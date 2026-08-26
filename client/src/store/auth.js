import { create } from 'zustand';
import api from '../api/index.js';

function persistSession(session, remember) {
  const raw = JSON.stringify(session);
  localStorage.removeItem('mf_session');
  sessionStorage.removeItem('mf_session');
  if (!session) return;
  (remember ? localStorage : sessionStorage).setItem('mf_session', raw);
}

export const useAuth = create((set, get) => ({
  user: null,
  session: null,
  loading: true,

  async restore() {
    const raw = localStorage.getItem('mf_session') || sessionStorage.getItem('mf_session');
    if (!raw) {
      set({ loading: false, user: null, session: null });
      return;
    }
    try {
      const session = JSON.parse(raw);
      persistSession(session, Boolean(localStorage.getItem('mf_session')));
      const data = await api.me();
      set({ user: data.user, session, loading: false });
    } catch {
      persistSession(null);
      set({ user: null, session: null, loading: false });
    }
  },

  async login(payload, remember = true) {
    const data = await api.login(payload);
    persistSession(data.session, remember);
    set({ user: data.user, session: data.session });
    return data.user;
  },

  async signup(payload) {
    const data = await api.signup(payload);
    persistSession(data.session, true);
    set({ user: data.user, session: data.session });
    return data.user;
  },

  async logout() {
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
    persistSession(null);
    set({ user: null, session: null });
  },

  setUser(user) {
    set({ user });
  },
}));
