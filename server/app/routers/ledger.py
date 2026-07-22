"""
Dedicated router untuk Ledger Integrity Verification
Menangani request POST/GET ke /api/v1/ledger/verify
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Transaction
from app.schemas import LedgerVerifyResult
from app.services import ledger_service

router = APIRouter(
    prefix="/api/v1/ledger",
    tags=["Ledger"],
)

@router.get("/verify", response_model=LedgerVerifyResult)
@router.post("/verify", response_model=LedgerVerifyResult)
def verify_ledger(db: Session = Depends(get_db)):
    """
    Verifikasi integritas Hash Chain SHA-256 pada Immutable Ledger (D3).
    """
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
