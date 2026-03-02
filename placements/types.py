import graphene
from graphene_django import DjangoObjectType
from placements.models import StudentPlacement


class PlacementStatusEnum(graphene.Enum):
    ACTIVE = 'active'
    COMPLETED = 'completed'
    TERMINATED = 'terminated'


class StudentPlacementType(DjangoObjectType):
    class Meta:
        model = StudentPlacement
        fields = (
            'id', 'student', 'internship_place', 'start_date', 'end_date',
            'status', 'supervisor_name', 'supervisor_phone',
            'termination_reason', 'created_at', 'updated_at'
        )
    
    status = graphene.Field(PlacementStatusEnum)
    student = graphene.Field('users.types.UserType')
    internship_place = graphene.Field('places.types.InternshipPlaceType')
