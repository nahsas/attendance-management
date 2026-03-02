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

from users.mutations import Mutation as UserMutation
from schools.mutations import Mutation as SchoolMutation
from places.mutations import Mutation as PlaceMutation
from placements.mutations import Mutation as PlacementMutation
from attendance.mutations import Mutation as AttendanceMutation
from activities.mutations import Mutation as ActivityMutation
from reports.mutations import Mutation as ReportMutation


class Query(UserQuery, SchoolQuery, PlaceQuery, PlacementQuery, AttendanceQuery, ActivityQuery, ReportQuery, graphene.ObjectType):
    pass


class Mutation(
    UserMutation,
    SchoolMutation,
    PlaceMutation,
    PlacementMutation,
    AttendanceMutation,
    ActivityMutation,
    ReportMutation,
    graphene.ObjectType
):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)
