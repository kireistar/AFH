"""
Ledger service — D3 Immutable Ledger chain hashing.
Handles block hash computation and integrity verification.
"""
import hashlib
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


def calculate_transaction_hash(previous_hash: str | None, payload: dict, occurred_at: datetime) -> str:
    """
    Computes a SHA-256 hash of a transaction block based on database comment spec:
    'SHA-256 hex dari (previous_hash || payload || occurred_at)'
    
    Ensures serialization is deterministic using sort_keys=True.
    """
    # Normalize None previous_hash to empty string
    prev = previous_hash if previous_hash else ""
    
    # Canonicalize the JSON payload
    payload_str = json.dumps(payload, sort_keys=True, default=str)
    
    # Standardize occurred_at format
    occurred_str = occurred_at.isoformat() if hasattr(occurred_at, "isoformat") else str(occurred_at)
    
    # Concatenate according to specification
    data_to_hash = f"{prev}{payload_str}{occurred_str}"
    
    return hashlib.sha256(data_to_hash.encode("utf-8")).hexdigest()


def verify_ledger_integrity(transactions) -> list[int]:
    """
    Verifies the integrity of a list of transaction objects sorted by ID/creation.
    Returns a list of tampered transaction IDs.
    """
    tampered_ids = []
    prev_hash = None
    
    for txn in transactions:
        # 1. Verify links: previous_hash of current must match current_hash of previous
        if txn.previous_hash != prev_hash:
            logger.warning(
                "Integrity violation at transaction ID %s: previous_hash '%s' "
                "does not match expected previous hash '%s'",
                txn.id, txn.previous_hash, prev_hash
            )
            tampered_ids.append(txn.id)
            # Keep traversing, but align prev_hash to current stored to catch individual tampering points
            prev_hash = txn.current_hash
            continue
            
        # 2. Verify content: recalculate hash and match against current_hash
        computed_hash = calculate_transaction_hash(
            previous_hash=txn.previous_hash,
            payload=txn.payload,
            occurred_at=txn.occurred_at
        )
        
        if computed_hash != txn.current_hash:
            logger.warning(
                "Integrity violation at transaction ID %s: current_hash '%s' "
                "does not match recalculated hash '%s'",
                txn.id, txn.current_hash, computed_hash
            )
            if txn.id not in tampered_ids:
                tampered_ids.append(txn.id)
                
        prev_hash = txn.current_hash
        
    return tampered_ids
