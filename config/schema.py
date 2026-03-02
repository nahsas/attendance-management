import graphene
import graphql_jwt
from graphql_jwt.mutations import ObtainJSONWebToken, Verify, Refresh, Revoke

from users.queries import UserQuery
from schools.queries import SchoolQuery
from places.queries import PlaceQuery
from placements.queries import PlacementQuery
from attendance.queries import AttendanceQuery
from activities.queries import ActivityQuery
from reports.queries import ReportQuery


class Query(UserQuery, SchoolQuery, PlaceQuery, PlacementQuery, AttendanceQuery, ActivityQuery, ReportQuery, graphene.ObjectType):
    pass


class Mutation(graphene.ObjectType):
    token_auth = ObtainJSONWebToken.Field()
    verify_token = Verify.Field()
    refresh_token = Refresh.Field()
    logout = Revoke.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)
