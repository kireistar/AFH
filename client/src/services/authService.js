/**
 * Auth Service — API calls untuk authentication
 */

import { API_BASE_URL } from './apiClient';

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

