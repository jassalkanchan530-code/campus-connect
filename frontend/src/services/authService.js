import api from '../api/axios';

/**
 * POST /api/auth/register
 * Returns { success, token, user }
 */
export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

/**
 * POST /api/auth/login
 * Returns { success, token, user }
 */
export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};
