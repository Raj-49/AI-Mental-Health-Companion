/**
 * Axios Client Configuration
 * 
 * Configures axios with:
 * - Base URL from environment variables
 * - Request interceptor to attach access token
 * - Response interceptor to handle token refresh on 401 errors
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { jwtDecode } from 'jwt-decode';

// Auto-detect environment and set API base URL
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const API_BASE_URL = isProduction
  ? import.meta.env.VITE_API_BASE_URL_PRODUCTION || 'https://ai-mental-health-companion.vercel.app/api'
  : import.meta.env.VITE_API_BASE_URL_LOCAL || 'http://localhost:3001/api';

console.log('Environment:', isProduction ? 'Production' : 'Development');
console.log('API Base URL:', API_BASE_URL);

// Create axios instance
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies (for refresh token if using httpOnly cookies)
});

// Token management in memory
let accessToken: string | null = null;
let refreshToken: string | null = null;

// Initialize tokens from localStorage on app load
export const initializeTokens = () => {
  accessToken = localStorage.getItem('accessToken');
  refreshToken = localStorage.getItem('refreshToken');
};

// Set tokens (called after login/register)
export const setTokens = (access: string, refresh?: string) => {
  accessToken = access;
  localStorage.setItem('accessToken', access);
  
  if (refresh) {
    refreshToken = refresh;
    localStorage.setItem('refreshToken', refresh);
  }
};

// Get access token
export const getAccessToken = () => accessToken;

// Get refresh token
export const getRefreshToken = () => refreshToken;

// Clear tokens (called on logout)
export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// Check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: { exp: number } = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

// Refresh access token
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refresh = getRefreshToken();
    if (!refresh) {
      throw new Error('No refresh token available');
    }

    // Call refresh token endpoint
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken: refresh,
    });

    const newAccessToken = response.data.accessToken;
    setTokens(newAccessToken, response.data.refreshToken || refresh);
    
    return newAccessToken;
  } catch (error) {
    clearTokens();
    // Redirect to login or trigger logout
    window.location.href = '/login';
    return null;
  }
};

// Request interceptor - attach access token to all requests
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = getAccessToken();

    // Check if token exists and is expired
    if (token && isTokenExpired(token)) {
      // Try to refresh token
      token = await refreshAccessToken();
    }

    // Attach token to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors and retry with new token
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 error and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

// Initialize tokens when module loads
initializeTokens();

export default axiosClient;
