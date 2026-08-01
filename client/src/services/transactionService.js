import { apiGet, apiPost } from "./apiClient";

export const submitTransaction = async (transactionData) => {
  // 1. JALUR QR CODE
  if (transactionData.signature && transactionData.public_key) {
    const qrData = transactionData.payload;

    return await apiPost('/api/v1/transactions/', {
      // --- A. Penuhi syarat validasi dasar backend di posisi luar (Root) ---
      action: qrData.action,
      asset_id: String(qrData.asset_id),
      borrower_id: String(qrData.borrower_id),
      request_id: String(qrData.request_id),
      admin_id: transactionData.admin_id,

      // --- B. Kirim paket kriptografi utuh ---
      payload: qrData,
      signature: transactionData.signature,
      public_key: transactionData.public_key
    });
  }

  // 2. JALUR MANUAL (Fallback)
  const reqId = transactionData.request_id || transactionData._id;
  const assetId = transactionData.asset_id || transactionData._assetId || transactionData.asset?._id || transactionData.asset;
  const borrowerId = transactionData.borrower_id || transactionData._borrowerId || transactionData.user?._id || transactionData.user;

  if (!assetId || !borrowerId) {
    console.error("Payload Data:", transactionData);
    throw new Error("Gagal melakukan handover: asset_id atau borrower_id kosong (undefined).");
  }

  return await apiPost('/api/v1/transactions/', {
    action: "handover",
    asset_id: String(assetId),
    borrower_id: String(borrowerId),
    request_id: String(reqId),
    admin_id: transactionData.admin_id,
    payload: transactionData.payload || { notes: "Handover executed via Admin Dashboard" }
  });
};

export const verifyLedger = async () => {
  return await apiPost("/api/v1/ledger/verify", {});
};

export const fetchAllTransactions = async () => {
  return await apiGet("/api/v1/transactions/");
};

export const fetchTransactionsByBorrower = async (borrowerId) => {
  return await apiGet(`/api/v1/transactions/?borrower_id=${encodeURIComponent(borrowerId)}`);
};
