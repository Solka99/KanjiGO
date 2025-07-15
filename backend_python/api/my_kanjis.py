from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from backend_python.db.models import DictionaryEntry, User 
from backend_python.db.database import get_async_session 
# ★★★ ここが変更点1: 認証の本体である fastapi_users をインポート ★★★
from backend_python.db.auth.auth import fastapi_users

router = APIRouter()

# ★★★ ここが変更点2: 依存関係を fastapi_users.current_user() に変更 ★★★
@router.get("/my-kanjis/{user_id}", status_code=200)
async def get_user_saved_kanjis(
    user_id: int, 
    db: AsyncSession = Depends(get_async_session), 
    current_user: User = Depends(fastapi_users.current_user(active=True))
):
    """
    指定されたユーザーIDが保存した漢字のリストを返す。
    fastapi-usersの認証済みユーザーにのみ許可する。
    """
    # セキュリティチェック: ログイン中のユーザーが自身のデータを要求しているか確認
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this resource")

    query = (
        select(DictionaryEntry.kanji_character)
        .filter(DictionaryEntry.user_id == user_id)
        .distinct()
    )
    
    result = await db.execute(query)
    saved_kanjis = result.scalars().all()

    if not saved_kanjis:
        return []

    # フロントエンドが期待する形式に変換
    return [
        {
            "kanji_id": index, 
            "character": kanji,
            "meaning": "" 
        }
        for index, kanji in enumerate(saved_kanjis)
    ]
