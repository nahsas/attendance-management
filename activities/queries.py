import graphene
from graphene_django import DjangoListField
from activities.models import ActivityLog
from activities.types import ActivityLogType


class ActivityQuery(graphene.ObjectType):
    activity_log = graphene.Field(ActivityLogType, id=graphene.UUID())
    activity_logs = DjangoListField(
        ActivityLogType, 
        student_placement_id=graphene.UUID(),
        date=graphene.Date()
    )

    def resolve_activity_log(self, info, id):
        return ActivityLog.objects.get(id=id)

    def resolve_activity_logs(self, info, student_placement_id=None, date=None):
        queryset = ActivityLog.objects.all()
        if student_placement_id:
            queryset = queryset.filter(student_placement_id=student_placement_id)
        if date:
            queryset = queryset.filter(date=date)
        return queryset
