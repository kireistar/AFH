"""
FastAPI dependencies — injectable auth & RBAC guards.
"""

import base64
import json
import time
from typing import Callable, cast

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models import User
from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives.asymmetric import ed25519
from fastapi import Depends, Header, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

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


# ── Shortcut dependencies ─────────────
def get_current_admin(current_user: User = Depends(require_role("admin"))) -> User:
    return current_user


def get_current_manager(current_user: User = Depends(require_role("manager"))) -> User:
    return current_user


def get_current_finance(current_user: User = Depends(require_role("finance"))) -> User:
    return current_user


# ── Step 3: Ed25519 Non-Repudiation Guard ─────────────────────────────────────


async def verify_non_repudiation(
    request: Request,
    x_ed25519_signature: str = Header(...),
    x_ed25519_public_key: str = Header(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    # 1. TOFU (Trust On First Use)
    if current_user.public_key is None:
        if not x_ed25519_public_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Public key required for initial registration.",
            )
        current_user.public_key = x_ed25519_public_key  # type: ignore
        db.commit()
        db.refresh(current_user)

    # 2. Prevent Replay Attacks
    raw_body = await request.body()
    try:
        payload = json.loads(raw_body)
        if abs(time.time() - payload.get("timestamp", 0)) > 300:
            raise ValueError("Payload expired")
    except Exception:
        raise HTTPException(
            status_code=400, detail="Invalid JSON or missing timestamp."
        )

    # 3. Cryptographic Verification
    try:
        # Cast ke string agar Pylance tahu ini adalah data string, bukan Column object
        public_key_str = cast(str, current_user.public_key)

        public_key_bytes = base64.b64decode(public_key_str)
        signature_bytes = base64.b64decode(x_ed25519_signature)

        public_key = ed25519.Ed25519PublicKey.from_public_bytes(public_key_bytes)
        public_key.verify(signature_bytes, raw_body)
    except Exception as e:
        raise HTTPException(
            status_code=403, detail=f"Signature verification failed: {str(e)}"
        )

    return current_user
