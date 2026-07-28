"""
User router - CRUD endpoint untuk user management & Device Registration Shield.
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.security import hash_password
from app.models import User
from app.schemas import UserCreate, UserResponse, UserUpdate, RegisterPublicKeyRequest

router = APIRouter(
    prefix="/api/v1/users",
    tags=["Users"],
)

# --- FASE 2: PYDANTIC SCHEMA & ENDPOINT REGISTRASI KUNCI ---

class RegisterPublicKeyRequest(BaseModel):
    public_key: str = Field(..., description="Ed25519 Public Key dalam format Base64")


@router.post("/register-key", response_model=UserResponse)
def register_public_key(
    payload: RegisterPublicKeyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Device Registration Shield
    Mengikat Public Key Ed25519 dari perangkat fisik ke tabel users (D1).
    Mengizinkan re-registrasi (overwrite) jika user berganti perangkat.
    """
    current_user.public_key = payload.public_key
    db.commit()
    db.refresh(current_user)
    return current_user


@router.patch("/{user_id}/reset-device-key", response_model=UserResponse)
def reset_device_key(
    user_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """
    Admin-only: Reset public key Ed25519 seorang user.
    Menghapus public_key sehingga user dipaksa registrasi ulang perangkat.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )

    user.public_key = None
    db.commit()
    db.refresh(user)
    return user


# --- EXISTING CRUD ENDPOINTS ---

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user


@router.get("/", response_model=List[UserResponse])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    return db.query(User).offset(skip).limit(limit).all()


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    return user


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    if db.query(User).filter(User.employee_id == user_in.employee_id).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee ID '{user_in.employee_id}' already exists"
        )
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Email '{user_in.email}' already exists"
        )
    user_data = user_in.model_dump(exclude={"password"})
    user_data["password_hash"] = hash_password(user_in.password)
    new_user = User(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: UUID,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    for key, value in user_in.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        db.delete(user)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Cannot delete user: User has existing requests or transactions. Please deactivate the account instead."
        )
    return None
