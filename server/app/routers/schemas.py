from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AssetBase(BaseModel):
    asset_name: str
    category: str
    status: Optional[str] = "Available"

class AssetCreate(AssetBase):
    pass

class AssetResponse(AssetBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True