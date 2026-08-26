import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireUser, requireAdmin } from '../middleware/auth.js';
import { startPipeline } from '../lib/pipeline.js';
import { mapAdminReport, mapQueryRow, mapReport, domainOf, usageCost } from '../lib/map.js';
import { defaultSettingsPayload, saveAdminSettings } from '../config/runtime.js';
import { mergeSite, defaultSite } from '../config/site.js';
import { buildPdfBuffer, pdfFilename, sendPdf } from '../lib/renderPdf.js';

const router = Router();
router.use(requireUser, requireAdmin);

const STEPS = [
  'queued',
  'crawling',
  'generating_queries',
  'testing',
  'scoring',
  'writing_recommendations',
  'generating_pdf',
  'completed',
];

async function profilesByIds(ids) {
  const unique = [...new Set((ids || []).filter(Boolean))];
  if (!unique.length) return {};
  const { data } = await supabase.from('profiles').select('id, first_name, last_name, email, avatar_url, role').in('id', unique);
  return Object.fromEntries((data || []).map((p) => [p.id, p]));
}

function dayKey(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toISOString().slice(0, 10);
}

function pctChange(curr, prev) {
  if (!prev) return curr ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}

router.get('/stats', async (_req, res, next) => {
  try {
    const now = Date.now();
    const d14 = new Date(now - 14 * 86400000).toISOString();
    const d30 = new Date(now - 30 * 86400000).toISOString();
    const d60 = new Date(now - 60 * 86400000).toISOString();

    const [{ data: reports, error: rErr }, { data: leads, error: lErr }, profilesRes] = await Promise.all([
      supabase
        .from('reports')
        .select('id, status, progress_step, overall_score, score_band, metrics, token_usage, created_at, completed_at, business_name, website, error, industry, city_region, user_id')
        .order('created_at', { ascending: false })
        .limit(2000),
      supabase.from('leads').select('id, business_name, created_at, email, source, industry, location').order('created_at', { ascending: false }).limit(500),
      supabase.from('profiles').select('id, created_at, role, blocked, email').limit(2000),
    ]);
    if (rErr) return res.status(400).json({ error: rErr.message });
    if (lErr) return res.status(400).json({ error: lErr.message });

    let profiles = profilesRes.data || [];
    if (profilesRes.error && String(profilesRes.error.message || '').includes('blocked')) {
      const fallback = await supabase.from('profiles').select('id, created_at, role, email').limit(2000);
      profiles = (fallback.data || []).map((p) => ({ ...p, blocked: false }));
    }

    const rows = reports || [];
    const leadRows = leads || [];
    const last30 = rows.filter((r) => r.created_at >= d30);
    const prev30 = rows.filter((r) => r.created_at >= d60 && r.created_at < d30);
    const leads30 = leadRows.filter((l) => l.created_at >= d30);
    const done = last30.filter((r) => r.status === 'completed' && r.overall_score != null);
    const failed30 = last30.filter((r) => r.status === 'failed');
    const completed30 = last30.filter((r) => r.status === 'completed');
    const processing = rows.filter((r) => r.status === 'processing' || r.status === 'queued').length;
    const avg = done.length ? Math.round(done.reduce((s, r) => s + r.overall_score, 0) / done.length) : 0;
    const spend = last30.reduce((s, r) => s + usageCost(r), 0);
    const avgCost = last30.filter((r) => usageCost(r) > 0);
    const avgPer = avgCost.length ? spend / avgCost.length : 0;
    const users30 = profiles.filter((p) => p.created_at >= d30);
    const prevUsers = profiles.filter((p) => p.created_at >= d60 && p.created_at < d30);

    function topCounts(list, key, n = 6) {
      const map = new Map();
      list.forEach((row) => {
        const k = String(row[key] || '').trim();
        if (!k) return;
        map.set(k, (map.get(k) || 0) + 1);
      });
      return [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([label, count]) => ({ label, count }));
    }

    const days = [];
    for (let i = 13; i >= 0; i -= 1) {
      const d = new Date();
      d.setHours(12, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push({
        date: dayKey(d),
        label: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()],
        count: 0,
        completed: 0,
        spend: 0,
        leads: 0,
        users: 0,
      });
    }
    function slotFor(iso) {
      return days.find((x) => x.date === dayKey(iso));
    }
    rows
      .filter((r) => r.created_at >= d14)
      .forEach((r) => {
        const slot = slotFor(r.created_at);
        if (!slot) return;
        slot.count += 1;
        if (r.status === 'completed') slot.completed += 1;
        slot.spend += usageCost(r);
      });
    leadRows
      .filter((l) => l.created_at >= d14)
      .forEach((l) => {
        const slot = slotFor(l.created_at);
        if (slot) slot.leads += 1;
      });
    profiles
      .filter((p) => p.created_at >= d14)
      .forEach((p) => {
        const slot = slotFor(p.created_at);
        if (slot) slot.users += 1;
      });

    const bandOrder = ['Invisible', 'Barely visible', 'Getting there', 'Visible', 'Leading'];
    const bands = bandOrder.map((label) => ({
      label,
      count: done.filter((r) => r.score_band === label).length,
    }));

    const activity = [
      ...rows.slice(0, 16).map((r) => {
        if (r.status === 'completed') {
          return {
            icon: 'file-check',
            title: 'Report completed',
            detail: `${r.business_name}${r.overall_score != null ? ` · score ${r.overall_score}` : ''}`,
            at: r.completed_at || r.created_at,
          };
        }
        if (r.status === 'failed') {
          return {
            icon: 'alert-triangle',
            title: 'Report failed',
            detail: `${r.business_name}${r.error ? ` · ${String(r.error).slice(0, 60)}` : ''}`,
            at: r.created_at,
          };
        }
        return {
          icon: 'file-bar-chart',
          title: 'Report in progress',
          detail: `${r.business_name} · ${r.progress_step || r.status}`,
          at: r.created_at,
        };
      }),
      ...leadRows.slice(0, 8).map((l) => ({
        icon: 'user-plus',
        title: 'New lead captured',
        detail: l.business_name || l.email || 'Lead',
        at: l.created_at,
      })),
    ]
      .filter((a) => a.at)
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 8);

    const recent = rows.slice(0, 6);
    const status_counts = [
      { label: 'Completed', key: 'completed', count: rows.filter((r) => r.status === 'completed').length },
      { label: 'In progress', key: 'processing', count: rows.filter((r) => r.status === 'processing' || r.status === 'queued').length },
      { label: 'Failed', key: 'failed', count: rows.filter((r) => r.status === 'failed').length },
    ];

    res.json({
      reports_30d: last30.length,
      reports_delta: pctChange(last30.length, prev30.length),
      leads_30d: leads30.length || last30.length,
      capture_rate: last30.length ? Math.round(((leads30.length || last30.length) / last30.length) * 100) : 0,
      avg_score: avg,
      openai_spend: Number(spend.toFixed(2)),
      avg_cost: Number(avgPer.toFixed(2)),
      reports_total: rows.length,
      leads_total: leadRows.length || rows.length,
      completed_30d: completed30.length,
      failed_30d: failed30.length,
      completion_rate: last30.length ? Math.round((completed30.length / last30.length) * 100) : 0,
      in_progress: processing,
      users_total: profiles.length,
      users_30d: users30.length,
      users_delta: pctChange(users30.length, prevUsers.length),
      blocked_users: profiles.filter((p) => p.blocked).length,
      admins: profiles.filter((p) => p.role === 'admin').length,
      status_counts,
      industries: topCounts(last30, 'industry'),
      cities: topCounts(last30, 'city_region'),
      lead_sources: topCounts(leadRows, 'source'),
      per_day: days.map((d) => ({ ...d, spend: Number(d.spend.toFixed(2)) })),
      bands,
      recent,
      activity,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const q = String(req.query.search || '').toLowerCase().trim();
    let { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(500);
    if (error && String(error.message || '').includes('blocked')) {
      const fallback = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(500);
      data = fallback.data;
      error = fallback.error;
    }
    if (error) return res.status(400).json({ error: error.message });
    const { data: reports } = await supabase.from('reports').select('user_id, status').limit(4000);
    const counts = {};
    const completed = {};
    (reports || []).forEach((r) => {
      counts[r.user_id] = (counts[r.user_id] || 0) + 1;
      if (r.status === 'completed') completed[r.user_id] = (completed[r.user_id] || 0) + 1;
    });
    let items = (data || []).map((p) => ({
      ...p,
      blocked: Boolean(p.blocked),
      reports_count: counts[p.id] || 0,
      completed_count: completed[p.id] || 0,
    }));
    if (q) {
      items = items.filter((p) =>
        [p.email, p.first_name, p.last_name, p.company_name, p.role].join(' ').toLowerCase().includes(q)
      );
    }
    if (req.query.role) items = items.filter((p) => p.role === req.query.role);
    if (req.query.blocked === '1') items = items.filter((p) => p.blocked);
    if (req.query.blocked === '0') items = items.filter((p) => !p.blocked);
    res.json({ items, total: items.length });
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.user.id && (req.body.blocked === true || req.body.role === 'user')) {
      return res.status(400).json({ error: 'You cannot block or demote your own admin account.' });
    }
    const patch = { updated_at: new Date().toISOString() };
    if (req.body.role === 'user' || req.body.role === 'admin') patch.role = req.body.role;
    if (typeof req.body.blocked === 'boolean') {
      patch.blocked = req.body.blocked;
      patch.blocked_at = req.body.blocked ? new Date().toISOString() : null;
    }
    const { data, error } = await supabase.from('profiles').update(patch).eq('id', req.params.id).select('*').single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own admin account.' });
    }
    const { data: profile, error: findErr } = await supabase.from('profiles').select('id, role').eq('id', req.params.id).maybeSingle();
    if (findErr) return res.status(400).json({ error: findErr.message });
    if (!profile) return res.status(404).json({ error: 'User not found.' });
    await supabase.from('reports').delete().eq('user_id', req.params.id);
    await supabase.from('competitors').delete().eq('user_id', req.params.id);
    await supabase.from('businesses').delete().eq('user_id', req.params.id);
    await supabase.from('leads').delete().eq('user_id', req.params.id);
    await supabase.from('profiles').delete().eq('id', req.params.id);
    const { error: authErr } = await supabase.auth.admin.deleteUser(req.params.id);
    if (authErr) console.warn('auth delete', authErr.message);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/reports', async (req, res, next) => {
  try {
    const { search = '', status = '', band = '' } = req.query;
    const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(500);
    if (error) return res.status(400).json({ error: error.message });
    const pmap = await profilesByIds((data || []).map((r) => r.user_id));
    let items = (data || []).map((r) => mapAdminReport(r, pmap[r.user_id]));
    const q = String(search).toLowerCase().trim();
    if (q) {
      items = items.filter((r) =>
        [r.business_name, r.website, r.lead_email, r.lead_name, r.industry].join(' ').toLowerCase().includes(q)
      );
    }
    if (status) {
      if (STEPS.includes(status) && status !== 'queued' && status !== 'completed') {
        items = items.filter((r) => r.progress_step === status || (status === 'testing' && r.status === 'processing'));
      } else {
        items = items.filter((r) => r.status === status);
      }
    }
    if (band) items = items.filter((r) => r.score_band === band);
    res.json({ items, total: items.length });
  } catch (err) {
    next(err);
  }
});

router.get('/reports/:id/pdf', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('reports').select('*').eq('id', req.params.id).maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Report not found.' });
    if (data.status !== 'completed') {
      return res.status(409).json({ error: 'PDF is available after the report completes.' });
    }
    const buffer = await buildPdfBuffer(mapReport(data));
    sendPdf(res, buffer, pdfFilename(data));
  } catch (err) {
    next(err);
  }
});

