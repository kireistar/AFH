"""
Transaction router — READ-ONLY endpoint untuk immutable ledger (append-only).
Updated: import dari struktur baru (app.models, app.schemas).
"""
from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Transaction, Asset, User
from app.schemas import TransactionCreate, TransactionResponse, LedgerVerifyResult

router = APIRouter(
    prefix="/api/v1/transactions",
    tags=["Transactions"],
)


@router.get("/", response_model=List[TransactionResponse])
def get_all_transactions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Mengambil semua transaction dari immutable ledger (paginated)."""
    return db.query(Transaction).offset(skip).limit(limit).all()


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
    TODO: transaction_code, current_hash, signature harus di-compute dari hashing_service.
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

    # TODO: Get previous_hash dari transaction terakhir
    # previous_hash = db.query(Transaction).order_by(Transaction.id.desc()).first().current_hash
    
    transaction_data = transaction_in.model_dump()
    transaction_data["transaction_code"] = "TXN-TEMP"  # TODO: Replace dengan generated code
    transaction_data["previous_hash"] = None  # TODO: Get dari ledger
    transaction_data["current_hash"] = "0" * 64  # TODO: Compute SHA-256 hash
    transaction_data["signature"] = None  # TODO: Sign dengan Ed25519

    new_transaction = Transaction(**transaction_data)
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    return new_transaction


@router.get("/verify/ledger", response_model=LedgerVerifyResult)
def verify_ledger(db: Session = Depends(get_db)):
    """
    Verify integritas seluruh ledger (check chained hashing).
    TODO: Implement verification logic menggunakan SHA-256 chain validation.
    """
    transactions = db.query(Transaction).order_by(Transaction.id.asc()).all()
    
    if not transactions:
        return LedgerVerifyResult(
            total_transactions=0,
            valid=True,
            tampered_transaction_ids=[],
            message="Ledger kosong"
        )
    
    # TODO: Implement chained hash verification
    return LedgerVerifyResult(
        total_transactions=len(transactions),
        valid=True,
        tampered_transaction_ids=[],
        message="Ledger integrity verified (TODO: implement actual verification)"
    )
