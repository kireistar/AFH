"""
Security utilities — password hashing (bcrypt) dan JWT token management.

SCOPE:
  - Bcrypt hash/verify  → untuk login credential check
  - JWT create/decode   → untuk session access token (HS256)

BUKAN scope modul ini:
  - SHA-256 chained hashing  → itu di integrity/hashing_service.py (ranah Cyber-1)
  - Ed25519 signing          → itu di handover/signing_service.py  (ranah Cyber-2)
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.schemas.user import TokenPayload

# ── Password Hashing (bcrypt) ─────────────────────────────────────────────────

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Hash plain-text password menggunakan bcrypt. Dipanggil saat create/update user."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Bandingkan plain-text password dengan bcrypt hash yang tersimpan di DB.
    Return True kalau cocok, False kalau tidak.
    """
    return pwd_context.verify(plain_password, hashed_password)


# ── JWT Token ─────────────────────────────────────────────────────────────────

def create_access_token(
    subject: str,
    role: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Buat JWT access token.

    Args:
        subject   : user.id (UUID as string) — menjadi field 'sub' di payload
        role      : user.role string — disertakan agar FE/BE bisa routing tanpa query DB
        expires_delta : override expiry, default dari settings.ACCESS_TOKEN_EXPIRE_MINUTES

    Returns:
        Signed JWT string (HS256)
    """
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {
        "sub": subject,
        "role": role,
        "exp": expire,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> TokenPayload:
    """
    Decode dan validasi JWT token.

    Returns:
        TokenPayload (sub, role, exp)

    Raises:
        JWTError : kalau token invalid, expired, atau signature tidak cocok.
                   Caller (dependencies.py) bertanggung jawab convert ke HTTP 401.
    """
    payload = jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM],
    )
    return TokenPayload(
        sub=payload["sub"],
        role=payload["role"],
        exp=payload["exp"],
    )
