"""
User Behavior Stats schemas (input feature untuk Random Forest).
Mostly read-only; di-update oleh background job/service.
"""
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class UserBehaviorStatsResponse(BaseModel):
    user_id: UUID
    total_borrows: int = Field(..., ge=0)
    total_returns: int = Field(..., ge=0)
    on_time_returns: int = Field(..., ge=0)
    late_returns: int = Field(..., ge=0)
    damage_count: int = Field(..., ge=0)
    lost_count: int = Field(..., ge=0)
    total_fines: Decimal = Field(..., ge=0)
    unpaid_fines: Decimal = Field(..., ge=0)
    last_calculated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserBehaviorStatsUpdate(BaseModel):
    """Internal update payload (dipakai background recalc)."""
    total_borrows: int = 0
    total_returns: int = 0
    on_time_returns: int = 0
    late_returns: int = 0
    damage_count: int = 0
    lost_count: int = 0
    total_fines: Decimal = Decimal(0)
    unpaid_fines: Decimal = Decimal(0)
