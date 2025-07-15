from fastapi_users import BaseUserManager
from fastapi import Depends
from ...db.models import User
from ...db.auth.user_db import get_user_db


SECRET = "AAA123"

class UserManager(BaseUserManager[User, int]):
    user_db_model = User
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request=None):
        print(f"User {user.email} has registered.")

    def parse_id(self, user_id: str) -> int:
        return int(user_id)

async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)
