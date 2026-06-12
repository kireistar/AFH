"""
Asset schemas.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.enums import AssetCategory, AssetCondition, AssetStatus


class AssetBase(BaseModel):
    asset_code: str = Field(..., min_length=1, max_length=20, examples=["AST-0101"])
    asset_name: str = Field(..., min_length=1, max_length=150)
    category: AssetCategory
    brand: Optional[str] = Field(None, max_length=100)
    serial_number: Optional[str] = Field(None, max_length=100)
    purchase_value: Decimal = Field(default=Decimal(0), ge=0)
    location: Optional[str] = Field(None, max_length=100)
    current_condition: AssetCondition = AssetCondition.GOOD
    status: AssetStatus = AssetStatus.AVAILABLE
    notes: Optional[str] = None


class AssetCreate(AssetBase):
    asset_code: Optional[str] = Field(None, max_length=20)


class AssetUpdate(BaseModel):
    asset_name: Optional[str] = Field(None, min_length=1, max_length=150)
    category: Optional[AssetCategory] = None
    brand: Optional[str] = None
    serial_number: Optional[str] = None
    purchase_value: Optional[Decimal] = Field(None, ge=0)
    location: Optional[str] = None
    current_condition: Optional[AssetCondition] = None
    status: Optional[AssetStatus] = None
    notes: Optional[str] = None


class AssetResponse(AssetBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
