import base64
import json
import time
import pytest
from unittest.mock import MagicMock
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.testclient import TestClient
from cryptography.hazmat.primitives.asymmetric import ed25519

from app.core.dependencies import verify_non_repudiation, get_current_user
from app.models import User

# --- SETUP DUMMY APP UNTUK TESTING DEPENDENCY ---
test_app = FastAPI()

@test_app.post("/test-signature")
async def dummy_protected_endpoint(user: User = Depends(verify_non_repudiation)):
    return {"status": "success", "user_id": str(user.id)}


# --- FIXTURES (HELPERS FOR TEST) ---
@pytest.fixture
def keypair():
    """Menghasilkan pasangan kunci Ed25519 baru untuk pengujian."""
    priv_key = ed25519.Ed25519PrivateKey.generate()
    pub_key_bytes = priv_key.public_key().public_bytes_raw()
    pub_key_b64 = base64.b64encode(pub_key_bytes).decode("utf-8")
    return priv_key, pub_key_b64


@pytest.fixture
def mock_user(keypair):
    """Membuat objek User tiruan yang sudah terdaftar Public Key-nya."""
    _, pub_key_b64 = keypair
    user = MagicMock(spec=User)
    user.id = "123e4567-e89b-12d3-a456-426614174000"
    user.public_key = pub_key_b64
    user.role = "user"
    return user


def create_signature(priv_key, action: str, borrower_id: str, asset_id: int, timestamp: int, expires_at: int = None) -> str:
    """Helper untuk membuat Base64 Signature dari Canonical String."""
    canonical_string = f"{action}|{borrower_id}|{asset_id}|{timestamp}"
    if expires_at is not None:
        canonical_string += f"|{expires_at}"
    signature_bytes = priv_key.sign(canonical_string.encode("utf-8"))
    return base64.b64encode(signature_bytes).decode("utf-8")


# --- UNIT TESTS: Single-Party (Manual Handover) ---

def test_verify_non_repudiation_success(keypair, mock_user):
    """
    Test 1: Happy Path (Single-Party)
    Payload valid dan signature sesuai dengan Canonical String.
    """
    priv_key, _ = keypair
    current_time = int(time.time())

    test_app.dependency_overrides[get_current_user] = lambda: mock_user
    client = TestClient(test_app)

    payload = {
        "action": "handover",
        "borrower_id": mock_user.id,
        "asset_id": 101,
        "timestamp": current_time
    }

    sig_b64 = create_signature(
        priv_key,
        action=payload["action"],
        borrower_id=str(payload["borrower_id"]),
        asset_id=payload["asset_id"],
        timestamp=payload["timestamp"]
    )

    response = client.post(
        "/test-signature",
        json=payload,
        headers={"x-ed25519-signature": sig_b64}
    )

    assert response.status_code == 200
    assert response.json()["status"] == "success"

    test_app.dependency_overrides.clear()


def test_verify_non_repudiation_unregistered_device(mock_user):
    """
    Test 2: Device Belum Terdaftar
    User belum punya public_key di database -> Harus return 403.
    """
    mock_user.public_key = None

    test_app.dependency_overrides[get_current_user] = lambda: mock_user
    client = TestClient(test_app)

    payload = {
        "action": "handover",
        "borrower_id": mock_user.id,
        "asset_id": 101,
        "timestamp": int(time.time())
    }

    response = client.post(
        "/test-signature",
        json=payload,
        headers={"x-ed25519-signature": "dummy_signature"}
    )

    assert response.status_code == 403
    assert "Device not registered" in response.json()["detail"]

    test_app.dependency_overrides.clear()


def test_verify_non_repudiation_tampered_payload(keypair, mock_user):
    """
    Test 3: Tamper Attack
    Signature di-sign untuk asset_id 101, tapi di payload diubah jadi 999.
    Verifikasi harus gagal -> Return 401.
    """
    priv_key, _ = keypair
    current_time = int(time.time())

    test_app.dependency_overrides[get_current_user] = lambda: mock_user
    client = TestClient(test_app)

    sig_b64 = create_signature(
        priv_key,
        action="handover",
        borrower_id=str(mock_user.id),
        asset_id=101,
        timestamp=current_time
    )

    tampered_payload = {
        "action": "handover",
        "borrower_id": mock_user.id,
        "asset_id": 999,
        "timestamp": current_time
    }

    response = client.post(
        "/test-signature",
        json=tampered_payload,
        headers={"x-ed25519-signature": sig_b64}
    )

    assert response.status_code == 401
    assert "Signature mismatch" in response.json()["detail"]

    test_app.dependency_overrides.clear()


