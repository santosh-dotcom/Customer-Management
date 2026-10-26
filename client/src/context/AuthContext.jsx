import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('cms_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('cms_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      if (token && user) {
        try {
          if (user.role === 'customer') {
            const res = await api.get('/customer/profile');
            setUser(res.data.data);
            localStorage.setItem('cms_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          // If session expired or invalid, logout
          logout();
        }
      }
      setLoading(false);
    };

    verifySession();
  }, [token]);

  const saveAuthData = (tokenValue, userData) => {
    setToken(tokenValue);
    setUser(userData);
    localStorage.setItem('cms_token', tokenValue);
    localStorage.setItem('cms_user', JSON.stringify(userData));
  };

  const registerCustomer = async (formData) => {
    const res = await api.post('/auth/register', formData);
    saveAuthData(res.data.token, res.data.user);
    return res.data;
  };

  const loginCustomer = async (email, password) => {
    const res = await api.post('/auth/customer/login', { email, password });
    saveAuthData(res.data.token, res.data.user);
    return res.data;
  };

  const loginAdmin = async (email, password) => {
    const res = await api.post('/auth/admin/login', { email, password });
    saveAuthData(res.data.token, res.data.user);
    return res.data;
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem('cms_user', JSON.stringify(merged));
      return merged;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cms_token');
    localStorage.removeItem('cms_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        registerCustomer,
        loginCustomer,
        loginAdmin,
        updateUser,
        logout,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        isCustomer: user?.role === 'customer',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
