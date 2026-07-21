import nacl from "tweetnacl";
import util from "tweetnacl-util";

const STORAGE_KEY = "ed25519_keypair";

export const getOrGenerateKeyPair = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    return {
      publicKey: util.decodeBase64(parsed.publicKey),
      secretKey: util.decodeBase64(parsed.secretKey),
    };
  }

  const keyPair = nacl.sign.keyPair();
  const encodedKeyPair = {
    publicKey: util.encodeBase64(keyPair.publicKey),
    secretKey: util.encodeBase64(keyPair.secretKey),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(encodedKeyPair));
  return keyPair;
};

export const getPublicKeyBase64 = () => {
  const keyPair = getOrGenerateKeyPair();
  return util.encodeBase64(keyPair.publicKey);
};

// ── TAMBAHAN UNTUK NON-REPUDIATION ──────────────────────────────────────────

// Sort key alfabetis agar deterministik
const sortObject = (obj) => {
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
};

export const signPayload = (payload) => {
  const keyPair = getOrGenerateKeyPair(); // Ambil kunci (otomatis generate jika belum ada)

  const sortedPayload = sortObject(payload);
  const messageStr = JSON.stringify(sortedPayload);

  // Konversi string JSON ke format byte menggunakan tweetnacl-util
  const messageBytes = util.decodeUTF8(messageStr);

  // Buat detached signature (hanya 64-byte signature, tanpa message aslinya)
  const signature = nacl.sign.detached(messageBytes, keyPair.secretKey);

  // Return dalam bentuk base64
  return util.encodeBase64(signature);
};
