import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const url = process.env.DATABASE_POOL_URL || process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is missing');
  process.exit(1);
}

const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const emails = adminEmail.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (emails.length) {
      await client.query(`update public.profiles set role = 'admin' where lower(email) = any($1::text[])`, [emails]);
    }
  }
  console.log('Schema applied.');
} catch (err) {
  console.error(err);
  process.exit(1);
} finally {
  await client.end();
}
