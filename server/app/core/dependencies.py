"""
FastAPI dependencies — injectable auth & RBAC guards.

Cara pakai di router:
    from app.core.dependencies import get_current_user, require_role

    # Hanya perlu login (role apapun):
    @router.get("/me")
    def get_me(current_user: User = Depends(get_current_user)):
        ...

    # Hanya admin:
    @router.post("/assets")
    def create_asset(current_user: User = Depends(require_role("admin"))):
        ...

    # Beberapa role sekaligus:
    @router.get("/requests")
    def get_requests(current_user: User = Depends(require_role("admin", "manager"))):
        ...
"""
from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models import User

# Skema OAuth2 — FastAPI akan otomatis tambahkan lock icon di Swagger UI
# tokenUrl harus match dengan endpoint login kita
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency utama — decode JWT dan kembalikan User object dari DB.

    Raise 401 jika:
      - Token tidak ada / format salah
      - Token expired atau signature invalid
      - User (sub) tidak ditemukan di DB
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token tidak valid atau sudah expired",
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
    """
    Factory untuk role-based guard. Kembalikan FastAPI dependency yang
    memastikan current_user memiliki salah satu dari role yang diizinkan.

    Contoh:
        Depends(require_role("admin"))
        Depends(require_role("admin", "manager"))

    Raise 403 jika user login tapi role-nya tidak diizinkan.
    """
    def _guard(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Akses ditolak. Role yang diizinkan: {', '.join(roles)}",
            )
        return current_user

    return _guard


# ── Shortcut dependencies (opsional, untuk readability di router) ─────────────
def get_current_admin(current_user: User = Depends(require_role("admin"))) -> User:
    return current_user


def get_current_manager(current_user: User = Depends(require_role("manager"))) -> User:
    return current_user


def get_current_finance(current_user: User = Depends(require_role("finance"))) -> User:
    return current_user


def get_current_admin_or_manager(
    current_user: User = Depends(require_role("admin", "manager"))
) -> User:
    return current_user
