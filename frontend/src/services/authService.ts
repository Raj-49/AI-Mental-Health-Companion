/**
 * Authentication Service
 * 
 * Contains all API calls related to authentication:
 * - Register
 * - Login
 * - Forgot Password
 * - Reset Password
 * - Refresh Token
 * - Get User Profile
 */

import axiosClient, { setTokens, clearTokens } from '../lib/axiosClient';

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  age: number | null;
  gender: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  googleId?: string | null;
}

export interface RegisterData {
  fullName?: string;
  email: string;
  password: string;
  age?: number;
  gender?: string;
  profileImage?: File;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
  refreshToken?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  password: string;
  token: string;
}

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const formData = new FormData();
  
  formData.append('email', data.email);
  formData.append('password', data.password);
  
  if (data.fullName) formData.append('fullName', data.fullName);
  if (data.age) formData.append('age', data.age.toString());
  if (data.gender) formData.append('gender', data.gender);
  if (data.profileImage) formData.append('profileImage', data.profileImage);

  const response = await axiosClient.post<AuthResponse>('/auth/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // Store tokens after successful registration
  setTokens(response.data.token, response.data.refreshToken);

  return response.data;
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await axiosClient.post<AuthResponse>('/auth/login', data);

  // Store tokens after successful login
  setTokens(response.data.token, response.data.refreshToken);

  return response.data;
};

/**
 * Google OAuth Login
 * POST /api/auth/google
 */
export const googleLogin = async (credential: string): Promise<AuthResponse> => {
  const response = await axiosClient.post<AuthResponse>('/auth/google', {
    credential,
    rememberMe: true,
  });

  // Store tokens after successful Google login
  setTokens(response.data.token, response.data.refreshToken);

  return response.data;
};

/**
 * Logout user
 * Clears tokens from storage
 */
export const logout = (): void => {
  clearTokens();
};

/**
 * Forgot password - request password reset email
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (data: ForgotPasswordData): Promise<{ message: string }> => {
  const response = await axiosClient.post<{ message: string }>('/auth/forgot-password', data);
  return response.data;
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (data: ResetPasswordData): Promise<{ message: string }> => {
  const response = await axiosClient.post<{ message: string }>(
    `/auth/reset-password?token=${data.token}`,
    { password: data.password }
  );
  return response.data;
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }> => {
  const response = await axiosClient.post<{ accessToken: string; refreshToken?: string }>(
    '/auth/refresh',
    { refreshToken }
  );
  return response.data;
};

/**
 * Get current user profile
 * GET /api/users/me
 */
export const getUserProfile = async (): Promise<User> => {
  const response = await axiosClient.get<{ message: string; user: User }>('/users/me');
  return response.data.user;
};

/**
 * Update user profile
 * PUT /api/auth/update-profile
 */
export const updateUserProfile = async (data: Partial<RegisterData>): Promise<{ message: string; user: User }> => {
  const formData = new FormData();
  
  if (data.fullName) formData.append('fullName', data.fullName);
  if (data.age) formData.append('age', data.age.toString());
  if (data.gender) formData.append('gender', data.gender);
  if (data.profileImage) formData.append('profileImage', data.profileImage);

  const response = await axiosClient.put<{ message: string; user: User }>(
    '/auth/update-profile',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

export default {
  register,
  login,
  googleLogin,
  logout,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  getUserProfile,
  updateUserProfile,
};
