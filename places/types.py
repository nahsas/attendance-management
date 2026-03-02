import graphene
from graphene_django import DjangoObjectType
from places.models import InternshipPlace, BreakConfig


class BreakConfigType(DjangoObjectType):
    class Meta:
        model = BreakConfig
        fields = (
            'id', 'break_count', 'break1_start', 'break1_end',
            'break2_start', 'break2_end', 'total_break_minutes'
        )


class InternshipPlaceType(DjangoObjectType):
    class Meta:
        model = InternshipPlace
        fields = (
            'id', 'school', 'name', 'address', 'phone', 'email',
            'latitude', 'longitude', 'contact_person', 'contact_phone',
            'industry', 'is_active', 'break_config', 'created_at', 'updated_at'
        )
    
    break_config = graphene.Field(BreakConfigType)
