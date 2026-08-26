import { generateReportResult, STAGES } from './generate.js';

const KEY = 'mf_mock_db';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || seed();
  } catch {
    return seed();
  }
}

function save(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

function uid() {
  return crypto.randomUUID();
}

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms));
}

function shapeReport(r) {
  if (!r) return r;
  const result = r.result_competitors || r.competitors_result || [];
  return {
    ...r,
    tracked_competitors: r.tracked_competitors || (Array.isArray(r.competitors) && typeof r.competitors[0] === 'string' ? r.competitors : []),
    competitors: result,
    competitors_result: result,
    weights: r.metrics?.weights || r.weights || [],
  };
}

function seed() {
  const db = { users: [], businesses: [], competitors: [], reports: [], session: null };
  save(db);
  return db;
}

function currentUser(db) {
  const raw = localStorage.getItem('mf_session') || sessionStorage.getItem('mf_session');
  if (!raw) return null;
  const session = JSON.parse(raw);
  return db.users.find((u) => u.id === session.user_id) || null;
}

function requireUser(db) {
  const user = currentUser(db);
  if (!user) throw new Error('Sign in required.');
  return user;
}

const pipelines = new Map();

function startPipeline(reportId) {
  if (pipelines.has(reportId)) return;
  pipelines.set(reportId, true);
  (async () => {
    const db = load();
    const report = db.reports.find((r) => r.id === reportId);
    if (!report) return;
    report.status = 'processing';
    for (const step of STAGES) {
      report.progress_step = step;
      save(db);
      await delay(900);
    }
    Object.assign(report, generateReportResult(report), {
      status: 'completed',
      progress_step: 'completed',
      completed_at: new Date().toISOString(),
    });
    save(db);
    pipelines.delete(reportId);
  })();
}

