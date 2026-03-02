import graphene
from graphene_django import DjangoListField
from reports.models import Report
from reports.types import ReportType, ReportStatusEnum


class ReportQuery(graphene.ObjectType):
    report = graphene.Field(ReportType, id=graphene.UUID())
    reports = DjangoListField(
        ReportType, 
        student_placement_id=graphene.UUID(),
        status=ReportStatusEnum()
    )

    def resolve_report(self, info, id):
        return Report.objects.get(id=id)

    def resolve_reports(self, info, student_placement_id=None, status=None):
        queryset = Report.objects.all()
        if student_placement_id:
            queryset = queryset.filter(student_placement_id=student_placement_id)
        if status:
            queryset = queryset.filter(status=status)
        return queryset
