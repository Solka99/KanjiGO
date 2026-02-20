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
KanjiGO requires a local PostgreSQL database. Follow these steps to create your own database and tables.
1. Open your DB client.
2. Connect to localhost with your PostgreSQL username.
3. Right-click the server → Create → Database
4. Name it kanji_db and save.
5. Configure environment variables in .env
6.
```bash
db_user=postgres
db_password=your_password
db_host=localhost
db_port=5432
db_database=kanji_db

kanji_alive_api_key=your_api_key
kanji_alive_api_host=kanjialive-api.p.rapidapi.com
```

7. Create tables from models:
python -m backend_python.db.create_tables
8. Verify the Database
Check your tables in any DB client:

```sql
SELECT * FROM users;
```
If you see the empty tables, your database is ready.
