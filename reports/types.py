import graphene
from graphene_django import DjangoObjectType
from reports.models import Report


class ReportTypeEnum(graphene.Enum):
    DAILY = 'daily'
    WEEKLY = 'weekly'
    MONTHLY = 'monthly'


class ReportStatusEnum(graphene.Enum):
    DRAFT = 'draft'
    SUBMITTED = 'submitted'
    REVIEWED = 'reviewed'
    APPROVED = 'approved'
    REJECTED = 'rejected'


class ReportType(DjangoObjectType):
    class Meta:
        model = Report
        fields = (
            'id', 'student_placement', 'title', 'content', 'report_type',
            'start_date', 'end_date', 'status', 'reviewed_by', 
            'reviewed_at', 'review_notes', 'created_at', 'updated_at'
        )
    
    report_type = graphene.Field(ReportTypeEnum)
    status = graphene.Field(ReportStatusEnum)
    student_placement = graphene.Field('placements.types.StudentPlacementType')
    reviewed_by = graphene.Field('users.types.UserType')
