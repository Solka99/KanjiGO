from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from ...db.models import User
# from db.database import SessionLocal
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from ...db.database import get_async_session

async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)