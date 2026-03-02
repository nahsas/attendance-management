import graphene
from graphql import GraphQLError
from activities.models import ActivityLog
from activities.types import ActivityLogType


class ActivityInput(graphene.InputObjectType):
    student_placement_id = graphene.ID(required=True)
    date = graphene.Date(required=True)
    title = graphene.String(required=True)
    description = graphene.String()
    photos = graphene.List(graphene.String)


class CreateActivity(graphene.Mutation):
    class Arguments:
        input = ActivityInput(required=True)

    activity = graphene.Field(ActivityLogType)

    @classmethod
    def mutate(cls, root, info, input):
        from placements.models import StudentPlacement

        try:
            placement = StudentPlacement.objects.get(id=input.student_placement_id)
        except StudentPlacement.DoesNotExist:
            raise GraphQLError('Student placement not found')

        activity = ActivityLog(
            student_placement=placement,
            date=input.date,
            title=input.title,
            description=input.description,
            photos=input.photos or [],
        )
        activity.save()
        return CreateActivity(activity=activity)


class UpdateActivity(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        title = graphene.String()
        description = graphene.String()
        photos = graphene.List(graphene.String)

    activity = graphene.Field(ActivityLogType)

    @classmethod
    def mutate(cls, root, info, id, **kwargs):
        try:
            activity = ActivityLog.objects.get(id=id)
        except ActivityLog.DoesNotExist:
            raise GraphQLError('Activity not found')

        if kwargs.get('title'):
            activity.title = kwargs['title']
        if kwargs.get('description') is not None:
            activity.description = kwargs['description']
        if kwargs.get('photos') is not None:
            activity.photos = kwargs['photos']

        activity.save()
        return UpdateActivity(activity=activity)


class DeleteActivity(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    @classmethod
    def mutate(cls, root, info, id):
        try:
            activity = ActivityLog.objects.get(id=id)
        except ActivityLog.DoesNotExist:
            raise GraphQLError('Activity not found')

        activity.delete()
        return DeleteActivity(success=True)


class Mutation(graphene.ObjectType):
    create_activity = CreateActivity.Field()
    update_activity = UpdateActivity.Field()
    delete_activity = DeleteActivity.Field()
