import nacl from "tweetnacl";
import util from "tweetnacl-util";

const STORAGE_KEY = "ed25519_keypair";

/**
 * Retrieves or generates an Ed25519 keypair for the current browser session.
 * Time Complexity: O(1) for retrieval or generation.
 * Space Complexity: O(1) storing 64-byte secret key and 32-byte public key.
 */
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
