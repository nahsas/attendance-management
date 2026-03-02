import graphene
from graphql import GraphQLError
from django.utils import timezone
from reports.models import Report, ReportStatus
from reports.types import ReportType


class ReportInput(graphene.InputObjectType):
    student_placement_id = graphene.ID(required=True)
    title = graphene.String(required=True)
    content = graphene.String(required=True)
    report_type = graphene.String(required=True)
    start_date = graphene.Date(required=True)
    end_date = graphene.Date(required=True)


class CreateReport(graphene.Mutation):
    class Arguments:
        input = ReportInput(required=True)

    report = graphene.Field(ReportType)

    @classmethod
    def mutate(cls, root, info, input):
        from placements.models import StudentPlacement

        try:
            placement = StudentPlacement.objects.get(id=input.student_placement_id)
        except StudentPlacement.DoesNotExist:
            raise GraphQLError('Student placement not found')

        report = Report(
            student_placement=placement,
            title=input.title,
            content=input.content,
            report_type=input.report_type,
            start_date=input.start_date,
            end_date=input.end_date,
            status=ReportStatus.DRAFT,
        )
        report.save()
        return CreateReport(report=report)


class UpdateReport(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        title = graphene.String()
        content = graphene.String()

    report = graphene.Field(ReportType)

    @classmethod
    def mutate(cls, root, info, id, **kwargs):
        try:
            report = Report.objects.get(id=id)
        except Report.DoesNotExist:
            raise GraphQLError('Report not found')

        if report.status != ReportStatus.DRAFT:
            raise GraphQLError('Can only edit draft reports')

        if kwargs.get('title'):
            report.title = kwargs['title']
        if kwargs.get('content'):
            report.content = kwargs['content']

        report.save()
        return UpdateReport(report=report)


class SubmitReport(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    report = graphene.Field(ReportType)

    @classmethod
    def mutate(cls, root, info, id):
        try:
            report = Report.objects.get(id=id)
        except Report.DoesNotExist:
            raise GraphQLError('Report not found')

        if report.status != ReportStatus.DRAFT:
            raise GraphQLError('Can only submit draft reports')

        report.status = ReportStatus.SUBMITTED
        report.save()
        return SubmitReport(report=report)


class ReviewReport(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        status = graphene.String(required=True)
        notes = graphene.String()

    report = graphene.Field(ReportType)

    @classmethod
    def mutate(cls, root, info, id, status, notes=None):
        try:
            report = Report.objects.get(id=id)
        except Report.DoesNotExist:
            raise GraphQLError('Report not found')

        if report.status != ReportStatus.SUBMITTED:
            raise GraphQLError('Can only review submitted reports')

        valid_statuses = ['approved', 'rejected']
        if status not in valid_statuses:
            raise GraphQLError(f'Invalid status. Must be one of: {valid_statuses}')

        report.status = ReportStatus.APPROVED if status == 'approved' else ReportStatus.REJECTED
        report.reviewed_by = info.context.user
        report.reviewed_at = timezone.now()
        if notes:
            report.review_notes = notes

        report.save()
        return ReviewReport(report=report)


class DeleteReport(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    @classmethod
    def mutate(cls, root, info, id):
        try:
            report = Report.objects.get(id=id)
        except Report.DoesNotExist:
            raise GraphQLError('Report not found')

        if report.status != ReportStatus.DRAFT:
            raise GraphQLError('Can only delete draft reports')

        report.delete()
        return DeleteReport(success=True)


class Mutation(graphene.ObjectType):
    create_report = CreateReport.Field()
    update_report = UpdateReport.Field()
    submit_report = SubmitReport.Field()
    review_report = ReviewReport.Field()
    delete_report = DeleteReport.Field()
