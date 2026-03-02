import graphene
from graphene_django import DjangoObjectType
from schools.models import School


class SchoolType(DjangoObjectType):
    class Meta:
        model = School
        fields = (
            'id', 'name', 'address', 'phone', 'email', 
            'logo', 'is_active', 'created_at', 'updated_at'
        )
