"""
Asset schemas.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional

from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.enums import AssetCategory, AssetCondition, AssetStatus


class BorrowedUserSummary(BaseModel):
    id: UUID
    employee_id: str
    employee_name: str
    email: str
    department: str
    role: str
    risk_score: Decimal = Decimal(0)
    risk_score_tier: str = "Low"
    employment_status: str = "Active"

    model_config = ConfigDict(from_attributes=True)


class AssetBase(BaseModel):
    asset_code: str = Field(..., min_length=1, max_length=20, examples=["AST-0101"])
    asset_name: str = Field(..., min_length=1, max_length=150)
    category: str = Field(..., min_length=1, max_length=50)
    brand: Optional[str] = Field(None, max_length=100)
    serial_number: Optional[str] = Field(None, max_length=100)
    purchase_value: Decimal = Field(default=Decimal(0), ge=0)
    location: Optional[str] = Field(None, max_length=100)
    current_condition: AssetCondition = AssetCondition.GOOD
    status: AssetStatus = AssetStatus.AVAILABLE
    notes: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)
    warranty_expiry_date: Optional[datetime] = None
    vendor_name: Optional[str] = Field(None, max_length=150)
    is_under_maintenance: Optional[int] = 0


class AssetCreate(AssetBase):
    asset_code: Optional[str] = Field(None, max_length=20)


class AssetUpdate(BaseModel):
    asset_name: Optional[str] = Field(None, min_length=1, max_length=150)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    brand: Optional[str] = None
    serial_number: Optional[str] = None
    purchase_value: Optional[Decimal] = Field(None, ge=0)
    location: Optional[str] = None
    current_condition: Optional[AssetCondition] = None
    status: Optional[AssetStatus] = None
    notes: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)
    warranty_expiry_date: Optional[datetime] = None
    vendor_name: Optional[str] = None
    is_under_maintenance: Optional[int] = None


class AssetResponse(AssetBase):
    id: int
    created_at: datetime
    updated_at: datetime
    borrowed_by: Optional[BorrowedUserSummary] = None
    has_borrow_history: bool = False

    model_config = ConfigDict(from_attributes=True)

