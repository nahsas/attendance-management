import graphene
from graphene_django import DjangoListField
from django.utils import timezone
from attendance.models import AttendanceSession
from attendance.types import AttendanceSessionType
import jwt
from django.conf import settings


def get_user_from_token(info):
    auth_header = info.context.META.get('HTTP_AUTHORIZATION', '')
    if not auth_header:
        return None
    
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() not in ('jwt', 'bearer'):
        return None
    
    token = parts[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        email = payload.get('email')
        if email:
            from users.models import User
            return User.objects.get(email=email)
    except Exception:
        pass
    return None


class AttendanceQuery(graphene.ObjectType):
    attendance_session = graphene.Field(AttendanceSessionType, id=graphene.UUID())
    attendance_sessions = DjangoListField(
        AttendanceSessionType, 
        student_placement_id=graphene.UUID(),
        date=graphene.Date()
    )
    my_attendance = graphene.List(AttendanceSessionType, start_date=graphene.Date(), end_date=graphene.Date())
    today_attendance = graphene.Field(AttendanceSessionType)

    def resolve_attendance_session(self, info, id):
        return AttendanceSession.objects.get(id=id)

    def resolve_attendance_sessions(self, info, student_placement_id=None, date=None):
        queryset = AttendanceSession.objects.all()
        if student_placement_id:
            queryset = queryset.filter(student_placement_id=student_placement_id)
        if date:
            queryset = queryset.filter(date=date)
        return queryset

    def resolve_my_attendance(self, info, start_date=None, end_date=None):
        user = get_user_from_token(info)
        if not user:
            return []
        
        from placements.models import StudentPlacement
        placements = StudentPlacement.objects.filter(student=user)
        queryset = AttendanceSession.objects.filter(student_placement__in=placements)
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        return queryset.order_by('-date')

    def resolve_today_attendance(self, info):
        user = get_user_from_token(info)
        if not user:
            return None
        
        from placements.models import StudentPlacement
        placements = StudentPlacement.objects.filter(student=user)
        today = timezone.now().date()
        return AttendanceSession.objects.filter(student_placement__in=placements, date=today).first()
