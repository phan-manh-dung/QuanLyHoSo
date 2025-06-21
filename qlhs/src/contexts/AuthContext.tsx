'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUserFromToken, isTokenValid, isAdmin } from '../utils/jwtUtils';

interface User {
  userId: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdminUser: boolean;
  isAuthLoading: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateToken: (accessToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Khởi tạo auth state từ localStorage khi component mount
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && isTokenValid(accessToken)) {
      const userInfo = getUserFromToken(accessToken);
      if (userInfo) {
        setUser(userInfo);
        setIsAuthenticated(true);
        setIsAdminUser(isAdmin(accessToken));
      } else {
        // Token invalid, clear localStorage
        logout();
      }
    } else {
      // Không có token hoặc token hết hạn
      logout();
    }
    setIsAuthLoading(false);
  }, []);

  const login = (accessToken: string, refreshToken: string) => {
    // Lưu tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    // Decode và lưu user info
    const userInfo = getUserFromToken(accessToken);
    if (userInfo) {
      setUser(userInfo);
      setIsAuthenticated(true);
      setIsAdminUser(isAdmin(accessToken));
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');

    // Clear state
    setUser(null);
    setIsAuthenticated(false);
    setIsAdminUser(false);
  };

  const updateToken = (accessToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    
    // Update user info từ token mới
    const userInfo = getUserFromToken(accessToken);
    if (userInfo) {
      setUser(userInfo);
      setIsAdminUser(isAdmin(accessToken));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isAdminUser,
    isAuthLoading,
    login,
    logout,
    updateToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 