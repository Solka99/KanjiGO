# KanjiGO

**KanjiGO** is an application for learning Japanese kanji characters. The project helps users practice and memorize kanji they encounter in the real world.
---

## Project Goal

The goal of KanjiGO is to provide an interactive learning experience for Japanese kanji characters by:

- Take a photo of kanji seen in the real world
- Add the kanji to a personal library
- Learn and review kanji through various quizzes


## How to Run

### 1. Frontend

Navigate to the `frontend` folder and run:

```bash
cd frontend
npm install
expo start
```

### 2. Backend
```bash
cd backend_python
python -m venv .venv
pip install -r requirements.txt
uvicorn main:app --reload
```
### 3. Database Setup
1. Configure environment variables in .env
db_user=postgres
db_password=your_password
db_host=localhost
db_port=5432
db_database=kanji_db

kanji_alive_api_key=your_api_key
kanji_alive_api_host=kanjialive-api.p.rapidapi.com

2. Create tables from models:
python -m backend_python.db.create_tables
