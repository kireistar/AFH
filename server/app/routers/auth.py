"""
Auth router — endpoint login & session management.
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
    prefix="/api/v1/auth",  # PERBAIKAN M1: Menambahkan /v1 agar seragam dengan router lain
    tags=["Auth"],
)


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Login dengan email + password.
    Return JWT access token + user profile.
    """
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ── Check employment status (HR lifecycle) ─────────────────────────────────
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


# PERBAIKAN M5: Menambahkan endpoint Logout
@router.post("/logout")
def logout(_: User = Depends(get_current_user)):
    """
    Logout user. Karena sistem menggunakan JWT stateless, backend hanya merespon sukses.
    Penghapusan token sepenuhnya harus dilakukan di sisi frontend.
    """
    return {"message": "Logged out successfully. Silakan hapus token di sisi client (Frontend)."}


from pydantic import BaseModel, Field

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6)

@router.post("/change-password")
def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Ganti password user yang sedang login."""
    if not verify_password(body.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password lama salah",
        )
    
    from app.core.security import hash_password
    current_user.password_hash = hash_password(body.new_password)
    db.commit()
    return {"status": "Success", "message": "Password berhasil diperbarui"}