def test_verify_non_repudiation_replay_attack(keypair, mock_user):
    """
    Test 4: Replay Attack
    Timestamp sudah kadaluwarsa (> 300 detik/5 menit) -> Harus return 400.
    """
    priv_key, _ = keypair
    expired_time = int(time.time()) - 600

    test_app.dependency_overrides[get_current_user] = lambda: mock_user
    client = TestClient(test_app)

    payload = {
        "action": "handover",
        "borrower_id": mock_user.id,
        "asset_id": 101,
        "timestamp": expired_time
    }

    sig_b64 = create_signature(
        priv_key,
        action=payload["action"],
        borrower_id=str(payload["borrower_id"]),
        asset_id=payload["asset_id"],
        timestamp=payload["timestamp"]
    )

    response = client.post(
        "/test-signature",
        json=payload,
        headers={"x-ed25519-signature": sig_b64}
    )

    assert response.status_code == 400
    assert "timestamp expired" in response.json()["detail"]

    test_app.dependency_overrides.clear()


# --- UNIT TESTS: QR Expiry (30-second TTL) ---

def test_verify_non_repudiation_qr_expired(keypair, mock_user):
    """
    Test 5: QR Code Expired
    expires_at sudah lewat -> Harus return 400.
    """
    priv_key, _ = keypair
    current_time = int(time.time())
    expired_at = current_time - 10  # 10 detik yang lalu

    test_app.dependency_overrides[get_current_user] = lambda: mock_user
    client = TestClient(test_app)

    payload = {
        "action": "handover",
        "borrower_id": mock_user.id,
        "asset_id": 101,
        "timestamp": current_time,
        "expires_at": str(expired_at)
    }

    sig_b64 = create_signature(
        priv_key,
        action=payload["action"],
        borrower_id=str(payload["borrower_id"]),
        asset_id=payload["asset_id"],
        timestamp=payload["timestamp"],
        expires_at=expired_at
    )

    response = client.post(
        "/test-signature",
        json=payload,
        headers={"x-ed25519-signature": sig_b64}
    )

    assert response.status_code == 400
    assert "expired" in response.json()["detail"].lower()

    test_app.dependency_overrides.clear()


def test_verify_non_repudiation_qr_not_expired(keypair, mock_user):
    """
    Test 6: QR Code Not Yet Expired
    expires_at masih dalam 30 detik -> Harus return 200.
    """
    priv_key, _ = keypair
    current_time = int(time.time())
    expires_at = current_time + 25  # 25 detik lagi

    test_app.dependency_overrides[get_current_user] = lambda: mock_user
    client = TestClient(test_app)

    payload = {
        "action": "handover",
        "borrower_id": mock_user.id,
        "asset_id": 101,
        "timestamp": current_time,
        "expires_at": str(expires_at)
    }

    sig_b64 = create_signature(
        priv_key,
        action=payload["action"],
        borrower_id=str(payload["borrower_id"]),
        asset_id=payload["asset_id"],
        timestamp=payload["timestamp"],
        expires_at=expires_at
    )

    response = client.post(
        "/test-signature",
        json=payload,
        headers={"x-ed25519-signature": sig_b64}
    )

    assert response.status_code == 200
    assert response.json()["status"] == "success"

    test_app.dependency_overrides.clear()


# --- UNIT TESTS: Dual-Party Verification (QR Code Flow) ---

def test_verify_non_repudiation_dual_party_success(keypair, mock_user):
    """
    Test 7: Dual-Party Happy Path
    Borrower signature + admin signature keduanya valid.
    """
    borrower_priv, borrower_pub_b64 = keypair
    admin_priv = ed25519.Ed25519PrivateKey.generate()
    admin_pub_bytes = admin_priv.public_key().public_bytes_raw()
    admin_pub_b64 = base64.b64encode(admin_pub_bytes).decode("utf-8")

    # mock_user is the admin (JWT holder)
    mock_user.public_key = admin_pub_b64

    current_time = int(time.time())

    test_app.dependency_overrides[get_current_user] = lambda: mock_user
    client = TestClient(test_app)

    payload = {
        "action": "handover",
        "borrower_id": mock_user.id,
        "asset_id": 101,
        "timestamp": current_time
    }

    # Borrower signs
    borrower_sig = create_signature(
        borrower_priv,
        action=payload["action"],
        borrower_id=str(payload["borrower_id"]),
        asset_id=payload["asset_id"],
        timestamp=payload["timestamp"]
    )

    # Admin signs the same canonical string
    admin_sig = create_signature(
        admin_priv,
        action=payload["action"],
        borrower_id=str(payload["borrower_id"]),
        asset_id=payload["asset_id"],
        timestamp=payload["timestamp"]
    )

    response = client.post(
        "/test-signature",
        json=payload,
        headers={
            "x-ed25519-signature": borrower_sig,
            "x-ed25519-admin-signature": admin_sig,
            "x-ed25519-public-key": borrower_pub_b64,
        }
    )

    assert response.status_code == 200
    assert response.json()["status"] == "success"

    test_app.dependency_overrides.clear()


