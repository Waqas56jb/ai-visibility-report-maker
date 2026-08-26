import { supabase } from '../supabase.js';
import { applyEngineOverlay, settings } from './env.js';
import { WEIGHTS } from './weights.js';
import { EXCLUDED_NAMES } from './exclusions.js';
import { SERVICES } from './services.js';

export const WEIGHT_DEFS = [
  { key: 'mention', label: 'Mention rate' },
  { key: 'prominence', label: 'Prominence' },
  { key: 'readiness', label: 'AI-readiness' },
  { key: 'citation', label: 'Citation rate' },
  { key: 'sentiment', label: 'Sentiment' },
  { key: 'competitive', label: 'Competitive position' },
];

function originsList() {
  return [process.env.CLIENT_ORIGIN, process.env.ADMIN_ORIGIN].filter(Boolean).join(', ');
}

export function defaultSettingsPayload() {
  const s = settings();
  return {
    weights: WEIGHT_DEFS.map((w) => ({
      key: w.key,
      label: w.label,
      pct: Math.round((WEIGHTS[w.key] || 0) * 100),
    })),
    services: Object.entries(SERVICES).map(([key, svc]) => ({
      key,
      name: svc.name,
      description: svc.description,
      cta: svc.cta || '',
    })),
    engine: {
      modelMini: s.modelMini,
      modelStrong: s.modelStrong,
      maxQueries: s.maxQueries,
      maxPages: s.maxPages,
      browsing: s.browsing !== false,
      knowledge: s.knowledge !== false,
      emailOnComplete: s.emailOnComplete !== false,
    },
    limits: {
      reportsPerIp: 3,
      reportsPerEmail: 2,
      allowedOrigins: originsList(),
      exclusions: EXCLUDED_NAMES.map((n) => n.replace(/\b\w/g, (c) => c.toUpperCase())).join(', '),
    },
  };
}

export function applySaved(row = {}) {
  if (Array.isArray(row.weights)) {
    for (const w of row.weights) {
      if (w?.key && WEIGHTS[w.key] != null) {
        const pct = Number(w.pct);
        if (Number.isFinite(pct)) WEIGHTS[w.key] = pct / 100;
      }
    }
  }
  if (row.engine) applyEngineOverlay(row.engine);
  if (row.limits?.exclusions) {
    const names = String(row.limits.exclusions)
      .split(',')
      .map((n) => n.trim().toLowerCase())
      .filter(Boolean);
    if (names.length) {
      EXCLUDED_NAMES.length = 0;
      EXCLUDED_NAMES.push(...names);
    }
  }
  if (Array.isArray(row.services)) {
    for (const svc of row.services) {
      if (!svc?.key) continue;
      SERVICES[svc.key] = {
        name: svc.name || svc.key,
        description: svc.description || '',
        cta: svc.cta || '',
      };
    }
  }
}

export async function loadAdminSettings() {
  try {
    const { data, error } = await supabase.from('admin_settings').select('*').eq('id', 'default').maybeSingle();
    if (error) throw error;
    if (data) applySaved(data);
  } catch (err) {
    console.warn('admin_settings load skipped:', err.message);
  }
}

export async function saveAdminSettings(patch = {}) {
  const current = defaultSettingsPayload();
  const next = {
    weights: patch.weights || current.weights,
    services: patch.services || current.services,
    engine: { ...current.engine, ...(patch.engine || {}) },
    limits: { ...current.limits, ...(patch.limits || {}) },
    updated_at: new Date().toISOString(),
  };
  applySaved(next);
  const { error } = await supabase.from('admin_settings').upsert({ id: 'default', ...next }).select('*').single();
  if (error) console.warn('admin_settings persist skipped:', error.message);
  return next;
}
