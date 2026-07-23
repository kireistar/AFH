import { getOrGenerateKeyPair, createCanonicalPayload, signPayload } from "../utils/crypto";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const injectEd25519Signature = async (endpoint, config) => {
  const isProtectedEndpoint =
    endpoint.includes("/transactions") ||
    endpoint.includes("/handover-tokens/scan");

  const isPost = config.method && config.method.toUpperCase() === "POST";

  if (isProtectedEndpoint && isPost) {
    try {
      let payload = {};
      if (config.body) {
        payload = typeof config.body === "string" ? JSON.parse(config.body) : config.body;
      }

      // --- PERBAIKAN: JALUR QR CODE (NON-REPUDIATION) ---
      // Jika payload dari service sudah membawa signature dan public_key peminjam,
      // gunakan itu untuk Header, dan JANGAN timpa dengan tanda tangan Admin.
      if (payload.signature && payload.public_key) {
        config.headers["x-ed25519-signature"] = payload.signature;
        config.headers["x-ed25519-public-key"] = payload.public_key;

        // Sinkronkan timestamp di Root dengan timestamp dari dalam QR Code
        // agar validasi backend tidak hancur
        if (payload.payload && payload.payload.timestamp) {
          payload.timestamp = payload.payload.timestamp;
          config.body = JSON.stringify(payload);
        }

        return; // KELUAR DARI FUNGSI SEKARANG. Jangan jalankan kode di bawah.
      }

      // --- JALUR MANUAL (ADMIN SIGNATURE) ---
      // 1. Ambil Keypair dari IndexedDB (Public & Private) milik Admin
      const { privKey, pubKeyBase64 } = await getOrGenerateKeyPair();

      const action = payload.action || "handover";
      const borrowerId = payload.borrower_id;
      const assetId = payload.asset_id;
      const timestamp = payload.timestamp || Math.floor(Date.now() / 1000);

      payload.timestamp = timestamp;
      config.body = JSON.stringify(payload);

      // 2. Buat Canonical String
      const canonicalString = createCanonicalPayload(action, borrowerId, assetId, timestamp);

      // 3. Signature
      const signResult = await signPayload(canonicalString, privKey);
      const signature = typeof signResult === "string" ? signResult : (signResult.signatureHex || signResult.signatureBase64);

      // 4. Injeksi Header Manual
      config.headers["x-ed25519-signature"] = signature;
      if (!config.headers["x-ed25519-public-key"] && pubKeyBase64) {
        config.headers["x-ed25519-public-key"] = pubKeyBase64;
      }
    } catch (err) {
      console.error("Failed to perform Ed25519 signing on request:", err);
    }
  }
};

export const apiCall = async (endpoint, options = {}) => {
  // SAFE FALLBACK TOKEN RETRIEVAL (Mencakup accessToken, token, & access_token)
  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("access_token");

  const headers = {
    Accept: "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  await injectEd25519Signature(endpoint, config);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      // Baca pesan error detail dari backend jika ada
      const errorData = await response.json().catch(() => ({}));
      const detailMessage = errorData.detail || "Session expired. Please login again.";

      // Jangan hapus token jika hanya masalah signature mismatch
      if (detailMessage.toLowerCase().includes("signature") || detailMessage.toLowerCase().includes("mismatch")) {
        throw new Error(`Cryptographic Auth Failed: ${detailMessage}`);
      }

      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-expired"));
      throw new Error(detailMessage);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.detail || `API Error: ${response.status}`;
      throw new Error(message);
    }

    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error(`API call failed [${endpoint}]:`, error);
    throw error;
  }
};

export const apiGet = (endpoint, options = {}) => apiCall(endpoint, { method: "GET", ...options });
export const apiPost = (endpoint, body, options = {}) => {
  const { headers, ...restOptions } = options;
  return apiCall(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    ...restOptions,
  });
};
export const apiPut = (endpoint, body, options = {}) => {
  const { headers, ...restOptions } = options;
  return apiCall(endpoint, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    ...restOptions,
  });
};
export const apiPatch = (endpoint, body, options = {}) => {
  const { headers, ...restOptions } = options;
  return apiCall(endpoint, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    ...restOptions,
  });
};
export const apiDelete = (endpoint, options = {}) => apiCall(endpoint, { method: "DELETE", ...options });

export default {
  apiCall,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
};
