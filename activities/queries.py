import graphene
from graphene_django import DjangoListField
from activities.models import ActivityLog
from activities.types import ActivityLogType
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


class ActivityQuery(graphene.ObjectType):
    activity_log = graphene.Field(ActivityLogType, id=graphene.UUID())
    activity_logs = DjangoListField(
        ActivityLogType, 
        student_placement_id=graphene.UUID(),
        date=graphene.Date()
    )
    my_activities = graphene.List(ActivityLogType, date=graphene.Date())

    def resolve_activity_log(self, info, id):
        return ActivityLog.objects.get(id=id)

    def resolve_activity_logs(self, info, student_placement_id=None, date=None):
        queryset = ActivityLog.objects.all()
        if student_placement_id:
            queryset = queryset.filter(student_placement_id=student_placement_id)
        if date:
            queryset = queryset.filter(date=date)
        return queryset

    def resolve_my_activities(self, info, date=None):
        user = get_user_from_token(info)
        if not user:
            return []
        
        from placements.models import StudentPlacement
        placements = StudentPlacement.objects.filter(student=user)
        queryset = ActivityLog.objects.filter(student_placement__in=placements)
        
        if date:
            queryset = queryset.filter(date=date)
        return queryset.order_by('-date')
