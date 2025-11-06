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

import axiosClient, { setAccessToken, clearTokens } from '../lib/axiosClient';

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  age: number | null;
  gender: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
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

  // Store access token after successful registration (refresh token in httpOnly cookie)
  setAccessToken(response.data.token);

  return response.data;
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (data: LoginData & { rememberMe?: boolean }): Promise<AuthResponse> => {
  const response = await axiosClient.post<AuthResponse>('/auth/login', data);

  // Store access token after successful login (refresh token in httpOnly cookie)
  setAccessToken(response.data.token);

  return response.data;
};

/**
 * Logout user
 * POST /api/auth/logout
 * Clears tokens from storage and server
 */
export const logout = async (): Promise<void> => {
  try {
    await axiosClient.post('/auth/logout');
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    clearTokens();
  }
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
 * Get current user profile
 * GET /api/users/me
 */
export const getUserProfile = async (): Promise<User> => {
  const response = await axiosClient.get<User>('/users/me');
  return response.data;
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

/**
 * Google OAuth authentication
 * POST /api/auth/google
 */
export const googleAuth = async (credential: string, rememberMe?: boolean): Promise<AuthResponse> => {
  const response = await axiosClient.post<AuthResponse>('/auth/google', {
    credential,
    rememberMe,
  });

  // Store access token after successful Google auth (refresh token in httpOnly cookie)
  setAccessToken(response.data.token);

  return response.data;
};

export default {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  googleAuth,
};
