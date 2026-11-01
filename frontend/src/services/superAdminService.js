import api from '../api/axios';

// ── Super Admin — Admin Management ────────────────────────────────────────────
export const getAdmins        = ()              => api.get('/super-admin/admins');
export const createAdmin      = (data)          => api.post('/super-admin/admins', data);
export const deactivateAdmin  = (id)            => api.patch(`/super-admin/admins/${id}/deactivate`);
export const activateAdmin    = (id)            => api.patch(`/super-admin/admins/${id}/activate`);

// ── Super Admin — Audit Logs ──────────────────────────────────────────────────
export const getAuditLogs     = (limit = 100)   => api.get(`/super-admin/admins/audit-logs?limit=${limit}`);
