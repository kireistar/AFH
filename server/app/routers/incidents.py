"""
Incident router — CRUD endpoint untuk laporan kerusakan device.
"""
from typing import List, Optional
from datetime import datetime, timezone
from uuid import UUID
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models import Incident, Asset, User, Transaction, Invoice
from app.schemas import IncidentCreate, IncidentResponse, IncidentUpdate
from app.services.code_generator import generate_incident_code, generate_transaction_code, generate_invoice_code
from app.services.behavior_service import record_damage, record_lost, record_fine_issued

router = APIRouter(
    prefix="/api/v1/incidents",
    tags=["Incidents"],
)

@router.get("/", response_model=List[IncidentResponse])
def get_all_incidents(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Mengambil semua incident reports dari database. Semua role yang login bisa akses."""
    return db.query(Incident).offset(skip).limit(limit).all()


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(
    incident_id: int, 
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
    ):
    """Ambil 1 incident report by id."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with id {incident_id} not found",
        )
    return incident

@router.post("/", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(
    incident_in: IncidentCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user), # Siapa saja yang login bisa report
    ):
    """
    Buat incident report baru.
    reporter_id harus di-inject dari JWT token, bukan dari parameter.
    Jika severity = 'severe', otomatis generate Invoice denda.
    """
    # Validate asset exists
    asset = None
    if incident_in.asset_id:
        asset = db.query(Asset).filter(Asset.id == incident_in.asset_id).first()
        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Asset with id {incident_in.asset_id} not found",
            )
    
    incident_data = incident_in.model_dump()
    incident_data["reporter_id"] = current_user.id # Inject dari JWT
    incident_data["incident_code"] = generate_incident_code(db)
    incident_data["status"] = "open"

    new_incident = Incident(**incident_data)
    db.add(new_incident)
    db.flush() # Flush agar incident.id tersedia

    # Auto-generate Invoice jika kerusakan SEVERE atau LOST
    severity = incident_in.severity if hasattr(incident_in, 'severity') else None

    if severity in ["severe", "lost"] and asset:
        # Rumus denda kerusakan/hilang: purchase_value * 2 (sesuai Form 3)
        fine_amount = Decimal(str(asset.purchase_value)) * Decimal("2")

        # Buat Transaction record dulu (Invoice butuh transaction_id)
        last_txn = db.query(Transaction).order_by(Transaction.id.desc()).first()
        previous_hash = last_txn.current_hash if last_txn else None

        transaction = Transaction(
            transaction_code=generate_transaction_code(db),
            request_id=None, # Incident tidak selalu punya request
            asset_id=asset.id,
            borrower_id=current_user.id,
            admin_id=None,
            action="incident_report",
            payload={
                "incident_id": new_incident.id,
                "severity": severity,
                "description": incident_in.description if hasattr(incident_in, 'description') else "",
            },
            previous_hash=previous_hash,
            current_hash="0" * 64, # Placeholder - Step 4
            status="committed",
        )
        db.add(transaction)
        db.flush()

        invoice = Invoice(
            invoice_code=generate_invoice_code(db),
            transaction_id=transaction.id,
            user_id=current_user.id,
            fine_amount=fine_amount,
            reason=f"Damage {'severely damaged' if severity == 'severe' else 'lost'} asset: {asset.asset_name}",
            status="unpaid",
        )
        db.add(invoice)
        
        # Update behavior stats
        record_fine_issued(db, current_user.id, fine_amount)
        if severity == "lost":
            record_lost(db, current_user.id)
            asset.status = "retired" # Asset hilang = retired
        else:
            record_damage(db, current_user.id)
            asset.current_condition = "damaged"

    db.commit()
    db.refresh(new_incident)
    return new_incident

@router.patch("/{incident_id}", response_model=IncidentResponse)
def update_incident(
    incident_id: int, 
    incident_in: IncidentUpdate, 
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin", "manager")),
    ):
    """Update partial incident. Admin/Manager only."""
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
def delete_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
    ):
    """Hapus incident report. Admin only."""
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
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager")), # Inject dari JWT
):
    """
    Admin/Manager resolve incident report.
    resolved_by_id harus di-inject dari JWT token, bukan dari parameter.
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
    
    incident.status = "resolved"
    incident.resolution_notes = resolution_notes
    incident.resolved_by = current_user.id # Inject dari JWT
    incident.resolved_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(incident)
    return incident
