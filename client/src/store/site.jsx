import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { defaultSite, mergeSite } from '../lib/siteDefaults.js';

const BASE = String(import.meta.env.VITE_API_URL || 'https://ai-visibility-report-maker-server.vercel.app').replace(
  /\/$/,
  ''
);

const SiteCtx = createContext(defaultSite());

export function applyTheme(theme = {}) {
  const root = document.documentElement;
  const set = (name, value) => {
    if (value) root.style.setProperty(name, value);
  };
  set('--ink', theme.ink);
  set('--ink-2', theme.ink2);
  set('--paper', theme.paper);
  set('--text', theme.text);
  set('--cyan', theme.cyan);
  set('--indigo', theme.indigo);
  set('--violet', theme.violet);
  set('--coral', theme.coral);
  set('--amber', theme.amber);
  set('--mint', theme.mint);
  if (theme.indigo && theme.cyan) {
    set('--grad', `linear-gradient(120deg, ${theme.indigo} 0%, ${theme.cyan} 100%)`);
  }
}

async function loadSite() {
  const res = await fetch(`${BASE}/api/public/site`);
  if (!res.ok) throw new Error('site');
  return res.json();
}

export function SiteProvider({ children }) {
  const [site, setSite] = useState(defaultSite);

  useEffect(() => {
    let live = true;
    let stamp = '';

    async function pull() {
      try {
        const next = await loadSite();
        const merged = mergeSite(defaultSite(), next);
        const token = next.updated_at || JSON.stringify(merged);
        if (!live || token === stamp) return;
        stamp = token;
        applyTheme(merged.theme);
        setSite(merged);
      } catch {
        /* keep defaults */
      }
    }

    pull();
    const id = window.setInterval(pull, 12000);
    const onFocus = () => pull();
    window.addEventListener('focus', onFocus);
    return () => {
      live = false;
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const value = useMemo(() => site, [site]);
  return <SiteCtx.Provider value={value}>{children}</SiteCtx.Provider>;
}

export function useSite() {
  return useContext(SiteCtx);
}
