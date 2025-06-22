from fastapi import APIRouter, Depends, Request, HTTPException, status
from backend_python.db.models import *
from backend_python.db.database import get_db

router = APIRouter()

@router.post("/users")
async def create_user(request: Request, db = Depends(get_db)):
    data = await request.json()                       # raw JSON dict
    user = User(email=data.get("email"),
                password=data.get("password"))
    db.add(user)                                       # stage INSERT
    db.commit()                                        # execute it
    db.refresh(user)                                   # load generated PK
    print(user.email, user.password, user.created_at)
    return {
        "user_id":      user.user_id,
        "email":        user.email,
        "password":     user.password,
        "created_at":   user.created_at
    } 

@router.get("/users/")
def read_users(db = Depends(get_db)):
    users = db.query(User).all()
    return [
        {"user_id": u.user_id, "email": u.email, "password": u.password, "created_at": u.created_at}
        for u in users
    ]

@router.get("/users/{user_id}")
def read_user(user_id: int, db = Depends(get_db)):
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return {
        "user_id":    user.user_id,
        "email":      user.email,
        "password":     user.password,
        "created_at": user.created_at,
    }

@router.put("/users/{user_id}")
async def update_user(user_id: int, request: Request, db = Depends(get_db)):
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    data = await request.json()
    if "email"    in data: user.email    = data["email"]
    if "password" in data: user.password = data["password"]
    db.commit()
    return {
        "user_id":    user.user_id,
        "email":      user.email,
        "password":     user.password,
        "created_at": user.created_at,
    }

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db = Depends(get_db)):
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    db.delete(user)
    db.commit()
    # returns 204 No Content
    return

#
# ─── KANJI_MASTER CRUD ────────────────────────────────────────────────────────
#

@router.post("/kanji_master", status_code=status.HTTP_201_CREATED)
async def create_kanji(request: Request, db = Depends(get_db)):
    data = await request.json()
    km = KanjiMaster(
        character        = data["character"],
        meaning          = data["meaning"],
        reading          = data.get("reading"),
        radical          = data.get("radical"),
        stroke_count     = data.get("stroke_count"),
        example_sentences= data.get("example_sentences"),
    )
    db.add(km)
    db.commit()
    db.refresh(km)
    return {
        "kanji_id":         km.kanji_id,
        "character":        km.character,
        "meaning":          km.meaning,
        "reading":          km.reading,
        "radical":          km.radical,
        "stroke_count":     km.stroke_count,
        "example_sentences":km.example_sentences,
    }

@router.get("/kanji_master")
def read_kanji_all(db = Depends(get_db)):
    return [
        {
            "kanji_id":         k.kanji_id,
            "character":        k.character,
            "meaning":          k.meaning,
            "reading":          k.reading,
            "radical":          k.radical,
            "stroke_count":     k.stroke_count,
            "example_sentences":k.example_sentences,
        }
        for k in db.query(KanjiMaster).all()
    ]

@router.get("/kanji_master/{kanji_id}")
def read_kanji(kanji_id: int, db = Depends(get_db)):
    k = db.query(KanjiMaster).get(kanji_id)
    if not k:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Kanji not found")
    return {
        "kanji_id":         k.kanji_id,
        "character":        k.character,
        "meaning":          k.meaning,
        "reading":          k.reading,
        "radical":          k.radical,
        "stroke_count":     k.stroke_count,
        "example_sentences":k.example_sentences,
    }

@router.put("/kanji_master/{kanji_id}")
async def update_kanji(kanji_id: int, request: Request, db = Depends(get_db)):
    k = db.query(KanjiMaster).get(kanji_id)
    if not k:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Kanji not found")
    data = await request.json()
    for field in ("character","meaning","reading","radical","stroke_count","example_sentences"):
        if field in data:
            setattr(k, field, data[field])
    db.commit()
    return {
        "kanji_id":         k.kanji_id,
        "character":        k.character,
        "meaning":          k.meaning,
        "reading":          k.reading,
        "radical":          k.radical,
        "stroke_count":     k.stroke_count,
        "example_sentences":k.example_sentences,
    }

@router.delete("/kanji_master/{kanji_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_kanji(kanji_id: int, db = Depends(get_db)):
    k = db.query(KanjiMaster).get(kanji_id)
    if not k:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Kanji not found")
    db.delete(k)
    db.commit()
    return

#
# ─── DICTIONARY_ENTRY CRUD ─────────────────────────────────────────────────────
#

@router.post("/dictionary_entries", status_code=status.HTTP_201_CREATED)
async def create_entry(request: Request, db = Depends(get_db)):
    data = await request.json()
    de = DictionaryEntry(
        kanji_id = data["kanji_id"],
        user_id  = data["user_id"],
        note     = data.get("note"),
        photo_pass = data.get("photo_pass"),
    )
    db.add(de)
    db.commit()
    db.refresh(de)
    return {
        "dict_id":    de.dict_id,
        "kanji_id":   de.kanji_id,
        "user_id":    de.user_id,
        "note":       de.note,
        "photo_pass": de.photo_pass,
        "added_at":   de.added_at,
    }

@router.get("/dictionary_entries")
def read_entries(db = Depends(get_db)):
    return [
        {
            "dict_id":    e.dict_id,
            "kanji_id":   e.kanji_id,
            "user_id":    e.user_id,
            "note":       e.note,
            "photo_pass": e.photo_pass,
            "added_at":   e.added_at,
        }
        for e in db.query(DictionaryEntry).all()
    ]

@router.get("/dictionary_entries/{user_id}")
def read_entry(dict_id: int, db = Depends(get_db)):
    e = db.query(DictionaryEntry).get(dict_id)
    if not e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Entry not found")
    return {
        "dict_id":    e.dict_id,
        "kanji_id":   e.kanji_id,
        "user_id":    e.user_id,
        "note":       e.note,
        "photo_pass": e.photo_pass,
        "added_at":   e.added_at,
    }

@router.put("/dictionary_entries/{dict_id}")
async def update_entry(dict_id: int, request: Request, db = Depends(get_db)):
    e = db.query(DictionaryEntry).get(dict_id)
    if not e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Entry not found")
    data = await request.json()
    for field in ("kanji_id","user_id","note","photo_pass"):
        if field in data:
            setattr(e, field, data[field])
    db.commit()
    return {
        "dict_id":    e.dict_id,
        "kanji_id":   e.kanji_id,
        "user_id":    e.user_id,
        "note":       e.note,
        "photo_pass": e.photo_pass,
        "added_at":   e.added_at,
    }

@router.get("/dictionary_entries/user/{user_id}")
def read_entries_for_user(user_id: int, db = Depends(get_db)):
    entries = (
        db.query(DictionaryEntry)
          .filter(DictionaryEntry.user_id == user_id)
          .all()
    )
    if not entries:
        # you can return an empty list instead if you prefer
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No entries for this user")
    return [
        {
            "dict_id":    e.dict_id,
            "kanji_id":   e.kanji_id,
            "user_id":    e.user_id,
            "note":       e.note,
            "photo_pass": e.photo_pass,
            "added_at":   e.added_at,
        }
        for e in entries
    ]


@router.delete("/dictionary_entries/{dict_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(dict_id: int, db = Depends(get_db)):
    e = db.query(DictionaryEntry).get(dict_id)
    if not e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Entry not found")
    db.delete(e)
    db.commit()
    return