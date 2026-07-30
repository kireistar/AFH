import * as ed from '@noble/ed25519';
import { get, set } from 'idb-keyval';

const PRIV_KEY_ALIAS = 'afh_ed25519_priv';

const uint8ArrayToBase64 = (bytes) => {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * 1. Ambil atau generate keypair Ed25519 dari IndexedDB
 */
export const getOrGenerateKeyPair = async () => {
  let privKey = await get(PRIV_KEY_ALIAS);

  if (!privKey) {
    privKey = window.crypto.getRandomValues(new Uint8Array(32));
    await set(PRIV_KEY_ALIAS, privKey);
  }

  const pubKey = await ed.getPublicKeyAsync(privKey);
  const pubKeyBase64 = uint8ArrayToBase64(pubKey);

  return {
    privKey,
    pubKey,
    pubKeyBase64,
  };
};

/**
 * 1b. Regenerate keypair Ed25519 (untuk re-registrasi perangkat).
 * Overwrite keypair lama di IndexedDB dengan yang baru.
 */
export const regenerateKeyPair = async () => {
  const privKey = window.crypto.getRandomValues(new Uint8Array(32));
  await set(PRIV_KEY_ALIAS, privKey);

  const pubKey = await ed.getPublicKeyAsync(privKey);
  const pubKeyBase64 = uint8ArrayToBase64(pubKey);

  return {
    privKey,
    pubKey,
    pubKeyBase64,
  };
};

/**
 * 2. Ambil Public Key terdaftar dalam format Base64
 */
export const getStoredPublicKey = async () => {
  try {
    const { pubKeyBase64 } = await getOrGenerateKeyPair();
    return pubKeyBase64;
  } catch (error) {
    console.error("Gagal mengambil stored public key:", error);
    return null;
  }
};

/**
 * 3. ALIAS EXPORT: Untuk mendukung komponen yang mengimpor 'getPublicKeyBase64'
 */
export const getPublicKeyBase64 = getStoredPublicKey;

/**
 * 4. Format Canonical String untuk verifikasi deterministik
 * Format: action|borrower_id|asset_id|timestamp[|expires_at]
 * expires_at opsional — jika disertakan, QR berlaku 30 detik.
 */
export const createCanonicalPayload = (action, borrowerId, assetId, timestamp, expiresAt) => {
  let canonical = `${action}|${borrowerId}|${assetId}|${timestamp}`;
  if (expiresAt) {
    canonical += `|${expiresAt}`;
  }
  return canonical;
};

/**
 * 5. Tanda tangani payload string menggunakan private key Ed25519
 */
export const signPayload = async (payloadString, privKey) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(payloadString);
  const signature = await ed.signAsync(data, privKey);
  return uint8ArrayToBase64(signature);
};

/**
 * Deterministic JSON stringify to match Python's json.dumps(..., sort_keys=True, separators=(',', ':'))
 * Mencegah InvalidSignature akibat perbedaan urutan key JSON antara JS dan Python.
 */
export const deterministicStringify = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return `[${obj.map(deterministicStringify).join(',')}]`;
  }
  const keys = Object.keys(obj).sort();
  const str = keys.map(k => `"${k}":${deterministicStringify(obj[k])}`).join(',');
  return `{${str}}`;
};
