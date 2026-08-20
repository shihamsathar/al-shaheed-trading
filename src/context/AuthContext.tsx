/**
 * Al Shaheed Trading and Equipment Co.
 * Global Auth Context & State Provider
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Notification } from '../types';
import { api } from '../services/api';
import { INITIAL_USERS } from '../constants/tradeData';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  loading: boolean;
  notifications: Notification[];
  unreadCount: number;
  login: (email: string, password?: string, role?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchDemoUser: (userId: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ast_auth_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initial load
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('ast_auth_token');
      if (storedToken) {
        try {
          const u = await api.getMe();
          setUser(u);
          await loadNotifications();
        } catch (err) {
          console.warn('Session expired or invalid:', err);
          localStorage.removeItem('ast_auth_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const loadNotifications = async () => {
    try {
      const list = await api.getNotifications();
      setNotifications(list);
    } catch (e) {
      // ignore silently on startup
    }
  };

  const login = async (email: string, password?: string, role?: string) => {
    setLoading(true);
    try {
      const res = await api.login({ email, password, role });
      localStorage.setItem('ast_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
      await loadNotifications();
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.register(data);
      localStorage.setItem('ast_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
      await loadNotifications();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('ast_auth_token');
    setToken(null);
    setUser(null);
    setNotifications([]);
  };

  const switchDemoUser = async (userId: string) => {
    setLoading(true);
    try {
      const res = await api.switchDemo(userId);
      localStorage.setItem('ast_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
      await loadNotifications();
    } catch (err) {
      console.error('Failed to switch demo user:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    try {
      const u = await api.getMe();
      setUser(u);
    } catch (e) {
      console.error(e);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        loading,
        notifications,
        unreadCount,
        login,
        register,
        logout,
        switchDemoUser,
        refreshUserData,
        refreshNotifications: loadNotifications,
        markNotificationAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
