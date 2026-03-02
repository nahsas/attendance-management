import graphene
from graphene_django import DjangoListField
from schools.models import School
from schools.types import SchoolType


class SchoolQuery(graphene.ObjectType):
    school = graphene.Field(SchoolType, id=graphene.UUID())
    schools = DjangoListField(SchoolType)

    def resolve_school(self, info, id):
        return School.objects.get(id=id)

    def resolve_schools(self, info):
        return School.objects.all()
