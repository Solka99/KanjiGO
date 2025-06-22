from sqlalchemy import create_engine
from backend_python.config.settings import settings
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = (
    f"postgresql://{settings.db_user}:{settings.db_password}"
    f"@{settings.db_host}:{settings.db_port}/{settings.db_database}"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# stmt = text("SELECT x, y FROM some_table WHERE y > :y ORDER BY x, y")
# with Session(engine) as session:
#     result = session.execute(stmt, {"y": 6})
#     for row in result:
#          print(f"x: {row.x}  y: {row.y}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
