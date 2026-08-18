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
from app.models import AssetRequest, Asset, User, Transaction, Invoice, Incident
from app.schemas import AssetRequestCreate, AssetRequestResponse, AssetRequestUpdate, TransactionCreate
from app.services.code_generator import generate_request_code, generate_transaction_code, generate_invoice_code
from app.services.behavior_service import record_return, record_fine_issued, record_damage, record_lost
from app.services.risk_service import calculate_and_update_risk

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
    limit = min(max(1, limit), 200)
    query = db.query(AssetRequest)
    
    if current_user.role == "user":
        # User biasa hanya boleh lihat request miliknya sendiri
        query = query.filter(AssetRequest.user_id == current_user.id)
    elif user_id:
        # Admin/Manager bisa filter by user_id
        try:
            target_uuid = UUID(user_id)
            query = query.filter(AssetRequest.user_id == target_uuid)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid UUID format for user_id: '{user_id}'",
            )

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
    score, tier, reason = calculate_and_update_risk(db, current_user.id)
    request_data["user_id"] = current_user.id # Inject dari JWT
    request_data["request_code"] = generate_request_code(db)
    request_data["risk_score_snapshot"] = score
    request_data["risk_tier_snapshot"] = tier
    request_data["ai_decision_reason"] = reason
    
    # Routing berdasarkan risk tier
    if tier == "High":
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
    """Update partial asset request (rejection_reason only — status is managed by dedicated approve/reject/return endpoints)."""
    request = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset request with id {request_id} not found",
        )
    update_data = request_in.model_dump(exclude_unset=True)
    # Status must NOT be freely settable here — it would bypass notifications,
    # ledger, and behavior tracking. Only metadata fields are editable.
    update_data.pop("status", None)
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
    Admin approve request biasa (pending_admin). Manager approve request high risk (pending_manager).
    approved_by harus di-inject dari JWT token, bukan dari parameter.
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
    
    # Role separation: high-risk requests routed to pending_manager must be approved by a manager,
    # not an admin. Admin may approve normal (pending_admin) requests.
    if request.status == "pending_manager" and current_user.role != "manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="High-risk requests must be approved by a manager.",
        )

    # Re-check current risk: if user's risk has escalated to High since the request
    # was created, escalate to Manager instead of allowing Admin to approve.
    if current_user.role != "manager":
        current_score, current_tier, current_reason = calculate_and_update_risk(db, request.user_id)
        if current_tier == "High":
            request.status = "pending_manager"
            request.risk_score_snapshot = current_score
            request.risk_tier_snapshot = current_tier
            request.ai_decision_reason = current_reason
            db.commit()
            db.refresh(request)
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User's risk has escalated to High since this request was created. Request has been escalated to Manager for review.",
            )

    # Re-check asset availability — it may have been handed over or taken meanwhile.
    asset = db.query(Asset).filter(Asset.id == request.asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with id {request.asset_id} not found",
        )
    if asset.status != "available":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Asset is currently '{asset.status}' and cannot be approved for request.",
        )
    
    request.status = "approved"
    request.approved_by = current_user.id # Inject dari JWT
    request.approved_at = datetime.now(timezone.utc)

    # Emit notification to employee
    try:
        from app.models.notification import Notification
        notif = Notification(
            user_id=request.user_id,
            title="Asset Request Approved! 🎉",
            message=f"Permintaan asset #{request.request_code} Anda telah disetujui. Silakan generate QR Code untuk proses handover.",
            type="request_approved"
        )
        db.add(notif)
    except Exception as e:
        print(f"Failed to create notification: {e}")
    
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

    # Emit notification to employee
    try:
        from app.models.notification import Notification
        notif = Notification(
            user_id=request.user_id,
            title="Asset Request Rejected",
            message=f"Permintaan asset #{request.request_code} Anda ditolak. Alasan: {rejection_reason}",
            type="request_rejected"
        )
        db.add(notif)
    except Exception as e:
        print(f"Failed to create notification: {e}")
    
    db.commit()
    db.refresh(request)
    return request

