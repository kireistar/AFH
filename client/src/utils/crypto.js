import util from "tweetnacl-util";

const DB_NAME = "AFH_Crypto_DB";
const STORE_NAME = "keypair_store";
const KEY_NAME = "handover_keypair";

/**
 * Opens IndexedDB for secure key storage.
 * @returns {Promise<IDBDatabase>}
 */
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

/**
 * Retrieves or generates an Ed25519 keypair securely stored in IndexedDB.
 * The private key is generated with extractable: false, making it impossible
 * for scripts to read the private key material from browser memory.
 * @returns {Promise<CryptoKeyPair>}
 */
export const getOrGenerateKeyPair = async () => {
  try {
    const db = await openDB();
    const stored = await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(KEY_NAME);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (stored) {
      return stored;
    }

    // Generate non-extractable Ed25519 key pair
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "Ed25519",
      },
      false, // extractable: false (private key cannot be exported or read by JS)
      ["sign", "verify"]
    );

    // Persist key pair object directly in IndexedDB (supported via structured clone)
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(keyPair, KEY_NAME);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return keyPair;
  } catch (error) {
    console.error("Error in getOrGenerateKeyPair:", error);
    throw error;
  }
};

/**
 * Exports public key from CryptoKey to raw format and encodes to Base64.
 * @param {CryptoKey} [publicKey] - Option public key object to export
 * @returns {Promise<string>} Base64 encoded raw public key bytes
 */
export const getPublicKeyBase64 = async (publicKey) => {
  try {
    const pub = publicKey || (await getOrGenerateKeyPair()).publicKey;
    const exported = await window.crypto.subtle.exportKey("raw", pub);
    return util.encodeBase64(new Uint8Array(exported));
  } catch (error) {
    console.error("Error in getPublicKeyBase64:", error);
    throw error;
  }
};
