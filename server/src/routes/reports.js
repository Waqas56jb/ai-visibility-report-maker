import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireUser } from '../middleware/auth.js';
import { startPipeline } from '../lib/pipeline.js';
import { mapReport, normalizeUrl, domainOf } from '../lib/map.js';
import { settings } from '../config/env.js';
import { buildPdfBuffer, pdfFilename, sendPdf } from '../lib/renderPdf.js';
import {
  QuotaError,
  attachUsageReport,
  clientIp,
  consumeReportQuota,
  normalizeEmail,
  releaseReportQuota,
  sendQuotaError,
} from '../lib/quota.js';

const router = Router();

router.post('/', requireUser, async (req, res, next) => {
  let usageId = null;
  try {
    const b = req.body || {};
    const business_name = String(b.business_name || '').trim();
    const website = normalizeUrl(b.website_url || b.website);
    if (!business_name) return res.status(400).json({ error: 'Business name is required.' });
    if (!website || !/^https?:\/\/.+\..+/.test(website)) {
      return res.status(400).json({ error: 'Enter a valid website URL.' });
    }

    const domain = domainOf(website);
    const { data: active } = await supabase
      .from('reports')
      .select('id, website, status')
      .eq('user_id', req.user.id)
      .in('status', ['queued', 'processing']);
    if ((active || []).some((r) => domainOf(r.website) === domain)) {
      return res.status(409).json({ error: 'A report for this website is already running.' });
    }

    const notify_to = normalizeEmail(b.email) || normalizeEmail(req.user.email);
    if (!notify_to) return res.status(400).json({ error: 'A valid email is required to generate a report.' });

    const isAdmin = req.profile?.role === 'admin';
    const reservation = await consumeReportQuota({
      email: notify_to,
      ip: clientIp(req),
      isAdmin,
    });
    usageId = reservation.usageId || null;

    let business_id = b.business_id || null;
    if (business_id) {
      const { data: existing } = await supabase
        .from('businesses')
        .select('id')
        .eq('id', business_id)
        .eq('user_id', req.user.id)
        .maybeSingle();
      if (!existing) business_id = null;
      else if (b.save_business !== false) {
        await supabase
          .from('businesses')
          .update({
            name: business_name,
            website,
            industry: b.industry || '',
            city_region: b.city_region || '',
            country: b.country || 'Australia',
            updated_at: new Date().toISOString(),
          })
          .eq('id', business_id)
          .eq('user_id', req.user.id);
      }
    } else if (b.save_business !== false) {
      const { data: biz, error } = await supabase
        .from('businesses')
        .insert({
          user_id: req.user.id,
          name: business_name,
          website,
          industry: b.industry || '',
          city_region: b.city_region || '',
          country: b.country || 'Australia',
        })
        .select('id')
        .single();
      if (error) {
        await releaseReportQuota(usageId);
        usageId = null;
        return res.status(400).json({ error: error.message });
      }
      business_id = biz.id;
      const comps = (b.competitors || []).filter(Boolean);
      if (comps.length) {
        await supabase.from('competitors').insert(
          comps.map((name) => ({
            user_id: req.user.id,
            business_id,
            name: typeof name === 'string' ? name : name.name,
            website: typeof name === 'object' ? name.website || '' : '',
          }))
        );
      }
    }

    const engine = settings();
    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: req.user.id,
        business_id,
        business_name,
        website,
        industry: b.industry || '',
        city_region: b.city_region || '',
        country: b.country || 'Australia',
        competitors: (b.competitors || []).map((c) => (typeof c === 'string' ? c : c.name)).filter(Boolean),
        key_services: b.key_services || [],
        modes: b.modes || { browsing: engine.browsing !== false, knowledge: engine.knowledge !== false },
        notify_email: typeof b.notify_email === 'boolean' ? b.notify_email : engine.emailOnComplete !== false,
        notify_to,
        status: 'queued',
        progress_step: 'queued',
      })
      .select('*')
      .single();
    if (error) {
      await releaseReportQuota(usageId);
      usageId = null;
      return res.status(400).json({ error: error.message });
    }
    await attachUsageReport(usageId, data.id);
    usageId = null;

    try {
      await supabase.from('leads').insert({
        user_id: req.user.id,
        email: notify_to,
        name: [req.profile?.first_name, req.profile?.last_name].filter(Boolean).join(' ').trim(),
        business_name,
        website,
        industry: b.industry || '',
        location: b.city_region || '',
        source: b.source || 'website',
      });
    } catch {
      /* optional */
    }

    startPipeline(data.id);
    res.status(201).json({ reportId: data.id, report: mapReport(data) });
  } catch (err) {
    await releaseReportQuota(usageId);
    if (err instanceof QuotaError) return sendQuotaError(res, err);
    next(err);
  }
});

