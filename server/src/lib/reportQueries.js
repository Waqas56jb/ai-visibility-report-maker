import { supabase } from '../supabase.js';
import { changedRows, toDbRow } from './visibilityRows.js';

export { testsFinished } from './visibilityRows.js';

export function rowFromDb(q) {
  return {
    id: q.id,
    text: q.text,
    category: q.category,
    topic: q.topic,
    intent: q.intent,
    mode: q.mode || '',
    raw_answer: q.raw_answer || '',
    citations: q.citations || [],
    extraction: q.extraction || null,
    error: q.error || null,
  };
}

export async function loadQueryRows(reportId) {
  const { data, error } = await supabase.from('report_queries').select('*').eq('report_id', reportId);
  if (error) {
    console.warn('load report_queries', error.message);
    return [];
  }
  return (data || []).map(rowFromDb);
}

/**
 * Upsert on (report_id, mode, text). The previous delete-then-insert rewrote all
 * 76 rows on every progress tick and, if the function was killed between the two
 * statements, lost every answer computed so far.
 */
export async function saveQueryRows(reportId, rows) {
  if (!rows?.length) return;
  const { error } = await supabase
    .from('report_queries')
    .upsert(rows.map((q) => toDbRow(reportId, q)), { onConflict: 'report_id,mode,text' });
  if (error) console.warn('report_queries persist', error.message);
}

/**
 * Persists only the rows whose stored shape changed since the caller's last
 * write. `sent` is the bookkeeping map to carry into the next call.
 */
export async function saveChangedQueryRows(reportId, rows, sent) {
  const delta = changedRows(reportId, rows, sent);
  if (!delta.rows.length) return sent;
  const { error } = await supabase
    .from('report_queries')
    .upsert(delta.rows, { onConflict: 'report_id,mode,text' });
  if (error) {
    console.warn('report_queries persist', error.message);
    return sent;
  }
  return delta.sent;
}
