"""
Invoice router — manajemen denda.
RBAC:
  - GET    : finance, admin
  - POST   : admin (auto-generated saat return damage/late)
  - PATCH  : finance (verifikasi pembayaran)
  - DELETE : admin
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models import Invoice, Transaction, User
from app.schemas import InvoiceCreate, InvoiceResponse, InvoiceUpdate

router = APIRouter(
    prefix="/api/v1/invoices",
    tags=["Invoices"],
)


@router.get("/", response_model=List[InvoiceResponse])
def get_all_invoices(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("finance", "admin")),
):
    """Semua invoice. Finance & Admin."""
    return db.query(Invoice).offset(skip).limit(limit).all()


@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("finance", "admin")),
):
    """Ambil 1 invoice. Finance & Admin."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Invoice with id {invoice_id} not found")
    return invoice


@router.post("/", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
def create_invoice(
    invoice_in: InvoiceCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """
    Buat invoice (denda). Admin only.
    TODO: generate invoice_code dari service layer.
    """
    if not db.query(Transaction).filter(Transaction.id == invoice_in.transaction_id).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Transaction with id {invoice_in.transaction_id} not found")
    if not db.query(User).filter(User.id == invoice_in.user_id).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"User with id {invoice_in.user_id} not found")

    invoice_data = invoice_in.model_dump()
    invoice_data["invoice_code"] = "INV-TEMP"  # TODO: generate kode

    new_invoice = Invoice(**invoice_data)
    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)
    return new_invoice


@router.patch("/{invoice_id}", response_model=InvoiceResponse)
def update_invoice(
    invoice_id: int,
    invoice_in: InvoiceUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("finance")),
):
    """Verifikasi / update status pembayaran. Finance only."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Invoice with id {invoice_id} not found")
    for key, value in invoice_in.model_dump(exclude_unset=True).items():
        setattr(invoice, key, value)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """Hapus invoice. Admin only."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Invoice with id {invoice_id} not found")
    db.delete(invoice)
    db.commit()
    return None
