"""
FastAPI entry point untuk AFH Backend.
"""
import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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
    ledger,
    notifications
)

app = FastAPI(
    title="AFH Backend - AI-Assisted IT Lifecycle",
    description="Sistem manajemen aset IT dengan AI Risk Scoring, Immutable Ledger, dan Secure Handover",
    version="1.0.0",
)

# CORS — Membatasi akses untuk Frontend lokal
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount directory uploads lokal
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# ── Register routers ──────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(assets.router)
app.include_router(users.router)
app.include_router(asset_requests.router)
app.include_router(transactions.router)
app.include_router(incidents.router)
app.include_router(invoices.router)
app.include_router(ledger.router)
app.include_router(notifications.router)

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
