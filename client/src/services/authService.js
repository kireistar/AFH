/**
 * Auth Service — API calls untuk authentication
 * Base URL: http://localhost:8000 (atau dari .env)
 */

import { apiGet } from './apiClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Login dengan email + password
 * @param {string} email - Email karyawan
 * @param {string} password - Password
 * @returns {Promise<{accessToken, tokenType, user}>}
 * @throws {Error} Jika login gagal (401, validation error, network error, dll)
 */
export const loginUser = async (email, password) => {
  try {
    // OAuth2 form data (requirement dari FastAPI OAuth2PasswordRequestForm)
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2 convention: 'username' untuk email
    formData.append('password', password);
    formData.append('grant_type', 'password');

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: formData,
    });

    // Handle error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.detail || `Login failed (${response.status})`;
      throw new Error(message);
    }

    // Parse response
    const data = await response.json();

    // Return dalam format yang expect oleh useAuth.login()
    return {
      accessToken: data.access_token,
      tokenType: data.token_type,
      user: data.user,
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Get current user profile (requires valid JWT token)
 * @param {string} accessToken - JWT token dari login (optional, akan diambil dari localStorage)
 * @returns {Promise<{user object}>}
 * @throws {Error} Jika token invalid/expired atau network error
 */
export const getCurrentUser = async () => {
  try {
    // Gunakan apiGet yang auto-add Authorization header
    const user = await apiGet('/api/v1/auth/me');
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

/**
 * Validate/refresh user session
 * Panggil saat app startup untuk validate token yang di-store
 * @param {string} accessToken - JWT token
 * @returns {Promise<{user object}|null>}
 */
export const validateSession = async (accessToken) => {
  if (!accessToken) return null;

  try {
    const user = await getCurrentUser(accessToken);
    return user;
  } catch (error) {
    console.error('Session validation failed:', error);
    return null;
  }
};

/**
 * Logout (client-side only, since JWT adalah stateless)
 * Di backend tidak ada logout endpoint, cukup hapus token di client
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  // Di sini bisa hit endpoint logout jika di-add ke backend nanti
  // Untuk sekarang, logout hanya client-side (removeItem dari localStorage)
  // dilakukan di useAuth.logout()
  console.log('User logged out');
};

export default {
  loginUser,
  getCurrentUser,
  validateSession,
  logoutUser,
};
