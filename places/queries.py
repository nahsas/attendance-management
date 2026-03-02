import graphene
from graphene_django import DjangoListField
from places.models import InternshipPlace
from places.types import InternshipPlaceType


class PlaceQuery(graphene.ObjectType):
    internship_place = graphene.Field(InternshipPlaceType, id=graphene.UUID())
    internship_places = DjangoListField(InternshipPlaceType, school_id=graphene.UUID())

    def resolve_internship_place(self, info, id):
        return InternshipPlace.objects.get(id=id)

    def resolve_internship_places(self, info, school_id=None):
        queryset = InternshipPlace.objects.all()
        if school_id:
            queryset = queryset.filter(school_id=school_id)
        return queryset
