"""
User router — CRUD endpoint untuk user management.
Updated: import dari struktur baru (app.models, app.schemas).
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse, UserUpdate

router = APIRouter(
    prefix="/api/v1/users",
    tags=["Users"],
)


@router.get("/", response_model=List[UserResponse])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Mengambil semua data user dari database (paginated)."""
    return db.query(User).offset(skip).limit(limit).all()


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: UUID, db: Session = Depends(get_db)):
    """Ambil 1 user by UUID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )
    return user


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """Buat user baru. Password HARUS di-hash menggunakan bcrypt di service layer."""
    # Check duplicate employee_id
    existing_employee = db.query(User).filter(User.employee_id == user_in.employee_id).first()
    if existing_employee:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee ID '{user_in.employee_id}' already exists",
        )

    # Check duplicate email
    existing_email = db.query(User).filter(User.email == user_in.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Email '{user_in.email}' already exists",
        )

    # TODO: Hash password menggunakan bcrypt di service layer
    # password_hash = hash_password(user_in.password)
    # Untuk now, simpan raw password (JANGAN DI-PRODUCTION)
    user_data = user_in.model_dump(exclude={"password"})
    user_data["password_hash"] = user_in.password  # TODO: Replace dengan hashed password

    new_user = User(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(user_id: UUID, user_in: UserUpdate, db: Session = Depends(get_db)):
    """Update partial 1 user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )

    update_data = user_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: UUID, db: Session = Depends(get_db)):
    """Hapus user (hard delete). FK-restrict kalau masih ada request/asset terkait."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )
    db.delete(user)
    db.commit()
    return None
