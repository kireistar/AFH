"""
Invoice model — D4 Invoice / Penalty Database.
Auto-generated saat return = damaged/late.
Fine = asset.purchase_value * 2 (Form 3 rule).
"""
from sqlalchemy import Column, BigInteger, String, Numeric, Text, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(BigInteger, primary_key=True)
    invoice_code = Column(String(20), unique=True, nullable=False, index=True)

    transaction_id = Column(BigInteger,
                            ForeignKey("transactions.id", ondelete="RESTRICT"),
                            nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True),
                     ForeignKey("users.id", ondelete="RESTRICT"),
                     nullable=False, index=True)

    fine_amount = Column(Numeric(15, 2), nullable=False)
    reason = Column(Text, nullable=False)

    # unpaid / pending_verification / paid / cancelled
    status = Column(String(30), nullable=False, default="unpaid", index=True)

    # bank_transfer / cash / e_wallet / payroll_deduction
    payment_method = Column(String(30), nullable=True)
    payment_proof_url = Column(Text, nullable=True)  # bukti upload (Supabase Storage)
    notes = Column(Text, nullable=True)

    paid_at = Column(DateTime(timezone=True), nullable=True)
    verified_by = Column(UUID(as_uuid=True),
                         ForeignKey("users.id", ondelete="SET NULL"),
                         nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)

    due_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(),
                        onupdate=func.now(), nullable=False)

    # ---- Relationships ----
    transaction = relationship("Transaction", back_populates="invoices")
    user = relationship("User", foreign_keys=[user_id], back_populates="invoices")
    verifier = relationship("User", foreign_keys=[verified_by])

    def __repr__(self) -> str:
        return f"<Invoice {self.invoice_code} ({self.status})>"
