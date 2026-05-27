"""
User model — D1 User & Risk Database.

Match dengan tabel public.users di Supabase (UUID PK + HR lifecycle + AI risk profile).

CATATAN tentang relationships:
- Hanya menyimpan back-refs untuk "main ownership" relationships
  (requests yang DIBUAT user, invoices YANG DITANGGUNG user, dll).
- Untuk relasi sekunder seperti "approvals yang dilakukan oleh user X",
  query langsung saja:
      db.query(AssetRequest).filter(AssetRequest.approved_by == user.id).all()
- Ini mencegah SQLAlchemy warning soal multi-FK conflict dan membuat
  intent code lebih eksplisit.
"""
import uuid
from sqlalchemy import Column, String, SmallInteger, Date, Numeric, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(String, unique=True, nullable=False, index=True)
    employee_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)

    # Role & HR lifecycle (CHECK constraint di DB level: 'user'/'admin'/'manager'/'finance')
    role = Column(String, nullable=False, index=True)
    department = Column(String, nullable=False)
    clearance_level = Column(SmallInteger, nullable=False, default=1)
    employment_status = Column(String, nullable=False, default="Active")
    hire_date = Column(Date, nullable=False)
    resignation_date = Column(Date, nullable=True)

    # AI risk profile
    risk_score = Column(Numeric(5, 2), nullable=False, default=0)
    risk_score_tier = Column(String, nullable=False, default="Low")

    # Auth
    password_hash = Column(Text, nullable=False)
    public_key = Column(Text, nullable=True)  # Ed25519, di-generate saat first handover

    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(),
                        onupdate=func.now(), nullable=False)

    # ---- Relationships (hanya "ownership" / primary FK ke users.id) ----
    requests = relationship(
        "AssetRequest",
        foreign_keys="AssetRequest.user_id",
        back_populates="user",
    )
    behavior_stats = relationship(
        "UserBehaviorStats",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    invoices = relationship(
        "Invoice",
        foreign_keys="Invoice.user_id",
        back_populates="user",
    )
    incidents_reported = relationship(
        "Incident",
        foreign_keys="Incident.reporter_id",
        back_populates="reporter",
    )

    def __repr__(self) -> str:
        return f"<User {self.employee_id} ({self.role})>"
