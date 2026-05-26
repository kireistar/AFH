"""
FastAPI entry point untuk AFH Backend.
Router lain (auth, users, requests, dll) akan ditambahkan di Tahap 2+.
"""
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.routers import assets, users

app = FastAPI(
    title="AFH Backend - Supabase Edition",
    description="Sistem AI-Assisted IT Lifecycle dengan arsitektur modular resmi",
    version="1.0.0",
)

# CORS — saat production ubah allow_origins ke URL spesifik (mis. http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers (tambah baris baru per router saat Tahap 2+)
app.include_router(assets.router)
app.include_router(users.router)


@app.get("/")
def health_check():
    """Endpoint dasar untuk memeriksa status server berjalan."""
    return {
        "status": "Online",
        "message": "Backend FastAPI AFH berjalan dengan lancar dari folder server!",
    }


@app.get("/api/v1/test-supabase")
def test_supabase_connection(db: Session = Depends(get_db)):
    """Endpoint untuk memastikan integrasi ke Cloud Database Supabase sukses."""
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "Success",
            "message": "FastAPI berhasil terhubung ke Cloud Database Supabase!",
        }
    except Exception as e:
        return {
            "status": "Error",
            "detail": f"Gagal terhubung ke Supabase. Error: {str(e)}",
        }
