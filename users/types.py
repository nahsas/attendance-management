import graphene
from graphene_django import DjangoObjectType
from users.models import User


class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'role', 
            'phone', 'avatar', 'is_active', 'school', 
            'created_at', 'updated_at'
        )

    school = graphene.Field('schools.types.SchoolType')


class UserRoleEnum(graphene.Enum):
    SUPERADMIN = 'superadmin'
    SCHOOL_ADMIN = 'school_admin'
    TEACHER = 'teacher'
    STUDENT = 'student'
