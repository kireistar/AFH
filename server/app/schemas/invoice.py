"""
Invoice schemas.
"""
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.enums import InvoiceStatus, PaymentMethod
from app.schemas.user import UserResponse


class InvoiceBase(BaseModel):
    transaction_id: int
    user_id: UUID
    fine_amount: Decimal = Field(..., ge=0)
    reason: str = Field(..., min_length=1)
    due_date: Optional[date] = None


class InvoiceCreate(InvoiceBase):
    pass


class InvoiceUpdate(BaseModel):
    """Untuk update payment status oleh finance."""
    status: Optional[InvoiceStatus] = None
    payment_method: Optional[PaymentMethod] = None
    payment_proof_url: Optional[str] = None
    paid_at: Optional[datetime] = None


class InvoiceResponse(InvoiceBase):
    id: int
    invoice_code: str
    status: InvoiceStatus
    payment_method: Optional[PaymentMethod] = None
    payment_proof_url: Optional[str] = None
    paid_at: Optional[datetime] = None
    verified_by: Optional[UUID] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    user: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
