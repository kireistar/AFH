"""
Asset Request schemas.
"""
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.enums import RequestStatus, RiskTier
from app.schemas.asset import AssetResponse
from app.schemas.user import UserResponse


class AssetRequestBase(BaseModel):
    asset_id: int
    reason: str = Field(..., min_length=3)
    requested_start: date
    requested_end: date
    is_long_term: bool = False

    @model_validator(mode="after")
    def validate_date_range(self) -> "AssetRequestBase":
        if self.requested_end < self.requested_start:
            raise ValueError("requested_end must be >= requested_start")
        return self


# Saat user submit dari frontend (user_id di-inject dari JWT, bukan body)
class AssetRequestCreate(AssetRequestBase):
    @model_validator(mode="after")
    def validate_start_not_in_past(self) -> "AssetRequestCreate":
        if self.requested_start < date.today():
            raise ValueError("requested_start cannot be before today")
        return self

    @model_validator(mode="after")
    def validate_long_term_auto(self) -> "AssetRequestCreate":
        if self.requested_end - self.requested_start >= timedelta(days=365):
            self.is_long_term = True
        return self


# Update untuk approve/reject oleh admin/manager
class AssetRequestUpdate(BaseModel):
    status: Optional[RequestStatus] = None
    rejection_reason: Optional[str] = None


class AssetRequestResponse(AssetRequestBase):
    id: int
    request_code: str
    user_id: UUID
    risk_score_snapshot: Decimal = Field(..., ge=0, le=10)
    risk_tier_snapshot: RiskTier
    ai_decision_reason: Optional[str] = None
    status: RequestStatus
    needs_review: bool = False
    approved_by: Optional[UUID] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    asset: Optional[AssetResponse] = None
    user: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