def test_verify_non_repudiation_dual_party_missing_borrower_pubkey(keypair, mock_user):
    """
    Test 8: Dual-Party Missing Borrower Public Key
    Admin signature present but x-ed25519-public-key header missing -> 400.
    """
    _, borrower_pub_b64 = keypair
    admin_priv = ed25519.Ed25519PrivateKey.generate()
    admin_pub_bytes = admin_priv.public_key().public_bytes_raw()
    admin_pub_b64 = base64.b64encode(admin_pub_bytes).decode("utf-8")

    mock_user.public_key = admin_pub_b64
    current_time = int(time.time())

    test_app.dependency_overrides[get_current_user] = lambda: mock_user
    client = TestClient(test_app)

    payload = {
        "action": "handover",
        "borrower_id": mock_user.id,
        "asset_id": 101,
        "timestamp": current_time
    }

    admin_sig = create_signature(
        admin_priv,
        action=payload["action"],
        borrower_id=str(payload["borrower_id"]),
        asset_id=payload["asset_id"],
        timestamp=payload["timestamp"]
    )

    response = client.post(
        "/test-signature",
        json=payload,
        headers={
            "x-ed25519-signature": "dummy_borrower_sig",
            "x-ed25519-admin-signature": admin_sig,
            # Missing x-ed25519-public-key
        }
    )

    assert response.status_code == 400
    assert "borrower public key" in response.json()["detail"].lower()

    test_app.dependency_overrides.clear()


def test_verify_non_repudiation_dual_party_wrong_admin_sig(keypair, mock_user):
    """
    Test 9: Dual-Party Wrong Admin Signature
    Borrower sig valid, admin sig does not match admin's key -> 401.
    """
    borrower_priv, borrower_pub_b64 = keypair
    admin_priv = ed25519.Ed25519PrivateKey.generate()
    admin_pub_bytes = admin_priv.public_key().public_bytes_raw()
    admin_pub_b64 = base64.b64encode(admin_pub_bytes).decode("utf-8")

    mock_user.public_key = admin_pub_b64
    current_time = int(time.time())

    test_app.dependency_overrides[get_current_user] = lambda: mock_user
    client = TestClient(test_app)

    payload = {
        "action": "handover",
        "borrower_id": mock_user.id,
        "asset_id": 101,
        "timestamp": current_time
    }

    borrower_sig = create_signature(
        borrower_priv,
        action=payload["action"],
        borrower_id=str(payload["borrower_id"]),
        asset_id=payload["asset_id"],
        timestamp=payload["timestamp"]
    )

    # Admin signs for the WRONG asset_id
    wrong_admin_sig = create_signature(
        admin_priv,
        action=payload["action"],
        borrower_id=str(payload["borrower_id"]),
        asset_id=999,  # Wrong!
        timestamp=payload["timestamp"]
    )

    response = client.post(
        "/test-signature",
        json=payload,
        headers={
            "x-ed25519-signature": borrower_sig,
            "x-ed25519-admin-signature": wrong_admin_sig,
            "x-ed25519-public-key": borrower_pub_b64,
        }
    )

    assert response.status_code == 401
    assert "Signature mismatch" in response.json()["detail"]

    test_app.dependency_overrides.clear()


def test_verify_non_repudiation_dual_party_wrong_borrower_sig(keypair, mock_user):
    """
    Test 10: Dual-Party Wrong Borrower Signature
    Admin sig valid, borrower sig does not match borrower's key -> 401.
    """
    _, borrower_pub_b64 = keypair
    admin_priv = ed25519.Ed25519PrivateKey.generate()
    admin_pub_bytes = admin_priv.public_key().public_bytes_raw()
    admin_pub_b64 = base64.b64encode(admin_pub_bytes).decode("utf-8")

    mock_user.public_key = admin_pub_b64
    current_time = int(time.time())

    test_app.dependency_overrides[get_current_user] = lambda: mock_user
    client = TestClient(test_app)

    payload = {
        "action": "handover",
        "borrower_id": mock_user.id,
        "asset_id": 101,
        "timestamp": current_time
    }

    # Admin signs correctly
    admin_sig = create_signature(
        admin_priv,
        action=payload["action"],
        borrower_id=str(payload["borrower_id"]),
        asset_id=payload["asset_id"],
        timestamp=payload["timestamp"]
    )

    # Wrong borrower signature (signed by a different key)
    wrong_borrower_priv = ed25519.Ed25519PrivateKey.generate()
    wrong_borrower_sig = create_signature(
        wrong_borrower_priv,
        action=payload["action"],
        borrower_id=str(payload["borrower_id"]),
        asset_id=payload["asset_id"],
        timestamp=payload["timestamp"]
    )

    response = client.post(
        "/test-signature",
        json=payload,
        headers={
            "x-ed25519-signature": wrong_borrower_sig,
            "x-ed25519-admin-signature": admin_sig,
            "x-ed25519-public-key": borrower_pub_b64,
        }
    )

    assert response.status_code == 401
    assert "Signature mismatch" in response.json()["detail"]

    test_app.dependency_overrides.clear()


