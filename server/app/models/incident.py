"""
Incident model — laporan kerusakan device dari user
(fitur "Report Broken Device" di UserDashboard).
"""
from sqlalchemy import Column, BigInteger, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(BigInteger, primary_key=True)
    incident_code = Column(String(20), unique=True, nullable=False, index=True)

    reporter_id = Column(UUID(as_uuid=True),
                         ForeignKey("users.id", ondelete="RESTRICT"),
                         nullable=False, index=True)
    asset_id = Column(BigInteger,
                      ForeignKey("assets.id", ondelete="SET NULL"),
                      nullable=True, index=True)

    description = Column(Text, nullable=False)
    # low / medium / high / critical
    severity = Column(String(20), nullable=False, default="medium")
    # open / investigating / resolved / closed
    status = Column(String(20), nullable=False, default="open", index=True)

    resolved_by = Column(UUID(as_uuid=True),
                         ForeignKey("users.id", ondelete="SET NULL"),
                         nullable=True)
    resolution_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    reported_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(),
                        onupdate=func.now(), nullable=False)

    # ---- Relationships ----
    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="incidents_reported")
    resolver = relationship("User", foreign_keys=[resolved_by])
    asset = relationship("Asset", back_populates="incidents")

    def __repr__(self) -> str:
        return f"<Incident {self.incident_code} severity={self.severity} status={self.status}>"
