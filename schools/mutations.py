import graphene
from graphql import GraphQLError
from schools.models import School
from schools.types import SchoolType


class SchoolInput(graphene.InputObjectType):
    name = graphene.String(required=True)
    address = graphene.String()
    phone = graphene.String()
    email = graphene.String()
    logo = graphene.String()
    is_active = graphene.Boolean()


class CreateSchool(graphene.Mutation):
    class Arguments:
        input = SchoolInput(required=True)

    school = graphene.Field(SchoolType)

    @classmethod
    def mutate(cls, root, info, input):
        school = School(
            name=input.name,
            address=input.address,
            phone=input.phone,
            email=input.email,
            logo=input.logo,
            is_active=input.is_active if input.is_active is not None else True,
        )
        school.save()
        return CreateSchool(school=school)


class UpdateSchool(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = SchoolInput(required=True)

    school = graphene.Field(SchoolType)

    @classmethod
    def mutate(cls, root, info, id, input):
        try:
            school = School.objects.get(id=id)
        except School.DoesNotExist:
            raise GraphQLError('School not found')

        if input.name:
            school.name = input.name
        if input.address is not None:
            school.address = input.address
        if input.phone is not None:
            school.phone = input.phone
        if input.email is not None:
            school.email = input.email
        if input.logo is not None:
            school.logo = input.logo
        if input.is_active is not None:
            school.is_active = input.is_active

        school.save()
        return UpdateSchool(school=school)


class DeleteSchool(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    @classmethod
    def mutate(cls, root, info, id):
        try:
            school = School.objects.get(id=id)
        except School.DoesNotExist:
            raise GraphQLError('School not found')

        school.delete()
        return DeleteSchool(success=True)


class Mutation(graphene.ObjectType):
    create_school = CreateSchool.Field()
    update_school = UpdateSchool.Field()
    delete_school = DeleteSchool.Field()
