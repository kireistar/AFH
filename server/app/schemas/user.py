"""
User schemas — Pydantic validation untuk endpoint user & auth.
PENTING: UserResponse TIDAK pernah expose password_hash.
"""
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.schemas.enums import EmploymentStatus, RiskTier, UserRole


# ---- Base (shared fields) ----
class UserBase(BaseModel):
    employee_id: str = Field(..., min_length=1, max_length=20, examples=["EMP-0001"])
    employee_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    role: UserRole
    department: str = Field(..., min_length=1, max_length=50)
    clearance_level: int = Field(default=1, ge=1, le=5)
    employment_status: EmploymentStatus = EmploymentStatus.ACTIVE
    hire_date: date
    resignation_date: Optional[date] = None

    @field_validator('resignation_date', mode='before')
    @classmethod
    def convert_empty_string_to_none(cls, v):
        """Convert empty string ke None untuk optional date fields."""
        if v == "" or v is None:
            return None
        return v


# ---- Create (input untuk POST /users atau registrasi) ----
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128,
                          description="Raw password; akan di-hash dengan bcrypt di backend")


# ---- Update (partial, semua optional) ----
class UserUpdate(BaseModel):
    employee_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    department: Optional[str] = None
    clearance_level: Optional[int] = Field(None, ge=1, le=5)
    employment_status: Optional[EmploymentStatus] = None
    resignation_date: Optional[date] = None
    risk_score: Optional[Decimal] = Field(None, ge=0, le=100)
    risk_score_tier: Optional[RiskTier] = None
    public_key: Optional[str] = None

    @field_validator('resignation_date', mode='before')
    @classmethod
    def convert_empty_string_to_none(cls, v):
        """Convert empty string ke None untuk optional date fields."""
        if v == "" or v is None:
            return None
        return v


# ---- Response (output API; NO password_hash) ----
class UserResponse(UserBase):
    id: UUID
    risk_score: Decimal = Field(..., ge=0, le=100)
    risk_score_tier: RiskTier
    public_key: Optional[str] = None
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---- Auth-specific schemas ----
class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse  # eager-include profile biar FE tidak perlu round-trip lagi


class TokenPayload(BaseModel):
    """JWT payload struktur (sub = user UUID)."""
    sub: str  # user.id as string
    role: UserRole
    exp: int  # expiry timestamp


class RegisterPublicKeyRequest(BaseModel):
    public_key: str = Field(..., min_length=1, description="Base64 encoded Ed25519 public key")
    signature: str = Field(..., description="Ed25519 signature dari challenge string 'register:{user_id}' untuk proof-of-possession")


class ResetPasswordRequest(BaseModel):
    """Admin-only: set password baru untuk user yang lupa password."""
    new_password: str = Field(..., min_length=6, max_length=128)
