import { create } from 'zustand';
import { api } from '../lib/axios';

interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // initial load state
  login: async (credential: string) => {
    try {
      const { data } = await api.post('/auth/google', { credential });
      set({ user: data.user, isAuthenticated: true });
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed', error);
    }
  },
  fetchSession: async () => {
    try {
      set({ isLoading: true });
      const { data } = await api.get('/users/me');
      set({ user: data, isAuthenticated: true });
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
