import graphene
from graphene_django import DjangoObjectType
from activities.models import ActivityLog


class ActivityLogType(DjangoObjectType):
    class Meta:
        model = ActivityLog
        fields = (
            'id', 'student_placement', 'date', 'title', 
            'description', 'photos', 'created_at', 'updated_at'
        )
    
    student_placement = graphene.Field('placements.types.StudentPlacementType')
