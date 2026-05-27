"""
Asset Request router — CRUD endpoint untuk workflow request asset.
Updated: import dari struktur baru (app.models, app.schemas).
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import AssetRequest, Asset, User
from app.schemas import AssetRequestCreate, AssetRequestResponse, AssetRequestUpdate

router = APIRouter(
    prefix="/api/v1/asset-requests",
    tags=["Asset Requests"],
)


@router.get("/", response_model=List[AssetRequestResponse])
def get_all_requests(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Mengambil semua asset request dari database (paginated)."""
    return db.query(AssetRequest).offset(skip).limit(limit).all()


@router.get("/{request_id}", response_model=AssetRequestResponse)
def get_request(request_id: int, db: Session = Depends(get_db)):
    """Ambil 1 asset request by id."""
    request = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset request with id {request_id} not found",
        )
    return request


@router.post("/", response_model=AssetRequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(request_in: AssetRequestCreate, user_id: str, db: Session = Depends(get_db)):
    """
    Buat asset request baru.
    TODO: user_id harus di-inject dari JWT token, bukan dari parameter.
    TODO: risk_score_snapshot dan risk_tier_snapshot harus di-calculate dari AI service.
    TODO: request_code harus di-generate dengan format tertentu (misal: REQ-2024-0001).
    """
    # Validate asset exists
    asset = db.query(Asset).filter(Asset.id == request_in.asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with id {request_in.asset_id} not found",
        )

    # Validate user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )

    # TODO: Generate request_code dan risk snapshot dari service layer
    request_data = request_in.model_dump()
    request_data["user_id"] = user_id
    request_data["request_code"] = "REQ-TEMP"  # TODO: Replace dengan generated code
    request_data["risk_score_snapshot"] = 0  # TODO: Calculate dari user risk profile
    request_data["risk_tier_snapshot"] = "Low"  # TODO: Calculate dari user risk profile

    new_request = AssetRequest(**request_data)
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request


@router.patch("/{request_id}", response_model=AssetRequestResponse)
def update_request(request_id: int, request_in: AssetRequestUpdate, db: Session = Depends(get_db)):
    """Update partial asset request (approve/reject)."""
    request = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset request with id {request_id} not found",
        )

    update_data = request_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(request, key, value)

    db.commit()
    db.refresh(request)
    return request


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_request(request_id: int, db: Session = Depends(get_db)):
    """Hapus asset request. FK-restrict kalau sudah ada transaction terkait."""
    request = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset request with id {request_id} not found",
        )
    db.delete(request)
    db.commit()
    return None
