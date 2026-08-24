import { create } from 'zustand';
import api from '../services/api';
import { getSocket } from '../services/socket';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initialize: async () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('agentflow_token');
    const storedUser = localStorage.getItem('agentflow_user');

    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      if (storedUser) {
        set({ user: JSON.parse(storedUser), token, isAuthenticated: true });
      }

      // Verify token with backend
      const res = await api.get('/auth/me');
      if (res.data) {
        localStorage.setItem('agentflow_user', JSON.stringify(res.data));
        set({ user: res.data, token, isAuthenticated: true, isLoading: false });

        // Join socket room
        const socket = getSocket();
        if (socket && res.data.id) {
          socket.emit('join_user', res.data.id);
        }
      }
    } catch (err) {
      console.warn('Session verification failed, logging out.');
      localStorage.removeItem('agentflow_token');
      localStorage.removeItem('agentflow_user');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;

      localStorage.setItem('agentflow_token', token);
      localStorage.setItem('agentflow_user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false, error: null });

      const socket = getSocket();
      if (socket && user.id) {
        socket.emit('join_user', user.id);
      }

      return { success: true };
    } catch (err) {
      set({ isLoading: false, error: err.message || 'Login failed' });
      return { success: false, error: err.message };
    }
  },

  register: async (name, email, password, role = 'operator') => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      const { token, user } = res.data;

      localStorage.setItem('agentflow_token', token);
      localStorage.setItem('agentflow_user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false, error: null });

      const socket = getSocket();
      if (socket && user.id) {
        socket.emit('join_user', user.id);
      }

      return { success: true };
    } catch (err) {
      set({ isLoading: false, error: err.message || 'Registration failed' });
      return { success: false, error: err.message };
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agentflow_token');
      localStorage.removeItem('agentflow_user');
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
