import { sign } from "@noble/ed25519"; // Import 'sign' langsung

// Helper untuk hex ke bytes
const hexToBytes = (hex) => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
};

// Helper untuk bytes ke base64
const bytesToBase64 = (bytes) => {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const sortObject = (obj) => {
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
};

export const signPayload = async (payload, privateKeyHex) => {
  const sortedPayload = sortObject(payload);
  const message = new TextEncoder().encode(JSON.stringify(sortedPayload));
  const privateKeyBytes = hexToBytes(privateKeyHex);

  // Gunakan 'sign' langsung, bukan 'ed25519.sign'
  const signature = await sign(message, privateKeyBytes);

  return bytesToBase64(signature);
};
