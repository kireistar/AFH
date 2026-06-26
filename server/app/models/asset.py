"""
Asset model — D2 Asset Inventory.
"""
from sqlalchemy import Column, BigInteger, String, Numeric, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Asset(Base):
    __tablename__ = "assets"

    id = Column(BigInteger, primary_key=True)
    asset_code = Column(String(20), unique=True, nullable=False, index=True)
    asset_name = Column(String(150), nullable=False)

    # Enum values divalidasi DB CHECK + Pydantic schema:
    # laptop / desktop / mobile / peripheral / projector / server / network / other
    category = Column(String(20), nullable=False, index=True)
    brand = Column(String(100), nullable=True)
    serial_number = Column(String(100), unique=True, nullable=True)
    purchase_value = Column(Numeric(15, 2), nullable=False, default=0)
    location = Column(String(100), nullable=True)

    # good / minor_damage / damaged / lost
    current_condition = Column(String(20), nullable=False, default="good", index=True)
    # available / borrowed / maintenance / retired
    status = Column(String(20), nullable=False, default="available", index=True)

    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(),
                        onupdate=func.now(), nullable=False)

    # ---- Relationships ----
    requests = relationship("AssetRequest", back_populates="asset")
    transactions = relationship("Transaction", back_populates="asset")
    incidents = relationship("Incident", back_populates="asset")

    def __repr__(self) -> str:
        return f"<Asset {self.asset_code} {self.asset_name}>"
