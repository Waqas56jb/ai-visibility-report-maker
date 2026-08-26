import { supabase } from '../supabase.js';
import { applyEngineOverlay, settings } from './env.js';
import { WEIGHTS } from './weights.js';
import { EXCLUDED_NAMES } from './exclusions.js';
import { SERVICES } from './services.js';
import { defaultSite, mergeSite } from './site.js';

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
    site: defaultSite(),
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
  const defaults = defaultSettingsPayload();
  let existing = {};
  try {
    const { data } = await supabase.from('admin_settings').select('*').eq('id', 'default').maybeSingle();
    existing = data || {};
  } catch {
    existing = {};
  }
  const next = {
    weights: patch.weights || existing.weights || defaults.weights,
    services: patch.services || existing.services || defaults.services,
    engine: { ...defaults.engine, ...(existing.engine || {}), ...(patch.engine || {}) },
    limits: { ...defaults.limits, ...(existing.limits || {}), ...(patch.limits || {}) },
    site: mergeSite(defaults.site, existing.site, patch.site),
    updated_at: new Date().toISOString(),
  };
  applySaved(next);
  const { error } = await supabase.from('admin_settings').upsert({ id: 'default', ...next }).select('*').single();
  if (error) console.warn('admin_settings persist skipped:', error.message);
  return next;
}

export async function publicSitePayload() {
  const defaults = defaultSite();
  try {
    const { data, error } = await supabase.from('admin_settings').select('site, updated_at').eq('id', 'default').maybeSingle();
    if (error) throw error;
    return {
      ...mergeSite(defaults, data?.site),
      updated_at: data?.updated_at || null,
    };
  } catch (err) {
    console.warn('public site', err.message);
    return { ...defaults, updated_at: null };
  }
}
