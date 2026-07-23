import nacl from 'tweetnacl';

export const verifyHandoverSignature = (payload, signatureB64, pubKeyB64) => {
  try {
    const messageUint8 = new TextEncoder().encode(payload);
    const signatureUint8 = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));
    const pubKeyUint8 = Uint8Array.from(atob(pubKeyB64), c => c.charCodeAt(0));

    return nacl.sign.detached.verify(messageUint8, signatureUint8, pubKeyUint8);
  } catch (error) {
    console.error("Error decoding atau verifikasi:", error);
    return false;
  }
};
