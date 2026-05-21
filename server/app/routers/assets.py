from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.models import Asset
from .schemas import AssetCreate, AssetResponse  # Sesuaikan path impor schemas Anda
from typing import List

router = APIRouter(
    prefix="/api/v1/assets",
    tags=["Assets"]
)

@router.get("/", response_model=List[AssetResponse])
def get_all_assets(db: Session = Depends(get_db)):
    """Mengambil semua data aset riil langsung dari database Supabase."""
    assets_data = db.query(Asset).all()
    return assets_data

@router.post("/", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
def create_asset(asset_in: AssetCreate, db: Session = Depends(get_db)):
    """Menyimpan data aset baru secara permanen ke dalam tabel Supabase."""
    new_asset = Asset(
        asset_name=asset_in.asset_name,
        category=asset_in.category,
        status=asset_in.status
    )
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return new_asset