router.get('/', requireUser, async (req, res, next) => {
  try {
    const { search = '', status = 'all', band = 'all', sort = 'newest', page = '1', pageSize = '10' } = req.query;
    const limit = Math.min(50, Math.max(1, Number(pageSize) || 10));
    const offset = (Math.max(1, Number(page) || 1) - 1) * limit;

    let q = supabase.from('reports').select('*', { count: 'exact' }).eq('user_id', req.user.id);
    if (status !== 'all') q = q.eq('status', status);
    if (band !== 'all') q = q.eq('score_band', band);
    if (search) q = q.or(`business_name.ilike.%${search}%,website.ilike.%${search}%`);

    if (sort === 'oldest') q = q.order('created_at', { ascending: true });
    else if (sort === 'highest') q = q.order('overall_score', { ascending: false, nullsFirst: false });
    else if (sort === 'lowest') q = q.order('overall_score', { ascending: true, nullsFirst: true });
    else q = q.order('created_at', { ascending: false });

    const { data, error, count } = await q.range(offset, offset + limit - 1);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ items: (data || []).map(mapReport), total: count || 0, page: Number(page) || 1, pageSize: limit });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/status', requireUser, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('id,status,progress_step,error,overall_score')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Report not found.' });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/pdf', requireUser, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .maybeSingle();
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

router.get('/:id', requireUser, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Report not found.' });
    res.json(mapReport(data));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', requireUser, async (req, res, next) => {
  try {
    const patch = {};
    if (typeof req.body?.notes === 'string') patch.notes = req.body.notes;
    const { data, error } = await supabase
      .from('reports')
      .update(patch)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('*')
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Report not found.' });
    res.json(mapReport(data));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireUser, async (req, res, next) => {
  try {
    const { error } = await supabase.from('reports').delete().eq('id', req.params.id).eq('user_id', req.user.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/rerun', requireUser, async (req, res, next) => {
  let usageId = null;
  try {
    const { data: prev, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!prev) return res.status(404).json({ error: 'Report not found.' });

    const notify_to = normalizeEmail(prev.notify_to) || normalizeEmail(req.user.email);
    if (!notify_to) return res.status(400).json({ error: 'A valid email is required to generate a report.' });

    const isAdmin = req.profile?.role === 'admin';
    const reservation = await consumeReportQuota({
      email: notify_to,
      ip: clientIp(req),
      isAdmin,
    });
    usageId = reservation.usageId || null;

    const { data, error: insErr } = await supabase
      .from('reports')
      .insert({
        user_id: req.user.id,
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
        notify_to,
        status: 'queued',
        progress_step: 'queued',
      })
      .select('*')
      .single();
    if (insErr) {
      await releaseReportQuota(usageId);
      usageId = null;
      return res.status(400).json({ error: insErr.message });
    }
    await attachUsageReport(usageId, data.id);
    usageId = null;
    startPipeline(data.id);
    res.status(201).json({ reportId: data.id, report: mapReport(data) });
  } catch (err) {
    await releaseReportQuota(usageId);
    if (err instanceof QuotaError) return sendQuotaError(res, err);
    next(err);
  }
});

export default router;
