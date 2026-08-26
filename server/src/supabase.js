import './loadEnv.js';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_KEY;

if (!url || !anon || !service) {
  throw new Error('Missing SUPABASE_URL, SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY');
}

export const supabaseAnon = createClient(url, anon, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const supabase = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
});
