import PQueue from 'p-queue';
import { answerAsChatGPT, completeJson } from '../services/openai.js';
import { MentionBatch } from '../services/schemas.js';
import { settings } from '../config/env.js';
import { mentionedInText } from './fuzzy.js';
import { domainOf } from './url.js';
import { SliceYield } from './keepAlive.js';
import { saveQueryRows, testsFinished } from './reportQueries.js';

function cantBrowse(text) {
  return /i can'?t browse|i don't have access to the (internet|web)|as an ai/i.test(text || '');
}

function applyFuzzy(row, summary, website) {
  const domain = domainOf(website);
  const variants = summary.name_variants || [];
  const fuzzy = mentionedInText(summary.canonical_name, variants, domain, row.raw_answer, 0.88);
  const extraction = { ...(row.extraction || {}) };
  if (fuzzy.mentioned && !extraction.target_mentioned) {
    extraction.target_mentioned = true;
    extraction.matched_by = 'fuzzy';
    if (!extraction.target_position) {
      const idx = normalizeIndex(summary.canonical_name, row.raw_answer);
      extraction.target_position = idx;
    }
  }
  if (cantBrowse(row.raw_answer) && row.mode === 'knowledge') {
    extraction.answer_recommends_providers = false;
  }
  row.extraction = extraction;
  return row;
}

function normalizeIndex(name, text) {
  const i = String(text || '').toLowerCase().indexOf(String(name || '').toLowerCase());
  if (i < 0) return null;
  const before = text.slice(0, i);
  const names = before.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
  return names.length + 1;
}

async function extractBatch(batch, summary, website, usage) {
  const answers_block = batch
    .map(
      (row, i) => `---
index: ${i}
Query: "${row.text}"
Mode: ${row.mode}
Citations: ${(row.citations || []).join(', ') || 'none'}
Answer text:
"""
${String(row.raw_answer || '').slice(0, 2000)}
"""`
    )
    .join('\n');

  const { data } = await completeJson({
    promptStem: 'mention_extraction',
    schema: MentionBatch,
    schemaName: 'MentionBatch',
    model: settings().modelMini,
    temperature: 0,
    max_tokens: 2500,
    stage: 'extract_mentions',
    usage,
    vars: {
      canonical_name: summary.canonical_name,
      name_variants: (summary.name_variants || []).join(', '),
      domain: domainOf(website),
      answers_block,
    },
  });

  const items = data.items || [];
  batch.forEach((row, i) => {
    const ext = items.find((x) => x.index === i) || items[i];
    if (ext) {
      const { index: _i, ...rest } = ext;
      row.extraction = rest;
    } else {
      row.extraction = {
        named_entities: [],
        target_mentioned: false,
        target_position: null,
        target_cited: false,
        target_sentiment: 'not_mentioned',
        target_description: null,
        competitors_named: [],
        answer_recommends_providers: false,
        error: 'extraction_missing',
      };
    }
    applyFuzzy(row, summary, website);
  });
}

function buildRows(queries, report, existing = []) {
  const modes = [];
  if (report.modes?.browsing !== false) modes.push('browsing');
  if (report.modes?.knowledge !== false) modes.push('knowledge');

  const prev = new Map();
  for (const row of existing) {
    if (!row?.text || !row?.mode) continue;
    prev.set(`${row.mode}::${row.text}`, row);
  }

  const rows = [];
  for (const q of queries) {
    for (const mode of modes) {
      const key = `${mode}::${q.text}`;
      const found = prev.get(key);
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

function queriesFromRows(rows) {
  const seen = new Set();
  const out = [];
  for (const row of rows) {
    if (!row.text || seen.has(row.text)) continue;
    seen.add(row.text);
    out.push({
      text: row.text,
      category: row.category,
      topic: row.topic,
      intent: row.intent,
    });
  }
  return out;
}

export async function runVisibilityTests(report, summary, queries, usage, { deadline, onProgress } = {}) {
  const s = settings();
  const city = summary.service_area?.city || (report.city_region || '').split(',')[0] || null;
  const country = 'AU';
  const existing = Array.isArray(report._existingRows) ? report._existingRows : [];
  const seed = queries?.length ? queries : queriesFromRows(existing);
  const rows = buildRows(seed, report, existing);

  const pending = rows.filter((row) => !row.raw_answer && !row.error);
  const concurrency = process.env.VERCEL ? 2 : 3;
  const answerQ = new PQueue({ concurrency });

  await answerQ.addAll(
    pending.map((row) => async () => {
      if (deadline?.hit(8000)) {
        answerQ.clear();
        return;
      }
      if (usage.wouldExceed() || usage.truncated) {
        row.error = 'truncated_cost';
        return;
      }
      try {
        const ans = await answerAsChatGPT({
          query: row.text,
          mode: row.mode,
          city,
          country,
          stage: `answer_${row.mode}`,
          usage,
          model: s.modelMini,
        });
        row.raw_answer = ans.raw_answer;
        row.citations = ans.citations || [];
        row.model = ans.model;
        row.latency_ms = ans.latency_ms;
      } catch (err) {
        row.error = err.message || 'answer_failed';
      }
      row.attempted = true;
      if (onProgress) await onProgress(rows);
    })
  );

  const needExtract = rows.filter((r) => r.raw_answer && !r.error && !r.extraction);
  for (let i = 0; i < needExtract.length; i += 5) {
    if (deadline?.hit(6000) || usage.wouldExceed()) break;
    const batch = needExtract.slice(i, i + 5);
    try {
      await extractBatch(batch, summary, report.website, usage);
    } catch (err) {
      batch.forEach((r) => {
        r.error = r.error || err.message;
        r.extraction = r.extraction || {
          named_entities: [],
          target_mentioned: false,
          target_position: null,
          target_cited: false,
          target_sentiment: 'not_mentioned',
          target_description: null,
          competitors_named: [],
          answer_recommends_providers: false,
        };
        applyFuzzy(r, summary, report.website);
      });
    }
    if (onProgress) await onProgress(rows);
  }

  if (onProgress) await onProgress(rows);

  if (!testsFinished(rows)) {
    throw new SliceYield(rows);
  }

  return rows;
}

export { saveQueryRows };
