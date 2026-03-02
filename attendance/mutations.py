import graphene
from graphql import GraphQLError
from django.utils import timezone
from datetime import datetime
from attendance.models import AttendanceSession, AttendanceLog, BreakLog, AttendanceStatus
from attendance.types import AttendanceSessionType


class ClockInInput(graphene.InputObjectType):
    student_placement_id = graphene.ID(required=True)
    latitude = graphene.Float(required=True)
    longitude = graphene.Float(required=True)
    location_address = graphene.String()
    photo = graphene.String()


class ClockIn(graphene.Mutation):
    class Arguments:
        input = ClockInInput(required=True)

    attendance_session = graphene.Field(AttendanceSessionType)

    @classmethod
    def mutate(cls, root, info, input):
        from placements.models import StudentPlacement

        try:
            placement = StudentPlacement.objects.get(id=input.student_placement_id)
        except StudentPlacement.DoesNotExist:
            raise GraphQLError('Student placement not found')

        today = timezone.now().date()
        
        if AttendanceSession.objects.filter(
            student_placement=placement,
            date=today
        ).exists():
            raise GraphQLError('Already clocked in today')

        session = AttendanceSession(
            student_placement=placement,
            date=today,
            status=AttendanceStatus.PRESENT,
        )
        session.save()

        attendance_log = AttendanceLog(
            session=session,
            type='clock_in',
            latitude=input.latitude,
            longitude=input.longitude,
            location_address=input.location_address,
            photo=input.photo,
        )
        attendance_log.save()

        return ClockIn(attendance_session=session)


class ClockOut(graphene.Mutation):
    class Arguments:
        session_id = graphene.ID(required=True)
        latitude = graphene.Float(required=True)
        longitude = graphene.Float(required=True)
        location_address = graphene.String()
        photo = graphene.String()

    attendance_session = graphene.Field(AttendanceSessionType)

    @classmethod
    def mutate(cls, root, info, session_id, latitude, longitude, location_address=None, photo=None):
        try:
            session = AttendanceSession.objects.get(id=session_id)
        except AttendanceSession.DoesNotExist:
            raise GraphQLError('Attendance session not found')

        if session.attendance_logs.filter(type='clock_out').exists():
            raise GraphQLError('Already clocked out')

        attendance_log = AttendanceLog(
            session=session,
            type='clock_out',
            latitude=latitude,
            longitude=longitude,
            location_address=location_address,
            photo=photo,
        )
        attendance_log.save()

        clock_in = session.attendance_logs.filter(type='clock_in').first()
        if clock_in:
            duration = attendance_log.timestamp - clock_in.timestamp
            session.actual_hours = round(duration.total_seconds() / 3600, 2)

            active_breaks = session.break_logs.filter(end_time__isnull=True)
            for break_log in active_breaks:
                break_log.end_time = attendance_log.timestamp
                break_log.duration_minutes = int((break_log.end_time - break_log.start_time).total_seconds() / 60)
                break_log.save()

                if session.actual_hours:
                    session.actual_hours -= break_log.duration_minutes / 60

        session.save()
        return ClockOut(attendance_session=session)


class LogBreak(graphene.Mutation):
    class Arguments:
        session_id = graphene.ID(required=True)
        break_number = graphene.Int(required=True)

    break_log = graphene.Field('attendance.types.BreakLogType')

    @classmethod
    def mutate(cls, root, info, session_id, break_number):
        try:
            session = AttendanceSession.objects.get(id=session_id)
        except AttendanceSession.DoesNotExist:
            raise GraphQLError('Attendance session not found')

        active_break = session.break_logs.filter(end_time__isnull=True).first()
        if active_break:
            raise GraphQLError('Already on break')

        break_log = BreakLog(
            session=session,
            break_number=break_number,
            start_time=timezone.now(),
        )
        break_log.save()
        return LogBreak(break_log=break_log)


class EndBreak(graphene.Mutation):
    class Arguments:
        break_log_id = graphene.ID(required=True)

    break_log = graphene.Field('attendance.types.BreakLogType')

    @classmethod
    def mutate(cls, root, info, break_log_id):
        try:
            break_log = BreakLog.objects.get(id=break_log_id)
        except BreakLog.DoesNotExist:
            raise GraphQLError('Break log not found')

        if break_log.end_time:
            raise GraphQLError('Break already ended')

        break_log.end_time = timezone.now()
        break_log.duration_minutes = int((break_log.end_time - break_log.start_time).total_seconds() / 60)
        break_log.save()
        return EndBreak(break_log=break_log)


class MarkAttendance(graphene.Mutation):
    class Arguments:
        session_id = graphene.ID(required=True)
        status = graphene.String(required=True)
        notes = graphene.String()

    attendance_session = graphene.Field(AttendanceSessionType)

    @classmethod
    def mutate(cls, root, info, session_id, status, notes=None):
        try:
            session = AttendanceSession.objects.get(id=session_id)
        except AttendanceSession.DoesNotExist:
            raise GraphQLError('Attendance session not found')

        valid_statuses = [choice[0] for choice in AttendanceStatus.choices]
        if status not in valid_statuses:
            raise GraphQLError(f'Invalid status. Must be one of: {valid_statuses}')

        session.status = status
        if notes:
            session.notes = notes
        session.save()
        return MarkAttendance(attendance_session=session)


class Mutation(graphene.ObjectType):
    clock_in = ClockIn.Field()
    clock_out = ClockOut.Field()
    log_break = LogBreak.Field()
    end_break = EndBreak.Field()
    mark_attendance = MarkAttendance.Field()
