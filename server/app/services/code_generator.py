# Format: PREFIX-YYYY-NNNN

from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models import Incident, AssetRequest, Transaction, Invoice

def _generate_code(db: Session, model, code_field: str, prefix: str) -> str:
    """
    Helper internal
    """
    year = datetime.now(timezone.utc).year
    pattern = f"{prefix}-{year}-%"

    # Ambil kode terakhir di tahun ini, diurutkan descending
    col = getattr(model, code_field)
    last = (
        db.query(col)
        .filter(col.like(pattern))
        .order_by(col.desc())
        .first()
    )

    if last is None:
        # Belum ada kode di tahun ini, mulai dari 0001
        next_number = 1
    else:
        # Parse nomor dari kode terakhir, misal "REQ-2025-0041" -> 41
        last_code = last[0] # hasil query tuple
        last_number = int(last_code.split("-")[-1])
        next_number = last_number + 1

    return f"{prefix}-{year}-{next_number:04d}"

def generate_request_code(db: Session) -> str:
    # Generate kode asset request
    return _generate_code(db, AssetRequest, "request_code", "REQ")

def generate_incident_code(db: Session) -> str:
    # Generate kode incident report
    return _generate_code(db, Incident, "incident_code", "INC")

def generate_invoice_code(db: Session) -> str:
    # Generate kode invoice/denda
    return _generate_code(db, Invoice, "invoice_code", "INV")

def generate_transaction_code(db: Session) -> str:
    # Generate kode transaction
    return _generate_code(db, Transaction, "transaction_code", "TXN")