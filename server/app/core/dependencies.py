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
    x_ed25519_signature: str = Header(..., description="Base64 Ed25519 signature of canonical payload"),
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Guards endpoints requiring True Non-Repudiation.
    1. Verifies registered Ed25519 Public Key exists on user profile (No TOFU).
    2. Enforces Replay Attack protection (5-minute timestamp window).
    3. Reconstructs canonical payload string (action|borrower_id|asset_id|timestamp) and verifies signature.
    """
    # 1. Reject if User has no registered Public Key (TOFU Disabled)
    if not current_user.public_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Device not registered. Please register your cryptographic key first."
        )

    # 2. Parse & Extract Required Fields from Body
    raw_body = await request.body()
    try:
        payload = json.loads(raw_body)

        action = payload.get("action")
        borrower_id = str(payload.get("borrower_id"))
        asset_id = payload.get("asset_id")
        timestamp = payload.get("timestamp")

        if not all([action, borrower_id, asset_id, timestamp]):
            raise ValueError("Missing canonical payload fields.")

        # Replay Attack Prevention (5 Minutes Window)
        if abs(time.time() - int(timestamp)) > 300:
            raise ValueError("Payload timestamp expired or out of tolerance.")

    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid transaction payload format: {str(e)}"
        )

    # 3. Construct Deterministic Canonical String
    # Format: action|borrower_id|asset_id|timestamp
    canonical_string = f"{action}|{borrower_id}|{asset_id}|{timestamp}"
    canonical_bytes = canonical_string.encode("utf-8")

    # 4. Cryptographic Verification
    try:
        # Helper untuk mendeteksi apakah string adalah Hex atau Base64
                def decode_crypto_string(s: str) -> bytes:
                    s_clean = s.strip()
                    # Jika panjangnya 64 atau 128 dan isinya karakter hex, parse sebagai hex
                    if len(s_clean) in (64, 128) and all(c in '0123456789abcdefABCDEF' for c in s_clean):
                        return bytes.fromhex(s_clean)
                    # Jika tidak, asumsikan itu base64
                    return base64.b64decode(s_clean)
                public_key_bytes = decode_crypto_string(current_user.public_key)
                signature_bytes = decode_crypto_string(x_ed25519_signature)

                public_key = ed25519.Ed25519PublicKey.from_public_bytes(public_key_bytes)
                public_key.verify(signature_bytes, canonical_bytes)
    except InvalidSignature:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cryptographic verification failed: Signature mismatch for canonical payload."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Malformed key or signature encoding: {str(e)}"
        )

    return current_user
