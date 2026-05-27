"""
Handover Token schemas (QR + Ed25519).
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.enums import TokenStatus


class HandoverTokenCreate(BaseModel):
    """Input untuk endpoint admin generate token.
    Server akan generate token string + signature."""
    request_id: int
    expires_in_minutes: int = Field(default=15, ge=1, le=120,
                                    description="Token validity window (1-120 menit)")


class HandoverTokenScan(BaseModel):
    """Input dari user (mobile) saat scan QR di admin."""
    token: str = Field(..., min_length=10, max_length=128)
    signature: str  # Ed25519 sig untuk diverifikasi server


class HandoverTokenResponse(BaseModel):
    id: int
    token: str
    request_id: int
    issued_by: UUID
    signature: str
    issued_at: datetime
    expires_at: datetime
    scanned_at: Optional[datetime] = None
    scanned_by: Optional[UUID] = None
    status: TokenStatus

    model_config = ConfigDict(from_attributes=True)


class HandoverQRPayload(BaseModel):
    """Struktur data yang di-encode jadi QR (sebelum signing)."""
    token: str
    request_id: int
    asset_code: str
    borrower_employee_id: str
    expires_at: datetime
