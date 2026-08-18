"""
User router - CRUD endpoint untuk user management & Device Registration Shield.
"""

import base64
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.exceptions import InvalidSignature

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.security import hash_password
from app.models import User, UserBehaviorStats
from app.schemas import UserCreate, UserResponse, UserUpdate, RegisterPublicKeyRequest, ResetPasswordRequest, UserBehaviorStatsResponse


router = APIRouter(
    prefix="/api/v1/users",
    tags=["Users"],
)


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

    Melakukan proof-of-possession dengan memverifikasi signature dari
    challenge 'register:{user_id}' untuk memastikan client memiliki private key.
    """
    # 1. Proof-of-possession: verify client holds the private key
    challenge = f"register:{current_user.id}"
    challenge_bytes = challenge.encode("utf-8")
    try:
        pub_key_bytes = base64.b64decode(payload.public_key.strip())
        sig_bytes = base64.b64decode(payload.signature.strip())
        public_key = ed25519.Ed25519PublicKey.from_public_bytes(pub_key_bytes)
        public_key.verify(sig_bytes, challenge_bytes)
    except (InvalidSignature, ValueError, Exception) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Proof-of-possession failed: {str(e)}"
        )

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

@router.post("/{user_id}/reset-password", response_model=UserResponse)
def reset_user_password(
    user_id: UUID,
    body: ResetPasswordRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role("admin")),
):
    """
    Admin-only: Reset password user yang lupa password.
    User yang lupa password harus menghubungi admin terlebih dahulu
    (lihat email admin di halaman login) — tidak ada self-service recovery.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )

    user.password_hash = hash_password(body.new_password)
    db.commit()
    db.refresh(user)

    from app.services.audit_service import log_admin_action
    log_admin_action(
        db,
        actor_id=admin_user.id,
        action="RESET_PASSWORD",
        entity_type="User",
        entity_id=user.id,
        details=f"Admin reset password untuk {user.employee_name} ({user.email})",
    )
    return user

@router.get("/{user_id}/behavior-stats", response_model=UserBehaviorStatsResponse)
def get_user_behavior_stats(
    user_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin", "manager")),
):
    """
    Ambil detail 8 fitur behavior stats user (input untuk Random Forest).
    Admin & Manager only.
    """
    stats = db.query(UserBehaviorStats).filter(
        UserBehaviorStats.user_id == user_id
    ).first()
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Behavior stats for user {user_id} not found",
        )
    return stats

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
    limit = min(max(1, limit), 200)
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


from fastapi import UploadFile, File
import csv
import io
import secrets
from datetime import date
from app.core.security import hash_password
from app.services.audit_service import log_admin_action
from app.models.audit_log import AuditLog

@router.post("/bulk-import-csv")
def bulk_import_users(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role("admin")),
):
    """Bulk import users dari file CSV. Column required: employee_id, employee_name, email, role, department. Optional: password (jika kosong, generate acak)."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File harus berformat CSV")

    contents = file.file.read().decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(contents))

    imported_count = 0
    errors = []
    generated_credentials = []

    for row_idx, row in enumerate(reader, start=2):
        emp_id = row.get("employee_id") or row.get("Employee ID") or row.get("id")
        emp_name = row.get("employee_name") or row.get("Name") or row.get("name")
        email = row.get("email") or row.get("Email")
        role = (row.get("role") or row.get("Role") or "user").strip().lower()
        dept = row.get("department") or row.get("Department") or "IT Operations"
        provided_pw = row.get("password") or row.get("Password")

        if not emp_id or not emp_name or not email:
            errors.append(f"Row {row_idx}: 'employee_id', 'employee_name', and 'email' are required")
            continue

        try:
            plain_password = provided_pw if provided_pw and len(provided_pw) >= 8 else secrets.token_urlsafe(10)
            new_user = User(
                employee_id=emp_id.strip(),
                employee_name=emp_name.strip(),
                email=email.strip().lower(),
                role=role,
                department=dept.strip(),
                clearance_level=3 if role == "admin" else (2 if role in ["manager", "finance"] else 1),
                employment_status="Active",
                hire_date=date.today(),
                password_hash=hash_password(plain_password),
                risk_score=0.0,
                risk_score_tier="Low",
            )
            db.add(new_user)
            db.commit()
            imported_count += 1
            if not provided_pw or len(provided_pw) < 8:
                generated_credentials.append({
                    "employee_id": emp_id.strip(),
                    "email": email.strip().lower(),
                    "password": plain_password,
                })
        except Exception as e:
            db.rollback()
            errors.append(f"Row {row_idx}: {str(e)}")

    log_admin_action(
        db,
        actor_id=admin_user.id,
        action="BULK_IMPORT_USERS",
        entity_type="User",
        details=f"Imported {imported_count} users via CSV. Errors: {len(errors)}",
    )

    return {
        "status": "Success",
        "imported_count": imported_count,
        "errors": errors,
        "generated_credentials": generated_credentials,
    }


@router.get("/audit-logs")
def get_admin_audit_logs(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """Ambil daftar log audit aktivitas admin."""
    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .limit(100)
        .all()
    )
    result = []
    for l in logs:
        actor_name = l.actor.employee_name if l.actor else "System"
        result.append({
            "id": str(l.id),
            "actor_name": actor_name,
            "action": l.action,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "details": l.details,
            "created_at": l.created_at.isoformat() if l.created_at else None,
        })
    return result
