/**
 * API Client — Fetch wrapper dengan auto Authorization header
 * Automatically adds JWT token ke semua requests
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Fetch wrapper yang auto-add Authorization header + handle errors
 * @param {string} endpoint - API endpoint (e.g., '/api/assets')
 * @param {object} options - Fetch options (method, body, headers, dll)
 * @returns {Promise<any>} Response JSON
 * @throws {Error} Jika response tidak ok atau network error
 */
export const apiCall = async (endpoint, options = {}) => {
  // Get token dari localStorage
  const token = localStorage.getItem('accessToken');

  // Default headers
  const headers = {
    'Accept': 'application/json',
    ...options.headers,
  };

  // Add Authorization header jika ada token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge dengan options
  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle 401/403 — token might be expired or invalid
    if (response.status === 401 || response.status === 403) {
      // Clear auth state — component yang pake hook akan auto-redirect ke login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-expired'));
      throw new Error('Session expired. Please login again.');
    }

    // Handle other error status codes
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.detail || `API Error: ${response.status}`;
      throw new Error(message);
    }

    // Parse dan return response safely (handle 204 No Content or empty bodies)
    if (response.status === 204) {
      return null;
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error(`API call failed [${endpoint}]:`, error);
    throw error;
  }
};

/**
 * GET request
 */
export const apiGet = (endpoint, options = {}) => {
  return apiCall(endpoint, {
    method: 'GET',
    ...options,
  });
};

/**
 * POST request
 */
export const apiPost = (endpoint, body, options = {}) => {
  return apiCall(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(body),
    ...options,
  });
};

/**
 * PUT request
 */
export const apiPut = (endpoint, body, options = {}) => {
  return apiCall(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(body),
    ...options,
  });
};

/**
 * PATCH request
 */
export const apiPatch = (endpoint, body, options = {}) => {
  return apiCall(endpoint, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(body),
    ...options,
  });
};

/**
 * DELETE request
 */
export const apiDelete = (endpoint, options = {}) => {
  return apiCall(endpoint, {
    method: 'DELETE',
    ...options,
  });
};

export default {
  apiCall,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
};
