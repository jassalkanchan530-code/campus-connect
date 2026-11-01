import api from '../api/axios';

// ── Student ───────────────────────────────────────────────────────────────────
export const registerForEvent    = (eventId, data) => api.post(`/events/${eventId}/register`, data);
export const checkMyRegistration = (eventId)       => api.get(`/events/${eventId}/my-registration`);
export const getMyRegistrations  = ()              => api.get('/registrations/my');
export const getRegistrationById = (id)            => api.get(`/registrations/${id}`);

// ── Admin ─────────────────────────────────────────────────────────────────────
export const getFormFields        = (eventId)              => api.get(`/events/${eventId}/form-fields`);
export const addFormField         = (eventId, data)        => api.post(`/events/${eventId}/form-fields`, data);
export const updateFormField      = (eventId, fieldId, data) => api.put(`/events/${eventId}/form-fields/${fieldId}`, data);
export const deleteFormField      = (eventId, fieldId)     => api.delete(`/events/${eventId}/form-fields/${fieldId}`);
export const getEventRegistrations = (eventId)             => api.get(`/events/${eventId}/registrations`);
