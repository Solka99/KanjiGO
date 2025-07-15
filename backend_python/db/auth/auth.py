from fastapi_users.authentication import AuthenticationBackend, BearerTransport, JWTStrategy
from fastapi_users import FastAPIUsers
from ...db.auth.user_manager import get_user_manager
from ...db.models import User

SECRET = "AAA123"

bearer_transport = BearerTransport(tokenUrl="auth/jwt/login") #BearerTransport means your tokens will be passed in Authorization: Bearer <token> headers.

def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600)

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, int](            #This creates the main auth system
    get_user_manager,
    [auth_backend],
)

current_active_user = fastapi_users.current_user(active=True) #dependency you can inject into protected endpoints.

#example of usage
# @app.get("/protected")
# def protected_route(user=Depends(current_active_user)):
#     return {"msg": f"Hello, {user.email}"}