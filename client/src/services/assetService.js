import { apiGet, apiPost, apiPatch } from './apiClient';
import { formatStatus, formatCondition } from '../utils/formatters';

/**
 * Mapper: backend Asset object → format yang dipakai komponen
 */
const mapAsset = (raw) => ({
  id: raw.asset_code,
  name: raw.asset_name,
  category: raw.category.charAt(0).toUpperCase() + raw.category.slice(1),
  brand: raw.brand || '-',
  serialNumber: raw.serial_number || '-',
  purchaseValue: raw.purchase_value,
  location: raw.location || '-',
  condition: formatCondition(raw.current_condition),
  status: formatStatus(raw.status),
  notes: raw.notes || '',
  _id: raw.id,  // integer id asli, dibutuhkan saat kirim ke API
  _status: raw.status,
  _category: raw.category,
  _condition: raw.current_condition,
  _createdAt: raw.created_at,
});

export const fetchAssets = async () => {
  const data = await apiGet('/api/v1/assets/');
  return data.map(mapAsset);
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