"""
Asset Request router — CRUD endpoint untuk workflow request asset.
Updated: import dari struktur baru (app.models, app.schemas).
"""
from typing import List, Optional
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import AssetRequest, Asset, User
from app.schemas import AssetRequestCreate, AssetRequestResponse, AssetRequestUpdate
from app.services.code_generator import generate_request_code

router = APIRouter(
    prefix="/api/v1/asset-requests",
    tags=["Asset Requests"],
)


@router.get("/", response_model=List[AssetRequestResponse])
def get_all_requests(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    user_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Mengambil semua asset request dari database (paginated).
    Optional filters:
    - status_filter: "pending", "escalated", "approved", "handed_over", "returned"
    - user_id: filter by user UUID
    """
    query = db.query(AssetRequest)
    
    if status_filter:
        query = query.filter(AssetRequest.status == status_filter)
    
    if user_id:
        query = query.filter(AssetRequest.user_id == UUID(user_id))
    
    return query.offset(skip).limit(limit).all()


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
    TODO: risk_score_snapshot dan risk_tier_snapshot harus di-calculate dari risk_service.
    """
    # Validate asset exists
    asset = db.query(Asset).filter(Asset.id == request_in.asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with id {request_in.asset_id} not found",
        )

    # Validate user exists
    user = db.query(User).filter(User.id == UUID(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )

    # Generate request_code (format: REQ-YYYYMMDD-XXXX)
    now = datetime.now(timezone.utc)
    date_part = now.strftime("%Y%m%d")
    
    # Count requests hari ini untuk sequence number
    today_count = db.query(AssetRequest).filter(
        AssetRequest.request_code.like(f"REQ-{date_part}%")
    ).count() + 1
    
    request_code = f"REQ-{date_part}-{today_count:04d}"

    # TODO: Call risk_service.calculate_risk_score() untuk risk snapshot
    # Untuk sekarang: placeholder values
    request_data = request_in.model_dump()
    request_data["user_id"] = UUID(user_id)
    request_data["request_code"] = generate_request_code(db)
    request_data["risk_score_snapshot"] = user.risk_score  # Use current user risk
    request_data["risk_tier_snapshot"] = user.risk_score_tier
    request_data["ai_decision_reason"] = f"User risk tier: {user.risk_score_tier}"
    
    # Determine initial status based on risk tier
    if user.risk_score_tier in ["High", "Critical"]:
        request_data["status"] = "escalated"  # Manager needs to review
    else:
        request_data["status"] = "approved"  # Auto-approved
        request_data["approved_by"] = user.id  # Self-approved by system

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


@router.patch("/{request_id}/approve", response_model=AssetRequestResponse)
def approve_request(request_id: int, approved_by_id: str, db: Session = Depends(get_db)):
    """
    Manager/Admin approve asset request.
    TODO: approved_by_id harus di-inject dari JWT token, bukan dari parameter.
    """
    request = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset request with id {request_id} not found",
        )
    
    if request.status not in ["pending", "escalated"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve request with status {request.status}",
        )
    
    # Validate approver exists
    approver = db.query(User).filter(User.id == UUID(approved_by_id)).first()
    if not approver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Approver with id {approved_by_id} not found",
        )
    
    request.status = "approved"
    request.approved_by = UUID(approved_by_id)
    request.approved_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(request)
    return request


@router.patch("/{request_id}/reject", response_model=AssetRequestResponse)
def reject_request(
    request_id: int,
    rejection_reason: str,
    rejected_by_id: str,
    db: Session = Depends(get_db),
):
    """
    Manager/Admin reject asset request.
    TODO: rejected_by_id harus di-inject dari JWT token, bukan dari parameter.
    """
    request = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset request with id {request_id} not found",
        )
    
    if request.status not in ["pending", "escalated"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject request with status {request.status}",
        )
    
    # Validate rejector exists
    rejector = db.query(User).filter(User.id == UUID(rejected_by_id)).first()
    if not rejector:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rejector with id {rejected_by_id} not found",
        )
    
    request.status = "rejected"
    request.rejection_reason = rejection_reason
    request.approved_by = UUID(rejected_by_id)  # Track who rejected
    request.approved_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(request)
    return request


@router.patch("/{request_id}/return", response_model=AssetRequestResponse)
def process_return(
    request_id: int,
    returned_by_id: str,
    condition_notes: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    User return asset.
    TODO: trigger fine calculation jika late/damage.
    TODO: create transaction record (action='return').
    TODO: call update_user_behavior_stats() untuk update risk score.
    """
    request = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset request with id {request_id} not found",
        )
    
    if request.status != "handed_over":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot return request with status {request.status}. Must be 'handed_over'.",
        )
    
    # Validate returner exists
    returner = db.query(User).filter(User.id == UUID(returned_by_id)).first()
    if not returner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {returned_by_id} not found",
        )
    
    request.status = "returned"
    request.updated_at = datetime.now(timezone.utc)
    
    # TODO: Calculate late fine if returned_at > requested_end
    # TODO: Auto-generate invoice if late
    # TODO: Create transaction record
    # TODO: Update asset status = 'available'
    
    db.commit()
    db.refresh(request)
    return request
