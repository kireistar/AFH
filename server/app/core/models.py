from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from .database import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    status = Column(String, default="Available")
    created_at = Column(DateTime(timezone=True), server_default=func.now())