import os
import logging
from decimal import Decimal

import joblib
import pandas as pd
from sqlalchemy.orm import Session

from app.models import User, UserBehaviorStats

logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join(
    os.path.dirname(__file__), "..", "ml_models", "random_forest.pkl"
)

_model = None

def _load_model():
    global _model
    if _model is None:
        _model = joblib.load(MODEL_PATH)
        logger.info("Random Forest model loaded from %s", MODEL_PATH)
    return _model
    
def predict_risk(stats: UserBehaviorStats) -> tuple[Decimal, str]:
    """Risk score prediction (1-10)"""

    model = _load_model()

    features = pd.DataFrame([{
        'total_borrows': stats.total_borrows or 0,
        'total_returns': stats.total_returns or 0,
        'on_time_returns': stats.on_time_returns or 0,
        'late_returns': stats.late_returns or 0,
        'damage_count': stats.damage_count or 0,
        'lost_count': stats.lost_count or 0,
        'total_fines': float(stats.total_fines or 0),
        'unpaid_fines': float(stats.unpaid_fines or 0),
    }])

    raw_score = model.predict(features)[0]
    score = round(min(max(raw_score, 1.0), 10.0), 2)

    if score <= 4.0:    # k-means threshold (rounded from 4.1)
        tier = "Low"
    elif score <= 6.0:
        tier = "Medium" # k-means threshold (rounded from 5.92)
    else:
        tier = "High"

    return Decimal(str(score)), tier

def _build_reason(score: Decimal, tier: str, stats: UserBehaviorStats) -> str:
    """Build a human-readable AI decision reason from behavior stats."""
    fines = int(float(stats.total_fines or 0))
    unpaid = int(float(stats.unpaid_fines or 0))
    routed = "Manager review" if tier == "High" else "Admin"

    return (
        f"Score {score}/10 ({tier}) — "
        f"Borrows: {stats.total_borrows or 0}, "
        f"Returns: {stats.total_returns or 0} "
        f"(On-time: {stats.on_time_returns or 0}, Late: {stats.late_returns or 0}), "
        f"Damage: {stats.damage_count or 0}, "
        f"Lost: {stats.lost_count or 0}, "
        f"Total Fines: Rp {fines:,}, "
        f"Unpaid Fines: Rp {unpaid:,}. "
        f"Routed to: {routed}."
    ).replace(",", ".")


def calculate_and_update_risk(db: Session, user_id) -> tuple[Decimal, str, str]:
    """Calculate the risk score based on the data behavior. Returns (score, tier, reason)."""
    stats = db.query(UserBehaviorStats).filter(
        UserBehaviorStats.user_id == user_id
    ).first()

    if stats is None:
        return Decimal("1.00"), "Low", "Score 1.00/10 (Low) — No behavior data recorded. Routed to: Admin."

    score, tier = predict_risk(stats)
    reason = _build_reason(score, tier, stats)

    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.risk_score = score
        user.risk_score_tier = tier

    return score, tier, reason