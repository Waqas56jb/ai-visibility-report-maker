import { supabase } from '../supabase.js';
import { getLimits } from '../config/runtime.js';
import { hitWindow } from '../middleware/rateLimit.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class QuotaError extends Error {
  constructor(message, { status = 429, retryAfterSec } = {}) {
    super(message);
    this.name = 'QuotaError';
    this.status = status;
    this.retryAfterSec = retryAfterSec;
  }
}

export function normalizeEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  return EMAIL_RE.test(email) ? email : '';
}

export function clientIp(req) {
  const xf = String(req.headers['x-forwarded-for'] || '')
    .split(',')[0]
    .trim();
  return xf || req.ip || req.socket?.remoteAddress || '';
}

function isoAgo(days) {
  return new Date(Date.now() - Number(days) * 86400000).toISOString();
}

function unlockMessage(oldest, days, kind) {
  const unlock = new Date(new Date(oldest).getTime() + Number(days) * 86400000);
  const when = unlock.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  if (kind === 'email') {
    return `This email already used its free report in the last ${days} days. You can run another after ${when}.`;
  }
  return `Too many reports from this network in the last ${days} days. Try again after ${when}.`;
}

function retryAfterSec(oldest, days) {
  const unlock = new Date(oldest).getTime() + Number(days) * 86400000;
  return Math.max(60, Math.ceil((unlock - Date.now()) / 1000));
}

function missingUsageTable(err) {
  return /relation|does not exist|schema cache/i.test(err?.message || '');
}

async function countSince(column, value, since) {
  const { count, error } = await supabase
    .from('report_usage')
    .select('id', { count: 'exact', head: true })
    .eq(column, value)
    .gte('created_at', since);
  if (error) {
    if (missingUsageTable(error)) {
      const skip = new Error('USAGE_TABLE_MISSING');
      skip.code = 'USAGE_TABLE_MISSING';
      throw skip;
    }
    throw error;
  }
  return count || 0;
}

async function oldestSince(column, value, since) {
  const { data } = await supabase
    .from('report_usage')
    .select('created_at')
    .eq(column, value)
    .gte('created_at', since)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.created_at || since;
}

export async function consumeReportQuota({ email, ip, isAdmin }) {
  if (isAdmin) return { skipped: true };

  const burst = hitWindow(`report:${ip || 'unknown'}`, 15 * 60 * 1000, 6);
  if (!burst.ok) {
    throw new QuotaError('Too many report requests from this network. Please wait a few minutes and try again.', {
      retryAfterSec: burst.retryAfterSec,
    });
  }

  const limits = getLimits();
  const sinceEmail = isoAgo(limits.emailWindowDays);
  const sinceIp = isoAgo(limits.ipWindowDays);

  try {
    if (ip) {
      const ipCount = await countSince('ip', ip, sinceIp);
      if (ipCount >= limits.reportsPerIp) {
        const oldest = await oldestSince('ip', ip, sinceIp);
        throw new QuotaError(unlockMessage(oldest, limits.ipWindowDays, 'ip'), {
          retryAfterSec: retryAfterSec(oldest, limits.ipWindowDays),
        });
      }
    }

    const emailCount = await countSince('email', email, sinceEmail);
    if (emailCount >= limits.reportsPerEmail) {
      const oldest = await oldestSince('email', email, sinceEmail);
      throw new QuotaError(unlockMessage(oldest, limits.emailWindowDays, 'email'), {
        retryAfterSec: retryAfterSec(oldest, limits.emailWindowDays),
      });
    }
  } catch (err) {
    if (err instanceof QuotaError) throw err;
    if (err?.code === 'USAGE_TABLE_MISSING' || missingUsageTable(err)) {
      console.warn('[quota] report_usage table missing; allowing request');
      return { skipped: true };
    }
    throw err;
  }

  const { data, error } = await supabase
    .from('report_usage')
    .insert({ email, ip: ip || '' })
    .select('id')
    .single();
  if (error) {
    if (missingUsageTable(error)) {
      console.warn('[quota] report_usage table missing; allowing request');
      return { skipped: true };
    }
    throw error;
  }

  const after = await countSince('email', email, sinceEmail);
  if (after > limits.reportsPerEmail) {
    await releaseReportQuota(data.id);
    const oldest = await oldestSince('email', email, sinceEmail);
    throw new QuotaError(unlockMessage(oldest, limits.emailWindowDays, 'email'), {
      retryAfterSec: retryAfterSec(oldest, limits.emailWindowDays),
    });
  }

  return { usageId: data.id };
}

export async function attachUsageReport(usageId, reportId) {
  if (!usageId || !reportId) return;
  await supabase.from('report_usage').update({ report_id: reportId }).eq('id', usageId);
}

export async function releaseReportQuota(usageId) {
  if (!usageId) return;
  await supabase.from('report_usage').delete().eq('id', usageId);
}

export function sendQuotaError(res, err) {
  if (err.retryAfterSec) res.set('Retry-After', String(err.retryAfterSec));
  return res.status(err.status || 429).json({
    error: err.message,
    retryAfterSec: err.retryAfterSec,
  });
}
