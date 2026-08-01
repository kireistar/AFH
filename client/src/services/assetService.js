import { apiGet, apiPost, apiPatch, apiDelete, apiUpload } from './apiClient';
import { formatStatus, formatCondition } from '../utils/formatters';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/uploads/')) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
};

/**
 * Mapper: backend Asset object → format yang dipakai komponen
 */
const mapAsset = (raw) => ({
  id: raw.asset_code,
  name: raw.asset_name,
  category: raw.category ? (raw.category.charAt(0).toUpperCase() + raw.category.slice(1)) : '-',
  brand: raw.brand || '-',
  serialNumber: raw.serial_number || '-',
  purchaseValue: raw.purchase_value,
  purchaseValueFormatted: raw.purchase_value ? `IDR ${Number(raw.purchase_value).toLocaleString('id-ID', { minimumFractionDigits: 2 })}` : 'IDR 0.00',
  location: raw.location || '-',
  condition: formatCondition(raw.current_condition),
  status: formatStatus(raw.status),
  notes: raw.notes || '',
  imageUrl: resolveImageUrl(raw.image_url),
  _imageUrlRaw: raw.image_url || null,
  hasBorrowHistory: Boolean(raw.has_borrow_history),
  borrowedBy: raw.borrowed_by ? {
    id: raw.borrowed_by.employee_id,
    name: raw.borrowed_by.employee_name,
    email: raw.borrowed_by.email,
    department: raw.borrowed_by.department,
    role: raw.borrowed_by.role,
    riskScore: raw.borrowed_by.risk_score,
    riskTier: raw.borrowed_by.risk_score_tier,
    status: raw.borrowed_by.employment_status,
    _id: raw.borrowed_by.id,
  } : null,
  _id: raw.id,  // integer id asli, dibutuhkan saat kirim ke API
  _status: raw.status,
  _category: raw.category,
  _condition: raw.current_condition,
});

export const fetchAssets = async () => {
  const data = await apiGet('/api/v1/assets/');
  return data.map(mapAsset);
};

export const fetchAssetById = async (assetId) => {
  const data = await apiGet(`/api/v1/assets/${assetId}`);
  return mapAsset(data);
};

export const fetchAvailableAssets = async () => {
  const data = await apiGet('/api/v1/assets/?status_filter=available');
  return data.map(mapAsset);
};

export const createAsset = async (assetData) => {
  const data = await apiPost('/api/v1/assets/', assetData);
  return mapAsset(data);
};

export const updateAsset = async (assetId, assetData) => {
  const data = await apiPatch(`/api/v1/assets/${assetId}`, assetData);
  return mapAsset(data);
};

export const deleteAsset = async (assetId) => {
  await apiDelete(`/api/v1/assets/${assetId}`);
};

export const uploadAssetImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return await apiUpload('/api/v1/assets/upload-image', formData);
};