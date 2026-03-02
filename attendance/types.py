import graphene
from graphene_django import DjangoObjectType
from attendance.models import AttendanceSession, AttendanceLog, BreakLog


class AttendanceStatusEnum(graphene.Enum):
    PRESENT = 'present'
    ABSENT = 'absent'
    LATE = 'late'
    ON_LEAVE = 'on_leave'


class AttendanceLogTypeEnum(graphene.Enum):
    CLOCK_IN = 'clock_in'
    CLOCK_OUT = 'clock_out'


class AttendanceLogType(DjangoObjectType):
    class Meta:
        model = AttendanceLog
        fields = ('id', 'type', 'timestamp', 'latitude', 'longitude', 'location_address', 'photo')
    
    type = graphene.Field(AttendanceLogTypeEnum)


class BreakLogType(DjangoObjectType):
    class Meta:
        model = BreakLog
        fields = ('id', 'break_number', 'start_time', 'end_time', 'duration_minutes')


class AttendanceSessionType(DjangoObjectType):
    class Meta:
        model = AttendanceSession
        fields = (
            'id', 'student_placement', 'date', 'status', 'required_hours',
            'actual_hours', 'notes', 'attendance_logs', 'break_logs', 'created_at'
        )
    
    status = graphene.Field(AttendanceStatusEnum)
    student_placement = graphene.Field('placements.types.StudentPlacementType')
    attendance_logs = graphene.List(AttendanceLogType)
    break_logs = graphene.List(BreakLogType)
