from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import AssetRequest, UserBehaviorStats

def _get_or_create_stats(db: Session, user_id: UUID) -> UserBehaviorStats:
    """
    Ambil stats user. Kalau belum ada (seharusnya tidak terjadi setelah seeding), buat baru supaya tidak crash.
    """
    stats = db.query(UserBehaviorStats).filter(
        UserBehaviorStats.user_id == user_id
    ).first()

    if stats is None:
        stats = UserBehaviorStats(user_id=user_id)
        db.add(stats)
        db.flush() # flush supaya object bisa langsung dipakai

    return stats

def record_return(
    db: Session,
    user_id: UUID,
    request_id: int,
    occured_at: datetime,
) -> None:
    """
    Dipanggil saat return transaction dibuat.
    total_returns naik 1.
    cek apakah terlambat berdasarkan requested_end di AssetRequest.
        - Tepat waktu   : on_time_returns naik 1
        - Terlambat     : late_returns naik 1
    """
    stats = _get_or_create_stats(db, user_id)
    stats.total_returns += 1

    # Cek keterlambatan
    request = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if request:
        return_date = occured_at.date() if isinstance(occured_at, datetime) else occured_at
        if return_date > request.requested_end:
            stats.late_returns += 1
        else:
            stats.on_time_returns += 1
    
    stats.last_calculated_at = datetime.now(timezone.utc)

def record_damage(db: Session, user_id: UUID) -> None:
    """
    Dipanggil saat incident report dengan kategori kerusakan dibuat.
    damage_count naik 1.
    """
    stats = _get_or_create_stats(db, user_id)
    stats.damage_count += 1
    stats.last_calculated_at = datetime.now(timezone.utc)

def record_lost(db: Session, user_id: UUID) -> None:
    """
    Dipanggil saat asset dinyatakan hilang.
    lost_count naik 1.
    """
    stats = _get_or_create_stats(db, user_id)
    stats.lost_count += 1
    stats.last_calculated_at = datetime.now(timezone.utc)

def record_fine_issued(db: Session, user_id: UUID, amount: Decimal) -> None:
    """
    Dipanggil saat invoice/denda baru dibuat.
    total_fines dan unpaid_fines naik sebesar amount.
    """
    stats = _get_or_create_stats(db, user_id)
    stats.total_fines += amount
    stats.unpaid_fines += amount
    stats.last_calculated_at = datetime.now(timezone.utc)
    
def record_fine_paid(db: Session, user_id: UUID, amount: Decimal) -> None:
    """
    Dipanggil saat invoice di-update ke status 'paid'.
    unpaid_fines turun sebesar amount (tidak boleh negatif).
    """
    stats = _get_or_create_stats(db, user_id)
    stats.unpaid_fines = max(Decimal(0), stats.unpaid_fines - amount)
    stats.last_calculated_at = datetime.now(timezone.utc)

def record_handover(db: Session, user_id: UUID, request_id: int) -> None:
    """
    Dipanggil saat handover token di-scan (asset diserahkan ke user).
    total_handovers naik 1.
    """
    stats = _get_or_create_stats(db, user_id)
    stats.total_handovers += 1
    stats.last_calculated_at = datetime.now(timezone.utc)