import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../services/authService';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  user: any | null;
  setUser: (user: any | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem('token');
    return !!token;
  });
  
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token') || null;
  });

  // Update authentication state when token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [token]);

  // Update user in localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    user,
    setUser,
    token,
    setToken,
    isLoading: false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
