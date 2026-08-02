import { apiGet, apiPatch } from './apiClient';

export const fetchUserNotifications = async () => {
  return await apiGet('/api/v1/notifications/');
};

export const markNotificationAsRead = async (id) => {
  return await apiPatch(`/api/v1/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async () => {
  return await apiPatch('/api/v1/notifications/read-all');
};

export default {
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
