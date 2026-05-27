"""
Asset router — CRUD endpoint untuk inventory asset.
Updated: import dari struktur baru (app.models, app.schemas).
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Asset
from app.schemas import AssetCreate, AssetResponse, AssetUpdate

router = APIRouter(
    prefix="/api/v1/assets",
    tags=["Assets"],
)


@router.get("/", response_model=List[AssetResponse])
def get_all_assets(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Mengambil semua data aset dari database (paginated)."""
    return db.query(Asset).offset(skip).limit(limit).all()


@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset(asset_id: int, db: Session = Depends(get_db)):
    """Ambil 1 aset by id."""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with id {asset_id} not found",
        )
    return asset


@router.post("/", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
def create_asset(asset_in: AssetCreate, db: Session = Depends(get_db)):
    """Buat asset baru."""
    existing = db.query(Asset).filter(Asset.asset_code == asset_in.asset_code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Asset code '{asset_in.asset_code}' already exists",
        )

    new_asset = Asset(**asset_in.model_dump())
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return new_asset


@router.patch("/{asset_id}", response_model=AssetResponse)
def update_asset(asset_id: int, asset_in: AssetUpdate, db: Session = Depends(get_db)):
    """Update partial 1 asset."""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with id {asset_id} not found",
        )

    update_data = asset_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(asset, key, value)

    db.commit()
    db.refresh(asset)
    return asset


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asset(asset_id: int, db: Session = Depends(get_db)):
    """Hapus asset (hard delete). FK-restrict kalau masih ada transaction terkait."""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with id {asset_id} not found",
        )
    db.delete(asset)
    db.commit()
    return None
