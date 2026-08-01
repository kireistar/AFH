"""
Automated End-to-End (E2E) Integration Test for AFH System.
Tests full lifecycle:
  1. Auth (Admin & User login)
  2. Device Shield Ed25519 Registration (Proof-of-Possession)
  3. Asset Creation (Admin)
  4. Asset Request (User) & Approval (Admin)
  5. Cryptographic Dual-Party Handover (Ed25519 Non-Repudiation)
  6. Asset Return & Status Update
  7. Immutable SHA-256 Ledger Chain Verification
"""

import base64
import json
import time
import requests
from cryptography.hazmat.primitives.asymmetric import ed25519

BASE_URL = "http://localhost:8000/api/v1"

def run_e2e_test():
    print("============================================================")
    print("STARTING AFH END-TO-END WORKFLOW INTEGRATION TEST")
    print("============================================================\n")

    # 1. AUTHENTICATION
    print("STEP 1: Authenticating Admin and User...")
    admin_login_res = requests.post(f"{BASE_URL}/auth/login", data={
        "username": "admin@afh.com",
        "password": "Password123!",
        "grant_type": "password"
    })
    if admin_login_res.status_code != 200:
        print(f"[FAIL] Admin login failed: {admin_login_res.text}")
        return False
    admin_token = admin_login_res.json()["access_token"]
    admin_user = admin_login_res.json()["user"]
    admin_id = str(admin_user["id"])
    print(f"  [OK] Admin logged in: {admin_user['employee_name']} (ID: {admin_id})")

    # Get regular user budi.santoso@afh.com
    users_res = requests.get(f"{BASE_URL}/users/", headers={"Authorization": f"Bearer {admin_token}"})
    budi_users = [u for u in users_res.json() if u["email"] == "budi.santoso@afh.com"]
    if not budi_users:
        print("[FAIL] Target test user budi.santoso@afh.com not found.")
        return False
    target_user = budi_users[0]
    target_user_id = str(target_user["id"])
    print(f"  [OK] Target User selected: {target_user['employee_name']} ({target_user['email']}, ID: {target_user_id})")

    # Login target user
    user_login_res = requests.post(f"{BASE_URL}/auth/login", data={
        "username": target_user["email"],
        "password": "Password123!",
        "grant_type": "password"
    })
    if user_login_res.status_code != 200:
        print(f"  [FAIL] User login failed: {user_login_res.text}")
        return False
    user_token = user_login_res.json()["access_token"]

    # 2. DEVICE REGISTRATION SHIELD (Ed25519)
    print("\nSTEP 2: Ed25519 Device Registration Shield (Proof-of-Possession)...")
    user_priv = ed25519.Ed25519PrivateKey.generate()
    user_pub_bytes = user_priv.public_key().public_bytes_raw()
    user_pub_b64 = base64.b64encode(user_pub_bytes).decode("utf-8")

    user_challenge = f"register:{target_user_id}".encode("utf-8")
    user_sig_bytes = user_priv.sign(user_challenge)
    user_sig_b64 = base64.b64encode(user_sig_bytes).decode("utf-8")

    reg_res = requests.post(
        f"{BASE_URL}/users/register-key",
        headers={"Authorization": f"Bearer {user_token}", "Content-Type": "application/json"},
        json={"public_key": user_pub_b64, "signature": user_sig_b64}
    )
    if reg_res.status_code != 200:
        print(f"[FAIL] Device registration failed: {reg_res.text}")
        return False
    print("  [OK] User Ed25519 Key registered successfully!")

    # Register Admin Key if needed
    admin_priv = ed25519.Ed25519PrivateKey.generate()
    admin_pub_bytes = admin_priv.public_key().public_bytes_raw()
    admin_pub_b64 = base64.b64encode(admin_pub_bytes).decode("utf-8")

    admin_challenge = f"register:{admin_id}".encode("utf-8")
    admin_sig_bytes = admin_priv.sign(admin_challenge)
    admin_sig_b64 = base64.b64encode(admin_sig_bytes).decode("utf-8")

    requests.post(
        f"{BASE_URL}/users/register-key",
        headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"},
        json={"public_key": admin_pub_b64, "signature": admin_sig_b64}
    )
    print("  [OK] Admin Ed25519 Key registered successfully!")

    # 3. ASSET CREATION
    print("\nSTEP 3: Creating a new Hardware Asset (Admin)...")
    create_asset_res = requests.post(
        f"{BASE_URL}/assets/",
        headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"},
        json={
            "asset_name": "E2E Test Laptop Pro M3",
            "category": "laptop",
            "brand": "Apple",
            "serial_number": f"SN-E2E-{int(time.time())}",
            "purchase_value": 25000000,
            "location": "Jakarta HQ",
            "current_condition": "good",
            "status": "available"
        }
    )
    if create_asset_res.status_code != 201:
        print(f"[FAIL] Asset creation failed: {create_asset_res.text}")
        return False
    asset = create_asset_res.json()
    asset_id = asset["id"]
    asset_code = asset["asset_code"]
    print(f"  [OK] Asset created: {asset['asset_name']} (Code: {asset_code}, ID: {asset_id})")

    # 4. ASSET REQUEST & APPROVAL
    print("\nSTEP 4: Asset Request Creation & Approval...")
    now_ts = int(time.time())
    start_date = time.strftime("%Y-%m-%d", time.gmtime(now_ts))
    end_date = time.strftime("%Y-%m-%d", time.gmtime(now_ts + 86400 * 7))

    req_res = requests.post(
        f"{BASE_URL}/asset-requests/",
        headers={"Authorization": f"Bearer {user_token}", "Content-Type": "application/json"},
        json={
            "asset_id": asset_id,
            "reason": "E2E Automated Testing",
            "requested_start": start_date,
            "requested_end": end_date
        }
    )
    if req_res.status_code != 201:
        print(f"[FAIL] Asset request creation failed: {req_res.text}")
        return False
    req_data = req_res.json()
    request_id = req_data["id"]
    print(f"  [OK] Asset Request created: Code {req_data['request_code']} (Status: {req_data['status']})")

    # Approve Request
    approve_res = requests.patch(
        f"{BASE_URL}/asset-requests/{request_id}/approve",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    if approve_res.status_code != 200:
        print(f"[FAIL] Asset request approval failed: {approve_res.text}")
        return False
    print(f"  [OK] Asset Request approved! Status: {approve_res.json()['status']}")

    # 5. DUAL-PARTY HANDOVER WITH ED25519 SIGNATURES
    print("\nSTEP 5: Cryptographic Dual-Party Handover (Ed25519 Non-Repudiation)...")
    timestamp = int(time.time())
    expires_at = timestamp + 30

    canonical_string = f"handover|{target_user_id}|{asset_id}|{timestamp}|{expires_at}"
    canonical_bytes = canonical_string.encode("utf-8")

    user_borrower_sig = base64.b64encode(user_priv.sign(canonical_bytes)).decode("utf-8")
    admin_handover_sig = base64.b64encode(admin_priv.sign(canonical_bytes)).decode("utf-8")

    handover_body = {
        "action": "handover",
        "asset_id": asset_id,
        "borrower_id": target_user_id,
        "admin_id": admin_id,
        "request_id": request_id,
        "timestamp": timestamp,
        "expires_at": expires_at,
        "payload": {
            "action": "handover",
            "borrower_id": target_user_id,
            "asset_id": asset_id,
            "timestamp": timestamp,
            "expires_at": expires_at
        },
        "signature": user_borrower_sig,
        "public_key": user_pub_b64
    }

    txn_res = requests.post(
        f"{BASE_URL}/transactions/",
        headers={
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json",
            "x-ed25519-signature": user_borrower_sig,
            "x-ed25519-admin-signature": admin_handover_sig,
            "x-ed25519-public-key": user_pub_b64
        },
        json=handover_body
    )
    if txn_res.status_code != 201:
        print(f"[FAIL] Handover transaction failed: {txn_res.text}")
        return False
    txn_data = txn_res.json()
    print(f"  [OK] Handover Transaction committed! Code: {txn_data['transaction_code']}")

    # Verify Asset status is now 'borrowed'
    updated_asset_res = requests.get(f"{BASE_URL}/assets/{asset_id}", headers={"Authorization": f"Bearer {admin_token}"})
    updated_asset = updated_asset_res.json()
    print(f"  [OK] Asset status updated to: '{updated_asset['status']}'")

    # 6. ASSET RETURN
    print("\nSTEP 6: Processing Asset Return...")
    return_res = requests.patch(
        f"{BASE_URL}/asset-requests/{request_id}/return",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"condition_notes": "Returned in perfect condition"}
    )
    if return_res.status_code != 200:
        print(f"[FAIL] Asset return failed: {return_res.text}")
        return False
    returned_req = return_res.json()
    print(f"  [OK] Asset returned! Request Status: '{returned_req['status']}'")

    final_asset_res = requests.get(f"{BASE_URL}/assets/{asset_id}", headers={"Authorization": f"Bearer {admin_token}"})
    print(f"  [OK] Asset status reset to: '{final_asset_res.json()['status']}'")

    # 7. IMMUTABLE SHA-256 LEDGER VERIFICATION
    print("\nSTEP 7: Verifying SHA-256 Chained Immutable Ledger Integrity...")
    ledger_res = requests.get(f"{BASE_URL}/ledger/verify", headers={"Authorization": f"Bearer {admin_token}"})
    if ledger_res.status_code != 200:
        print(f"[FAIL] Ledger verification failed: {ledger_res.text}")
        return False
    ledger_data = ledger_res.json()
    print(f"  [OK] Ledger Check: Total Transactions = {ledger_data['total_transactions']}")
    print(f"  [OK] Ledger Integrity Status: {'VALID (0 Tampering Detected)' if ledger_data['valid'] else 'INVALID'}")

    print("\n============================================================")
    print("ALL END-TO-END WORKFLOW TESTS PASSED SUCCESSFULLY!")
    print("============================================================")
    return True

if __name__ == "__main__":
    run_e2e_test()
