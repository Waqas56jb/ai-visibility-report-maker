import { mentionedInText } from './fuzzy.js';
import { domainOf } from './url.js';

export function emptyExtraction(extra = {}) {
  return {
    named_entities: [],
    target_mentioned: false,
    target_position: null,
    target_cited: false,
    target_sentiment: 'not_mentioned',
    target_description: null,
    competitors_named: [],
    answer_recommends_providers: false,
    ...extra,
  };
}

export function cantBrowse(text) {
  return /i can'?t browse|i don't have access to the (internet|web)|as an ai/i.test(text || '');
}

export function isRetryableTestError(message) {
  return /429|5\d\d|timeout|timed ?out|ETIMEDOUT|ECONNRESET|socket hang up|fetch failed|aborted/i.test(
    String(message || '')
  );
}

export function normalizeIndex(name, text) {
  const i = String(text || '').toLowerCase().indexOf(String(name || '').toLowerCase());
  if (i < 0) return null;
  const before = text.slice(0, i);
  const names = before.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
  return names.length + 1;
}

export function applyFuzzy(row, summary, website) {
  const domain = domainOf(website);
  const variants = summary.name_variants || [];
  const fuzzy = mentionedInText(summary.canonical_name, variants, domain, row.raw_answer, 0.88);
  const extraction = { ...(row.extraction || {}) };
  if (fuzzy.mentioned && !extraction.target_mentioned) {
    extraction.target_mentioned = true;
    extraction.matched_by = 'fuzzy';
    if (!extraction.target_position) {
      extraction.target_position = normalizeIndex(summary.canonical_name, row.raw_answer);
    }
  }
  if (cantBrowse(row.raw_answer) && row.mode === 'knowledge') {
    extraction.answer_recommends_providers = false;
  }
  row.extraction = extraction;
  return row;
}

export function modesFor(report) {
  const modes = [];
  if (report.modes?.browsing !== false) modes.push('browsing');
  if (report.modes?.knowledge !== false) modes.push('knowledge');
  return modes;
}

export function buildRows(queries, report, existing = []) {
  const modes = modesFor(report);
  const prev = new Map();
  for (const row of existing) {
    if (!row?.text || !row?.mode) continue;
    prev.set(rowKey(row), row);
  }

  const rows = [];
  for (const q of queries) {
    for (const mode of modes) {
      const found = prev.get(rowKey({ mode, text: q.text }));
      rows.push(
        found
          ? {
              ...found,
              category: found.category || q.category,
              topic: found.topic || q.topic,
              intent: found.intent || q.intent,
            }
          : {
              text: q.text,
              category: q.category,
              topic: q.topic,
              intent: q.intent,
              mode,
              raw_answer: '',
              citations: [],
              extraction: null,
              error: null,
            }
      );
    }
  }
  return rows;
}

export function queriesFromRows(rows) {
  const seen = new Set();
  const out = [];
  for (const row of rows || []) {
    if (!row.text || seen.has(row.text)) continue;
    seen.add(row.text);
    out.push({ text: row.text, category: row.category, topic: row.topic, intent: row.intent });
  }
  return out;
}

/** Rows still worth an OpenAI call: never answered, or failed with a transient error. */
export function pendingRows(rows) {
  return (rows || []).filter((row) => !row.raw_answer && (!row.error || isRetryableTestError(row.error)));
}

export function testsFinished(rows) {
  return Boolean(rows?.length) && rows.every((r) => r.raw_answer || r.error || r.attempted);
}

export function progressCounts(rows) {
  const list = rows || [];
  return { tests_done: list.filter((r) => r.raw_answer || r.error).length, tests_total: list.length };
}

/** Identity of a row in report_queries — matches the table's unique constraint. */
export function rowKey(row) {
  return `${row?.mode || ''}::${row?.text || ''}`;
}

export function toDbRow(reportId, q) {
  return {
    report_id: reportId,
    text: q.text,
    category: q.category ?? null,
    topic: q.topic || null,
    intent: q.intent || null,
    mode: q.mode || '',
    raw_answer: String(q.raw_answer || '').slice(0, 8000),
    citations: q.citations || [],
    extraction: q.extraction ?? null,
    error: q.error || null,
  };
}

/**
 * Only the rows whose persisted shape changed since the last write. Answers are
 * written once and never touched again, so this keeps each progress flush small
 * instead of re-sending the whole 76-row set every time.
 */
export function changedRows(reportId, rows, sent = new Map()) {
  const next = new Map(sent);
  const out = [];
  for (const row of rows || []) {
    if (!row?.text) continue;
    const db = toDbRow(reportId, row);
    const key = rowKey(row);
    const print = JSON.stringify(db);
    if (next.get(key) === print) continue;
    next.set(key, print);
    out.push(db);
  }
  return { rows: out, sent: next };
}
