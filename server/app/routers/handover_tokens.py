"""
Handover Token router — Secure QR Handover (Ed25519).
RBAC:
  - GET /               : admin
  - POST /generate      : admin (issued_by dari JWT)
  - POST /scan          : user (scanned_by dari JWT)
  - GET  /{id}/verify   : admin

Catatan scope:
  - Generate token string + Ed25519 signing = TODO Cyber scope.
  - Verify signature + chain commit = TODO Cyber scope.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models import AssetRequest, HandoverToken, User
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
    _: User = Depends(require_role("admin")),
):
    """Semua handover token. Admin only."""
    return db.query(HandoverToken).offset(skip).limit(limit).all()


@router.get("/{token_id}", response_model=HandoverTokenResponse)
def get_handover_token(
    token_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """Ambil 1 token by id. Admin only."""
    token = db.query(HandoverToken).filter(HandoverToken.id == token_id).first()
    if not token:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Handover token with id {token_id} not found")
    return token


@router.post("/generate", response_model=HandoverTokenResponse, status_code=status.HTTP_201_CREATED)
def generate_handover_token(
    token_in: HandoverTokenCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """
    Generate handover token. Admin only.
    issued_by di-inject dari JWT.
    TODO (Cyber scope): generate token string, Ed25519 signature, QR payload, expires_at.
    """
    if not db.query(AssetRequest).filter(AssetRequest.id == token_in.request_id).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Asset request with id {token_in.request_id} not found")

    token_data = {
        "request_id": token_in.request_id,
        "issued_by": current_user.id,
        "token": "TOKEN-TEMP",           # TODO: Cyber scope
        "signature": "SIG-TEMP",         # TODO: Cyber scope (Ed25519)
        "expires_at": "2024-01-01T00:00:00",  # TODO: Cyber scope
        "status": "active",
    }
    new_token = HandoverToken(**token_data)
    db.add(new_token)
    db.commit()
    db.refresh(new_token)
    return new_token


@router.post("/scan")
def scan_handover_token(
    scan_in: HandoverTokenScan,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("user")),
):
    """
    Scan QR token saat terima asset. User only.
    scanned_by di-inject dari JWT.
    TODO (Cyber scope): verify Ed25519 signature, check expiry, update status, create transaction.
    """
    token = db.query(HandoverToken).filter(HandoverToken.token == scan_in.token).first()
    if not token:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Token tidak valid atau sudah expired")

    # TODO (Cyber scope): verify signature dengan public key issuer
    # TODO (Cyber scope): check token expiry
    # TODO (Cyber scope): update token status ke "used", set scanned_by = current_user.id
    # TODO (Cyber scope): create transaction entry

    return {"status": "success", "message": "Token scanned (TODO: full verification — Cyber scope)"}


@router.get("/{token_id}/verify")
def verify_handover_token(
    token_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """
    Verify token signature & expiry. Admin only.
    TODO (Cyber scope): implement Ed25519 verification.
    """
    token = db.query(HandoverToken).filter(HandoverToken.id == token_id).first()
    if not token:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Handover token with id {token_id} not found")
    return {
        "token_id": token_id,
        "valid": True,
        "status": token.status,
        "message": "TODO: Ed25519 verification — Cyber scope",
    }
