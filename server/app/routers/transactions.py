"""
Transaction router — READ-ONLY endpoint untuk immutable ledger (append-only).
Updated: import dari struktur baru (app.models, app.schemas).
"""
from typing import Any, List, Optional
from uuid import UUID
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Transaction, Asset, User
from app.schemas import TransactionCreate, TransactionResponse, LedgerVerifyResult
from app.services.code_generator import generate_transaction_code
from app.services import ledger_service
from app.services.behavior_service import (
    record_handover,
    record_return,
    record_fine_issued,
)

router = APIRouter(
    prefix="/api/v1/transactions",
    tags=["Transactions"],
)


@router.get("/", response_model=List[TransactionResponse])
def get_all_transactions(
    skip: int = 0,
    limit: int = 100,
    asset_id: int = None,
    borrower_id: str = None,
    db: Session = Depends(get_db),
):
    """
    Mengambil semua transaction dari immutable ledger (paginated).
    Optional filters:
    - asset_id: filter by asset
    - borrower_id: filter by user UUID
    """
    query = db.query(Transaction)
    
    if asset_id:
        query = query.filter(Transaction.asset_id == asset_id)
    
    if borrower_id:
        query = query.filter(Transaction.borrower_id == UUID(borrower_id))
    
    return query.offset(skip).limit(limit).all()


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Ambil 1 transaction by id."""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with id {transaction_id} not found",
        )
    return transaction


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(transaction_in: TransactionCreate, db: Session = Depends(get_db)):
    """
    Buat transaction baru (append-only ledger).
    TIDAK BOLEH UPDATE atau DELETE setelah dibuat (enforced di DB trigger).
    TODO: current_hash & signature di-compute dari teman cyber (ledger_service).
    TODO: previous_hash diambil dari transaction terakhir di ledger.
    """
    # Validate asset exists
    asset = db.query(Asset).filter(Asset.id == transaction_in.asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with id {transaction_in.asset_id} not found",
        )

    # Validate borrower exists
    borrower = db.query(User).filter(User.id == transaction_in.borrower_id).first()
    if not borrower:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Borrower with id {transaction_in.borrower_id} not found",
        )

    # Validate admin exists (jika diberikan)
    if transaction_in.admin_id:
        admin = db.query(User).filter(User.id == transaction_in.admin_id).first()
        if not admin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Admin with id {transaction_in.admin_id} not found",
            )

    # Generate transaction_code (format: TXN-YYYYMMDD-XXXX)
    now = datetime.now(timezone.utc)
    date_part = now.strftime("%Y%m%d")
    
    # Count transactions hari ini untuk sequence number
    today_count = db.query(Transaction).filter(
        Transaction.transaction_code.like(f"TXN-{date_part}%")
    ).count() + 1
    
    transaction_code = f"TXN-{date_part}-{today_count:04d}"

    # Get previous_hash from the last transaction
    last_txn = db.query(Transaction).order_by(Transaction.id.desc()).first()
    previous_hash = last_txn.current_hash if last_txn else None
    
    occurred_at = datetime.now(timezone.utc)
    
    # Calculate deterministic hash
    current_hash = ledger_service.calculate_transaction_hash(
        previous_hash=previous_hash,
        payload=transaction_in.payload,
        occurred_at=occurred_at
    )
    
    transaction_data = transaction_in.model_dump()
    transaction_data["transaction_code"] = generate_transaction_code(db)  # Use code generator service
    transaction_data["previous_hash"] = previous_hash
    transaction_data["current_hash"] = current_hash
    transaction_data["occurred_at"] = occurred_at
    transaction_data["signature"] = None  # Signature added during scan if cryptographic handover is active

    new_transaction = Transaction(**transaction_data)
    db.add(new_transaction)

    if transaction_in.action == "handover":
        record_handover(db, transaction_in.borrower_id, transaction_in.request_id)

    elif transaction_in.action == "return":
        record_return(
            db,
            user_id=transaction_in.borrower_id,
            request_id=transaction_in.request_id,
            occured_at=new_transaction.occurred_at or datetime.now(timezone.utc),
        )

    elif transaction_in.action == "fine_issued":
        amount = transaction_in.payload.get("fine_amount", 0)
        record_fine_issued(db, transaction_in.borrower_id, Decimal(str(amount)))
    db.commit()
    db.refresh(new_transaction)
    return new_transaction


@router.get("/verify/ledger", response_model=LedgerVerifyResult)
def verify_ledger(db: Session = Depends(get_db)):
    """
    Verify integritas seluruh ledger (check chained hashing).
    """
    transactions = db.query(Transaction).order_by(Transaction.id.asc()).all()
    
    if not transactions:
        return LedgerVerifyResult(
            total_transactions=0,
            valid=True,
            tampered_transaction_ids=[],
            message="Ledger kosong"
        )
    
    tampered = ledger_service.verify_ledger_integrity(transactions)
    
    return LedgerVerifyResult(
        total_transactions=len(transactions),
        valid=len(tampered) == 0,
        tampered_transaction_ids=tampered,
        message=f"Ledger verification complete. {len(transactions)} transactions verified." 
                if len(tampered) == 0 
                else f"WARNING: {len(tampered)} tampered transactions detected!"
    )
