"""
Asset Request router — workflow request asset.
RBAC:
  - POST   : user (buat request, user_id dari JWT)
  - GET    : admin, manager
  - PATCH  : admin, manager (approve/reject)
  - DELETE : admin
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models import Asset, AssetRequest, User
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
    _: User = Depends(require_role("admin", "manager")),
):
    """Semua request. Admin & Manager only."""
    return db.query(AssetRequest).offset(skip).limit(limit).all()


@router.get("/{request_id}", response_model=AssetRequestResponse)
def get_request(
    request_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin", "manager")),
):
    """Ambil 1 request by id. Admin & Manager only."""
    req = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Asset request with id {request_id} not found")
    return req


@router.post("/", response_model=AssetRequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(
    request_in: AssetRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("user")),
):
    """
    Buat request baru. User only.
    user_id di-inject dari JWT — user tidak bisa request atas nama orang lain.

    TODO (AI scope): generate request_code, hitung risk_score_snapshot dari AI service.
    """
    asset = db.query(Asset).filter(Asset.id == request_in.asset_id).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Asset with id {request_in.asset_id} not found")

    request_data = request_in.model_dump()
    request_data["user_id"] = current_user.id
    request_data["request_code"] = "REQ-TEMP"       # TODO: generate kode
    request_data["risk_score_snapshot"] = 0          # TODO: AI risk score
    request_data["risk_tier_snapshot"] = "Low"       # TODO: AI risk tier

    new_request = AssetRequest(**request_data)
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request


@router.patch("/{request_id}", response_model=AssetRequestResponse)
def update_request(
    request_id: int,
    request_in: AssetRequestUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin", "manager")),
):
    """Approve / reject request. Admin & Manager only."""
    req = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Asset request with id {request_id} not found")
    for key, value in request_in.model_dump(exclude_unset=True).items():
        setattr(req, key, value)
    db.commit()
    db.refresh(req)
    return req


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_request(
    request_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """Hapus request. Admin only."""
    req = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Asset request with id {request_id} not found")
    db.delete(req)
    db.commit()
    return None