export const api = {
  async signup(body) {
    await delay();
    const db = load();
    if (db.users.some((u) => u.email === body.email)) throw new Error('Email already registered.');
    const user = {
      id: uid(),
      email: body.email,
      password: body.password,
      first_name: body.first_name,
      last_name: body.last_name,
      company_name: body.company_name || '',
      phone: '',
      avatar_url: '',
      timezone: 'Australia/Brisbane',
      role: 'user',
      settings: { notify_complete: true, monthly_reminder: false, tips: true, default_country: 'Australia', default_modes: { browsing: true, knowledge: true } },
    };
    db.users.push(user);
    const session = { access_token: uid(), user_id: user.id };
    save(db);
    return { user, session };
  },
  async login({ email, password }) {
    await delay();
    const db = load();
    const user = db.users.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password.');
    const { password: _p, ...safe } = user;
    return { user: safe, session: { access_token: uid(), user_id: user.id } };
  },
  async logout() {
    await delay(120);
    return { ok: true };
  },
  async me() {
    await delay(120);
    const db = load();
    const user = requireUser(db);
    const { password, ...safe } = user;
    return { user: safe, session: null };
  },
  async forgotPassword() {
    await delay();
    return { ok: true };
  },
  async resetPassword() {
    await delay();
    return { ok: true };
  },

  async createReport(payload) {
    await delay();
    const db = load();
    const user = requireUser(db);
    let business_id = payload.business_id || null;
    if (payload.save_business) {
      const b = {
        id: uid(),
        user_id: user.id,
        name: payload.business_name,
        website: payload.website_url,
        industry: payload.industry || '',
        city_region: payload.city_region || '',
        country: payload.country || 'Australia',
        created_at: new Date().toISOString(),
      };
      db.businesses.push(b);
      business_id = b.id;
    }
    const report = {
      id: uid(),
      user_id: user.id,
      business_id,
      business_name: payload.business_name,
      website: payload.website_url,
      industry: payload.industry || '',
      city_region: payload.city_region || '',
      country: payload.country || 'Australia',
      competitors: payload.competitors || [],
      key_services: payload.key_services || [],
      modes: payload.modes || { browsing: true, knowledge: true },
      notify_email: payload.notify_email !== false,
      status: 'queued',
      progress_step: 'queued',
      notes: '',
      created_at: new Date().toISOString(),
      completed_at: null,
    };
    db.reports.unshift(report);
    save(db);
    startPipeline(report.id);
    return { reportId: report.id, report };
  },
  async getReportStatus(id) {
    await delay(150);
    const db = load();
    const user = requireUser(db);
    const r = db.reports.find((x) => x.id === id && x.user_id === user.id);
    if (!r) throw new Error('Report not found.');
    return { id: r.id, status: r.status, progress_step: r.progress_step, error: r.error, overall_score: r.overall_score };
  },
  async getReport(id) {
    await delay();
    const db = load();
    const user = requireUser(db);
    const r = db.reports.find((x) => x.id === id && x.user_id === user.id);
    if (!r) throw new Error('Report not found.');
    return shapeReport(r);
  },
  async listReports(params = {}) {
    await delay();
    const db = load();
    const user = requireUser(db);
    let items = db.reports.filter((r) => r.user_id === user.id);
    if (params.status && params.status !== 'all') items = items.filter((r) => r.status === params.status);
    if (params.band && params.band !== 'all') items = items.filter((r) => r.score_band === params.band);
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter((r) => r.business_name.toLowerCase().includes(q) || r.website.toLowerCase().includes(q));
    }
    if (params.sort === 'oldest') items = [...items].sort((a, b) => a.created_at.localeCompare(b.created_at));
    if (params.sort === 'highest') items = [...items].sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0));
    if (params.sort === 'lowest') items = [...items].sort((a, b) => (a.overall_score || 0) - (b.overall_score || 0));
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 10;
    const total = items.length;
    items = items.slice((page - 1) * pageSize, page * pageSize);
    return { items: items.map(shapeReport), total, page, pageSize };
  },
  async deleteReport(id) {
    await delay();
    const db = load();
    const user = requireUser(db);
    db.reports = db.reports.filter((r) => !(r.id === id && r.user_id === user.id));
    save(db);
    return { ok: true };
  },
  async rerunReport(id) {
    const db = load();
    const user = requireUser(db);
    const prev = db.reports.find((r) => r.id === id && r.user_id === user.id);
    if (!prev) throw new Error('Report not found.');
    return this.createReport({
      business_id: prev.business_id,
      business_name: prev.business_name,
      website_url: prev.website,
      industry: prev.industry,
      city_region: prev.city_region,
      country: prev.country,
      competitors: prev.competitors,
      key_services: prev.key_services,
      modes: prev.modes,
      notify_email: prev.notify_email,
    });
  },
  async updateReport(id, body) {
    await delay();
    const db = load();
    const user = requireUser(db);
    const r = db.reports.find((x) => x.id === id && x.user_id === user.id);
    if (!r) throw new Error('Report not found.');
    Object.assign(r, body);
    save(db);
    return r;
  },
  async getPublicReport(id) {
    await delay();
    const db = load();
    const r = db.reports.find((x) => x.id === id && x.is_public);
    if (!r) throw new Error('Report not found.');
    return r;
  },
  async downloadPdf() {
    throw new Error('PDF download needs the live API.');
  },
  async downloadPublicPdf() {
    throw new Error('PDF download needs the live API.');
  },

  async listBusinesses() {
    await delay();
    const db = load();
    const user = requireUser(db);
    const items = db.businesses
      .filter((b) => b.user_id === user.id)
      .map((b) => {
        const related = db.reports.filter((r) => r.business_id === b.id);
        const latest = related.find((r) => r.status === 'completed');
        return { ...b, latest_score: latest?.overall_score ?? null, reports_count: related.length };
      });
    return { items };
  },
  async saveBusiness(b) {
    await delay();
    const db = load();
    const user = requireUser(db);
    const row = {
      id: uid(),
      user_id: user.id,
      name: b.business_name || b.name,
      website: b.website_url || b.website,
      industry: b.industry || '',
      city_region: b.city_region || '',
      country: b.country || 'Australia',
      created_at: new Date().toISOString(),
    };
    db.businesses.push(row);
    (b.competitors || []).forEach((c) => {
      db.competitors.push({
        id: uid(),
        user_id: user.id,
        business_id: row.id,
        name: typeof c === 'string' ? c : c.name,
        website: typeof c === 'object' ? c.website || '' : '',
      });
    });
    save(db);
    return row;
  },
  async updateBusiness(id, b) {
    await delay();
    const db = load();
    const user = requireUser(db);
    const row = db.businesses.find((x) => x.id === id && x.user_id === user.id);
    if (!row) throw new Error('Business not found.');
    if (b.business_name || b.name) row.name = b.business_name || b.name;
    if (b.website_url || b.website) row.website = b.website_url || b.website;
    if (b.industry != null) row.industry = b.industry;
    if (b.city_region != null) row.city_region = b.city_region;
    save(db);
    return row;
  },
  async deleteBusiness(id) {
    await delay();
    const db = load();
    const user = requireUser(db);
    db.businesses = db.businesses.filter((b) => !(b.id === id && b.user_id === user.id));
    save(db);
    return { ok: true };
  },
  async listCompetitors(businessId) {
    await delay();
    const db = load();
    const user = requireUser(db);
    return { items: db.competitors.filter((c) => c.user_id === user.id && c.business_id === businessId) };
  },
  async addCompetitor(businessId, body) {
    await delay();
    const db = load();
    const user = requireUser(db);
    const row = { id: uid(), user_id: user.id, business_id: businessId, name: body.name, website: body.website || '' };
    db.competitors.push(row);
    save(db);
    return row;
  },
  async deleteCompetitor(id) {
    await delay();
    const db = load();
    const user = requireUser(db);
    db.competitors = db.competitors.filter((c) => !(c.id === id && c.user_id === user.id));
    save(db);
    return { ok: true };
  },
  async getHistory(params = {}) {
    await delay();
    const db = load();
    const user = requireUser(db);
    let items = db.reports.filter((r) => r.user_id === user.id && r.status === 'completed');
    if (params.business_id) items = items.filter((r) => r.business_id === params.business_id);
    items.sort((a, b) => a.created_at.localeCompare(b.created_at));
    return { items: items.map(shapeReport) };
  },
  async getProfile() {
    return (await this.me()).user;
  },
  async updateProfile(p) {
    await delay();
    const db = load();
    const user = requireUser(db);
    Object.assign(user, p);
    save(db);
    const { password, ...safe } = user;
    return safe;
  },
  async changePassword() {
    await delay();
    return { ok: true };
  },
  async deleteAccount(confirm) {
    if (confirm !== 'DELETE') throw new Error('Type DELETE to confirm.');
    await delay();
    return { ok: true };
  },
};

export default api;
