"""
Centralized settings — semua environment variables dibaca dari .env di sini.
Import settings dari modul lain:
    from app.core.config import settings
"""
# PERBAIKAN M2: Import SettingsConfigDict
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str

    # ── JWT / Auth ────────────────────────────────────────────────────────────
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # PERBAIKAN M2 & SOLUSI ERROR: Gunakan model_config dan abaikan variabel asing (extra="ignore")
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()