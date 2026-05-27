from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

# Membuat engine koneksi ke Supabase PostgreSQL
engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Fungsi bantuan untuk membuka dan menutup sesi database otomatis per HTTP request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
