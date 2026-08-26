import '../loadEnv.js';
import { supabase } from '../supabase.js';

const accounts = [
  {
    email: process.env.DEMO_USER_EMAIL,
    password: process.env.DEMO_USER_PASSWORD,
    first_name: 'User',
    last_name: 'Account',
    role: 'user',
  },
  {
    email: process.env.DEMO_ADMIN_EMAIL,
    password: process.env.DEMO_ADMIN_PASSWORD,
    first_name: 'Admin',
    last_name: 'MakeFlow',
    role: 'admin',
  },
].filter((a) => a.email && a.password);

if (!accounts.length) {
  console.error('Set DEMO_USER_EMAIL / DEMO_ADMIN_EMAIL and passwords in .env');
  process.exit(1);
}

const { data: listed, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
if (listErr) {
  console.error(listErr.message);
  process.exit(1);
}

for (const a of accounts) {
  const email = a.email.trim().toLowerCase();
  const existing = (listed.users || []).find((u) => (u.email || '').toLowerCase() === email);
  let user = existing;
  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password: a.password,
      email_confirm: true,
      user_metadata: { first_name: a.first_name, last_name: a.last_name },
    });
    if (error) {
      console.error(email, error.message);
      continue;
    }
    user = data.user;
    console.log('updated', email, a.role);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: a.password,
      email_confirm: true,
      user_metadata: { first_name: a.first_name, last_name: a.last_name },
    });
    if (error) {
      console.error(email, error.message);
      continue;
    }
    user = data.user;
    console.log('created', email, a.role);
  }

  const { error: upErr } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      email,
      first_name: a.first_name,
      last_name: a.last_name,
      role: a.role,
      accept_terms: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );
  if (upErr) console.error('profile', email, upErr.message);
}
