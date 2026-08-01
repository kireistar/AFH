"""
Asset router — CRUD endpoint untuk inventory asset.
RBAC: read = semua role, write = admin only.
"""
import os
import shutil
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models import Asset, User, AssetRequest, Transaction
from app.schemas import AssetCreate, AssetResponse, AssetUpdate
from app.services.code_generator import generate_asset_code

router = APIRouter(
    prefix="/api/v1/assets",
    tags=["Assets"],
)


@router.post("/upload-image")
def upload_asset_image(
    file: UploadFile = File(...),
    _: User = Depends(require_role("admin")),
):
    """Upload file gambar lokal untuk hardware asset (max 5MB)."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type must be an image (JPEG, PNG, WEBP, SVG, etc.)."
        )

    # Validate file size (max 5MB)
    MAX_FILE_SIZE = 5 * 1024 * 1024
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum allowed limit of 5MB."
        )

    ext = os.path.splitext(file.filename or "")[1] or ".png"
    unique_name = f"{uuid.uuid4().hex}{ext}"

    uploads_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
    os.makedirs(uploads_dir, exist_ok=True)

    file_path = os.path.join(uploads_dir, unique_name)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"image_url": f"/uploads/{unique_name}"}


@router.get("/", response_model=List[AssetResponse])
def get_all_assets(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Mengambil semua aset (semua role yang login)."""
    limit = min(max(1, limit), 200)
    query = db.query(Asset)
    if status_filter:
        query = query.filter(Asset.status == status_filter)
    assets = query.offset(skip).limit(limit).all()

    borrowed_asset_ids = [a.id for a in assets if a.status == "borrowed"]
    if borrowed_asset_ids:
        # 1. Look up active handed_over AssetRequests
        active_requests = (
            db.query(AssetRequest)
            .filter(
                AssetRequest.asset_id.in_(borrowed_asset_ids),
                AssetRequest.status == "handed_over",
            )
            .all()
        )
        borrower_map = {req.asset_id: req.user for req in active_requests if req.user}

        # 2. Fallback to latest Transaction for remaining borrowed assets
        unresolved_ids = [aid for aid in borrowed_asset_ids if aid not in borrower_map]
        if unresolved_ids:
            txns = (
                db.query(Transaction)
                .filter(
                    Transaction.asset_id.in_(unresolved_ids),
                    Transaction.action.in_(["handover", "return"])
                )
                .order_by(Transaction.id.asc())
                .all()
            )
            latest_tx_map = {}
            for tx in txns:
                latest_tx_map[tx.asset_id] = tx
            
            for aid, tx in latest_tx_map.items():
                if tx.action == "handover" and tx.borrower:
                    borrower_map[aid] = tx.borrower

        for a in assets:
            if a.status == "borrowed" and a.id in borrower_map:
                setattr(a, "borrowed_by", borrower_map[a.id])

    # Compute has_borrow_history for all assets
    all_asset_ids = [a.id for a in assets]
    if all_asset_ids:
        tx_asset_ids = set(
            row[0] for row in db.query(Transaction.asset_id)
            .filter(Transaction.asset_id.in_(all_asset_ids), Transaction.action == "handover")
            .all()
        )
        req_asset_ids = set(
            row[0] for row in db.query(AssetRequest.asset_id)
            .filter(AssetRequest.asset_id.in_(all_asset_ids))
            .all()
        )
        history_asset_ids = tx_asset_ids.union(req_asset_ids)
        for a in assets:
            setattr(a, "has_borrow_history", a.id in history_asset_ids)

    return assets


@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Ambil 1 aset by id (semua role yang login)."""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Asset with id {asset_id} not found")
    if asset.status == "borrowed":
        # 1. Check active AssetRequest
        active_req = (
            db.query(AssetRequest)
            .filter(
                AssetRequest.asset_id == asset.id,
                AssetRequest.status == "handed_over",
            )
            .order_by(AssetRequest.updated_at.desc())
            .first()
        )
        if active_req and active_req.user:
            setattr(asset, "borrowed_by", active_req.user)
        else:
            # 2. Fallback to latest Transaction
            latest_txn = (
                db.query(Transaction)
                .filter(Transaction.asset_id == asset.id, Transaction.action.in_(["handover", "return"]))
                .order_by(Transaction.id.desc())
                .first()
            )
            if latest_txn and latest_txn.action == "handover" and latest_txn.borrower:
                setattr(asset, "borrowed_by", latest_txn.borrower)

    has_tx = db.query(Transaction).filter(Transaction.asset_id == asset.id, Transaction.action == "handover").first() is not None
    has_req = db.query(AssetRequest).filter(AssetRequest.asset_id == asset.id).first() is not None
    setattr(asset, "has_borrow_history", has_tx or has_req)

    return asset


@router.post("/", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
def create_asset(
    asset_in: AssetCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """Buat asset baru. Admin only."""
    # Generate asset_code automatically based on category
    asset_code = generate_asset_code(db, asset_in.category.value)
    
    asset_data = asset_in.model_dump()
    asset_data["asset_code"] = asset_code
    
    new_asset = Asset(**asset_data)
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    setattr(new_asset, "has_borrow_history", False)
    return new_asset


@router.patch("/{asset_id}", response_model=AssetResponse)
def update_asset(
    asset_id: int,
    asset_in: AssetUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """Update partial asset. Admin only."""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Asset with id {asset_id} not found")
    for key, value in asset_in.model_dump(exclude_unset=True).items():
        setattr(asset, key, value)
    db.commit()
    db.refresh(asset)

    has_tx = db.query(Transaction).filter(Transaction.asset_id == asset.id, Transaction.action == "handover").first() is not None
    has_req = db.query(AssetRequest).filter(AssetRequest.asset_id == asset.id).first() is not None
    setattr(asset, "has_borrow_history", has_tx or has_req)
    return asset


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """Hapus asset. Admin only (hanya untuk asset baru / belum pernah dipinjam)."""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Asset with id {asset_id} not found")

    has_tx = db.query(Transaction).filter(Transaction.asset_id == asset_id, Transaction.action == "handover").first() is not None
    has_req = db.query(AssetRequest).filter(AssetRequest.asset_id == asset_id).first() is not None
    if has_tx or has_req:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete an asset that has borrowing history or active requests."
        )

    db.delete(asset)
    db.commit()
    return None
