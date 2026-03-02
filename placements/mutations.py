import graphene
from graphql import GraphQLError
from placements.models import StudentPlacement, PlacementStatus
from placements.types import StudentPlacementType


class StudentPlacementInput(graphene.InputObjectType):
    student_id = graphene.ID(required=True)
    internship_place_id = graphene.ID(required=True)
    start_date = graphene.Date(required=True)
    end_date = graphene.Date(required=True)
    supervisor_name = graphene.String()
    supervisor_phone = graphene.String()


class CreateStudentPlacement(graphene.Mutation):
    class Arguments:
        input = StudentPlacementInput(required=True)

    student_placement = graphene.Field(StudentPlacementType)

    @classmethod
    def mutate(cls, root, info, input):
        from users.models import User
        from places.models import InternshipPlace

        try:
            student = User.objects.get(id=input.student_id)
        except User.DoesNotExist:
            raise GraphQLError('Student not found')

        try:
            place = InternshipPlace.objects.get(id=input.internship_place_id)
        except InternshipPlace.DoesNotExist:
            raise GraphQLError('Internship place not found')

        placement = StudentPlacement(
            student=student,
            internship_place=place,
            start_date=input.start_date,
            end_date=input.end_date,
            supervisor_name=input.supervisor_name,
            supervisor_phone=input.supervisor_phone,
        )
        placement.save()
        return CreateStudentPlacement(student_placement=placement)


class UpdateStudentPlacement(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = StudentPlacementInput(required=True)

    student_placement = graphene.Field(StudentPlacementType)

    @classmethod
    def mutate(cls, root, info, id, input):
        try:
            placement = StudentPlacement.objects.get(id=id)
        except StudentPlacement.DoesNotExist:
            raise GraphQLError('Student placement not found')

        if input.student_id:
            from users.models import User
            try:
                student = User.objects.get(id=input.student_id)
                placement.student = student
            except User.DoesNotExist:
                raise GraphQLError('Student not found')

        if input.internship_place_id:
            from places.models import InternshipPlace
            try:
                place = InternshipPlace.objects.get(id=input.internship_place_id)
                placement.internship_place = place
            except InternshipPlace.DoesNotExist:
                raise GraphQLError('Internship place not found')

        if input.start_date:
            placement.start_date = input.start_date
        if input.end_date:
            placement.end_date = input.end_date
        if input.supervisor_name is not None:
            placement.supervisor_name = input.supervisor_name
        if input.supervisor_phone is not None:
            placement.supervisor_phone = input.supervisor_phone

        placement.save()
        return UpdateStudentPlacement(student_placement=placement)


class TerminatePlacement(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        reason = graphene.String()

    student_placement = graphene.Field(StudentPlacementType)

    @classmethod
    def mutate(cls, root, info, id, reason=None):
        try:
            placement = StudentPlacement.objects.get(id=id)
        except StudentPlacement.DoesNotExist:
            raise GraphQLError('Student placement not found')

        placement.status = PlacementStatus.TERMINATED
        placement.termination_reason = reason
        placement.save()
        return TerminatePlacement(student_placement=placement)


class CompletePlacement(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    student_placement = graphene.Field(StudentPlacementType)

    @classmethod
    def mutate(cls, root, info, id):
        try:
            placement = StudentPlacement.objects.get(id=id)
        except StudentPlacement.DoesNotExist:
            raise GraphQLError('Student placement not found')

        placement.status = PlacementStatus.COMPLETED
        placement.save()
        return CompletePlacement(student_placement=placement)


class DeleteStudentPlacement(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    @classmethod
    def mutate(cls, root, info, id):
        try:
            placement = StudentPlacement.objects.get(id=id)
        except StudentPlacement.DoesNotExist:
            raise GraphQLError('Student placement not found')

        placement.delete()
        return DeleteStudentPlacement(success=True)


class Mutation(graphene.ObjectType):
    create_student_placement = CreateStudentPlacement.Field()
    update_student_placement = UpdateStudentPlacement.Field()
    terminate_placement = TerminatePlacement.Field()
    complete_placement = CompletePlacement.Field()
    delete_student_placement = DeleteStudentPlacement.Field()
