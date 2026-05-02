import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const initUser = () => {
  const token = localStorage.getItem('sl_token');
  const stored = localStorage.getItem('sl_user');
  if (token && stored) {
    try { return JSON.parse(stored); } catch { localStorage.removeItem('sl_user'); }
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(initUser);
  const [loading] = useState(false);

  const login = async (email, password) => {
    // const data = await authAPI.login(email, password);
    const data = {
      token: 'fake-jwt-token-testing-bypass',
      user: { id: '123', name: 'Demo User', email: email || 'demo@demo.com', role: 'admin' }
    };
    localStorage.setItem('sl_token', data.token);
    localStorage.setItem('sl_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await authAPI.register(name, email, password);
    localStorage.setItem('sl_token', data.token);
    localStorage.setItem('sl_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('sl_token');
    localStorage.removeItem('sl_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('sl_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
