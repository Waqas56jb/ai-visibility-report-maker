import pg from 'pg';

export async function ensureAdminColumns() {
  const url = process.env.DATABASE_POOL_URL || process.env.DATABASE_URL;
  if (!url) return;
  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    await client.query(`alter table public.profiles add column if not exists blocked boolean default false`);
    await client.query(`alter table public.profiles add column if not exists blocked_at timestamptz`);
    await client.query(`alter table public.admin_settings add column if not exists site jsonb`);
    await client.query(`alter table public.reports add column if not exists notify_to text`);
    await client.query(`alter table public.reports add column if not exists email_sent_at timestamptz`);
    await client.query(`alter table public.reports add column if not exists pipeline_lock_at timestamptz`);
    await client.query(`
      create table if not exists public.report_usage (
        id uuid primary key default gen_random_uuid(),
        email text not null,
        ip text default '',
        report_id uuid unique,
        created_at timestamptz default now()
      )
    `);
    await client.query(
      `create index if not exists report_usage_email_created_idx on public.report_usage (email, created_at desc)`
    );
    await client.query(
      `create index if not exists report_usage_ip_created_idx on public.report_usage (ip, created_at desc)`
    );
    await client.query(`create index if not exists reports_notify_to_idx on public.reports (notify_to)`);
    await client.query(`alter table public.report_usage enable row level security`);
    await client.query(`
      update public.reports r
      set notify_to = lower(p.email)
      from public.profiles p
      where r.user_id = p.id
        and (r.notify_to is null or r.notify_to = '')
        and p.email is not null
        and p.email <> ''
    `);
    await client.query(`
      insert into public.report_usage (email, ip, report_id, created_at)
      select lower(coalesce(nullif(r.notify_to, ''), p.email)), '', r.id, r.created_at
      from public.reports r
      left join public.profiles p on p.id = r.user_id
      where coalesce(nullif(r.notify_to, ''), p.email) is not null
        and coalesce(nullif(r.notify_to, ''), p.email) <> ''
        and not exists (select 1 from public.report_usage u where u.report_id = r.id)
    `);
  } catch (err) {
    console.warn('schema ensure skipped:', err.message);
  } finally {
    try {
      await client.end();
    } catch {
      /* ignore */
    }
  }
}
