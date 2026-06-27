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
    # Generate purely numeric code: YYYYNNNNNN (e.g. 2026000001)
    year = datetime.now(timezone.utc).year
    pattern = f"{year}%"
    col = Transaction.transaction_code
    last = (
        db.query(col)
        .filter(col.like(pattern))
        .order_by(col.desc())
        .first()
    )
    if last is None:
        next_number = 1
    else:
        last_code = last[0]
        try:
            # Extract sequence number after the 4-digit year
            num_part = last_code[4:]
            next_number = int(num_part) + 1
        except ValueError:
            next_number = 1
            
    return f"{year}{next_number:06d}"

def generate_asset_code(db: Session, category: str) -> str:
    # Generate kode asset dengan format PREFIX (3 digit) + SEQUENCE (9 digit)
    from app.models.asset import Asset
    category_prefixes = {
        "desktop": "001",
        "laptop": "002",
        "mobile": "003",
        "peripheral": "004",
        "projector": "005",
        "server": "006",
        "network": "007",
        "other": "008"
    }
    prefix = category_prefixes.get(category.lower(), "008")
    existing_codes = (
        db.query(Asset.asset_code)
        .filter(Asset.category == category)
        .filter(Asset.asset_code.like(f"{prefix}%"))
        .all()
    )
    max_number = 0
    for code_tuple in existing_codes:
        code_str = code_tuple[0]
        if len(code_str) >= 12:
            try:
                num_part = int(code_str[3:])
                if num_part > max_number:
                    max_number = num_part
            except ValueError:
                continue
    next_number = max_number + 1
    return f"{prefix}{next_number:09d}"