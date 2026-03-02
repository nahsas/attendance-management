import graphene
from graphql import GraphQLError
from places.models import InternshipPlace, BreakConfig
from places.types import InternshipPlaceType, BreakConfigType


class BreakConfigInput(graphene.InputObjectType):
    break_count = graphene.Int(required=True)
    break1_start = graphene.Time()
    break1_end = graphene.Time()
    break2_start = graphene.Time()
    break2_end = graphene.Time()


class InternshipPlaceInput(graphene.InputObjectType):
    school_id = graphene.ID(required=True)
    name = graphene.String(required=True)
    address = graphene.String(required=True)
    phone = graphene.String()
    email = graphene.String()
    latitude = graphene.Float(required=True)
    longitude = graphene.Float(required=True)
    contact_person = graphene.String()
    contact_phone = graphene.String()
    industry = graphene.String()
    is_active = graphene.Boolean()
    break_config = BreakConfigInput()


class CreateInternshipPlace(graphene.Mutation):
    class Arguments:
        input = InternshipPlaceInput(required=True)

    internship_place = graphene.Field(InternshipPlaceType)

    @classmethod
    def mutate(cls, root, info, input):
        from schools.models import School

        try:
            school = School.objects.get(id=input.school_id)
        except School.DoesNotExist:
            raise GraphQLError('School not found')

        place = InternshipPlace(
            school=school,
            name=input.name,
            address=input.address,
            phone=input.phone,
            email=input.email,
            latitude=input.latitude,
            longitude=input.longitude,
            contact_person=input.contact_person,
            contact_phone=input.contact_phone,
            industry=input.industry,
            is_active=input.is_active if input.is_active is not None else True,
        )
        place.save()

        if input.break_config:
            break_config = BreakConfig(
                internship_place=place,
                break_count=input.break_config.break_count,
                break1_start=input.break_config.break1_start,
                break1_end=input.break_config.break1_end,
                break2_start=input.break_config.break2_start,
                break2_end=input.break_config.break2_end,
            )
            if input.break_config.break1_start and input.break_config.break1_end:
                from datetime import datetime
                b1_start = datetime.combine(place.id, input.break_config.break1_start)
                b1_end = datetime.combine(place.id, input.break_config.break1_end)
                break_config.total_break_minutes = int((b1_end - b1_start).total_seconds() / 60)
            break_config.save()

        return CreateInternshipPlace(internship_place=place)


class UpdateInternshipPlace(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = InternshipPlaceInput(required=True)

    internship_place = graphene.Field(InternshipPlaceType)

    @classmethod
    def mutate(cls, root, info, id, input):
        try:
            place = InternshipPlace.objects.get(id=id)
        except InternshipPlace.DoesNotExist:
            raise GraphQLError('Internship place not found')

        if input.school_id:
            from schools.models import School
            try:
                school = School.objects.get(id=input.school_id)
                place.school = school
            except School.DoesNotExist:
                raise GraphQLError('School not found')

        if input.name:
            place.name = input.name
        if input.address:
            place.address = input.address
        if input.phone is not None:
            place.phone = input.phone
        if input.email is not None:
            place.email = input.email
        if input.latitude:
            place.latitude = input.latitude
        if input.longitude:
            place.longitude = input.longitude
        if input.contact_person is not None:
            place.contact_person = input.contact_person
        if input.contact_phone is not None:
            place.contact_phone = input.contact_phone
        if input.industry is not None:
            place.industry = input.industry
        if input.is_active is not None:
            place.is_active = input.is_active

        place.save()

        if input.break_config:
            break_config, _ = BreakConfig.objects.get_or_create(internship_place=place)
            break_config.break_count = input.break_config.break_count
            break_config.break1_start = input.break_config.break1_start
            break_config.break1_end = input.break_config.break1_end
            break_config.break2_start = input.break_config.break2_start
            break_config.break2_end = input.break_config.break2_end
            break_config.save()

        return UpdateInternshipPlace(internship_place=place)


class DeleteInternshipPlace(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    @classmethod
    def mutate(cls, root, info, id):
        try:
            place = InternshipPlace.objects.get(id=id)
        except InternshipPlace.DoesNotExist:
            raise GraphQLError('Internship place not found')

        place.delete()
        return DeleteInternshipPlace(success=True)


class Mutation(graphene.ObjectType):
    create_internship_place = CreateInternshipPlace.Field()
    update_internship_place = UpdateInternshipPlace.Field()
    delete_internship_place = DeleteInternshipPlace.Field()
