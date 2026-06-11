"""
FastAPI entry point untuk AFH Backend.
"""
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.routers import (
    auth,
    assets,
    users,
    asset_requests,
    transactions,
    incidents,
    invoices,
    handover_tokens,
)

app = FastAPI(
    title="AFH Backend - AI-Assisted IT Lifecycle",
    description="Sistem manajemen aset IT dengan AI Risk Scoring, Immutable Ledger, dan Secure Handover",
    version="1.0.0",
)

# CORS — Membatasi akses hanya untuk Frontend Vite lokal
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ], # PERBAIKAN M3: Keamanan CORS yang lebih ketat
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ──────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(assets.router)
app.include_router(users.router)
app.include_router(asset_requests.router)
app.include_router(transactions.router)
app.include_router(incidents.router)
app.include_router(invoices.router)
app.include_router(handover_tokens.router)


@app.get("/", tags=["Health"])
def health_check():
    """Endpoint dasar untuk memeriksa status server berjalan."""
    return {
        "status": "Online",
        "message": "Backend FastAPI AFH berjalan dengan lancar!",
    }


@app.get("/api/v1/test-supabase", tags=["Health"])
def test_supabase_connection(db: Session = Depends(get_db)):
    """Endpoint untuk memastikan koneksi ke Supabase berhasil."""
    try:
        db.execute(text("SELECT 1"))
        return {"status": "Success", "message": "Terhubung ke Supabase!"}
    except Exception as e:
        return {"status": "Error", "message": str(e)}
