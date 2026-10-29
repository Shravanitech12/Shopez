import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Load current session on mount via HTTP-only cookie
  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 unauthenticated is expected if guest
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (identifier, password) => {
    try {
      const res = await api.post('/auth/login', { identifier, password });
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        showToast(`Welcome back, ${res.data.user.name}!`, 'success');
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
      return { success: false, message: err.message };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        showToast('Registration successful! Welcome to SHOPEZ.', 'success');
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      showToast('Logged out successfully', 'info');
      return { success: true };
    } catch (err) {
      setUser(null);
      return { success: true };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.patch('/auth/profile', profileData);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        showToast('Profile updated successfully', 'success');
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      showToast(err.message || 'Profile update failed', 'error');
      return { success: false, message: err.message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.patch('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.success) {
        showToast('Password changed successfully', 'success');
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      showToast(err.message || 'Password update failed', 'error');
      return { success: false, message: err.message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.userType === 'admin',
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
