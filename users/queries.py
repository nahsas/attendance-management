import graphene
from graphene_django import DjangoListField
from users.models import User
from users.types import UserType, UserRoleEnum


class UserQuery(graphene.ObjectType):
    me = graphene.Field(UserType)
    user = graphene.Field(UserType, id=graphene.UUID())
    users = DjangoListField(UserType, role=UserRoleEnum(), school_id=graphene.UUID())

    def resolve_me(self, info):
        if not info.context.user.is_authenticated:
            return None
        return info.context.user

    def resolve_user(self, info, id):
        return User.objects.get(id=id)

    def resolve_users(self, info, role=None, school_id=None):
        queryset = User.objects.all()
        if role:
            queryset = queryset.filter(role=role)
        if school_id:
            queryset = queryset.filter(school_id=school_id)
        return queryset
