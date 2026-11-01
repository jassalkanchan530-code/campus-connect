import api from '../api/axios';

// ── Student / All authenticated ───────────────────────────────────────────────
export const getNotifications     = ()        => api.get('/notifications');
export const getNotificationById  = (id)      => api.get(`/notifications/${id}`);

// ── Admin / Super Admin ───────────────────────────────────────────────────────
export const getAllNotificationsAdmin = ()         => api.get('/notifications/manage');
export const createNotification       = (data)     => api.post('/notifications', data);
export const updateNotification       = (id, data) => api.put(`/notifications/${id}`, data);
export const deleteNotification       = (id)       => api.delete(`/notifications/${id}`);
