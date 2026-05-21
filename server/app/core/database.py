import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Memuat variabel lingkungan dari file .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Membuat engine koneksi ke Supabase PostgreSQL
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Fungsi bantuan untuk membuka dan menutup sesi database otomatis per HTTP request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()