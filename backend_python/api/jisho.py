import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/jisho/{kanji}")
async def get_kanji_data(kanji: str):
    url = f"https://jisho.org/api/v1/search/words?keyword={kanji}"

    async with httpx.AsyncClient() as client:
        response = await client.get(url)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch from Jisho")

    data = response.json()

    # Make sure there's at least one matching entry with Japanese word
    for entry in data["data"]:
        if entry["japanese"] and kanji in entry["japanese"][0].get("word", ""):
            word = entry["japanese"][0].get("word", kanji)
            reading = entry["japanese"][0].get("reading", "")
            senses = [sense["english_definitions"] for sense in entry["senses"]]

            return {
                "word": word,
                "reading": reading,
                "definitions": senses
            }

    # If no valid entry found
    raise HTTPException(status_code=404, detail="Kanji not found")
