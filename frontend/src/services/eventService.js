import api from '../api/axios';

// ── Public / Student ──────────────────────────────────────────────────────────
export const getEvents       = ()        => api.get('/events');
export const getEventById    = (id)      => api.get(`/events/${id}`);

// ── Admin ─────────────────────────────────────────────────────────────────────
export const getAllEventsAdmin = ()       => api.get('/events/manage');
export const createEvent      = (data)   => api.post('/events', data);
export const updateEvent      = (id, data) => api.put(`/events/${id}`, data);
export const deleteEvent      = (id)     => api.delete(`/events/${id}`);
