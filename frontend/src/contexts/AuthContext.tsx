/**
 * Auth Context
 * 
 * Provides authentication state and functions globally across the app
 * - Current user
 * - Login/Logout/Register functions
 * - Loading states
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, login as loginService, register as registerService, logout as logoutService, getUserProfile, RegisterData, LoginData } from '@/services/authService';
import { getAccessToken, clearTokens } from '@/lib/axiosClient';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Wrapper around setUser to add logging
  const setUser = (newUser: User | null) => {
    console.log('AuthContext: setUser called with:', {
      id: newUser?.id,
      email: newUser?.email,
      fullName: newUser?.fullName,
      profileImageUrl: newUser?.profileImageUrl,
    });
    setUserState(newUser);
  };

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      
      if (token) {
        try {
          const userProfile = await getUserProfile();
          console.log('AuthContext: Initial user profile loaded:', {
            id: userProfile.id,
            email: userProfile.email,
            profileImageUrl: userProfile.profileImageUrl,
          });
          setUser(userProfile);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          clearTokens();
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const response = await loginService(data);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await registerService(data);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userProfile = await getUserProfile();
      setUser(userProfile);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
