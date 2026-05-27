"""
HandoverToken model — QR token dinamis untuk Secure Handover (Ed25519 signed).
Token punya expiry, di-verify server-side saat user scan QR code admin.
"""
from sqlalchemy import Column, BigInteger, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class HandoverToken(Base):
    __tablename__ = "handover_tokens"

    id = Column(BigInteger, primary_key=True)
    token = Column(String(128), unique=True, nullable=False)
    request_id = Column(BigInteger,
                        ForeignKey("asset_requests.id", ondelete="CASCADE"),
                        nullable=False, index=True)
    issued_by = Column(UUID(as_uuid=True),
                       ForeignKey("users.id"),
                       nullable=False)
    signature = Column(Text, nullable=False)  # Ed25519 sig dari payload

    issued_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    scanned_at = Column(DateTime(timezone=True), nullable=True)
    scanned_by = Column(UUID(as_uuid=True),
                        ForeignKey("users.id", ondelete="SET NULL"),
                        nullable=True)

    # active / used / expired / revoked
    status = Column(String(20), nullable=False, default="active", index=True)

    # ---- Relationships ----
    request = relationship("AssetRequest", back_populates="handover_tokens")
    issuer = relationship("User", foreign_keys=[issued_by])
    scanner = relationship("User", foreign_keys=[scanned_by])

    def __repr__(self) -> str:
        return f"<HandoverToken token={self.token[:8]}... status={self.status}>"
