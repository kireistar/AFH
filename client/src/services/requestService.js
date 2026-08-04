import { apiGet, apiPost, apiPatch } from './apiClient';
import { formatStatus, formatDate } from '../utils/formatters';

/**
 * Mapper: backend AssetRequest object -> format yang dipakai komponen
 * Memanfaatkan nested 'asset' dan 'user' yang sudah ditambahkan di schema.
 */
const mapRequest = (raw) => ({
  id: raw.request_code,
  asset: raw.asset?.asset_name || `Asset #${raw.asset_id}`,
  user: raw.user?.employee_name || 'Unknown User',
  department: raw.user?.department || '-',
  reason: raw.reason,
  date: formatDate(raw.created_at),
  startDate: formatDate(raw.requested_start),
  endDate: formatDate(raw.requested_end),
  urgency: raw.risk_tier_snapshot,       // 'Low' / 'Medium' / 'High'
  riskScore: raw.risk_score_snapshot,    // angka risk score
  status: formatStatus(raw.status),      // 'pending_admin' → 'Pending Admin'
  aiReason: raw.ai_decision_reason || '-',
  _id: raw.id,                           // integer id asli untuk API call
  _status: raw.status,                   // status raw untuk logic kondisional
  _assetId: raw.asset_id,
  _borrowerId: raw.user_id,
  _requestedEnd: raw.requested_end,
});

export const fetchAllRequests = async (statusFilter = null) => {
  const url = statusFilter
    ? `/api/v1/asset-requests/?status_filter=${statusFilter}`
    : '/api/v1/asset-requests/';
  const data = await apiGet(url);
  return data.map(mapRequest);
};

export const fetchMyRequests = async () => {
  // Role 'user' otomatis hanya lihat miliknya sendiri (diatur di backend)
  const data = await apiGet('/api/v1/asset-requests/');
  return data.map(mapRequest);
};

export const createRequest = async (payload) => {
  // payload: { asset_id, reason, requested_start, requested_end }
  const data = await apiPost('/api/v1/asset-requests/', payload);
  return mapRequest(data);
};

export const approveRequest = async (requestId) => {
  // requestId di sini adalah integer _id, bukan request_code
  const data = await apiPatch(`/api/v1/asset-requests/${requestId}/approve`);
  return mapRequest(data);
};

export const rejectRequest = async (requestId, rejectionReason) => {
  const data = await apiPatch(
    `/api/v1/asset-requests/${requestId}/reject?rejection_reason=${encodeURIComponent(rejectionReason)}`
  );
  return mapRequest(data);
};

export const returnRequest = async (requestId, conditionNotes = "", returnCondition = null) => {
  const params = new URLSearchParams();
  if (conditionNotes) params.set('condition_notes', conditionNotes);
  if (returnCondition) params.set('return_condition', returnCondition);
  const query = params.toString();
  const url = query
    ? `/api/v1/asset-requests/${requestId}/return?${query}`
    : `/api/v1/asset-requests/${requestId}/return`;
  const data = await apiPatch(url);
  return mapRequest(data);
};