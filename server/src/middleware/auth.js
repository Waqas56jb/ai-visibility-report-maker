import { supabase, supabaseAnon } from '../supabase.js';

export async function requireUser(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Sign in required.' });

    const { data, error } = await supabaseAnon.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Session expired. Please sign in again.' });

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
    req.user = data.user;
    req.profile = profile;
    req.accessToken = token;
    next();
  } catch (err) {
    next(err);
  }
}

export async function requireAdmin(req, res, next) {
  if (!req.profile || req.profile.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}
