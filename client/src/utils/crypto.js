import * as ed from '@noble/ed25519';
import { get, set } from 'idb-keyval';

const PRIV_KEY_ALIAS = 'afh_ed25519_priv';

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
  const pubKeyBase64 = btoa(String.fromCharCode(...pubKey));

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
 * 4. Format Canonical String untuk verifikasi deterministik (Fase 1 & 3)
 * Format: action|borrower_id|asset_id|timestamp
 */
export const createCanonicalPayload = (action, borrowerId, assetId, timestamp) => {
  return `${action}|${borrowerId}|${assetId}|${timestamp}`;
};

/**
 * 5. Tanda tangani payload string menggunakan private key Ed25519
 */
export const signPayload = async (payloadString, privKey) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(payloadString);
  const signature = await ed.signAsync(data, privKey);
  return btoa(String.fromCharCode(...signature));
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