@router.patch("/{request_id}/return", response_model=AssetRequestResponse)
def process_return(
    request_id: int,
    condition_notes: Optional[str] = None,
    return_condition: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """
    Admin process asset return.
    - Cek keterlambatan, hitung denda late return.
    - Admin bisa flag device issue via return_condition: 'damaged' atau 'lost'.
      * damaged → record_damage + invoice 1x harga asset
      * lost → record_lost + invoice 2x harga asset + asset retired
    """
    if return_condition and return_condition not in ("damaged", "lost"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid return_condition: '{return_condition}'. Must be 'damaged' or 'lost'.",
        )

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

    # 3. Update asset status
    asset = db.query(Asset).filter(Asset.id == request.asset_id).first()
    if asset:
        if return_condition == "lost":
            asset.status = "retired"
        elif return_condition == "damaged":
            asset.status = "available"
            asset.current_condition = "damaged"
        else:
            asset.status = "available"

    # 4. Buat Transaction record (immutable ledger)
    last_txn = db.query(Transaction).order_by(Transaction.id.desc()).first()
    previous_hash = last_txn.current_hash if last_txn else None

    payload_data = {
        "days_late": days_late,
        "is_late": is_late,
        "condition_notes": condition_notes or "",
        "return_condition": return_condition or "good",
        "return_date": return_date.isoformat(),
    }

    from app.services import ledger_service
    current_hash = ledger_service.calculate_transaction_hash(
        previous_hash=previous_hash,
        payload=payload_data,
        occurred_at=now,
    )

    transaction = Transaction(
        transaction_code=generate_transaction_code(db),
        request_id=request.id,
        asset_id=request.asset_id,
        borrower_id=request.user_id,
        admin_id=current_user.id,
        action="return",
        payload=payload_data,
        previous_hash=previous_hash,
        current_hash=current_hash,
        status="committed",
        occurred_at=now,
    )
    db.add(transaction)
    db.flush()

    # 5. Auto-generate Invoice jika terlambat
    if is_late and asset:
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
        record_fine_issued(db, request.user_id, fine_amount)

    # 6. Flag device issue — Admin menemukan kerusakan/kehilangan saat inspeksi fisik
    #    Cek apakah sudah ada incident report severe/lost untuk asset ini supaya tidak double-count.
    existing_incident = None
    if return_condition and asset:
        existing_incident = db.query(Incident).filter(
            Incident.asset_id == asset.id,
            Incident.severity.in_(["severe", "lost"]),
            Incident.status.in_(["open", "investigating"]),
        ).first()

    if return_condition == "damaged" and asset:
        if not existing_incident:
            record_damage(db, request.user_id)
        damage_fine = Decimal(str(asset.purchase_value)) * Decimal("1")
        already_fined = existing_incident and db.query(Invoice).filter(
            Invoice.user_id == request.user_id,
            Invoice.reason.ilike(f"%{asset.asset_name}%"),
            Invoice.status == "unpaid",
        ).first()
        if not already_fined:
            invoice = Invoice(
                invoice_code=generate_invoice_code(db),
                transaction_id=transaction.id,
                user_id=request.user_id,
                fine_amount=damage_fine,
                reason=f"Device returned damaged: {asset.asset_name}. {condition_notes or ''}".strip(),
                status="unpaid",
            )
            db.add(invoice)
            record_fine_issued(db, request.user_id, damage_fine)

    elif return_condition == "lost" and asset:
        if not existing_incident:
            record_lost(db, request.user_id)
        lost_fine = Decimal(str(asset.purchase_value)) * Decimal("2")
        already_fined = existing_incident and db.query(Invoice).filter(
            Invoice.user_id == request.user_id,
            Invoice.reason.ilike(f"%{asset.asset_name}%"),
            Invoice.status == "unpaid",
        ).first()
        if not already_fined:
            invoice = Invoice(
                invoice_code=generate_invoice_code(db),
                transaction_id=transaction.id,
                user_id=request.user_id,
                fine_amount=lost_fine,
                reason=f"Device lost/not returned: {asset.asset_name}. {condition_notes or ''}".strip(),
                status="unpaid",
            )
            db.add(invoice)
            record_fine_issued(db, request.user_id, lost_fine)

    # 7. Update behavior stats: catat return
    record_return(db, request.user_id, request.id, now)

    db.commit()
    db.refresh(request)
    return request


@router.post("/run-weekly-check")
def run_weekly_check(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """
    Admin-triggered weekly check untuk semua active loans (status handed_over).
    Memverifikasi bahwa:
      1. Asset masih dengan user (asset.status == 'borrowed'), dan
      2. User masih bekerja di perusahaan (employment_status Active / On Leave).

    Setiap pelanggaran menandai request dengan needs_review=True, mengirim
    notifikasi ke semua admin, dan mencatat audit log untuk ditindaklanjuti.
    """
    from app.models.notification import Notification
    from app.services.audit_service import log_admin_action

    ALLOWED_STATUSES = ["Active", "On Leave"]
    admin_users = db.query(User).filter(User.role == "admin").all()

    long_term_loans = db.query(AssetRequest).filter(
        AssetRequest.status == "handed_over",
    ).all()

    checked = len(long_term_loans)
    flagged = []
    issues = []

    for req in long_term_loans:
        user = db.query(User).filter(User.id == req.user_id).first()
        asset = db.query(Asset).filter(Asset.id == req.asset_id).first()

        reason = None
        if not user or user.employment_status not in ALLOWED_STATUSES:
            status = user.employment_status if user else "unknown"
            reason = f"User {user.employee_name if user else '?'} tidak lagi aktif (status: {status})"
        elif not asset or asset.status != "borrowed":
            reason = f"Asset {asset.asset_name if asset else '?'} tidak lagi bersama user (status: {asset.status if asset else 'unknown'})"

        if reason:
            req.needs_review = True
            flagged.append(req.id)
            issues.append({
                "request_code": req.request_code,
                "request_id": req.id,
                "user_id": str(req.user_id),
                "user_name": user.employee_name if user else None,
                "asset_id": req.asset_id,
                "asset_name": asset.asset_name if asset else None,
                "reason": reason,
            })

            for admin in admin_users:
                try:
                    notif = Notification(
                        user_id=admin.id,
                        title="Active Loan Review Needed",
                        message=(
                            f"Loan #{req.request_code} ({asset.asset_name if asset else 'Asset'}) "
                            f"perlu review. Alasan: {reason}"
                        ),
                        type="active_loan_check",
                    )
                    db.add(notif)
                except Exception as e:
                    print(f"Failed to create notification: {e}")

            log_admin_action(
                db,
                actor_id=current_user.id,
                action="WEEKLY_CHECK_FLAG",
                entity_type="AssetRequest",
                entity_id=str(req.id),
                details=reason,
            )

    db.commit()

    return {
        "status": "Success",
        "checked": checked,
        "flagged": len(flagged),
        "issues": issues,
        "message": f"Checked {checked} active loan(s), flagged {len(flagged)} for review.",
    }
