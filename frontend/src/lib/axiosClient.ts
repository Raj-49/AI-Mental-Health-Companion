/**
 * Axios Client Configuration
 * 
 * Configures axios with:
 * - Base URL from environment variables (auto-detects local vs production)
 * - Request interceptor to attach access token
 * - Response interceptor to handle token refresh on 401 errors
 * - Automatic token refresh using httpOnly cookies
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { jwtDecode } from 'jwt-decode';

// Auto-detect environment and use appropriate API URL
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocalhost
  ? (import.meta.env.VITE_API_BASE_URL_LOCAL || 'http://localhost:3001/api')
  : (import.meta.env.VITE_API_BASE_URL_PRODUCTION || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api');

console.log('API Base URL:', API_BASE_URL, '(isLocalhost:', isLocalhost, ')');

// Create axios instance
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies (for httpOnly refresh token)
});

// Token management in memory (only access token now)
let accessToken: string | null = null;

// Initialize token from localStorage on app load
export const initializeTokens = () => {
  accessToken = localStorage.getItem('accessToken');
};

// Set access token (called after login/register)
export const setAccessToken = (token: string) => {
  accessToken = token;
  localStorage.setItem('accessToken', token);
};

// Get access token
export const getAccessToken = () => accessToken;

// Clear tokens (called on logout)
export const clearTokens = () => {
  accessToken = null;
  localStorage.removeItem('accessToken');
};

// Check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: { exp: number } = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    // Consider token expired if less than 1 minute remaining
    return decoded.exp < currentTime + 60;
  } catch {
    return true;
  }
};

// Refresh access token using httpOnly cookie
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    // Call refresh endpoint (refresh token sent automatically via httpOnly cookie)
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    );

    const newAccessToken = response.data.token;
    setAccessToken(newAccessToken);
    
    return newAccessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearTokens();
    // Redirect to login
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return null;
  }
};

// Request interceptor - attach access token to all requests
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = getAccessToken();

    // Check if token exists and is expired
    if (token && isTokenExpired(token)) {
      console.log('Access token expired, refreshing...');
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
