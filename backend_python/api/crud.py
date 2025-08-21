from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# 必要なモデルと、新しい非同期セッション関数をインポート
from db.models import User, DictionaryEntry
from db.database import get_async_session

router = APIRouter()

# このファイル内のすべての関数を非同期(async def)に変更し、
# データベースセッションも非同期用のもの(get_async_session)に修正します。

@router.post("/users")
async def create_user(request: Request, db: AsyncSession = Depends(get_async_session)):
    data = await request.json()
    # Userモデルの hashed_password を使用
    user = User(email=data.get("email"), hashed_password=data.get("password"))
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.get("/users/")
async def read_users(db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return users

@router.get("/users/{user_id}")
async def read_user(user_id: int, db: AsyncSession = Depends(get_async_session)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.put("/users/{user_id}")
async def update_user(user_id: int, request: Request, db: AsyncSession = Depends(get_async_session)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    data = await request.json()
    if "email" in data:
        user.email = data["email"]
    if "password" in data:
        user.hashed_password = data["password"]
    await db.commit()
    return user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: AsyncSession = Depends(get_async_session)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    await db.delete(user)
    await db.commit()
    return

#
# ─── DICTIONARY_ENTRY CRUD (非同期版) ───────────────────────────────────
#

@router.post("/dictionary_entries", status_code=status.HTTP_201_CREATED)
async def create_entry(request: Request, db: AsyncSession = Depends(get_async_session)):
    data = await request.json()
    de = DictionaryEntry(
        kanji_character=data["kanji_character"],
        user_id=data["user_id"],
        photo_pass=data.get("photo_pass"),
    )
    db.add(de)
    await db.commit()
    await db.refresh(de)
    return de

@router.get("/dictionary_entries")
async def read_entries(db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(DictionaryEntry))
    entries = result.scalars().all()
    return entries
