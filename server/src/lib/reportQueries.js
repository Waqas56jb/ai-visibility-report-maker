import { supabase } from '../supabase.js';

export function rowFromDb(q) {
  return {
    id: q.id,
    text: q.text,
    category: q.category,
    topic: q.topic,
    intent: q.intent,
    mode: q.mode,
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

export async function saveQueryRows(reportId, rows) {
  if (!rows?.length) return;
  try {
    await supabase.from('report_queries').delete().eq('report_id', reportId);
    await supabase.from('report_queries').insert(
      rows.map((q) => ({
        report_id: reportId,
        text: q.text,
        category: q.category,
        topic: q.topic || null,
        intent: q.intent || null,
        mode: q.mode || null,
        raw_answer: String(q.raw_answer || '').slice(0, 8000),
        citations: q.citations || [],
        extraction: q.extraction,
        error: q.error || null,
      }))
    );
  } catch (err) {
    console.warn('report_queries persist', err.message);
  }
}

export function testsFinished(rows) {
  return Boolean(rows?.length) && rows.every((r) => r.raw_answer || r.error || r.attempted);
}
