import { apiGet, apiPost } from "./apiClient";
import { formatStatus, formatCurrency, formatDate } from "../utils/formatters";
import util from "tweetnacl-util";
import { getOrGenerateKeyPair, getPublicKeyBase64 } from "../utils/crypto";

/**
 * Mapper: backend transaction object -> format yang dipakai komponen
 */

const mapTransaction = (raw) => ({
  id: raw.transaction_code,
  party: raw.borrower?.employee_name || "Unknown User",
  asset: raw.asset?.asset_name || "Unknown Asset",
  date: formatDate(raw.occurred_at),
  action: formatStatus(raw.action),
  amount: raw.payload?.fine_amount
    ? formatCurrency(raw.payload.fine_amount)
    : "-",
  status: formatStatus(raw.status),
  _id: raw.id,
  _action: raw.action,
  _status: raw.status,
  _borrowerId: raw.borrower_id,
  _assetId: raw.asset_id,
  previous_hash: raw.previous_hash,
  current_hash: raw.current_hash,
});

export const fetchAllTransactions = async () => {
  const data = await apiGet("/api/v1/transactions/");
  return data.map(mapTransaction);
};

export const verifyLedger = async () => {
  return await apiGet("/api/v1/transactions/verify/ledger");
};

/**
 * Submits a new transaction with an Ed25519 signature for non-repudiation.
 * Time Complexity: O(N) where N is the payload string length for encoding, O(1) for curve signing.
 * Space Complexity: O(N) for message byte array allocation + 64 bytes constant for the signature.
 */
export const submitTransaction = async (transactionPayload) => {
  const keyPair = await getOrGenerateKeyPair();

  // Inject timestamp for anti-replay verification on the backend
  const securePayload = {
    ...transactionPayload,
    timestamp: Math.floor(Date.now() / 1000),
  };

  // Serialize to standard UTF-8 bytes before signing
  const payloadString = JSON.stringify(securePayload);
  const messageUint8 = util.decodeUTF8(payloadString);

  // Generate the Ed25519 signature using SubtleCrypto
  const signatureBuffer = await window.crypto.subtle.sign(
    { name: "Ed25519" },
    keyPair.privateKey,
    messageUint8
  );
  const signatureUint8 = new Uint8Array(signatureBuffer);
  const publicKeyBase64 = await getPublicKeyBase64(keyPair.publicKey);

  // Execute POST request with cryptographic headers
  const data = await apiPost("/api/v1/transactions/", securePayload, {
    headers: {
      "x-ed25519-signature": util.encodeBase64(signatureUint8),
      "x-ed25519-public-key": publicKeyBase64,
    },
  });

  // Optionally map the returned single transaction if your UI expects the formatted version
  return data.transaction_code ? mapTransaction(data) : data;
};
