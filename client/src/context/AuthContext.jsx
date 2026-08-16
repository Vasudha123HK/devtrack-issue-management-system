import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('devtrack_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('devtrack_token') || null;
  });

  const [loading, setLoading] = useState(true);

  // Initialize auth state and verify session with backend
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('devtrack_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('devtrack_user', JSON.stringify(res.user));
          }
        } catch (error) {
          console.error('Session validation error:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen for unauthorized events from axios interceptor
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('devtrack_token', data.token);
      localStorage.setItem('devtrack_user', JSON.stringify(data.user));
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('devtrack_token', data.token);
      localStorage.setItem('devtrack_user', JSON.stringify(data.user));
    }
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('devtrack_token');
    localStorage.removeItem('devtrack_user');
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('devtrack_user', JSON.stringify(res.user));
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'Admin',
    isDeveloper: user?.role === 'Developer',
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
