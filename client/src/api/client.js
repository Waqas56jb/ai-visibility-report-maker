const BASE = String(import.meta.env.VITE_API_URL || 'https://ai-visibility-report-maker-server.vercel.app').replace(
  /\/$/,
  ''
);

const SESSION_LS = 'mf_session';
const USER_LS = 'mf_user';
const SESSION_SS = 'mf_session';
const USER_SS = 'mf_user';

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function readJson(key, storage) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getSession() {
  return readJson(SESSION_LS, localStorage) || readJson(SESSION_SS, sessionStorage);
}

export function getStoredUser() {
  return readJson(USER_LS, localStorage) || readJson(USER_SS, sessionStorage);
}

export function remembered() {
  return Boolean(localStorage.getItem(SESSION_LS));
}

export function persistAuth(session, user, remember = true) {
  localStorage.removeItem(SESSION_LS);
  localStorage.removeItem(USER_LS);
  sessionStorage.removeItem(SESSION_SS);
  sessionStorage.removeItem(USER_SS);
  if (!session) return;
  const store = remember ? localStorage : sessionStorage;
  store.setItem(SESSION_LS, JSON.stringify(session));
  if (user) store.setItem(USER_LS, JSON.stringify(user));
}

function sessionExpired(session) {
  const exp = Number(session?.expires_at);
  if (!exp) return false;
  return exp * 1000 < Date.now() + 20_000;
}

let refreshLock = null;

export async function refreshSession() {
  const session = getSession();
  if (!session?.refresh_token) return null;
  if (refreshLock) return refreshLock;
  refreshLock = (async () => {
    try {
      const res = await fetch(`${BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.session) return null;
      persistAuth(data.session, data.user || getStoredUser(), remembered());
      return data;
    } catch {
      return null;
    } finally {
      refreshLock = null;
    }
  })();
  return refreshLock;
}

async function ensureFreshToken() {
  const session = getSession();
  if (session && sessionExpired(session)) {
    await refreshSession();
  }
}

export async function request(path, { method = 'GET', body, params, _retry } = {}) {
  await ensureFreshToken();
  let url = `${BASE}${path}`;
  if (params) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== '' && v !== 'all') q.set(k, String(v));
    });
    const s = q.toString();
    if (s) url += `?${s}`;
  }
  const headers = { 'Content-Type': 'application/json' };
  const session = getSession();
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !_retry) {
    const refreshed = await refreshSession();
    if (refreshed?.session) return request(path, { method, body, params, _retry: true });
  }
  if (!res.ok) throw new ApiError(data.error || 'Request failed', res.status);
  return data;
}

export async function downloadBinary(path, filename) {
  await ensureFreshToken();
  const headers = {};
  let session = getSession();
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  let res = await fetch(`${BASE}${path}`, { headers });
  if (res.status === 401) {
    const refreshed = await refreshSession();
    if (refreshed?.session) {
      headers.Authorization = `Bearer ${getSession()?.access_token}`;
      res = await fetch(`${BASE}${path}`, { headers });
    }
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.error || 'Download failed', res.status);
  }
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

export const api = {
  signup: (body) => request('/api/auth/signup', { method: 'POST', body }),
  login: (body) => request('/api/auth/login', { method: 'POST', body }),
  logout: () => request('/api/auth/logout', { method: 'POST', body: {} }),
  me: () => request('/api/auth/me'),
  forgotPassword: (email) => request('/api/auth/forgot', { method: 'POST', body: { email } }),
  resetPassword: (body) => request('/api/auth/reset', { method: 'POST', body }),

  createReport: (payload) => request('/api/reports', { method: 'POST', body: payload }),
  getReportStatus: (id) => request(`/api/reports/${id}/status`),
  getReport: (id) => request(`/api/reports/${id}`),
  listReports: (params) => request('/api/reports', { params }),
  deleteReport: (id) => request(`/api/reports/${id}`, { method: 'DELETE' }),
  rerunReport: (id) => request(`/api/reports/${id}/rerun`, { method: 'POST', body: {} }),
  updateReport: (id, body) => request(`/api/reports/${id}`, { method: 'PATCH', body }),
  getPublicReport: (id) => request(`/api/public/reports/${id}`),
  downloadPdf: (id, filename) =>
    downloadBinary(`/api/reports/${id}/pdf`, filename || 'MakeFlow-AI-Visibility-Report.pdf'),
  downloadPublicPdf: (id, filename) =>
    downloadBinary(`/api/public/reports/${id}/pdf`, filename || 'MakeFlow-AI-Visibility-Report.pdf'),

  listBusinesses: () => request('/api/businesses'),
  saveBusiness: (b) => request('/api/businesses', { method: 'POST', body: b }),
  updateBusiness: (id, b) => request(`/api/businesses/${id}`, { method: 'PATCH', body: b }),
  deleteBusiness: (id) => request(`/api/businesses/${id}`, { method: 'DELETE' }),
  listCompetitors: (businessId) => request(`/api/businesses/${businessId}/competitors`),
  addCompetitor: (businessId, body) =>
    request(`/api/businesses/${businessId}/competitors`, { method: 'POST', body }),
  deleteCompetitor: (id) => request(`/api/profile/competitors/${id}`, { method: 'DELETE' }),
  getHistory: (params) => request('/api/profile/history', { params }),

  getProfile: () => request('/api/profile'),
  updateProfile: (p) => request('/api/profile', { method: 'PATCH', body: p }),
  changePassword: (p) => request('/api/profile/password', { method: 'POST', body: p }),
  deleteAccount: (confirm) => request('/api/profile', { method: 'DELETE', body: { confirm } }),
};

export default api;
