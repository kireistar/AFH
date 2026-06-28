"""
Transaction router — Immutable ledger (append-only) dengan Ed25519 Non-Repudiation.
Updated: Integrasi guard sekuriti dan perbaikan tipe data.
"""

from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional, cast
from uuid import UUID

from app.core.database import get_db
from app.core.dependencies import verify_non_repudiation, get_current_user
from app.models import Asset, Transaction, User, AssetRequest
from app.schemas import LedgerVerifyResult, TransactionCreate, TransactionResponse
from app.services import ledger_service
from app.services.behavior_service import (
    record_fine_issued,
    record_handover,
    record_return,
)
from app.services.code_generator import generate_transaction_code
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/api/v1/transactions",
    tags=["Transactions"],
)


@router.get("/", response_model=List[TransactionResponse])
def get_all_transactions(
    skip: int = 0,
    limit: int = 100,
    asset_id: Optional[int] = None,
    borrower_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Transaction)
    
    # Regular users can only retrieve their own transactions
    if current_user.role == "user":
        query = query.filter(Transaction.borrower_id == current_user.id)
    elif borrower_id:
        query = query.filter(Transaction.borrower_id == UUID(borrower_id))

    if asset_id:
        query = query.filter(Transaction.asset_id == asset_id)

    return query.offset(skip).limit(limit).all()


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with id {transaction_id} not found",
        )
    # Check authorization
    if current_user.role == "user" and transaction.borrower_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this transaction.",
        )
    return transaction


@router.post(
    "/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED
)
def create_transaction(
    request: Request,
    transaction_in: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_non_repudiation),
):
    # 1. Identity Guard
    if str(current_user.id) != str(
        transaction_in.borrower_id
    ) and current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cryptographic mismatch: Token owner does not match borrower.",
        )

    # 2. Database Validation
    asset = db.query(Asset).filter(Asset.id == transaction_in.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    borrower = db.query(User).filter(User.id == transaction_in.borrower_id).first()
    if not borrower:
        raise HTTPException(status_code=404, detail="Borrower not found")

    if transaction_in.admin_id:
        admin = db.query(User).filter(User.id == transaction_in.admin_id).first()
        if not admin:
            raise HTTPException(status_code=404, detail="Admin not found")

    # 3. Ledger Logic
    # Acquire exclusive advisory lock on the ledger chain to serialize concurrent updates
    ledger_service.acquire_ledger_lock(db)
    
    last_txn = db.query(Transaction).order_by(Transaction.id.desc()).first()
    previous_hash = cast(Optional[str], last_txn.current_hash) if last_txn else None

    occurred_at = datetime.now(timezone.utc)
    current_hash = ledger_service.calculate_transaction_hash(
        previous_hash=previous_hash,
        payload=transaction_in.payload,
        occurred_at=occurred_at,
    )

    # 4. Persistence
    transaction_data = transaction_in.model_dump()
    transaction_data["transaction_code"] = generate_transaction_code(db)
    transaction_data["previous_hash"] = previous_hash
    transaction_data["current_hash"] = current_hash
    transaction_data["occurred_at"] = occurred_at
    transaction_data["signature"] = request.headers.get("x-ed25519-signature")

    # Update request and asset status for handovers
    if transaction_in.action == "handover":
        if transaction_in.request_id is not None:
            req_obj = db.query(AssetRequest).filter(AssetRequest.id == transaction_in.request_id).first()
            if req_obj:
                req_obj.status = "handed_over"
        
        asset_obj = db.query(Asset).filter(Asset.id == transaction_in.asset_id).first()
        if asset_obj:
            asset_obj.status = "borrowed"

    new_transaction = Transaction(**transaction_data)
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    # 5. Behavior Tracking
    if transaction_in.action == "handover" and transaction_in.request_id is not None:
        record_handover(db, transaction_in.borrower_id, transaction_in.request_id)
    elif transaction_in.action == "return" and transaction_in.request_id is not None:
        record_return(
            db,
            user_id=transaction_in.borrower_id,
            request_id=transaction_in.request_id,
            occured_at=occurred_at,
        )
    elif transaction_in.action == "fine_issued":
        amount = transaction_in.payload.get("fine_amount", 0)
        record_fine_issued(db, transaction_in.borrower_id, Decimal(str(amount)))

    return new_transaction


@router.get("/verify/ledger", response_model=LedgerVerifyResult)
def verify_ledger(db: Session = Depends(get_db)):
    transactions = db.query(Transaction).order_by(Transaction.id.asc()).all()
    if not transactions:
        return LedgerVerifyResult(
            total_transactions=0,
            valid=True,
            tampered_transaction_ids=[],
            message="Ledger is empty",
        )

    tampered = ledger_service.verify_ledger_integrity(transactions)
    return LedgerVerifyResult(
        total_transactions=len(transactions),
        valid=len(tampered) == 0,
        tampered_transaction_ids=tampered,
        message="Verification complete." if not tampered else "TAMPERING DETECTED!",
    )
