const BASE = import.meta.env.VITE_API_URL || '';

function token() {
  try {
    const raw = localStorage.getItem('mf_session') || sessionStorage.getItem('mf_session');
    return raw ? JSON.parse(raw).access_token : null;
  } catch {
    return null;
  }
}

async function request(path, { method = 'GET', body, params } = {}) {
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
  const t = token();
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function downloadBinary(path, filename) {
  const headers = {};
  const t = token();
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(`${BASE}${path}`, { headers });
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
