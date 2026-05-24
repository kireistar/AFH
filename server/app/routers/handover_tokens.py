"""
Handover Token router — endpoint untuk Secure Handover QR token (Ed25519 signed).
Updated: import dari struktur baru (app.models, app.schemas).
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import HandoverToken, AssetRequest, User
from app.schemas import HandoverTokenCreate, HandoverTokenResponse, HandoverTokenScan

router = APIRouter(
    prefix="/api/v1/handover-tokens",
    tags=["Handover Tokens"],
)


@router.get("/", response_model=List[HandoverTokenResponse])
def get_all_handover_tokens(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Mengambil semua handover tokens dari database (paginated)."""
    return db.query(HandoverToken).offset(skip).limit(limit).all()


@router.get("/{token_id}", response_model=HandoverTokenResponse)
def get_handover_token(token_id: int, db: Session = Depends(get_db)):
    """Ambil 1 handover token by id."""
    token = db.query(HandoverToken).filter(HandoverToken.id == token_id).first()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Handover token with id {token_id} not found",
        )
    return token


@router.post("/generate", response_model=HandoverTokenResponse, status_code=status.HTTP_201_CREATED)
def generate_handover_token(token_in: HandoverTokenCreate, issued_by: str, db: Session = Depends(get_db)):
    """
    Generate handover token baru (admin endpoint).
    TODO: issued_by harus di-inject dari JWT token, bukan dari parameter.
    TODO: token string harus di-generate (random) dan signature dengan Ed25519.
    TODO: expires_at harus di-calculate dari issued_at + expires_in_minutes.
    TODO: QR payload harus di-encode dengan token + request_id + asset_code + borrower_employee_id + expires_at.
    """
    # Validate request exists
    request = db.query(AssetRequest).filter(AssetRequest.id == token_in.request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset request with id {token_in.request_id} not found",
        )

    # Validate issuer (admin) exists
    issuer = db.query(User).filter(User.id == issued_by).first()
    if not issuer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User (issuer) with id {issued_by} not found",
        )

    # TODO: Generate token string (random secure token)
    # token_string = secrets.token_urlsafe(32)
    
    # TODO: Calculate expires_at
    # from datetime import datetime, timedelta
    # expires_at = datetime.now(timezone.utc) + timedelta(minutes=token_in.expires_in_minutes)
    
    # TODO: Create QR payload dan sign dengan Ed25519
    # qr_payload = HandoverQRPayload(...)
    # signature = ed25519_sign(qr_payload)
    
    token_data = {
        "request_id": token_in.request_id,
        "issued_by": issued_by,
        "token": "TOKEN-TEMP",  # TODO: Replace dengan generated token
        "signature": "SIG-TEMP",  # TODO: Replace dengan Ed25519 signature
        "expires_at": "2024-01-01T00:00:00",  # TODO: Calculate expires_at
        "status": "active",
    }

    new_token = HandoverToken(**token_data)
    db.add(new_token)
    db.commit()
    db.refresh(new_token)
    return new_token


@router.post("/scan")
def scan_handover_token(scan_in: HandoverTokenScan, scanned_by: str, db: Session = Depends(get_db)):
    """
    Scan handover token QR (user endpoint saat receive asset dari admin).
    TODO: scanned_by harus di-inject dari JWT token.
    TODO: Verify token signature dengan Ed25519 public key admin.
    TODO: Check token status (active, belum expired).
    TODO: Update token status menjadi "used" dan set scanned_at, scanned_by.
    TODO: Create transaction entry untuk handover event.
    """
    # Find token by token string
    token = db.query(HandoverToken).filter(HandoverToken.token == scan_in.token).first()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token tidak valid atau sudah expired",
        )

    # Validate scanner (user) exists
    scanner = db.query(User).filter(User.id == scanned_by).first()
    if not scanner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User (scanner) with id {scanned_by} not found",
        )

    # TODO: Verify signature dengan public key issuer
    # TODO: Check token expiry
    # TODO: Update token status ke "used"
    # TODO: Create transaction entry

    return {
        "status": "success",
        "message": "Token scanned successfully (TODO: implement full verification logic)"
    }


@router.get("/{token_id}/verify")
def verify_handover_token(token_id: int, db: Session = Depends(get_db)):
    """Verify handover token signature dan expiry."""
    token = db.query(HandoverToken).filter(HandoverToken.id == token_id).first()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Handover token with id {token_id} not found",
        )

    # TODO: Implement Ed25519 signature verification
    # TODO: Check token expiry
    
    return {
        "token_id": token_id,
        "valid": True,  # TODO: Actual verification
        "status": token.status,
        "message": "Token verification (TODO: implement actual verification logic)"
    }
