import { apiGet } from './apiClient';
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
});

export const fetchAssets = async () => {
  const data = await apiGet('/api/v1/assets/');
  return data.map(mapAsset);
};

export const fetchAvailableAssets = async () => {
  const data = await apiGet('/api/v1/assets/?status_filter=available');
  return data.map(mapAsset);
};