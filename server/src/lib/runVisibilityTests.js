import PQueue from 'p-queue';
import { answerAsChatGPT, completeJson } from '../services/openai.js';
import { MentionBatch } from '../services/schemas.js';
import { settings } from '../config/env.js';
import { domainOf } from './url.js';
import { SliceYield } from './keepAlive.js';
import {
  applyFuzzy,
  buildRows,
  emptyExtraction,
  pendingRows,
  queriesFromRows,
  testsFinished,
} from './visibilityRows.js';

/** Slice time held back so an in-flight request can be aborted and its row saved. */
const SLICE_RESERVE_MS = 2500;
/** Below this there is not enough time left for a call to be worth starting. */
const MIN_CALL_MS = 4000;

async function extractBatch(batch, summary, website, usage, budgetMs) {
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
    budgetMs,
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
      row.extraction = emptyExtraction({ error: 'extraction_missing' });
    }
    applyFuzzy(row, summary, website);
  });
}

function budgetFor(deadline) {
  if (!deadline) return Infinity;
  return deadline.remaining() - SLICE_RESERVE_MS;
}

export async function runVisibilityTests(
  report,
  summary,
  queries,
  usage,
  { deadline, onProgress, flushProgress } = {}
) {
  const s = settings();
  const city = summary.service_area?.city || (report.city_region || '').split(',')[0] || null;
  const country = 'AU';
  const existing = Array.isArray(report._existingRows) ? report._existingRows : [];
  const seed = queries?.length ? queries : queriesFromRows(existing);
  const rows = buildRows(seed, report, existing);

  const pending = pendingRows(rows);
  const answerQ = new PQueue({ concurrency: s.answerConcurrency });

  await answerQ.addAll(
    pending.map((row) => async () => {
      // No queue.clear() here: p-queue never settles the promises of tasks it drops,
      // so clearing mid-run would hang this addAll until the platform killed the
      // function — losing the checkpoint. Letting each remaining task fall through
      // this guard costs microseconds and leaves the row pending for the next slice.
      const budgetMs = budgetFor(deadline);
      if (budgetMs < MIN_CALL_MS) return;
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
          budgetMs,
        });
        row.raw_answer = ans.raw_answer;
        row.citations = ans.citations || [];
        row.model = ans.model;
        row.latency_ms = ans.latency_ms;
        row.error = null;
      } catch (err) {
        row.error = err.message || 'answer_failed';
      }
      row.attempted = true;
      onProgress?.(rows);
    })
  );

  await flushProgress?.(rows);

  const needExtract = rows.filter((r) => r.raw_answer && !r.error && !r.extraction);
  const batches = [];
  for (let i = 0; i < needExtract.length; i += s.extractBatchSize) {
    batches.push(needExtract.slice(i, i + s.extractBatchSize));
  }
  const extractQ = new PQueue({ concurrency: s.extractConcurrency });

  await extractQ.addAll(
    batches.map((batch) => async () => {
      const budgetMs = budgetFor(deadline);
      if (budgetMs < MIN_CALL_MS || usage.wouldExceed()) return;
      try {
        await extractBatch(batch, summary, report.website, usage, budgetMs);
      } catch (err) {
        batch.forEach((r) => {
          r.error = r.error || err.message;
          r.extraction = r.extraction || emptyExtraction();
          applyFuzzy(r, summary, report.website);
        });
      }
      onProgress?.(rows);
    })
  );

  await flushProgress?.(rows);

  if (!testsFinished(rows)) throw new SliceYield(rows);

  return rows;
}

