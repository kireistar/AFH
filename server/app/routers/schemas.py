"""
DEPRECATED — Modul ini di-keep untuk backward compatibility saja.
Semua Pydantic schemas sekarang ada di `app/schemas/` (split per entity).

Cara import yang benar (mulai sekarang):
    from app.schemas import AssetCreate, AssetResponse, AssetUpdate

File ini akan dihapus di rilis berikutnya.
"""
import warnings

from app.schemas.asset import (  # noqa: F401
    AssetBase,
    AssetCreate,
    AssetResponse,
    AssetUpdate,
)

warnings.warn(
    "`app.routers.schemas` is deprecated. Import from `app.schemas` instead.",
    DeprecationWarning,
    stacklevel=2,
)
