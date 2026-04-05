import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

// Lazy-initialize user from localStorage to avoid setState in useEffect
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
    const data = await authAPI.login(email, password);
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

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
