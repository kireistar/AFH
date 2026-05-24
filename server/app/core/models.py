"""
DEPRECATED — Modul ini di-keep untuk backward compatibility saja.
Semua SQLAlchemy models sekarang ada di `app/models/` (split per entity).

Cara import yang benar (mulai sekarang):
    from app.models import User, Asset, AssetRequest, Transaction, Invoice, \\
                           Incident, HandoverToken, UserBehaviorStats, Base

File ini akan dihapus di rilis berikutnya.
"""
import warnings

from app.models import (  # noqa: F401
    Asset,
    AssetRequest,
    Base,
    HandoverToken,
    Incident,
    Invoice,
    Transaction,
    User,
    UserBehaviorStats,
)

warnings.warn(
    "`app.core.models` is deprecated. Import from `app.models` instead.",
    DeprecationWarning,
    stacklevel=2,
)
