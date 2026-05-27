"""
Transaction model — D3 Immutable Ledger.
APPEND-ONLY: jangan pernah UPDATE atau DELETE (di-enforce via DB trigger).

previous_hash + current_hash = chained SHA-256 (mirip block di blockchain ringan).
signature = Ed25519 sig dari current_hash (non-repudiation).
"""
from sqlalchemy import Column, BigInteger, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(BigInteger, primary_key=True)
    transaction_code = Column(String(20), unique=True, nullable=False, index=True)

    request_id = Column(BigInteger, ForeignKey("asset_requests.id", ondelete="RESTRICT"),
                        nullable=True)
    asset_id = Column(BigInteger, ForeignKey("assets.id", ondelete="RESTRICT"),
                      nullable=False, index=True)
    borrower_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"),
                         nullable=False, index=True)
    admin_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"),
                      nullable=True)

    # handover / return / incident_report / fine_issued / fine_paid / verification
    action = Column(String(30), nullable=False, index=True)

    # Snapshot data event (kondisi, lokasi, fine_amount, dll)
    payload = Column(JSONB, nullable=False)

    # ---- Chained hashing fields ----
    previous_hash = Column(String(64), nullable=True, index=True)  # NULL untuk genesis
    current_hash = Column(String(64), unique=True, nullable=False)  # SHA-256 hex
    signature = Column(Text, nullable=True)  # Ed25519 base64

    # pending / committed / verified / tampered
    status = Column(String(20), nullable=False, default="committed")
    occurred_at = Column(DateTime(timezone=True), server_default=func.now(),
                         nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # ---- Relationships ----
    request = relationship("AssetRequest", back_populates="transactions")
    asset = relationship("Asset", back_populates="transactions")
    borrower = relationship("User", foreign_keys=[borrower_id])
    admin = relationship("User", foreign_keys=[admin_id])
    invoices = relationship("Invoice", back_populates="transaction")

    def __repr__(self) -> str:
        return f"<Transaction {self.transaction_code} action={self.action}>"
