from fastapi import APIRouter
from db.auth.auth import fastapi_users, auth_backend
from fastapi_users.router import ErrorCode
from db.schemas import UserRead, UserCreate, UserUpdate

router = APIRouter(
    prefix="/auth"
)

# Registration of new user: POST /auth/register
router.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
)

# Login of user and getting JWT token: POST /auth/jwt/login
# The logout endpoint is automatically included here in newer versions.
router.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/jwt"
)

# Endpoint for getting data about myself (authorized): GET /auth/users/me
router.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users"
)

# The following line was causing the error and has been removed,
# as get_logout_router is deprecated. The functionality is now
# handled by get_auth_router.
#
# router.include_router(fastapi_users.get_logout_router(auth_backend), prefix="/jwt")
