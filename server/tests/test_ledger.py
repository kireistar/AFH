import unittest
from datetime import datetime, timezone
from app.services.ledger_service import calculate_transaction_hash, verify_ledger_integrity

class MockTransaction:
    def __init__(self, id, transaction_code, payload, previous_hash, occurred_at=None):
        self.id = id
        self.transaction_code = transaction_code
        self.payload = payload
        self.previous_hash = previous_hash
        self.occurred_at = occurred_at or datetime.now(timezone.utc)
        self.current_hash = calculate_transaction_hash(
            previous_hash=self.previous_hash,
            payload=self.payload,
            occurred_at=self.occurred_at
        )

class TestLedgerService(unittest.TestCase):
    
    def test_calculate_transaction_hash_deterministic(self):
        occurred_at = datetime(2026, 6, 27, 12, 0, 0, tzinfo=timezone.utc)
        payload = {"asset_id": 1, "borrower_id": "user-uuid-1", "action": "handover"}
        
        hash1 = calculate_transaction_hash("prev-hash", payload, occurred_at)
        hash2 = calculate_transaction_hash("prev-hash", payload, occurred_at)
        
        # Hash calculation must be deterministic
        self.assertEqual(hash1, hash2)

    def test_calculate_transaction_hash_changes_with_payload(self):
        occurred_at = datetime(2026, 6, 27, 12, 0, 0, tzinfo=timezone.utc)
        payload1 = {"asset_id": 1, "borrower_id": "user-uuid-1", "action": "handover"}
        payload2 = {"asset_id": 1, "borrower_id": "user-uuid-1", "action": "handover", "extra": "tampered"}
        
        hash1 = calculate_transaction_hash("prev-hash", payload1, occurred_at)
        hash2 = calculate_transaction_hash("prev-hash", payload2, occurred_at)
        
        self.assertNotEqual(hash1, hash2)

    def test_verify_ledger_integrity_valid_chain(self):
        # Genesis transaction
        t1 = MockTransaction(1, "TXN-001", {"asset_id": 1}, None)
        
        # Second transaction linked to t1
        t2 = MockTransaction(2, "TXN-002", {"asset_id": 2}, t1.current_hash)
        
        # Third transaction linked to t2
        t3 = MockTransaction(3, "TXN-003", {"asset_id": 3}, t2.current_hash)
        
        ledger = [t1, t2, t3]
        tampered_ids = verify_ledger_integrity(ledger)
        
        # No tampering should be detected
        self.assertEqual(len(tampered_ids), 0)

    def test_verify_ledger_integrity_tampered_payload(self):
        t1 = MockTransaction(1, "TXN-001", {"asset_id": 1}, None)
        t2 = MockTransaction(2, "TXN-002", {"asset_id": 2}, t1.current_hash)
        
        ledger = [t1, t2]
        
        # Tamper payload of t1 directly (re-evaluating its contents will hash differently)
        t1.payload = {"asset_id": 999} 
        
        tampered_ids = verify_ledger_integrity(ledger)
        
        # t1 should be flagged as tampered
        self.assertIn(1, tampered_ids)

    def test_verify_ledger_integrity_broken_link(self):
        t1 = MockTransaction(1, "TXN-001", {"asset_id": 1}, None)
        t2 = MockTransaction(2, "TXN-002", {"asset_id": 2}, t1.current_hash)
        t3 = MockTransaction(3, "TXN-003", {"asset_id": 3}, t2.current_hash)
        
        ledger = [t1, t2, t3]
        
        # Break the chain link between t2 and t3 by changing previous_hash of t3
        t3.previous_hash = "wrong-previous-hash"
        
        tampered_ids = verify_ledger_integrity(ledger)
        
        # t3 should be flagged as tampered due to incorrect link matching
        self.assertIn(3, tampered_ids)

if __name__ == '__main__':
    unittest.main()
