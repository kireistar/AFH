"""
Incident router — CRUD endpoint untuk laporan kerusakan device.
Updated: import dari struktur baru (app.models, app.schemas).
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Incident, Asset, User
from app.schemas import IncidentCreate, IncidentResponse, IncidentUpdate

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
    TODO: incident_code harus di-generate dengan format tertentu (misal: INC-2024-0001).
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
    reporter = db.query(User).filter(User.id == reporter_id).first()
    if not reporter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User (reporter) with id {reporter_id} not found",
        )

    # TODO: Generate incident_code dari service layer
    incident_data = incident_in.model_dump()
    incident_data["reporter_id"] = reporter_id
    incident_data["incident_code"] = "INC-TEMP"  # TODO: Replace dengan generated code

    new_incident = Incident(**incident_data)
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)
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