router.get('/reports/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('reports').select('*').eq('id', req.params.id).maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Report not found.' });
    const pmap = await profilesByIds([data.user_id]);
    const report = mapAdminReport(data, pmap[data.user_id]);
    const { data: queries } = await supabase
      .from('report_queries')
      .select('*')
      .eq('report_id', data.id)
      .order('created_at', { ascending: true });
    let queryRows = (queries || []).map(mapQueryRow);
    if (!queryRows.length && Array.isArray(data.gaps)) {
      queryRows = data.gaps.map((g) => ({
        text: g.question || g.query,
        category: g.category,
        mode: g.mode,
        mentioned: false,
        position: null,
        competitors: g.named_instead || g.competitors_named || [],
        error: null,
      }));
    }
    res.json({
      ...report,
      queries: queryRows,
      log: STEPS,
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/reports/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('reports').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/reports/:id/rerun', async (req, res, next) => {
  try {
    const { data: prev, error } = await supabase.from('reports').select('*').eq('id', req.params.id).maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!prev) return res.status(404).json({ error: 'Report not found.' });

    const { data, error: insErr } = await supabase
      .from('reports')
      .insert({
        user_id: prev.user_id,
        business_id: prev.business_id,
        business_name: prev.business_name,
        website: prev.website,
        industry: prev.industry,
        city_region: prev.city_region,
        country: prev.country,
        competitors: prev.competitors,
        key_services: prev.key_services,
        modes: prev.modes,
        notify_email: prev.notify_email,
        status: 'queued',
        progress_step: 'queued',
      })
      .select('*')
      .single();
    if (insErr) return res.status(400).json({ error: insErr.message });
    startPipeline(data.id);
    res.status(201).json({ reportId: data.id, report: mapAdminReport(data) });
  } catch (err) {
    next(err);
  }
});

