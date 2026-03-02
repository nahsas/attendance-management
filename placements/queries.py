import graphene
from graphene_django import DjangoListField
from placements.models import StudentPlacement
from placements.types import StudentPlacementType, PlacementStatusEnum
import jwt
from django.conf import settings


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
            from users.models import User
            return User.objects.get(email=email)
    except Exception:
        pass
    return None


class PlacementQuery(graphene.ObjectType):
    student_placement = graphene.Field(StudentPlacementType, id=graphene.UUID())
    student_placements = DjangoListField(
        StudentPlacementType, 
        student_id=graphene.UUID(),
        place_id=graphene.UUID(),
        status=PlacementStatusEnum()
    )
    my_placements = graphene.List(StudentPlacementType)

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

    def resolve_my_placements(self, info):
        user = get_user_from_token(info)
        if not user:
            return []
        return StudentPlacement.objects.filter(student=user)
