from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import engine, get_db
from app.routers import assets

app = FastAPI(
    title="AFH Backend - Supabase Edition",
    description="Sistem AI-Assisted IT Lifecycle dengan arsitektur modular resmi",
    version="1.0.0"
)

# Konfigurasi CORS agar Frontend (Vite) dapat mengakses API backend ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ubah menjadi URL spesifik frontend saat production (misal: http://localhost:5173)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daftarkan semua modul perutean (routers)
app.include_router(assets.router)

@app.get("/")
def health_check():
    """Endpoint dasar untuk memeriksa status server berjalan."""
    return {
        "status": "Online",
        "message": "Backend FastAPI AFH berjalan dengan lancar dari folder server!"
    }

@app.get("/api/v1/test-supabase")
def test_supabase_connection(db: Session = Depends(get_db)):
    """Endpoint untuk memastikan integrasi ke Cloud Database Supabase sukses."""
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "Success",
            "message": "Luar biasa! FastAPI berhasil terhubung ke Cloud Database Supabase!"
        }
    except Exception as e:
        return {
            "status": "Error",
            "detail": f"Gagal terhubung ke Supabase. Kebocoran konfigurasi atau jaringan. Error: {str(e)}"
        }