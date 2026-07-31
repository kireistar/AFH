"""
FastAPI dependencies - injectable auth, RBAC guards, & Non-Repudiation cryptographic verification.
"""

import base64
import json
import time
from typing import Callable, cast
from fastapi import Depends, Header, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.exceptions import InvalidSignature

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id: str = payload.sub
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


def require_role(*roles: str) -> Callable:
    def _guard(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Allowed roles: {', '.join(roles)}",
            )
        return current_user
    return _guard


# Shortcut dependencies
def get_current_admin(current_user: User = Depends(require_role("admin"))) -> User:
    return current_user


def get_current_manager(current_user: User = Depends(require_role("manager"))) -> User:
    return current_user


def get_current_finance(current_user: User = Depends(require_role("finance"))) -> User:
    return current_user


async def verify_non_repudiation(
    request: Request,
    x_ed25519_signature: str = Header(..., description="Base64 Ed25519 signature (borrower on QR path, signer on manual path)"),
    x_ed25519_admin_signature: str = Header(None, description="Base64 Ed25519 admin signature (QR path only)"),
    x_ed25519_public_key: str = Header(None, description="Borrower's Ed25519 public key from QR (QR path only)"),
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Guards endpoints requiring True Non-Repudiation.

    Two modes of operation:
      - Single-party (manual handover): Verifies x-ed25519-signature against current_user's registered key.
      - Dual-party (QR code flow): Verifies BOTH borrower's signature (x-ed25519-signature) against the
        borrower's public key (x-ed25519-public-key header) AND admin's signature (x-ed25519-admin-signature)
        against the admin's registered key (current_user.public_key).

    Also enforces:
      - Registered public key check (no TOFU).
      - Replay attack prevention (5-minute timestamp window).
      - QR expiry enforcement (30-second TTL if expires_at is present).
    """
    # 1. Reject if JWT holder has no registered Public Key
    if not current_user.public_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Device not registered. Please register your cryptographic key first."
        )

    # 2. Parse & Extract Required Fields from Body
    raw_body = await request.body()
    try:
        payload = json.loads(raw_body)

        # QR (dual-party) flow: canonical fields live in the nested handover token
        # (payload.payload). Promote them so verification matches what the borrower
        # signed in ProduceQRModal — and so the QR TTL check below actually runs.
        nested = payload.get("payload") if isinstance(payload.get("payload"), dict) else {}
        for key in ("action", "borrower_id", "asset_id", "timestamp", "expires_at"):
            if payload.get(key) in (None, ""):
                payload[key] = nested.get(key)

        action = payload.get("action")
        borrower_id = str(payload.get("borrower_id"))
        asset_id = payload.get("asset_id")
        timestamp = payload.get("timestamp")
        expires_at = payload.get("expires_at")

        if not all([action, borrower_id, asset_id, timestamp]):
            raise ValueError("Missing canonical payload fields.")

        # Replay Attack Prevention (1 Minute Window)
        if abs(time.time() - int(timestamp)) > 60:
            raise ValueError("Payload timestamp expired or out of tolerance.")

        # QR Expiry Enforcement (30-second TTL)
        if expires_at is not None:
            if time.time() > int(expires_at):
                raise ValueError("QR Code has expired. Please generate a new one.")

    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid transaction payload format: {str(e)}"
        )

    # 3. Construct Deterministic Canonical String
    # Format: action|borrower_id|asset_id|timestamp[|expires_at]
    canonical_string = f"{action}|{borrower_id}|{asset_id}|{timestamp}"
    if expires_at is not None:
        canonical_string += f"|{expires_at}"
    canonical_bytes = canonical_string.encode("utf-8")

    # 4. Helper: decode hex or base64 string to bytes
    def decode_crypto_string(s: str) -> bytes:
        s_clean = s.strip()
        if len(s_clean) in (64, 128) and all(c in '0123456789abcdefABCDEF' for c in s_clean):
            return bytes.fromhex(s_clean)
        return base64.b64decode(s_clean)

    # 5. Cryptographic Verification
    try:
        if x_ed25519_admin_signature:
            # ── DUAL-PARTY MODE (QR Code Flow) ──
            # Verify borrower's signature against borrower's public key from QR header
            if not x_ed25519_public_key:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Missing borrower public key header for dual-party verification."
                )
            borrower_pub_bytes = decode_crypto_string(x_ed25519_public_key)
            borrower_sig_bytes = decode_crypto_string(x_ed25519_signature)
            borrower_pub = ed25519.Ed25519PublicKey.from_public_bytes(borrower_pub_bytes)
            borrower_pub.verify(borrower_sig_bytes, canonical_bytes)

            # Verify admin's signature against admin's registered key (current_user)
            admin_sig_bytes = decode_crypto_string(x_ed25519_admin_signature)
            admin_pub_bytes = decode_crypto_string(current_user.public_key)
            admin_pub = ed25519.Ed25519PublicKey.from_public_bytes(admin_pub_bytes)
            admin_pub.verify(admin_sig_bytes, canonical_bytes)
        else:
            # ── SINGLE-PARTY MODE (Manual Handover) ──
            # Verify signer's signature against current_user's registered key
            public_key_bytes = decode_crypto_string(current_user.public_key)
            signature_bytes = decode_crypto_string(x_ed25519_signature)
            public_key = ed25519.Ed25519PublicKey.from_public_bytes(public_key_bytes)
            public_key.verify(signature_bytes, canonical_bytes)

    except InvalidSignature:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cryptographic verification failed: Signature mismatch for canonical payload."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Malformed key or signature encoding: {str(e)}"
        )

    return current_user
