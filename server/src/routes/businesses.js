import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireUser } from '../middleware/auth.js';
import { mapReport, normalizeUrl } from '../lib/map.js';

const router = Router();

router.get('/', requireUser, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });

    const { data: reports } = await supabase
      .from('reports')
      .select('id,business_id,overall_score,created_at,status')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    const items = (data || []).map((b) => {
      const related = (reports || []).filter((r) => r.business_id === b.id);
      const latest = related.find((r) => r.status === 'completed') || related[0];
      return {
        ...b,
        latest_score: latest?.overall_score ?? null,
        reports_count: related.length,
      };
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireUser, async (req, res, next) => {
  try {
    const name = String(req.body?.business_name || req.body?.name || '').trim();
    const website = normalizeUrl(req.body?.website_url || req.body?.website);
    if (!name || !website) return res.status(400).json({ error: 'Name and website are required.' });
    const { data, error } = await supabase
      .from('businesses')
      .insert({
        user_id: req.user.id,
        name,
        website,
        industry: req.body?.industry || '',
        city_region: req.body?.city_region || '',
        country: req.body?.country || 'Australia',
      })
      .select('*')
      .single();
    if (error) return res.status(400).json({ error: error.message });
    const comps = (req.body?.competitors || []).filter(Boolean);
    if (comps.length) {
      await supabase.from('competitors').insert(
        comps.map((c) => ({
          user_id: req.user.id,
          business_id: data.id,
          name: typeof c === 'string' ? c : c.name,
          website: typeof c === 'object' ? c.website || '' : '',
        }))
      );
    }
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', requireUser, async (req, res, next) => {
  try {
    const patch = {};
    if (req.body.business_name || req.body.name) patch.name = req.body.business_name || req.body.name;
    if (req.body.website_url || req.body.website) patch.website = normalizeUrl(req.body.website_url || req.body.website);
    if (req.body.industry != null) patch.industry = req.body.industry;
    if (req.body.city_region != null) patch.city_region = req.body.city_region;
    if (req.body.country != null) patch.country = req.body.country;
    patch.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('businesses')
      .update(patch)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('*')
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Business not found.' });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireUser, async (req, res, next) => {
  try {
    const { error } = await supabase.from('businesses').delete().eq('id', req.params.id).eq('user_id', req.user.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/competitors', requireUser, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('competitors')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('business_id', req.params.id)
      .order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ items: data || [] });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/competitors', requireUser, async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Competitor name is required.' });
    const { data, error } = await supabase
      .from('competitors')
      .insert({
        user_id: req.user.id,
        business_id: req.params.id,
        name,
        website: req.body?.website || '',
      })
      .select('*')
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/history', requireUser, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('business_id', req.params.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ items: (data || []).map(mapReport) });
  } catch (err) {
    next(err);
  }
});

export default router;
