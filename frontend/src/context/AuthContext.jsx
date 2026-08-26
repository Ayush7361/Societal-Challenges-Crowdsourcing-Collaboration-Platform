import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('samadhan_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Session expired or invalid token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem('samadhan_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await API.post('/auth/register', formData);
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem('samadhan_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('samadhan_token');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
