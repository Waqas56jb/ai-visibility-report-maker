let overlay = {};

export function applyEngineOverlay(partial = {}) {
  overlay = { ...(partial || {}) };
}

export function getEngineOverlay() {
  return overlay;
}

export function num(name, fallback) {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

export function settings() {
  return {
    modelMini: overlay.modelMini || process.env.MODEL_MINI || process.env.OPENAI_MODEL || 'gpt-4o-mini',
    modelStrong: overlay.modelStrong || process.env.MODEL_STRONG || 'gpt-4o',
    maxQueries: overlay.maxQueries ?? num('MAX_QUERIES', 42),
    maxPages: overlay.maxPages ?? num('MAX_PAGES', 12),
    maxCostUsd: overlay.maxCostUsd ?? (Number(process.env.MAX_COST_USD) || 0.6),
    maxOpenAiCalls: overlay.maxOpenAiCalls ?? num('MAX_OPENAI_CALLS', 160),
    bucket: process.env.SUPABASE_BUCKET || 'reports',
    browsing: overlay.browsing !== false,
    knowledge: overlay.knowledge !== false,
    emailOnComplete: overlay.emailOnComplete !== false,
  };
}
