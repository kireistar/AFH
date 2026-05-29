"""
AssetRequest model — Workflow request: user submit -> AI risk score
-> route ke admin/manager -> approve -> handover -> return.
"""
from sqlalchemy import Column, BigInteger, String, Date, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class AssetRequest(Base):
    __tablename__ = "asset_requests"

    id = Column(BigInteger, primary_key=True)
    request_code = Column(String(20), unique=True, nullable=False, index=True)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"),
                     nullable=False, index=True)
    asset_id = Column(BigInteger, ForeignKey("assets.id", ondelete="RESTRICT"),
                      nullable=False, index=True)

    reason = Column(Text, nullable=False)
    requested_start = Column(Date, nullable=False)
    requested_end = Column(Date, nullable=False)

    # Snapshot AI saat request dibuat (immutable per-request)
    risk_score_snapshot = Column(Numeric(5, 2), nullable=False, default=0)
    risk_tier_snapshot = Column(String, nullable=False, default="Low")  # Low/Medium/High
    ai_decision_reason = Column(Text, nullable=True)

    # pending_admin / pending_manager / approved / rejected / handed_over / returned / cancelled
    status = Column(String(30), nullable=False, default="pending_admin", index=True)

    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"),
                         nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(),
                        nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(),
                        onupdate=func.now(), nullable=False)

    # ---- Relationships ----
    user = relationship("User", foreign_keys=[user_id], back_populates="requests")
    # approver: relasi 1-arah (User side tidak punya back-ref untuk hindari multi-FK conflict).
    # Untuk query "approvals oleh user X":
    #   db.query(AssetRequest).filter(AssetRequest.approved_by == user.id)
    approver = relationship("User", foreign_keys=[approved_by])
    asset = relationship("Asset", back_populates="requests")
    transactions = relationship("Transaction", back_populates="request")
    handover_tokens = relationship(
        "HandoverToken",
        back_populates="request",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<AssetRequest {self.request_code} ({self.status})>"
