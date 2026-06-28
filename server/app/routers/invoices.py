"""
Invoice router — CRUD endpoint untuk invoice/denda.
Updated: import dari struktur baru (app.models, app.schemas).
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models import Invoice, Transaction, User
from app.schemas import InvoiceCreate, InvoiceResponse, InvoiceUpdate
from app.schemas.enums import PaymentMethod
from app.services.code_generator import generate_invoice_code
from app.services.behavior_service import record_fine_paid

router = APIRouter(
    prefix="/api/v1/invoices",
    tags=["Invoices"],
)


@router.get("/", response_model=List[InvoiceResponse])
def get_all_invoices(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    user_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mengambil semua invoice dari database (paginated).
    Optional filters:
    - status_filter: "unpaid", "paid", "overdue"
    - user_id: filter by user UUID
    """
    query = db.query(Invoice)
    
    if status_filter:
        query = query.filter(Invoice.status == status_filter)
    
    if user_id:
        query = query.filter(Invoice.user_id == UUID(user_id))
    
    return query.offset(skip).limit(limit).all()


@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil 1 invoice by id."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with id {invoice_id} not found",
        )
    return invoice


@router.post("/", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
def create_invoice(
    invoice_in: InvoiceCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("finance", "admin")),
):
    """
    Buat invoice baru (otomatis di-generate saat return damage/late).
    TODO: Dipanggil dari invoice_service atau routers yang trigger fine.
    """
    # Validate transaction exists
    transaction = db.query(Transaction).filter(Transaction.id == invoice_in.transaction_id).first()
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with id {invoice_in.transaction_id} not found",
        )

    # Validate user exists
    user = db.query(User).filter(User.id == invoice_in.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {invoice_in.user_id} not found",
        )

    invoice_data = invoice_in.model_dump()
    invoice_data["invoice_code"] = generate_invoice_code(db)  # Use code generator service
    invoice_data["status"] = "unpaid"  # Initial status

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
    current_user: User = Depends(require_role("finance", "admin")),
):
    """Update partial invoice (payment update oleh finance)."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with id {invoice_id} not found",
        )

    old_status = invoice.status
    update_data = invoice_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(invoice, key, value)

    if invoice_in.status == "paid" and old_status != "paid":
        record_fine_paid(db, invoice.user_id, invoice.fine_amount)
    db.commit()
    db.refresh(invoice)
    return invoice

@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_invoice(
    invoice_id: int, 
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
    ):
    """Hapus invoice."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with id {invoice_id} not found",
        )
    db.delete(invoice)
    db.commit()
    return None


@router.patch("/{invoice_id}/verify-payment", response_model=InvoiceResponse)
def verify_payment(
    invoice_id: int,
    payment_method: PaymentMethod = PaymentMethod.BANK_TRANSFER,
    payment_notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("finance")), # Inject dari JWT
):
    """
    Finance verify payment & mark invoice as paid.
    verified_by_id harus di-inject dari JWT token, bukan dari parameter.
    TODO: Call behavior_stats_service.update_user_behavior_stats() untuk update unpaid_fines.
    """
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with id {invoice_id} not found",
        )
    
    if invoice.status == "paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invoice already paid",
        )
    
    invoice.status = "paid"
    invoice.verified_by = current_user.id # Inject dari JWT
    invoice.payment_method = payment_method
    invoice.verified_at = datetime.now(timezone.utc)
    
    # Store payment notes if provided
    if payment_notes:
        invoice.notes = payment_notes if not invoice.notes else f"{invoice.notes}\nPayment: {payment_notes}"
    
    # Update user behavior stats: unpaid_fines turun
    record_fine_paid(db, invoice.user_id, invoice.fine_amount)
    
    db.commit()
    db.refresh(invoice)
    
    return invoice
