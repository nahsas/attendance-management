import graphene
from graphene_django import DjangoListField
from reports.models import Report
from reports.types import ReportType, ReportStatusEnum
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


class ReportQuery(graphene.ObjectType):
    report = graphene.Field(ReportType, id=graphene.UUID())
    reports = DjangoListField(
        ReportType, 
        student_placement_id=graphene.UUID(),
        status=ReportStatusEnum()
    )
    my_reports = graphene.List(ReportType)

    def resolve_report(self, info, id):
        return Report.objects.get(id=id)

    def resolve_reports(self, info, student_placement_id=None, status=None):
        queryset = Report.objects.all()
        if student_placement_id:
            queryset = queryset.filter(student_placement_id=student_placement_id)
        if status:
            queryset = queryset.filter(status=status)
        return queryset

    def resolve_my_reports(self, info):
        user = get_user_from_token(info)
        if not user:
            return []
        
        from placements.models import StudentPlacement
        placements = StudentPlacement.objects.filter(student=user)
        return Report.objects.filter(student_placement__in=placements).order_by('-created_at')
