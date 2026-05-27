"""
UserBehaviorStats model — aggregate denormalized untuk feed Random Forest.
1:1 dengan User. Di-update via background job atau trigger pasca return/incident.
"""
from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class UserBehaviorStats(Base):
    __tablename__ = "user_behavior_stats"

    user_id = Column(UUID(as_uuid=True),
                     ForeignKey("users.id", ondelete="CASCADE"),
                     primary_key=True)
    total_borrows = Column(Integer, nullable=False, default=0)
    total_returns = Column(Integer, nullable=False, default=0)
    on_time_returns = Column(Integer, nullable=False, default=0)
    late_returns = Column(Integer, nullable=False, default=0)
    damage_count = Column(Integer, nullable=False, default=0)
    lost_count = Column(Integer, nullable=False, default=0)
    total_fines = Column(Numeric(15, 2), nullable=False, default=0)
    unpaid_fines = Column(Numeric(15, 2), nullable=False, default=0)
    last_calculated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # ---- Relationships ----
    user = relationship("User", back_populates="behavior_stats")

    def __repr__(self) -> str:
        return (f"<UserBehaviorStats user_id={self.user_id} "
                f"borrows={self.total_borrows}>")
