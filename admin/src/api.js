const BASE = import.meta.env.VITE_API_URL || '';
const SESSION_KEY = 'mf_admin_session';
const USER_KEY = 'mf_admin_user';

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function setAuth(session, user) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export function clearAuth() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(USER_KEY);
}

async function refreshSession() {
  const session = getSession();
  if (!session?.refresh_token) return null;
  const res = await fetch(`${BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.session) {
    clearAuth();
    return null;
  }
  setAuth(data.session, data.user);
  return data;
}

export async function request(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (!opts.body || typeof opts.body === 'string' || opts.json !== false) {
    headers['Content-Type'] = 'application/json';
  }
  const session = getSession();
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  const res = await fetch(`${BASE}${path}`, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? (typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body)) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !opts._retry) {
    const refreshed = await refreshSession();
    if (refreshed) return request(path, { ...opts, _retry: true });
  }
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/api/auth/me'),
  logout: () => request('/api/auth/logout', { method: 'POST', body: {} }).catch(() => ({})),
  stats: () => request('/api/admin/stats'),
  reports: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) q.set(k, v);
    });
    const qs = q.toString();
    return request(`/api/admin/reports${qs ? `?${qs}` : ''}`);
  },
  report: (id) => request(`/api/admin/reports/${id}`),
  deleteReport: (id) => request(`/api/admin/reports/${id}`, { method: 'DELETE' }),
  rerun: (id) => request(`/api/admin/reports/${id}/rerun`, { method: 'POST', body: {} }),
  leads: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) q.set(k, v);
    });
    const qs = q.toString();
    return request(`/api/admin/leads${qs ? `?${qs}` : ''}`);
  },
  settings: () => request('/api/admin/settings'),
  saveSettings: (body) => request('/api/admin/settings', { method: 'PATCH', body }),
  downloadPdf: async (id, filename = 'MakeFlow-AI-Visibility-Report.pdf') => {
    const session = getSession();
    const headers = {};
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
    const res = await fetch(`${BASE}/api/admin/reports/${id}/pdf`, { headers });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Download failed');
    }
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  },
};
