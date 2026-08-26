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
