import { createContext, useContext, useEffect, useState } from 'react';
import { ApiError, api, clearAuth, getSession, getUser, setAuth } from './api.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;

    async function hydrate() {
      const session = getSession();
      if (!session?.access_token && !session?.refresh_token) {
        if (live) setReady(true);
        return;
      }
      try {
        const data = await api.me();
        if (!live) return;
        if (data.user?.role !== 'admin') {
          clearAuth();
          setUser(null);
        } else {
          setAuth(getSession(), data.user);
          setUser(data.user);
        }
      } catch (err) {
        if (!live) return;
        const status = err instanceof ApiError ? err.status : 0;
        if (status === 401 || status === 403) {
          clearAuth();
          setUser(null);
        }
      } finally {
        if (live) setReady(true);
      }
    }

    hydrate();
    const id = window.setInterval(hydrate, 20 * 60 * 1000);
    return () => {
      live = false;
      window.clearInterval(id);
    };
  }, []);

  async function login(email, password) {
    const data = await api.login(email, password);
    if (data.user?.role !== 'admin') {
      throw new Error('This account is not an admin.');
    }
    setAuth(data.session, data.user);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
    clearAuth();
    setUser(null);
  }

  return <AuthCtx.Provider value={{ user, ready, login, logout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
