import { create } from 'zustand';
import api from '../api/index.js';
import { ApiError, getSession, getStoredUser, persistAuth, remembered, refreshSession } from '../api/client.js';

export const useAuth = create((set, get) => ({
  user: getStoredUser(),
  session: getSession(),
  loading: true,

  async restore() {
    const session = getSession();
    const cached = getStoredUser();
    if (!session?.access_token && !session?.refresh_token) {
      persistAuth(null);
      set({ loading: false, user: null, session: null });
      return;
    }
    if (cached) set({ user: cached, session, loading: true });
    try {
      const data = await api.me();
      const nextSession = getSession() || session;
      persistAuth(nextSession, data.user, remembered());
      set({ user: data.user, session: nextSession, loading: false });
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0;
      if (status === 401 || status === 403) {
        const recovered = await refreshSession();
        if (recovered?.user) {
          persistAuth(recovered.session, recovered.user, remembered());
          set({ user: recovered.user, session: recovered.session, loading: false });
          return;
        }
        persistAuth(null);
        set({ user: null, session: null, loading: false });
        return;
      }
      set({ user: cached || get().user, session, loading: false });
    }
  },

  async login(payload, remember = true) {
    const data = await api.login(payload);
    persistAuth(data.session, data.user, remember !== false);
    set({ user: data.user, session: data.session, loading: false });
    return data.user;
  },

  async signup(payload) {
    const data = await api.signup(payload);
    persistAuth(data.session, data.user, true);
    set({ user: data.user, session: data.session, loading: false });
    return data.user;
  },

  async logout() {
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
    persistAuth(null);
    set({ user: null, session: null, loading: false });
  },

  setUser(user) {
    const session = getSession();
    persistAuth(session, user, remembered());
    set({ user });
  },
}));
