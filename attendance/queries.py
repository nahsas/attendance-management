import graphene
from graphene_django import DjangoListField
from attendance.models import AttendanceSession
from attendance.types import AttendanceSessionType


class AttendanceQuery(graphene.ObjectType):
    attendance_session = graphene.Field(AttendanceSessionType, id=graphene.UUID())
    attendance_sessions = DjangoListField(
        AttendanceSessionType, 
        student_placement_id=graphene.UUID(),
        date=graphene.Date()
    )

    def resolve_attendance_session(self, info, id):
        return AttendanceSession.objects.get(id=id)

    def resolve_attendance_sessions(self, info, student_placement_id=None, date=None):
        queryset = AttendanceSession.objects.all()
        if student_placement_id:
            queryset = queryset.filter(student_placement_id=student_placement_id)
        if date:
            queryset = queryset.filter(date=date)
        return queryset
