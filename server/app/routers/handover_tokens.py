"""
Handover Token router - Secure QR Handover (Ed25519).
True Non-Repudiation: Admin must sign the payload locally.
"""
import json
import base64
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.exceptions import InvalidSignature

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models import AssetRequest, HandoverToken, User, Asset, Transaction
from app.schemas import (
    HandoverTokenCreate,
    HandoverTokenResponse,
    HandoverTokenScan,
    HandoverQRPayload
)
from app.services import ledger_service
from app.services.code_generator import generate_transaction_code
from app.services.behavior_service import record_handover

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

@router.post("/generate", response_model=HandoverTokenResponse, status_code=status.HTTP_201_CREATED)
def generate_handover_token(
    token_in: HandoverTokenCreate,
    x_ed25519_public_key: str = Header(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """
    True Non-Repudiation Generation: Verifies that the Admin cryptographically
    signed the handover payload on their local machine.
    """
    if not current_user.public_key:
            if not x_ed25519_public_key:
                raise HTTPException(
                    status_code=400,
                    detail="Admin public key not registered. Provide x-ed25519-public-key header."
                )
            current_user.public_key = x_ed25519_public_key
            db.commit()
            db.refresh(current_user)

    request_obj = db.query(AssetRequest).filter(AssetRequest.id == token_in.request_id).first()
    if not request_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    asset_obj = db.query(Asset).filter(Asset.id == request_obj.asset_id).first()
    borrower_obj = db.query(User).filter(User.id == request_obj.user_id).first()

    # Reconstruct payload to verify Admin's signature
    qr_payload = HandoverQRPayload(
        token=token_in.admin_token_string,
        request_id=request_obj.id,
        asset_code=asset_obj.asset_code,
        borrower_employee_id=borrower_obj.employee_id,
        expires_at=token_in.expires_at
    )

    serialized_payload = json.dumps(
        qr_payload.model_dump(),
        separators=(',', ':'),
        sort_keys=True
    ).encode("utf-8")

    # Verify signature
    try:
        admin_pub_bytes = base64.b64decode(current_user.public_key)
        admin_public_key = ed25519.Ed25519PublicKey.from_public_bytes(admin_pub_bytes)
        admin_sig_bytes = base64.b64decode(token_in.admin_signature)
        admin_public_key.verify(admin_sig_bytes, serialized_payload)
    except InvalidSignature:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cryptographic signing failed. The payload does not match the Admin's signature."
        )

    new_token = HandoverToken(
        request_id=token_in.request_id,
        issued_by=current_user.id,
        token=token_in.admin_token_string,
        signature=token_in.admin_signature,
        expires_at=datetime.fromtimestamp(token_in.expires_at, tz=timezone.utc),
        status="active"
    )

    db.add(new_token)
    db.commit()
    db.refresh(new_token)
    return new_token

@router.post("/scan")
def scan_handover_token(
    scan_in: HandoverTokenScan,
    x_ed25519_public_key: str = Header(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Penyelesaian Secure Handover: Verifikasi signature Borrower dan commit ke Ledger.
    """
    # 1. Inline TOFU Registration for Borrower
    if not current_user.public_key:
        if not x_ed25519_public_key:
            raise HTTPException(
                status_code=400,
                detail="Borrower public key not registered. Provide x-ed25519-public-key header."
            )
        current_user.public_key = x_ed25519_public_key
        db.commit()
        db.refresh(current_user)

    # 2. State Validation & Authorization
    token_obj = db.query(HandoverToken).filter(HandoverToken.token == scan_in.token).first()
    if not token_obj:
        raise HTTPException(status_code=404, detail="Invalid or missing token.")

    if token_obj.status != "active":
        raise HTTPException(
            status_code=400,
            detail=f"Token cannot be used. Current status: {token_obj.status}"
        )

    now = datetime.now(timezone.utc)
    if now > token_obj.expires_at:
        token_obj.status = "expired"
        db.commit()
        raise HTTPException(status_code=400, detail="Token has expired.")

    # Prevent another user from scanning the QR code meant for the requester
    request_obj = db.query(AssetRequest).filter(AssetRequest.id == token_obj.request_id).first()
    if request_obj.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to borrow this asset."
        )

    # 3. Borrower Cryptographic Verification (True Non-Repudiation)
    try:
        borrower_pub_bytes = base64.b64decode(current_user.public_key)
        borrower_public_key = ed25519.Ed25519PublicKey.from_public_bytes(borrower_pub_bytes)

        # Borrower signs the original raw token string from the QR as proof of acceptance
        borrower_sig_bytes = base64.b64decode(scan_in.borrower_signature)
        borrower_public_key.verify(borrower_sig_bytes, scan_in.token.encode("utf-8"))
    except InvalidSignature:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cryptographic verification failed. Borrower signature is invalid."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Malformed key format: {str(e)}")

    # 4. State Mutation & Immutable Ledger Commit (ACID Compliance)
    try:
        # Mutate token status
        token_obj.status = "used" # type: ignore
        token_obj.scanned_at = now # type: ignore
        token_obj.scanned_by = current_user.id # type: ignore

        # Mutate asset and request status
        asset_obj = db.query(Asset).filter(Asset.id == request_obj.asset_id).first()
        if asset_obj:
            asset_obj.status = "borrowed" # type: ignore

        request_obj.status = "handed_over" # type: ignore

        # Hash chaining to the previous transaction
        last_txn = db.query(Transaction).order_by(Transaction.id.desc()).first()
        previous_hash = last_txn.current_hash if last_txn else None

        payload_data = {
            "handover_token_id": token_obj.id,
            "asset_code": asset_obj.asset_code if asset_obj else "UNKNOWN",
            "admin_issuer": str(token_obj.issued_by)
        }

        current_hash = ledger_service.calculate_transaction_hash(
            previous_hash=previous_hash,
            payload=payload_data,
            occurred_at=now,
        )

        transaction = Transaction(
            transaction_code=generate_transaction_code(db),
            request_id=request_obj.id,
            asset_id=request_obj.asset_id,
            borrower_id=current_user.id,
            admin_id=token_obj.issued_by,
            action="handover",
            payload=payload_data,
            previous_hash=previous_hash,
            current_hash=current_hash,
            signature=scan_in.borrower_signature, # Final proof from the borrower
            status="committed",
            occurred_at=now,
        )
        db.add(transaction)

        # Trigger AI Behavior recording
        record_handover(db, current_user.id, request_obj.id)

        # Commit all mutations atomically
        db.commit()

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Ledger commit failed, transaction rolled back: {str(e)}"
        )

    return {
        "status": "success",
        "message": "Secure handover complete. Asset successfully transferred and ledger committed.",
    }
