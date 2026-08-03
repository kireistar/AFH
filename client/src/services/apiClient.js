import { getOrGenerateKeyPair, createCanonicalPayload, signPayload } from "../utils/crypto";

export const API_BASE_URL = "http://127.0.0.1:8000";

export const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/uploads/')) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
};

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

      const isQRFlow = payload.signature && payload.public_key;

      // QR flow: the borrower already signed the canonical over the QR's own timestamp
      // and expiry. The admin MUST sign that SAME canonical string (server verifies both
      // signatures against one string), so reuse the QR values and mirror them to the
      // ROOT of the body — otherwise the server reconstructs a different canonical and
      // every QR handover fails with "Signature mismatch".
      const qrPayload = isQRFlow ? payload.payload : null;

      const { privKey, pubKeyBase64 } = await getOrGenerateKeyPair();

      const action = payload.action || "handover";
      const borrowerId = payload.borrower_id;
      const assetId = payload.asset_id;
      const ts = isQRFlow
        ? String(qrPayload?.timestamp ?? Math.floor(Date.now() / 1000))
        : String(Math.floor(Date.now() / 1000));
      const expiresAt = isQRFlow ? qrPayload?.expires_at : null;

      payload.timestamp = ts;
      if (expiresAt != null && expiresAt !== "") {
        payload.expires_at = String(expiresAt);
      }
      config.body = JSON.stringify(payload);

      const canonicalString = createCanonicalPayload(action, borrowerId, assetId, ts, expiresAt);

      const signResult = await signPayload(canonicalString, privKey);
      const adminSignature = typeof signResult === "string" ? signResult : (signResult.signatureHex || signResult.signatureBase64);

      if (isQRFlow) {
        // QR path: borrower's signature as primary, admin's as secondary
        config.headers["x-ed25519-signature"] = payload.signature;
        config.headers["x-ed25519-admin-signature"] = adminSignature;
        config.headers["x-ed25519-public-key"] = payload.public_key;
      } else {
        // Manual path: admin is the sole signer (single-party verification)
        config.headers["x-ed25519-signature"] = adminSignature;
        config.headers["x-ed25519-public-key"] = pubKeyBase64;
      }
    } catch (err) {
      console.error("Failed to perform Ed25519 signing on request:", err);
      throw new Error("Cryptographic signing failed: " + (err.message || "Unable to sign transaction."));
    }
  }
};

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem("accessToken");

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

export const apiUpload = async (endpoint, formData) => {
  const token = localStorage.getItem("accessToken");

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Upload Error: ${response.status}`);
  }

  return await response.json();
};

export default {
  API_BASE_URL,
  resolveImageUrl,
  apiCall,
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
  apiUpload,
};
