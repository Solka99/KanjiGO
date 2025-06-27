import httpx
from fastapi import APIRouter, HTTPException
import re # 文字列から単語と読みを抽出するために正規表現ライブラリをインポート

router = APIRouter()

KANJIALIVE_API_KEY = "6c5b4aed7emsh341240410f59e70p11a35ejsn1959249b5e34" # あなたのKanjiAlive APIキー
KANJIALIVE_API_HOST = "kanjialive-api.p.rapidapi.com"

@router.get("/kanjialive/{kanji}")
async def get_kanji_data_from_kanjialive(kanji: str):
    if len(kanji) != 1:
        raise HTTPException(status_code=400, detail="Please provide a single kanji character.")

    kanjialive_url = f"https://{KANJIALIVE_API_HOST}/api/public/kanji/{kanji}"
    headers = {
        "X-RapidAPI-Key": KANJIALIVE_API_KEY,
        "X-RapidAPI-Host": KANJIALIVE_API_HOST
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # --- KanjiAlive APIにのみリクエストを送信 ---
            response = await client.get(kanjialive_url, headers=headers)
            response.raise_for_status() # エラーがあればここで例外を発生させる
            
            kanji_detail_data = response.json()

        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"Failed to fetch from KanjiAlive: {e.response.text}")
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"An error occurred while requesting KanjiAlive API: {e}")

    try:
        # --- ここからが新しい単語リスト作成ロジック ---
        word_list = []
        # 'examples' 配列から単語情報を抽出する
        for example in kanji_detail_data.get("examples", []):
            japanese_full = example.get("japanese", "")
            
            # 例: "人類学（じんるいがく）" から "人類学" と "じんるいがく" を抽出
            word = re.sub(r'（.*）', '', japanese_full).strip('*')
            reading_match = re.search(r'（(.*)）', japanese_full)
            reading = reading_match.group(1) if reading_match else ""

            meaning_obj = example.get("meaning", {})
            english_meaning = meaning_obj.get("english", "")

            # wordが空でなければリストに追加
            if word:
                word_list.append({
                    "word": word,
                    "reading": reading,
                    "meaning": english_meaning
                })
        
        # --- 最終的なレスポンスを組み立て ---
        kanji_info = kanji_detail_data.get("kanji", {})
        radical_info = kanji_detail_data.get("radical", {})
        video_info = kanji_info.get("video", {})
        stroke_order_info = {
            "image": video_info.get("poster"),
            "video_mp4": video_info.get("mp4"),
            "video_webm": video_info.get("webm"),
        }
        
        result = {
            "kanji": kanji_info.get("character"),
            "meaning": kanji_info.get("meaning", {}).get("english"),
            "strokes": kanji_info.get("strokes", {}).get("count"),
            "onyomi": kanji_info.get("onyomi", {}),
            "kunyomi": kanji_info.get("kunyomi", {}),
            "radical": radical_info,
            "stroke_order": stroke_order_info,
            "examples": kanji_detail_data.get("examples", []), # examplesは元のまま残す
            "words": word_list # 新しく作成した単語リスト
        }
        return result
        
    except (KeyError, TypeError) as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse data from external API: {e}")