router.get('/leads', async (req, res, next) => {
  try {
    const { search = '', source = '' } = req.query;
    const [{ data: leads, error: lErr }, { data: reports, error: rErr }] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(500),
      supabase
        .from('reports')
        .select('id, user_id, website, overall_score, industry, city_region, business_name, created_at')
        .order('created_at', { ascending: false })
        .limit(500),
    ]);
    if (lErr) return res.status(400).json({ error: lErr.message });
    if (rErr) return res.status(400).json({ error: rErr.message });

    const reportRows = reports || [];
    const pmap = await profilesByIds([
      ...(leads || []).map((l) => l.user_id),
      ...reportRows.map((r) => r.user_id),
    ]);

    const latestByDomain = new Map();
    reportRows.forEach((r) => {
      const key = domainOf(r.website) || r.website;
      if (key && !latestByDomain.has(key)) latestByDomain.set(key, r);
    });

    let items = (leads || []).map((l) => {
      const profile = pmap[l.user_id];
      const match = latestByDomain.get(domainOf(l.website) || l.website);
      const name = l.name || [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim();
      return {
        id: l.id,
        report_id: match?.id || null,
        name: name || profile?.email || '',
        email: l.email || profile?.email || '',
        business_name: l.business_name || match?.business_name || '',
        website: l.website || match?.website || '',
        industry: l.industry || match?.industry || '',
        location: l.location || match?.city_region || '',
        latest_score: match?.overall_score ?? null,
        source: l.source || 'website',
        created_at: l.created_at,
      };
    });

    if (!items.length) {
      items = reportRows.map((r) => {
        const profile = pmap[r.user_id];
        const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim();
        return {
          id: r.id,
          report_id: r.id,
          name: name || profile?.email || '',
          email: profile?.email || '',
          business_name: r.business_name,
          website: r.website,
          industry: r.industry || '',
          location: r.city_region || '',
          latest_score: r.overall_score ?? null,
          source: 'website',
          created_at: r.created_at,
        };
      });
    }

    const q = String(search).toLowerCase().trim();
    if (q) {
      items = items.filter((l) =>
        [l.name, l.email, l.business_name, l.website, l.industry, l.location].join(' ').toLowerCase().includes(q)
      );
    }
    if (source) items = items.filter((l) => l.source === source);
    res.json({ items, total: items.length });
  } catch (err) {
    next(err);
  }
});

router.get('/settings', async (_req, res, next) => {
  try {
    const defaults = defaultSettingsPayload();
    const { data, error } = await supabase.from('admin_settings').select('*').eq('id', 'default').maybeSingle();
    if (error) {
      console.warn('admin_settings', error.message);
      return res.json(defaults);
    }
    res.json({
      weights: data?.weights || defaults.weights,
      services: data?.services || defaults.services,
      engine: { ...defaults.engine, ...(data?.engine || {}) },
      limits: { ...defaults.limits, ...(data?.limits || {}) },
      site: mergeSite(defaultSite(), data?.site),
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/settings', async (req, res, next) => {
  try {
    const saved = await saveAdminSettings(req.body || {});
    res.json(saved);
  } catch (err) {
    if (err.message) return res.status(400).json({ error: err.message });
    next(err);
  }
});

export default router;
