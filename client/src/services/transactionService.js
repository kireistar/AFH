import { apiGet, apiPost } from "./apiClient";
// Hapus import crypto di sini karena sudah di-handle oleh apiClient.js secara otomatis

export const submitTransaction = async (transactionData) => {
  // 1. Ekstraksi ID dengan fallback yang aman (mencegah "undefined")
  // Sesuaikan dengan struktur asli dari database/API get requests kamu
  const reqId = transactionData.request_id || transactionData._id;

  // Ambil dari _assetId, asset_id, atau id dari dalam objek asset
  const assetId = transactionData.asset_id || transactionData._assetId || transactionData.asset?._id || transactionData.asset;

  // Ambil dari _borrowerId, borrower_id, atau id dari dalam objek user
  const borrowerId = transactionData.borrower_id || transactionData._borrowerId || transactionData.user?._id || transactionData.user;

  if (!assetId || !borrowerId) {
    console.error("Payload Data:", transactionData);
    throw new Error("Gagal melakukan handover: asset_id atau borrower_id kosong (undefined).");
  }

  // 2. Langsung tembak API. apiClient.js akan otomatis membuatkan signature-nya!
  return await apiPost('/api/v1/transactions/', {
    action: "handover",
    asset_id: assetId.toString(),
    borrower_id: borrowerId.toString(),
    request_id: reqId.toString(),
    admin_id: transactionData.admin_id,
    payload: transactionData.payload || { notes: "Handover executed via Admin Dashboard" }
  });
};

export const verifyLedger = async () => {
  // Tembak endpoint verifikasi ledger backend kamu
  return await apiPost("/api/v1/transactions/verify/ledger", {});
};

export const fetchAllTransactions = async () => {
  return await apiGet("/api/v1/transactions/");
};
