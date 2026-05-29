"""
Incident router — CRUD endpoint untuk laporan kerusakan device.
Updated: import dari struktur baru (app.models, app.schemas).
"""
from typing import List, Optional
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Incident, Asset, User
from app.schemas import IncidentCreate, IncidentResponse, IncidentUpdate
from app.services.code_generator import generate_incident_code

router = APIRouter(
    prefix="/api/v1/incidents",
    tags=["Incidents"],
)


@router.get("/", response_model=List[IncidentResponse])
def get_all_incidents(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Mengambil semua incident reports dari database (paginated)."""
    return db.query(Incident).offset(skip).limit(limit).all()


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    """Ambil 1 incident report by id."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with id {incident_id} not found",
        )
    return incident


@router.post("/", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(incident_in: IncidentCreate, reporter_id: str, db: Session = Depends(get_db)):
    """
    Buat incident report baru (Report Broken Device).
    TODO: reporter_id harus di-inject dari JWT token, bukan dari parameter.
    TODO: trigger fine calculation jika damage severity=SEVERE.
    TODO: create transaction record.
    """
    # Validate asset exists (jika asset_id di-provide)
    if incident_in.asset_id:
        asset = db.query(Asset).filter(Asset.id == incident_in.asset_id).first()
        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Asset with id {incident_in.asset_id} not found",
            )

    # Validate reporter exists
    reporter = db.query(User).filter(User.id == UUID(reporter_id)).first()
    if not reporter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User (reporter) with id {reporter_id} not found",
        )

    # Generate incident_code (format: INC-YYYYMMDD-XXXX)
    now = datetime.now(timezone.utc)
    date_part = now.strftime("%Y%m%d")
    
    # Count incidents hari ini untuk sequence number
    today_count = db.query(Incident).filter(
        Incident.incident_code.like(f"INC-{date_part}%")
    ).count() + 1
    
    incident_code = f"INC-{date_part}-{today_count:04d}"

    incident_data = incident_in.model_dump()
    incident_data["reporter_id"] = UUID(reporter_id)
    incident_data["incident_code"] = generate_incident_code(db)  # Use code generator service
    incident_data["status"] = "open"  # Initial status

    new_incident = Incident(**incident_data)
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)
    
    # TODO: If severity is SEVERE, auto-calculate fine & generate invoice
    # TODO: Create transaction record (action='incident_report')
    
    return new_incident


@router.patch("/{incident_id}", response_model=IncidentResponse)
def update_incident(incident_id: int, incident_in: IncidentUpdate, db: Session = Depends(get_db)):
    """Update partial incident (resolve/close)."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with id {incident_id} not found",
        )

    update_data = incident_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(incident, key, value)

    db.commit()
    db.refresh(incident)
    return incident


@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_incident(incident_id: int, db: Session = Depends(get_db)):
    """Hapus incident report."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with id {incident_id} not found",
        )
    db.delete(incident)
    db.commit()
    return None


@router.patch("/{incident_id}/resolve", response_model=IncidentResponse)
def resolve_incident(
    incident_id: int,
    resolution_notes: str,
    resolved_by_id: str,
    db: Session = Depends(get_db),
):
    """
    Admin/Manager resolve incident report.
    TODO: resolved_by_id harus di-inject dari JWT token, bukan dari parameter.
    """
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with id {incident_id} not found",
        )
    
    if incident.status == "resolved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incident already resolved",
        )
    
    # Validate resolver exists
    resolver = db.query(User).filter(User.id == UUID(resolved_by_id)).first()
    if not resolver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User (resolver) with id {resolved_by_id} not found",
        )
    
    incident.status = "resolved"
    incident.resolution_notes = resolution_notes
    incident.resolved_by = UUID(resolved_by_id)
    incident.resolved_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(incident)
    return incident
