/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

import { apiGet } from '../services/apiClient';

const AuthContext = createContext(null);

// ── Helper: Cek apakah token sudah expired ────────────────────────────────────
const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    // Decode payload (base64)
    const payload = JSON.parse(atob(parts[1]));

    // exp adalah seconds since epoch
    const expiryTime = payload.exp * 1000; // convert to milliseconds
    return Date.now() >= expiryTime;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
};

// ── Initialize state dari localStorage ────────────────────────────────────────
const initializeAuthState = () => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const userJson = localStorage.getItem('user');

    // Jika token sudah expired, clear localStorage
    if (accessToken && isTokenExpired(accessToken)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      return { accessToken: null, user: null, isAuth: false };
    }

    const user = userJson ? JSON.parse(userJson) : null;

    return {
      accessToken: accessToken || null,
      user: user || null,
      isAuth: !!accessToken && !!user,
    };
  } catch (error) {
    console.error('Error initializing auth state:', error);
    return { accessToken: null, user: null, isAuth: false };
  }
};

export const AuthProvider = ({ children }) => {
  const initialState = initializeAuthState();
  const [accessToken, setAccessToken] = useState(initialState.accessToken);
  const [user, setUser] = useState(initialState.user);
  const [isAuth, setIsAuth] = useState(initialState.isAuth);

  // ── Login: store token + user dari backend response ────────────────────────
  const login = useCallback((accessToken, userProfile) => {
    try {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userProfile));

      setAccessToken(accessToken);
      setUser(userProfile);
      setIsAuth(true);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }, []);

  // ── Logout: clear token + user ────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    setAccessToken(null);
    setUser(null);
    setIsAuth(false);
    window.location.href = "/login";
  }, []);

  // ── refreshUser: refetch user profile from backend ────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;
      const updatedUser = await apiGet('/api/v1/users/me');
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsAuth(true);
      return updatedUser;
    } catch (error) {
      console.error('Error refreshing user:', error);
      return null;
    }
  }, []);

  // ── Check token expiry on mount & periodically ────────────────────────────
  useEffect(() => {
    const checkTokenExpiry = () => {
      if (accessToken && isTokenExpired(accessToken)) {
        console.warn('Token expired, logging out...');
        logout();
      }
    };

    // Check saat mount
    checkTokenExpiry();

    // Check setiap 1 menit
    const interval = setInterval(checkTokenExpiry, 60000);
    return () => clearInterval(interval);
  }, [accessToken, logout]);

  const value = {
    // State
    isAuth,
    accessToken,
    user,
    userRole: user?.role || '',
    userId: user?.id || '',
    userName: user?.employee_name || '',
    userEmail: user?.email || '',

    // Actions
    login,
    logout,
    refreshUser,

    // Helpers
    isTokenExpired: (token = accessToken) => isTokenExpired(token),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus di dalam AuthProvider');
  return context;
};
