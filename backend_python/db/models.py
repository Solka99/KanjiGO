from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func, Boolean
from sqlalchemy.orm import relationship
from .database import Base
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTable

# --- 1. 正しく統合された User クラス ---
class User(SQLAlchemyBaseUserTable[int], Base):
    __tablename__ = "users"

    # fastapi-usersは 'id' を主キーとして期待するため、'id' に統一します。
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    points = Column(Integer, default=0, nullable=False) # pointsカラムもここに含めます
    created_at = Column(DateTime, server_default=func.now())
    
    dictionary_entries = relationship("DictionaryEntry", back_populates="user")

# --- 2. KanjiMaster は不要なのでコメントアウトのまま ---
# class KanjiMaster(Base):
#     ...

# --- 3. DictionaryEntry クラス ---
class DictionaryEntry(Base):
    __tablename__ = 'dictionary_entry'

    dict_id = Column(Integer, primary_key=True, autoincrement=True)
    kanji_character = Column(String(10), nullable=True)
    # ★★★ ここが変更点: ForeignKeyを 'users.id' に修正 ★★★
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    photo_pass = Column(String(255), nullable=True)
    added_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="dictionary_entries")

