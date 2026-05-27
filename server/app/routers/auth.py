"""
Auth router — endpoint login & session management.

Endpoint:
  POST /api/auth/login  → verifikasi kredensial, return JWT access token

Catatan scope:
  - Ini adalah JWT session auth (bcrypt + HS256). BUKAN Ed25519 handover auth (ranah Cyber).
  - Untuk logout, cukup hapus token di sisi client (stateless JWT).
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import create_access_token, verify_password
from app.models import User
from app.schemas import Token, UserResponse

router = APIRouter(
    prefix="/api/auth",
    tags=["Auth"],
)


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Login dengan email + password.

    - **username** : email karyawan (field 'username' adalah konvensi OAuth2 form)
    - **password** : plain-text password

    Return JWT access token + user profile (agar FE tidak perlu round-trip lagi).
    """
    # Cari user by email (OAuth2PasswordRequestForm memakai field 'username')
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ── Check employment status (HR lifecycle) ─────────────────────────────────
    # Hanya Active dan On Leave yang boleh login
    ALLOWED_STATUSES = ["Active", "On Leave"]
    if user.employment_status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Akun tidak aktif. Status: {user.employment_status}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Update last_login_at
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(
        subject=str(user.id),
        role=user.role,
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user,
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Ambil profil user yang sedang login berdasarkan JWT token.
    Berguna untuk FE refresh state tanpa re-login.
    """
    return current_user
