import { apiGet, apiPost } from './apiClient';
import { formatStatus, formatDate } from '../utils/formatters';

const mapIncident = (raw) => ({
  id: raw.incident_code,
  reporter: raw.reporter?.employee_name || 'Unknown User',
  asset: raw.asset?.asset_name || 'Unknown Asset',
  severity: formatStatus(raw.severity),
  status: formatStatus(raw.status),
  description: raw.description,
  date: formatDate(raw.reported_at),
  _id: raw.id,
  _status: raw.status,
  _severity: raw.severity,
});

export const fetchAllIncidents = async () => {
    const data = await apiGet('/api/v1/incidents/');
    return data.map(mapIncident);
};

export const createIncident = async (payload) => {
  const data = await apiPost('/api/v1/incidents/', payload);
  return mapIncident(data);
};