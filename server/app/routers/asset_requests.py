"""
Asset Request router — CRUD endpoint untuk workflow request asset.
"""
from typing import List, Optional
from datetime import datetime, timezone
from uuid import UUID
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models import AssetRequest, Asset, User, Transaction, Invoice
from app.schemas import AssetRequestCreate, AssetRequestResponse, AssetRequestUpdate, TransactionCreate
from app.services.code_generator import generate_request_code, generate_transaction_code, generate_invoice_code
from app.services.behavior_service import record_return, record_fine_issued

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
    current_user: User = Depends(get_current_user),
):
    """
    Mengambil semua asset request dari database.
    - Admin/Manager/Finance: bisa lihat semua
    - User biasa: hanya bisa lihat miliki sendiri
    """
    query = db.query(AssetRequest)
    
    if current_user.role == "user":
        # User biasa hanya boleh lihat request miliknya sendiri
        query = query.filter(AssetRequest.user_id == current_user.id)
    elif user_id:
        # Admin/Manager bisa filter by user_id
        query = query.filter(AssetRequest.user_id == UUID(user_id))

    if status_filter:
        query = query.filter(AssetRequest.status == status_filter)
    
    return query.offset(skip).limit(limit).all()

@router.get("/{request_id}", response_model=AssetRequestResponse)
def get_request(request_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Ambil 1 asset request by id."""
    request = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset request with id {request_id} not found",
        )
    return request

@router.post("/", response_model=AssetRequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(request_in: AssetRequestCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Buat asset request baru.
    user_id harus di-inject dari JWT token, bukan dari parameter.
    TODO: risk_score_snapshot dan risk_tier_snapshot harus di-calculate dari risk_service.
    """
    # Validate asset exists dan available
    asset = db.query(Asset).filter(Asset.id == request_in.asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with id {request_in.asset_id} not found",
        )
    if asset.status != "available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Asset with id {request_in.asset_id} is not available. Current status: {asset.status}",
        )

    request_data = request_in.model_dump()
    request_data["user_id"] = current_user.id # Inject dari JWT
    request_data["request_code"] = generate_request_code(db)
    request_data["risk_score_snapshot"] = current_user.risk_score
    request_data["risk_tier_snapshot"] = current_user.risk_score_tier
    request_data["ai_decision_reason"] = f"User risk tier: {current_user.risk_score_tier}"
    
    # Routing berdasarkan risk tier
    if current_user.risk_score_tier in ["High", "Critical"]:
        request_data["status"] = "pending_manager"  # Harus review manager
    else:
        request_data["status"] = "pending_admin" # Review admin

    new_request = AssetRequest(**request_data)
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

@router.patch("/{request_id}", response_model=AssetRequestResponse)
def update_request(request_id: int, request_in: AssetRequestUpdate, db: Session = Depends(get_db), _: User = Depends(require_role("admin", "manager"))):
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
def delete_request(request_id: int, db: Session = Depends(get_db), _: User = Depends(require_role("admin"))):
    """Hapus asset request. Admin only."""
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
def approve_request(request_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role("admin", "manager"))): # Inject dari JWT
    """
    Admin approve requst biasa. Manager approve request high risk.
    approved_by_id harus di-inject dari JWT token, bukan dari parameter.
    """
    request = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset request with id {request_id} not found",
        )
    
    if request.status not in ["pending_admin", "pending_manager"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve request with status {request.status}",
        )
    
    request.status = "approved"
    request.approved_by = current_user.id # Inject dari JWT
    request.approved_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(request)
    return request

@router.patch("/{request_id}/reject", response_model=AssetRequestResponse)
def reject_request(
    request_id: int,
    rejection_reason: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager")), # Inject dari JWT
):
    """
    Manager/Admin reject asset request.
    rejected_by_id harus di-inject dari JWT token, bukan dari parameter.
    """
    request = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset request with id {request_id} not found",
        )
    
    if request.status not in ["pending_admin", "pending_manager"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject request with status {request.status}",
        )
    
    request.status = "rejected"
    request.rejection_reason = rejection_reason
    request.approved_by = current_user.id  # Track siapa yang reject
    request.approved_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(request)
    return request

@router.patch("/{request_id}/return", response_model=AssetRequestResponse)
def process_return(
    request_id: int,
    condition_notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")) # Admin yang log pengembalian
):
    """
    User return asset.
    Otomatis: cek keterlambatan, hitung denda, buat Invoice, buat Transaction, update behavior stats.
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
    
    now = datetime.now(timezone.utc)
    return_date = now.date()

    # 1. Cek keterlambatan
    days_late = (return_date - request.requested_end).days
    is_late = days_late > 0
    
    # 2. Update status request
    request.status = "returned"
    request.updated_at = now

    # 3. Update asset kembali ke 'available'
    asset = db.query(Asset).filter(Asset.id == request.asset_id).first()
    if asset:
        asset.status = "available"

    # 4. Buat Transaction record (immutable ledger)
    last_txn = db.query(Transaction).order_by(Transaction.id.desc()).first()
    previous_hash = last_txn.current_hash if last_txn else None

    transaction = Transaction(
        transaction_code=generate_transaction_code(db),
        request_id=request.id,
        asset_id=request.asset_id,
        borrower_id=request.user_id,
        admin_id=current_user.id,
        action="return",
        payload={
            "days_late": days_late,
            "is_late": is_late,
            "condition_notes": condition_notes or "",
            "return_date": return_date.isoformat(),
        },
        previous_hash=previous_hash,
        current_hash="0" * 64, # Placeholder (diisi ledger_service pada step berikutnya)
        status="committed",
    )
    db.add(transaction)
    db.flush() # Flush agar transaction.id tersedia untuk invoice
    
    # 5. Auto-generate Invoice jika terlambat
    if is_late and asset:
        # Rumus denda: Rp. 50.000 per hari keterlambatan
        DAILY_FINE = Decimal("50000")
        fine_amount = DAILY_FINE * days_late

        invoice = Invoice(
            invoice_code=generate_invoice_code(db),
            transaction_id=transaction.id,
            user_id=request.user_id,
            fine_amount=fine_amount,
            reason=f"Late return by {days_late} days (deadline: {request.requested_end})",
            status="unpaid",
        )
        db.add(invoice)
        
        # Update behavior stats: catat denda
        record_fine_issued(db, request.user_id, fine_amount)

    # 6. Update behavior stats: catat return
    record_return(db, request.user_id, request.id, now)
   
    db.commit()
    db.refresh(request)
    return request
