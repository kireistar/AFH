"""
Incident router — laporan kerusakan / kehilangan.
RBAC:
  - POST   : all authenticated users (reporter_id dari JWT)
  - GET    : admin, manager
  - PATCH  : admin (resolve/close)
  - DELETE : admin
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models import Asset, Incident, User
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
    _: User = Depends(require_role("admin", "manager")),
):
    """Semua incident. Admin & Manager only."""
    return db.query(Incident).offset(skip).limit(limit).all()


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin", "manager")),
):
    """Ambil 1 incident. Admin & Manager only."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Incident with id {incident_id} not found")
    return incident


@router.post("/", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(
    incident_in: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user), # PERBAIKAN C2: Menggunakan get_current_user
):
    """
    Laporkan incident. Bisa dilakukan oleh role manapun yang sedang login.
    reporter_id di-inject dari JWT.
    TODO: generate incident_code dari service layer.
    """
    if incident_in.asset_id:
        if not db.query(Asset).filter(Asset.id == incident_in.asset_id).first():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"Asset with id {incident_in.asset_id} not found")

    incident_data = incident_in.model_dump()
    incident_data["reporter_id"] = current_user.id
    incident_data["incident_code"] = "INC-TEMP"  # TODO: generate kode

    new_incident = Incident(**incident_data)
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)
    return new_incident


@router.patch("/{incident_id}", response_model=IncidentResponse)
def update_incident(
    incident_id: int,
    incident_in: IncidentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """Resolve / close incident. Admin only."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Incident with id {incident_id} not found")
    for key, value in incident_in.model_dump(exclude_unset=True).items():
        setattr(incident, key, value)
    db.commit()
    db.refresh(incident)
    return incident


@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """Hapus incident. Admin only."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Incident with id {incident_id} not found")
    db.delete(incident)
    db.commit()
    return None