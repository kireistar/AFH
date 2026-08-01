import { apiGet, apiPost, apiPatch, apiDelete } from './apiClient';

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
  public_key: raw.public_key,
  _id: raw.id,
});

export const fetchUsers = async () => {
  const data = await apiGet('/api/v1/users/');
  return data.map(mapUser);
};

export const fetchUserById = async (userId) => {
  const data = await apiGet(`/api/v1/users/${userId}`);
  return mapUser(data);
};

export const fetchMyProfile = async () => {
  const data = await apiGet('/api/v1/users/me');
  return mapUser(data);
};

export const createUser = async (userData) => {
  const data = await apiPost('/api/v1/users/', userData);
  return mapUser(data);
};

export const updateUser = async (userId, userData) => {
  const data = await apiPatch(`/api/v1/users/${userId}`, userData);
  return mapUser(data);
};

export const deleteUser = async (userId) => {
  await apiDelete(`/api/v1/users/${userId}`);
};

export const resetUserDeviceKey = async (userId) => {
  // Tembak endpoint reset key yang kita buat di users.py
  return await apiPatch(`/api/v1/users/${userId}/reset-device-key`);
};
