import { apiGet } from './apiClient';
import { formatStatus } from '../utils/formatters';

/**
 * Mapper: backend User object → format yang dipakai komponen
 */
const mapUser = (raw) => ({
  id: raw.employee_id,
  name: raw.employee_name,
  email: raw.email,
  department: raw.department,
  role: raw.role,
  status: raw.employment_status,
  riskScore: raw.risk_score,
  riskTier: raw.risk_score_tier,
  _id: raw.id,  // UUID asli, dibutuhkan saat kirim ke API
});

export const fetchUsers = async () => {
  const data = await apiGet('/api/v1/users/');
  return data.map(mapUser);
};

export const fetchMyProfile = async () => {
  const data = await apiGet('/api/v1/users/me');
  return mapUser(data);
};