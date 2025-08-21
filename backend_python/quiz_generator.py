import random
from jm_dict import load_kanji_entries
from fastapi import APIRouter, HTTPException

router = APIRouter()
kanji_entries = load_kanji_entries() # should be loaded in main just once!


def generate_meaning_quiz(target_kanji, kanji_pool):
    question = f"Which kanji means '{target_kanji['meanings']}'?"
    correct = target_kanji['kanji']
    distractors = random.sample(
        [k['kanji'] for k in kanji_pool if k['kanji'] != correct], 3
    )
    print("question ", question, "options ",  random.sample(distractors + [correct], 4),  "answer ", correct)
    return {
        "type": "meaning",
        "question": question,
        "options": random.sample(distractors + [correct], 4),
        "answer": correct
    }

def generate_reading_quiz(target_kanji, kanji_pool):
    reading = target_kanji['readings']
    if not reading:
        return None
    question = f"What is the reading of {target_kanji['kanji']}?"
    distractors = random.sample(
        [k['readings'] for k in kanji_pool], 3
    )
    # distractors = random.sample(["yama", "mizu", "hi", "kawa", "san"], 3)  # or pull from DB
    print({
        "type": "reading",
        "question": question,
        "options": random.sample(distractors + [reading], 4),
        "answer": reading
    })
    return {
        "type": "reading",
        "question": question,
        "options": random.sample(distractors + [reading], 4),
        "answer": reading
    }
def generate_reading_to_kanji_quiz(target_kanji, kanji_pool):
    question = f"Which of these kanji have a reading '{target_kanji['readings']}'?"
    correct = target_kanji['kanji']
    distractors = random.sample(
        [k['kanji'] for k in kanji_pool], 3
    )
    print({
        "type": "reading_to_kanji",
        "question": question,
        "options": random.sample(distractors + [correct], 4),
        "answer": correct
    })
    return {
        "type": "reading_to_kanji",
        "question": question,
        "options": random.sample(distractors + [correct], 4),
        "answer": correct
    }

def get_kanji_from_db(kanji_char: str, kanji_entries: list[dict]) -> dict | None:
    for entry in kanji_entries:
        if entry["kanji"] == kanji_char:
            return entry
    return None

def get_all_words_except(kanji_char: str, kanji_entries: list[dict]) -> list[dict]:
    return [entry for entry in kanji_entries if entry["kanji"] != kanji_char]

def get_all_kanji_except(kanji_char: str, kanji_entries: list[dict]) -> list[dict]:
    return [entry for entry in kanji_entries if entry["kanji"] != kanji_char and len(entry["kanji"])==1]
def get_kanji_meanings(kanji_char: str, kanji_entries: list[dict]) -> list[dict]:
    meanings=[]
    for entry in kanji_entries:
        if entry["kanji"] == kanji_char:
            meanings.append(entry["meaning"])
            return meanings
    return None


@router.get("/quiz/{quiz_type}/{kanji_char}")
def get_quiz(quiz_type: str, kanji_char: str):
    KANJI_CHAR = kanji_char
    target = get_kanji_from_db(KANJI_CHAR, kanji_entries)
    pool = get_all_kanji_except(KANJI_CHAR, kanji_entries)

    if quiz_type == "meaning":
        return generate_meaning_quiz(target, pool)
    elif quiz_type == "reading":
        return generate_reading_quiz(target, pool)
    elif quiz_type == "reading_to_kanji":
        return generate_reading_to_kanji_quiz(target, pool)
    else:
        raise HTTPException(400, "Invalid quiz type")

# get_quiz("meaning")
# get_quiz("reading")
# get_quiz("reading_to_kanji")