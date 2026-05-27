"""
Transaction (Ledger) schemas.
Tidak ada Update schema karena ledger append-only.
"""
from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.enums import TransactionAction, TransactionStatus


class TransactionBase(BaseModel):
    asset_id: int
    borrower_id: UUID
    action: TransactionAction
    payload: dict[str, Any] = Field(..., description="Snapshot data event (JSONB)")
    request_id: Optional[int] = None
    admin_id: Optional[UUID] = None


class TransactionCreate(TransactionBase):
    """
    Input untuk endpoint internal (mis. handover commit).
    previous_hash / current_hash / signature di-compute oleh hashing_service.
    """
    pass


class TransactionResponse(TransactionBase):
    id: int
    transaction_code: str
    previous_hash: Optional[str] = None
    current_hash: str
    signature: Optional[str] = None
    status: TransactionStatus
    occurred_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LedgerVerifyResult(BaseModel):
    """Response untuk GET /api/v1/ledger/verify."""
    total_transactions: int
    valid: bool
    tampered_transaction_ids: list[int]
    message: str
