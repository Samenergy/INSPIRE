/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { SME, AuthResponse, SMESignupBasicData, SMESignupCompleteData, SMEUpdateData } from '../services/authService';

interface AuthContextType {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: SME | null;
  error: string | null;

  // Methods
  signupBasic: (signupData: SMESignupBasicData) => Promise<AuthResponse>;
  signupComplete: (signupData: SMESignupCompleteData) => Promise<AuthResponse>;
  updateProfile: (updateData: SMEUpdateData) => Promise<AuthResponse>;
  login: (loginData: any) => Promise<AuthResponse>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<SME | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Verify token and get user data
          const response = await authService.getCurrentSME();
          if (response.success && response.data) {
            setUser(response.data.sme);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear it
            authService.logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signupBasic = async (signupData: SMESignupBasicData): Promise<AuthResponse> => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authService.completeBasicSignup(signupData);
      
      if (response.success && response.data) {
        setUser(response.data.sme);
        setIsAuthenticated(true);
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Signup failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signupComplete = async (signupData: SMESignupCompleteData): Promise<AuthResponse> => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authService.completeFullSignup(signupData);
      
      if (response.success && response.data) {
        setUser(response.data.sme);
        setIsAuthenticated(true);
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Signup failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updateData: SMEUpdateData): Promise<AuthResponse> => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authService.updateProfile(updateData);
      
      if (response.success && response.data) {
        setUser(response.data.sme);
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Profile update failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (loginData: any): Promise<AuthResponse> => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authService.completeLogin(loginData);
      
      if (response.success && response.data) {
        setUser(response.data.sme);
        setIsAuthenticated(true);
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const refreshUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const response = await authService.getCurrentSME();
        if (response.success && response.data) {
          setUser(response.data.sme);
        }
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    error,
    signupBasic,
    signupComplete,
    updateProfile,
    login,
    logout,
    clearError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;