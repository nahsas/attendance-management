import graphene
import graphql_jwt
from graphql_jwt.mutations import ObtainJSONWebToken, Verify, Refresh, Revoke

class Query(graphene.ObjectType):
    pass

class Mutation(graphene.ObjectType):
    token_auth = ObtainJSONWebToken.Field()
    verify_token = Verify.Field()
    refresh_token = Refresh.Field()
    logout = Revoke.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)
