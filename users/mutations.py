import graphene
from django.contrib.auth import get_user_model
from graphene_django import DjangoObjectType
from graphql import GraphQLError
import graphql_jwt
from users.models import User
from users.types import UserType

User = get_user_model()


class RegisterInput(graphene.InputObjectType):
    email = graphene.String(required=True)
    password = graphene.String(required=True)
    first_name = graphene.String(required=True)
    last_name = graphene.String(required=True)
    role = graphene.String(default_value='student')
    school_id = graphene.ID()
    phone = graphene.String()


class UserInput(graphene.InputObjectType):
    email = graphene.String()
    first_name = graphene.String()
    last_name = graphene.String()
    role = graphene.String()
    school_id = graphene.ID()
    phone = graphene.String()
    is_active = graphene.Boolean()


class CreateUser(graphene.Mutation):
    class Arguments:
        input = UserInput(required=True)

    user = graphene.Field(UserType)

    @classmethod
    def mutate(cls, root, info, input):
        if User.objects.filter(email=input.email).exists():
            raise GraphQLError('Email already exists')

        user = User(
            email=input.email,
            username=input.email,
            first_name=input.first_name,
            last_name=input.last_name,
            role=input.role,
            phone=input.phone,
        )
        if input.school_id:
            from schools.models import School
            try:
                school = School.objects.get(id=input.school_id)
                user.school = school
            except School.DoesNotExist:
                raise GraphQLError('School not found')

        user.set_password(input.get('password', 'changeme123'))
        user.save()
        return CreateUser(user=user)


class UpdateUser(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = UserInput(required=True)

    user = graphene.Field(UserType)

    @classmethod
    def mutate(cls, root, info, id, input):
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            raise GraphQLError('User not found')

        if input.email:
            user.email = input.email
        if input.first_name:
            user.first_name = input.first_name
        if input.last_name:
            user.last_name = input.last_name
        if input.role:
            user.role = input.role
        if input.phone:
            user.phone = input.phone
        if input.is_active is not None:
            user.is_active = input.is_active
        if input.school_id:
            from schools.models import School
            try:
                school = School.objects.get(id=input.school_id)
                user.school = school
            except School.DoesNotExist:
                raise GraphQLError('School not found')

        user.save()
        return UpdateUser(user=user)


class DeleteUser(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    @classmethod
    def mutate(cls, root, info, id):
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            raise GraphQLError('User not found')

        user.delete()
        return DeleteUser(success=True)


class Mutation(graphene.ObjectType):
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()
    logout = graphql_jwt.Revoke.Field()
    create_user = CreateUser.Field()
    update_user = UpdateUser.Field()
    delete_user = DeleteUser.Field()
