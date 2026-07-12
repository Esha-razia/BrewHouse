import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

const STORAGE_KEY = 'brewhouse_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on first load
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const persist = (userData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/users/login', { email, password });
    persist(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/users/register', { name, email, password });
    persist(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const { data } = await api.put('/users/profile', updates);
    persist(data);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateProfile, isAdmin: user?.role === 'admin' }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
