from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List
from pydantic import BaseModel

from db.models import User
from db.database import get_async_session
from api.auth_api import fastapi_users # 正しい認証機能をインポート

router = APIRouter()

class PointsAdd(BaseModel):
    points: int

@router.post("/users/{user_id}/add-points", status_code=200)
async def add_points_to_user(
    user_id: int, 
    points_data: PointsAdd,
    db: AsyncSession = Depends(get_async_session), 
    current_user: User = Depends(fastapi_users.current_user(active=True)) # 正しい依存関係に変更
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user_to_update = await db.get(User, user_id)
    if not user_to_update:
        raise HTTPException(status_code=404, detail="User not found")
        
    user_to_update.points = (user_to_update.points or 0) + points_data.points
    await db.commit()
    return {"message": "Points added successfully", "new_total": user_to_update.points}

@router.get("/ranking")
async def get_ranking(
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(fastapi_users.current_user(active=True)) # 正しい依存関係に変更
):
    # ポイントの高い順に全ユーザーを取得
    stmt = select(User.id, User.email, User.points).order_by(desc(User.points))
    result = await db.execute(stmt)
    all_users_ranked = result.all()

    # 上位3名を作成
    top_3 = [{"rank": i+1, "email": user.email, "points": user.points} for i, user in enumerate(all_users_ranked[:3])]

    # 自分の順位を探す
    my_rank_info = None
    for i, user in enumerate(all_users_ranked):
        if user.id == current_user.id:
            my_rank_info = {"rank": i + 1, "email": current_user.email, "points": current_user.points}
            break
            
    if my_rank_info is None:
        # 万が一見つからない場合（通常はあり得ない）
        my_rank_info = {"rank": -1, "email": current_user.email, "points": current_user.points}

    return {"top_3": top_3, "my_rank": my_rank_info}
