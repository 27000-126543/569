import { create } from 'zustand';
import type { User, Student, Coach, Message } from '../../shared/types';
import api from '../utils/api';

interface AuthState {
  user: User | null;
  student: Student | null;
  coach: Coach | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  login: (username: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
  checkAuth: () => Promise<boolean>;
}

interface MessageState {
  messages: Message[];
  unreadCount: number;
  isLoading: boolean;

  fetchMessages: (userId: string, type?: string) => Promise<void>;
  fetchUnreadCount: (userId: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  student: null,
  coach: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (username: string, password: string, role: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<any>('/auth/login', {
        username,
        password,
        role,
      });

      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.user.id);
        localStorage.setItem('userRole', response.user.role);

        set({
          user: response.user,
          student: response.student || null,
          coach: response.coach || null,
          token: response.token,
          isLoading: false,
        });
        return true;
      } else {
        set({ error: response.message || '登录失败', isLoading: false });
        return false;
      }
    } catch (error) {
      set({ error: '登录失败，请稍后重试', isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    set({ user: null, student: null, coach: null, token: null });
  },

  setUser: (user: User) => set({ user }),

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      return false;
    }

    try {
      const response = await api.get<any>('/auth/profile');
      if (response.success) {
        set({
          user: response.user,
          student: response.student || null,
          coach: response.coach || null,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  unreadCount: 0,
  isLoading: false,

  fetchMessages: async (userId: string, type = 'all') => {
    set({ isLoading: true });
    try {
      const response = await api.get<any>(
        `/messages?userId=${userId}&type=${type}`
      );
      if (response.success) {
        set({
          messages: response.messages,
          unreadCount: response.unreadCount,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async (userId: string) => {
    try {
      const response = await api.get<any>(
        `/messages/unread-count?userId=${userId}`
      );
      if (response.success) {
        set({ unreadCount: response.count });
      }
    } catch (error) {
      console.error('Fetch unread count error:', error);
    }
  },

  markAsRead: async (messageId: string) => {
    try {
      const response = await api.put<any>(`/messages/${messageId}/read`, {});
      if (response.success) {
        const messages = get().messages.map(m =>
          m.id === messageId ? { ...m, isRead: true } : m
        );
        const unreadCount = Math.max(0, get().unreadCount - 1);
        set({ messages, unreadCount });
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  },

  markAllAsRead: async (userId: string) => {
    try {
      const response = await api.put<any>('/messages/read-all', { userId });
      if (response.success) {
        const messages = get().messages.map(m => ({ ...m, isRead: true }));
        set({ messages, unreadCount: 0 });
      }
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  },
}));
