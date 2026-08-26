import { Router } from 'express';
import { supabase, supabaseAnon } from '../supabase.js';
import { requireUser } from '../middleware/auth.js';
import { mapReport } from '../lib/map.js';

const router = Router();

router.get('/', requireUser, async (req, res) => {
  res.json(req.profile);
});

router.patch('/', requireUser, async (req, res, next) => {
  try {
    const allowed = ['first_name', 'last_name', 'company_name', 'phone', 'timezone', 'avatar_url', 'settings'];
    const patch = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
      if (req.body?.[key] != null) patch[key] = req.body[key];
    }
    const { data, error } = await supabase.from('profiles').update(patch).eq('id', req.user.id).select('*').single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/password', requireUser, async (req, res, next) => {
  try {
    const { current_password, new_password, confirm } = req.body || {};
    if (!new_password || new_password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }
    if (new_password !== confirm) return res.status(400).json({ error: 'Passwords do not match.' });
    const { error: signErr } = await supabaseAnon.auth.signInWithPassword({
      email: req.user.email,
      password: current_password,
    });
    if (signErr) return res.status(400).json({ error: 'Current password is incorrect.' });
    const { error } = await supabase.auth.admin.updateUserById(req.user.id, { password: new_password });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/', requireUser, async (req, res, next) => {
  try {
    if (req.body?.confirm !== 'DELETE') return res.status(400).json({ error: 'Type DELETE to confirm.' });
    await supabase.from('reports').delete().eq('user_id', req.user.id);
    await supabase.from('competitors').delete().eq('user_id', req.user.id);
    await supabase.from('businesses').delete().eq('user_id', req.user.id);
    await supabase.from('profiles').delete().eq('id', req.user.id);
    await supabase.auth.admin.deleteUser(req.user.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/history', requireUser, async (req, res, next) => {
  try {
    let q = supabase
      .from('reports')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: true });
    if (req.query.business_id) q = q.eq('business_id', req.query.business_id);
    const { data, error } = await q;
    if (error) return res.status(400).json({ error: error.message });
    res.json({ items: (data || []).map(mapReport) });
  } catch (err) {
    next(err);
  }
});

router.delete('/competitors/:id', requireUser, async (req, res, next) => {
  try {
    const { error } = await supabase.from('competitors').delete().eq('id', req.params.id).eq('user_id', req.user.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
