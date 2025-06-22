from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship, declarative_base
from backend_python.db.database import SessionLocal, Base

class User(Base):
    __tablename__ = 'users'

    user_id = Column(Integer, primary_key=True,  autoincrement=True)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    dictionary_entries = relationship("DictionaryEntry", back_populates="user")


class KanjiMaster(Base):
    __tablename__ = 'kanji_master'

    kanji_id = Column(Integer, primary_key=True, autoincrement=True)
    character = Column(String(1), unique=True, nullable=False)
    meaning = Column(Text, nullable=False)
    reading = Column(String(100), nullable=True)
    radical = Column(String(10), nullable=True)
    stroke_count = Column(Integer, nullable=True)
    example_sentences = Column(Text, nullable=True)

    dictionary_entries = relationship("DictionaryEntry", back_populates="kanji")


class DictionaryEntry(Base):
    __tablename__ = 'dictionary_entry'

    dict_id = Column(Integer, primary_key=True, autoincrement=True)
    kanji_id = Column(Integer, ForeignKey("kanji_master.kanji_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    note = Column(Text, nullable=True)
    photo_pass = Column(String(255), nullable=True)
    added_at = Column(DateTime, server_default=func.now())

    kanji = relationship("KanjiMaster", back_populates="dictionary_entries")
    user = relationship("User", back_populates="dictionary_entries")


session = SessionLocal()