def test_verify_non_repudiation_dual_party_expired_qr(keypair, mock_user):
    """
    Test 11: Dual-Party with Expired QR
    Both signatures valid but expires_at has passed -> 400.
    """
    borrower_priv, borrower_pub_b64 = keypair
    admin_priv = ed25519.Ed25519PrivateKey.generate()
    admin_pub_bytes = admin_priv.public_key().public_bytes_raw()
    admin_pub_b64 = base64.b64encode(admin_pub_bytes).decode("utf-8")

    mock_user.public_key = admin_pub_b64
    current_time = int(time.time())
    expired_at = current_time - 5

    test_app.dependency_overrides[get_current_user] = lambda: mock_user
    client = TestClient(test_app)

    payload = {
        "action": "handover",
        "borrower_id": mock_user.id,
        "asset_id": 101,
        "timestamp": current_time,
        "expires_at": str(expired_at)
    }

    borrower_sig = create_signature(
        borrower_priv,
        action=payload["action"],
        borrower_id=str(payload["borrower_id"]),
        asset_id=payload["asset_id"],
        timestamp=payload["timestamp"],
        expires_at=expired_at
    )

    admin_sig = create_signature(
        admin_priv,
        action=payload["action"],
        borrower_id=str(payload["borrower_id"]),
        asset_id=payload["asset_id"],
        timestamp=payload["timestamp"],
        expires_at=expired_at
    )

    response = client.post(
        "/test-signature",
        json=payload,
        headers={
            "x-ed25519-signature": borrower_sig,
            "x-ed25519-admin-signature": admin_sig,
            "x-ed25519-public-key": borrower_pub_b64,
        }
    )

    assert response.status_code == 400
    assert "expired" in response.json()["detail"].lower()

    test_app.dependency_overrides.clear()


def test_verify_non_repudiation_dual_party_real_qr_shape(keypair, mock_user):
    """
    Test 12: Dual-Party with the real QR body shape (nested handover token).
    Borrower signs the token's own canonical (string timestamp + expires_at) in
    ProduceQRModal; admin signs the SAME string. The server must promote the
    nested fields to top level so both signatures verify against one canonical.
    """
    borrower_priv, borrower_pub_b64 = keypair
    admin_priv = ed25519.Ed25519PrivateKey.generate()
    admin_pub_bytes = admin_priv.public_key().public_bytes_raw()
    admin_pub_b64 = base64.b64encode(admin_pub_bytes).decode("utf-8")

    mock_user.public_key = admin_pub_b64
    current_time = int(time.time())
    expires_at = current_time + 25

    # Mirrors ProduceQRModal.jsx payloadObj: string timestamp & expires_at
    token = {
        "action": "handover",
        "asset_id": "101",
        "borrower_id": str(mock_user.id),
        "request_id": "55",
        "timestamp": str(current_time),
        "expires_at": str(expires_at),
    }

    borrower_sig = create_signature(
        borrower_priv,
        action=token["action"],
        borrower_id=token["borrower_id"],
        asset_id=token["asset_id"],
        timestamp=token["timestamp"],
        expires_at=expires_at,
    )

    admin_sig = create_signature(
        admin_priv,
        action=token["action"],
        borrower_id=token["borrower_id"],
        asset_id=token["asset_id"],
        timestamp=token["timestamp"],
        expires_at=expires_at,
    )

    # Mirrors transactionService.submitTransaction QR path body shape
    body = {
        "action": token["action"],
        "asset_id": token["asset_id"],
        "borrower_id": token["borrower_id"],
        "request_id": token["request_id"],
        "admin_id": str(mock_user.id),
        "payload": token,
        "signature": borrower_sig,
        "public_key": borrower_pub_b64,
    }

    test_app.dependency_overrides[get_current_user] = lambda: mock_user
    client = TestClient(test_app)

    response = client.post(
        "/test-signature",
        json=body,
        headers={
            "x-ed25519-signature": borrower_sig,
            "x-ed25519-admin-signature": admin_sig,
            "x-ed25519-public-key": borrower_pub_b64,
        }
    )

    assert response.status_code == 200
    assert response.json()["status"] == "success"

    test_app.dependency_overrides.clear()
