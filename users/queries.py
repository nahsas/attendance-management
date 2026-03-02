import graphene
from graphene_django import DjangoListField
from users.models import User
from users.types import UserType, UserRoleEnum
import logging
import jwt
from django.conf import settings

logger = logging.getLogger(__name__)


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
            return User.objects.get(email=email)
    except Exception as e:
        logger.error(f"Error decoding token: {e}")
    return None


class UserQuery(graphene.ObjectType):
    me = graphene.Field(UserType)
    user = graphene.Field(UserType, id=graphene.UUID())
    users = DjangoListField(UserType, role=UserRoleEnum(), school_id=graphene.UUID())

    def resolve_me(self, info):
        user = get_user_from_token(info)
        return user

    def resolve_user(self, info, id):
        return User.objects.get(id=id)

    def resolve_users(self, info, role=None, school_id=None):
        queryset = User.objects.all()
        if role:
            queryset = queryset.filter(role=role)
        if school_id:
            queryset = queryset.filter(school_id=school_id)
        return queryset
