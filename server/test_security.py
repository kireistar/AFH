import base64
import json
import os
import time

import requests
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ed25519

# --- KONFIGURASI ---
BASE_URL = "http://localhost:8000/api/v1/transactions/"
TOKEN = "INSERT TOKEN OF USER THAT LOGIN"
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
BORROWER_ID = "INSERT USER_ID"
KEY_FILE = "keypair.json"

HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}


# --- PERSISTENSI KUNCI (Mencegah 403 Forbidden) ---
def get_or_create_keypair():
    if os.path.exists(KEY_FILE):
        with open(KEY_FILE, "r") as f:
            data = json.load(f)
            # Load private key menggunakan format standard PKCS8
            return serialization.load_pem_private_key(
                data["private_key"].encode(), password=None
            )
    else:
        priv_key = ed25519.Ed25519PrivateKey.generate()
        # Menggunakan format PKCS8 agar kompatibel dengan load_pem_private_key
        pem = priv_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )
        with open(KEY_FILE, "w") as f:
            json.dump({"private_key": pem.decode()}, f)
        return priv_key


private_key = get_or_create_keypair()
public_key_bytes = private_key.public_key().public_bytes(
    encoding=serialization.Encoding.Raw, format=serialization.PublicFormat.Raw
)
public_key_b64 = base64.b64encode(public_key_bytes).decode("utf-8")


def sign_data(payload):
    # Build canonical string: action|borrower_id|asset_id|timestamp[|expires_at]
    canonical = f"{payload['action']}|{payload['borrower_id']}|{payload['asset_id']}|{payload['timestamp']}"
    if payload.get('expires_at'):
        canonical += f"|{payload['expires_at']}"
    canonical_bytes = canonical.encode("utf-8")
    signature = private_key.sign(canonical_bytes)
    return canonical_bytes, base64.b64encode(signature).decode("utf-8")


def send_signed(payload, extra_headers=None):
    """Helper to POST a signed transaction."""
    canonical_bytes, sig = sign_data(payload)
    body = json.dumps(payload, separators=(",", ":"))
    headers = {**HEADERS, "x-ed25519-signature": sig, **(extra_headers or {})}
    return requests.post(BASE_URL, data=body, headers=headers)


print("Memulai Security Audit Ed25519 (Persisted Keys)...\n")

# --- TEST 1: Happy Path ---
valid_payload = {
    "action": "handover",
    "asset_id": 3,
    "borrower_id": BORROWER_ID,
    "request_id": 16,
    "payload": {"notes": "Test device"},
    "timestamp": int(time.time()),
}

res1 = send_signed(valid_payload, {"x-ed25519-public-key": public_key_b64})
print(
    f"Test 1 (Valid Transaction): {'PASS' if res1.status_code == 201 else 'FAIL'} - HTTP {res1.status_code}"
)

# --- TEST 2: Tamper Attack ---
tampered_payload = valid_payload.copy()
tampered_payload["asset_id"] = 99
# Use the original valid signature but modify the body — will fail canonical check
body2 = json.dumps(tampered_payload, separators=(",", ":"))
_, sig_orig = sign_data(valid_payload)  # signature over ORIGINAL canonical string
res2 = requests.post(
    BASE_URL, data=body2, headers={**HEADERS, "x-ed25519-signature": sig_orig}
)
print(
    f"Test 2 (Tampered Data)    : {'PASS' if res2.status_code == 401 else 'FAIL'} - HTTP {res2.status_code}"
)

# --- TEST 3: Replay Attack ---
expired_payload = valid_payload.copy()
expired_payload["timestamp"] = int(time.time()) - 120  # 2 min old, beyond 60s window
res3 = send_signed(expired_payload)
print(
    f"Test 3 (Replay Attack)    : {'PASS' if res3.status_code == 400 else 'FAIL'} - HTTP {res3.status_code}"
)
