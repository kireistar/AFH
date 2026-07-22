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


def create_signature(priv_key, action: str, borrower_id: str, asset_id: int, timestamp: int) -> str:
    """Helper untuk membuat Base64 Signature dari Canonical String."""
    canonical_string = f"{action}|{borrower_id}|{asset_id}|{timestamp}"
    signature_bytes = priv_key.sign(canonical_string.encode("utf-8"))
    return base64.b64encode(signature_bytes).decode("utf-8")


# --- UNIT TESTS ---

def test_verify_non_repudiation_success(keypair, mock_user):
    """
    Test 1: Happy Path
    Payload valid dan signature sesuai dengan Canonical String.
    """
    priv_key, _ = keypair
    current_time = int(time.time())

    # 1. Override dependency auth
    test_app.dependency_overrides[get_current_user] = lambda: mock_user
    client = TestClient(test_app)

    # 2. Susun payload
    payload = {
        "action": "handover",
        "borrower_id": mock_user.id,
        "asset_id": 101,
        "timestamp": current_time
    }

    # 3. Sign canonical string
    sig_b64 = create_signature(
        priv_key,
        action=payload["action"],
        borrower_id=str(payload["borrower_id"]),
        asset_id=payload["asset_id"],
        timestamp=payload["timestamp"]
    )

    # 4. Request
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
    mock_user.public_key = None  # Reset public key (TOFU Disabled)

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

    # Sign untuk asset_id 101
    sig_b64 = create_signature(
        priv_key,
        action="handover",
        borrower_id=str(mock_user.id),
        asset_id=101,
        timestamp=current_time
    )

    # Kirim payload yang di-tamper (asset_id = 999)
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
    expired_time = int(time.time()) - 600  # 10 menit yang lalu

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
