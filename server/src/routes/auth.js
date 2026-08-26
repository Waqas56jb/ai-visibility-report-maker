import { Router } from 'express';
import { supabase, supabaseAnon } from '../supabase.js';
import { requireUser } from '../middleware/auth.js';
import { isAdminEmail } from '../lib/admins.js';

const router = Router();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function shapeUser(profile, session) {
  return {
    user: profile
      ? {
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          company_name: profile.company_name,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
          timezone: profile.timezone,
          role: profile.role,
          settings: profile.settings || {},
        }
      : null,
    session: session
      ? {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
        }
      : null,
  };
}

async function upsertProfile(user, extras = {}) {
  const { data: existing } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  const row = {
    id: user.id,
    email: user.email,
    first_name: extras.first_name || user.user_metadata?.first_name || '',
    last_name: extras.last_name || user.user_metadata?.last_name || '',
    company_name: extras.company_name || user.user_metadata?.company_name || '',
    accept_terms: extras.accept_terms ?? false,
    role: isAdminEmail(user.email) ? 'admin' : existing?.role || 'user',
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' }).select('*').single();
  if (error) throw error;
  return data;
}

router.post('/signup', async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, confirm_password, company_name, accept_terms } = req.body || {};
    if (!first_name?.trim() || !last_name?.trim()) return res.status(400).json({ error: 'First and last name are required.' });
    if (!EMAIL.test(String(email || ''))) return res.status(400).json({ error: 'Enter a valid email.' });
    if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    if (password !== confirm_password) return res.status(400).json({ error: 'Passwords do not match.' });
    if (!accept_terms) return res.status(400).json({ error: 'Please accept the terms.' });

    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        company_name: (company_name || '').trim(),
        accept_terms: true,
      },
    });
    if (createErr) return res.status(400).json({ error: createErr.message });

    const profile = await upsertProfile(created.user, {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      company_name: (company_name || '').trim(),
      accept_terms: true,
    });

    const { data: signed, error: signErr } = await supabaseAnon.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (signErr) return res.status(400).json({ error: signErr.message });

    res.json(shapeUser(profile, signed.session));
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!EMAIL.test(String(email || '')) || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email: String(email).trim().toLowerCase(),
      password,
    });
    if (error) return res.status(401).json({ error: 'Invalid email or password.' });
    const profile = await upsertProfile(data.user);
    res.json(shapeUser(profile, data.session));
  } catch (err) {
    next(err);
  }
});

router.post('/logout', requireUser, async (req, res, next) => {
  try {
    await supabase.auth.admin.signOut(req.accessToken);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireUser, async (req, res) => {
  res.json(shapeUser(req.profile, null));
});

router.post('/forgot', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!EMAIL.test(email)) return res.status(400).json({ error: 'Enter a valid email.' });
    const redirectTo = `${process.env.CLIENT_ORIGIN}/reset-password/confirm`;
    const { error } = await supabaseAnon.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/reset', async (req, res, next) => {
  try {
    const { access_token, new_password, confirm_password } = req.body || {};
    if (!new_password || new_password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    if (new_password !== confirm_password) return res.status(400).json({ error: 'Passwords do not match.' });
    if (!access_token) return res.status(400).json({ error: 'Reset token missing.' });

    const { data: userData, error: userErr } = await supabaseAnon.auth.getUser(access_token);
    if (userErr || !userData?.user) return res.status(400).json({ error: 'Reset link is invalid or expired.' });

    const { error } = await supabase.auth.admin.updateUserById(userData.user.id, { password: new_password });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const refresh_token = req.body?.refresh_token;
    if (!refresh_token) return res.status(400).json({ error: 'Missing refresh token.' });
    const { data, error } = await supabaseAnon.auth.refreshSession({ refresh_token });
    if (error) return res.status(401).json({ error: error.message });
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
    res.json(shapeUser(profile, data.session));
  } catch (err) {
    next(err);
  }
});

export default router;
