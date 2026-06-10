"""
Incident schemas (Report Broken Device).
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.enums import IncidentSeverity, IncidentStatus
from app.schemas.user import UserResponse
from app.schemas.asset import AssetResponse


class IncidentBase(BaseModel):
    asset_id: Optional[int] = None
    description: str = Field(..., min_length=3)
    severity: IncidentSeverity = IncidentSeverity.MEDIUM


# Saat user submit, reporter_id di-inject dari JWT
class IncidentCreate(IncidentBase):
    pass


class IncidentUpdate(BaseModel):
    status: Optional[IncidentStatus] = None
    resolution_notes: Optional[str] = None
    severity: Optional[IncidentSeverity] = None


class IncidentResponse(IncidentBase):
    id: int
    incident_code: str
    reporter_id: UUID
    status: IncidentStatus
    resolved_by: Optional[UUID] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None
    reported_at: datetime
    created_at: datetime
    updated_at: datetime

    reporter: Optional[UserResponse] = None
    asset: Optional[AssetResponse] = None

    model_config = ConfigDict(from_attributes=True)
