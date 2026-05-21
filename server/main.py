from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from .core.database import engine, get_db

app = FastAPI(
    title="AFH Backend - Supabase Edition",
    description="Sistem AI-Assisted IT Lifecycle dengan arsitektur modular",
    version="1.0.0"
)

@app.get("/")
def health_check():
    return {
        "status": "Online",
        "message": "Backend FastAPI AFH berjalan menggunakan modul alternatif!"
    }

@app.get("/api/v1/test-supabase")
def test_supabase_connection(db: Session = Depends(get_db)):
    try:
        # Menjalankan query uji coba ke Supabase
        db.execute(text("SELECT 1"))
        return {
            "status": "Success",
            "message": "Luar biasa! FastAPI berhasil terhubung ke Cloud Database Supabase!"
        }
    except Exception as e:
        return {
            "status": "Error",
            "detail": f"Gagal terhubung ke Supabase. Error: {str(e)}"
        }