import graphene
from graphene_django import DjangoListField
from placements.models import StudentPlacement
from placements.types import StudentPlacementType, PlacementStatusEnum


class PlacementQuery(graphene.ObjectType):
    student_placement = graphene.Field(StudentPlacementType, id=graphene.UUID())
    student_placements = DjangoListField(
        StudentPlacementType, 
        student_id=graphene.UUID(),
        place_id=graphene.UUID(),
        status=PlacementStatusEnum()
    )

    def resolve_student_placement(self, info, id):
        return StudentPlacement.objects.get(id=id)

    def resolve_student_placements(self, info, student_id=None, place_id=None, status=None):
        queryset = StudentPlacement.objects.all()
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if place_id:
            queryset = queryset.filter(internship_place_id=place_id)
        if status:
            queryset = queryset.filter(status=status)
        return queryset
