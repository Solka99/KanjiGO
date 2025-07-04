from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend_python.db.models import KanjiMaster, DictionaryEntry
from backend_python.db.database import get_db

router = APIRouter()

@router.get("/my-kanjis/{user_id}")
def get_user_saved_kanjis(user_id: int, db: Session = Depends(get_db)):
    """
    指定されたユーザーIDが保存した漢字のリストを返すエンドポイント。
    dictionary_entryテーブルとkanji_masterテーブルをJOINして必要な情報を取得する。
    """
    saved_kanjis = (
        db.query(
            KanjiMaster.kanji_id,
            KanjiMaster.character,
            KanjiMaster.meaning
        )
        .join(DictionaryEntry, KanjiMaster.kanji_id == DictionaryEntry.kanji_id)
        .filter(DictionaryEntry.user_id == user_id)
        .order_by(DictionaryEntry.added_at.desc())
        .all()
    )

    if not saved_kanjis:
        # エラーではなく空のリストを返す方がフロントエンドで扱いやすい
        return []

    return [
        {
            "kanji_id": kanji.kanji_id,
            "character": kanji.character,
            "meaning": kanji.meaning.split(',')[0] # 意味が長い場合があるので、最初のものだけ取得
        }
        for kanji in saved_kanjis
    ]