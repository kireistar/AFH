"""
Transaction router — immutable ledger (append-only).
RBAC:
  - GET    : admin, manager, finance
  - POST   : admin (internal, dipanggil saat handover commit)
  - verify : admin, manager, finance
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models import Asset, Transaction, User
from app.schemas import LedgerVerifyResult, TransactionCreate, TransactionResponse

router = APIRouter(
    prefix="/api/v1/transactions",
    tags=["Transactions"],
)


@router.get("/", response_model=List[TransactionResponse])
def get_all_transactions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin", "manager", "finance")),
):
    """Semua transaksi dari ledger. Admin, Manager, Finance."""
    return db.query(Transaction).offset(skip).limit(limit).all()


@router.get("/verify/ledger", response_model=LedgerVerifyResult)
def verify_ledger(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin", "manager", "finance")),
):
    """
    Verifikasi integritas chain. Admin, Manager, Finance.
    TODO (Cyber scope): implement SHA-256 chain validation.
    """
    transactions = db.query(Transaction).order_by(Transaction.id.asc()).all()
    if not transactions:
        return LedgerVerifyResult(total_transactions=0, valid=True,
                                  tampered_transaction_ids=[], message="Ledger kosong")
    return LedgerVerifyResult(
        total_transactions=len(transactions),
        valid=True,
        tampered_transaction_ids=[],
        message="TODO: implement SHA-256 chain verification (Cyber scope)",
    )


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin", "manager", "finance")),
):
    """Ambil 1 transaksi by id."""
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Transaction with id {transaction_id} not found")
    return txn


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction_in: TransactionCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """
    Append transaksi ke ledger. Admin only (internal endpoint).
    TODO (Cyber scope): compute transaction_code, previous_hash, current_hash, signature.
    """
    if not db.query(Asset).filter(Asset.id == transaction_in.asset_id).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Asset with id {transaction_in.asset_id} not found")
    if not db.query(User).filter(User.id == transaction_in.borrower_id).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Borrower with id {transaction_in.borrower_id} not found")
    if transaction_in.admin_id:
        if not db.query(User).filter(User.id == transaction_in.admin_id).first():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"Admin with id {transaction_in.admin_id} not found")

    transaction_data = transaction_in.model_dump()
    transaction_data["transaction_code"] = "TXN-TEMP"  # TODO: Cyber scope
    transaction_data["previous_hash"] = None            # TODO: Cyber scope
    transaction_data["current_hash"] = "0" * 64        # TODO: Cyber scope
    transaction_data["signature"] = None                # TODO: Cyber scope

    new_txn = Transaction(**transaction_data)
    db.add(new_txn)
    db.commit()
    db.refresh(new_txn)
    return new_txn
