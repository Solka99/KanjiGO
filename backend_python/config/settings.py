from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    db_user: str
    db_password: str
    db_host: str = "localhost"
    db_port: int = 5432
    db_database: str

    kanji_alive_api_key: str
    kanji_alive_api_host: str

    port: int = 8000

    class Config:
        env_file = ".env"

settings = Settings()
