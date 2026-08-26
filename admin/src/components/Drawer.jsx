import { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Circle,
  FileDown,
  Link2,
  LoaderCircle,
  Minus,
  RotateCcw,
  Swords,
  Trash2,
  X,
} from 'lucide-react';
import { api } from '../api.js';
import { ago, badgeLabel, band, fmtDate } from '../lib.js';
import { useToast } from '../toast.jsx';

const TABS = [
  ['overview', 'Overview'],
  ['queries', 'Queries'],
  ['readiness', 'AI-readiness'],
  ['recs', 'Recommendations'],
  ['usage', 'Usage & cost'],
];

const STEPS = [
  'queued',
  'crawling',
  'generating_queries',
  'testing',
  'scoring',
  'writing_recommendations',
  'generating_pdf',
  'completed',
];

function checkIcon(status) {
  if (status === 'pass') return <Check className="lucide" />;
  if (status === 'fail') return <X className="lucide" />;
  if (status === 'partial') return <Minus className="lucide" />;
  return <Circle className="lucide" />;
}

export default function Drawer({ id, onClose, onChanged }) {
  const toast = useToast();
  const [tab, setTab] = useState('overview');
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) {
      setReport(null);
      return undefined;
    }
    setTab('overview');
    setError('');
    setReport(null);
    let live = true;
    api
      .report(id)
      .then((data) => {
        if (live) setReport(data);
      })
      .catch((err) => {
        if (live) setError(err.message);
      });
    return () => {
      live = false;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [id, onClose]);

  async function remove() {
    if (!report || !window.confirm('Delete this report and its lead? This cannot be undone.')) return;
    setBusy(true);
    try {
      await api.deleteReport(report.id);
      toast('Report deleted');
      onChanged?.();
      onClose();
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function rerun() {
    if (!report) return;
    setBusy(true);
    try {
      await api.rerun(report.id);
      toast('Re-run queued');
      onChanged?.();
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    const url = report?.public_url || `${import.meta.env.VITE_CLIENT_URL || 'https://ai-visibility-report-maker-client.vercel.app'}/report/${report?.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast('Report link copied');
    } catch {
      window.prompt('Copy this public link', url);
    }
  }

  async function openPdf() {
    if (!report) return;
    setBusy(true);
    try {
      await api.downloadPdf(report.id, `MakeFlow-AI-Visibility-${(report.business_name || 'report').replace(/[^\w]+/g, '-')}.pdf`);
      toast('PDF downloaded');
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }

  const sc = report?.overall_score ?? 0;
  const metrics = report?.metrics || {};
  const usage = report?.token_usage || [];
  const tokensIn = usage.reduce((s, e) => s + (Number(e.prompt_tokens) || 0), 0);
  const tokensOut = usage.reduce((s, e) => s + (Number(e.completion_tokens) || 0), 0);
  const tokens = tokensIn + tokensOut;
  const checks = report?.ai_readiness?.checks || [];
  const comps = report?.competitors || report?.competitors_result || [];
  const step = report?.status === 'failed' ? 'failed' : report?.progress_step || report?.status;
  const stepIdx = STEPS.indexOf(step);
  const browsing = report?.score_by_mode?.find((m) => /brows/i.test(m.name))?.value;
  const knowledge = report?.score_by_mode?.find((m) => /know/i.test(m.name))?.value;

  return (
    <>
      <div className={`scrim ${id ? 'show' : ''}`} style={{ zIndex: 45 }} onClick={onClose} />
      <div className={`drawer ${id ? 'open' : ''}`}>
        <div className="drawer-h">
          <div>
            <h2>{report?.business_name || (error ? 'Report' : 'Loading…')}</h2>
            <div className="m">
              <span>{report?.website}</span>
              {report?.id && (
                <>
                  <span>·</span>
                  <span>{report.id.slice(0, 8)}</span>
                </>
              )}
              {report?.created_at && (
                <>
                  <span>·</span>
                  <span>{fmtDate(report.created_at)}</span>
                </>
              )}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" type="button" onClick={onClose} aria-label="Close">
            <X className="lucide" />
          </button>
        </div>
        <div className="drawer-b">
          {error && <p className="err">{error}</p>}
          {!report && !error && <p className="loading">Loading report…</p>}
          {report && (
            <>
              <div className="tabs">
                {TABS.map(([key, label]) => (
                  <button key={key} type="button" className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>
                    {label}
                  </button>
                ))}
              </div>

              <div className={`tab ${tab === 'overview' ? 'active' : ''}`}>
                <div className="dscore">
                  <div>
                    <div className="n">
                      <span>{sc}</span>
                      <small>/100</small>
                    </div>
                    <div className="b">
                      {report.status === 'completed'
                        ? `${report.score_band || band(sc)} · tested against ChatGPT`
                        : report.status === 'failed'
                          ? `Failed: ${report.error || 'unknown error'}`
                          : `Status: ${badgeLabel(report)}`}
                    </div>
                  </div>
                  <div className="mini">
                    {[
                      ['Mention rate', metrics.mention_rate != null ? `${metrics.mention_rate}%` : '—'],
                      ['Avg position', metrics.avg_position ?? '—'],
                      ['Citations', metrics.citations ?? '—'],
                      ['Readability', report.readability_score ?? '—'],
                      ['Browsing', browsing ?? '—'],
                      ['Knowledge', knowledge ?? '—'],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <strong>{value}</strong>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="kv">
                  {[
                    ['Contact', report.lead_name || '—'],
                    ['Email', report.lead_email || '—'],
                    ['Industry', report.industry || '—'],
                    ['Location', report.city_region || '—'],
                    ['Source', 'website'],
                    ['PDF', report.pdf_url ? 'Generated · stored in Supabase' : 'Not generated'],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <span>{k}</span>
                      {v}
                    </div>
                  ))}
                </div>
                <div className="h4">
                  <Swords className="lucide svg" /> Competitors
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Business</th>
                        <th>Mention rate</th>
                        <th>Avg pos</th>
                        <th>SoV</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comps.length === 0 && (
                        <tr style={{ cursor: 'default' }}>
                          <td colSpan={4} style={{ color: 'var(--text-3)' }}>
                            No competitor data yet
                          </td>
                        </tr>
                      )}
                      {comps.map((c) => (
                        <tr key={c.name} style={{ cursor: 'default', background: c.you ? '#F5F3FF' : undefined }}>
                          <td>
                            <strong>
                              {c.name}
                              {c.you ? ' (you)' : ''}
                            </strong>
                          </td>
                          <td>{c.mention_rate ?? '—'}%</td>
                          <td>{c.avg_position ?? '—'}</td>
                          <td>{c.share_of_voice ?? '—'}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={`tab ${tab === 'queries' ? 'active' : ''}`}>
                {(report.queries || []).length === 0 && <p className="empty">No query results stored for this report yet.</p>}
                {(report.queries || []).map((q, i) => (
                  <div className="qrow" key={q.id || i}>
                    <div className="q">
                      <span>{q.text}</span>
                      <span className={`badge ${q.mentioned ? 'completed' : 'failed'}`}>{q.mentioned ? 'mentioned' : 'absent'}</span>
                    </div>
                    <div className="meta">
                      {q.category && <span>{q.category}</span>}
                      {q.mode && <span>{q.mode}</span>}
                      {q.mentioned ? (
                        <span className="yes">position {q.position ?? '—'}</span>
                      ) : (
                        <span className="no">{(q.competitors || []).length ? (q.competitors || []).slice(0, 3).join(', ') : 'competitors named'}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className={`tab ${tab === 'readiness' ? 'active' : ''}`}>
                {checks.length === 0 && <p className="empty">No AI-readiness audit on this report.</p>}
                {checks.map((c) => {
                  const status = Array.isArray(c) ? c[0] : c.status;
                  const label = Array.isArray(c) ? c[1] : c.label;
                  const pts = Array.isArray(c) ? c[3] || c[2] : `${c.points_awarded ?? 0}/${c.points_max ?? 0}`;
                  return (
                    <div className={`ck ${status}`} key={label}>
                      <div className="ck-ic">{checkIcon(status)}</div>
                      <div>{label}</div>
                      <span>{pts}</span>
                    </div>
                  );
                })}
              </div>

              <div className={`tab ${tab === 'recs' ? 'active' : ''}`}>
                {(report.recommendations || []).length === 0 && <p className="empty">No recommendations yet.</p>}
                {(report.recommendations || []).map((r, i) => (
                  <div className="rec" key={r.title || i}>
                    <strong>
                      {i + 1}. {r.title}
                    </strong>
                    <p>{r.why || r.why_it_matters}</p>
                    <div className="t">
                      {r.impact && <span>{r.impact} impact</span>}
                      {r.effort && <span>{r.effort} effort</span>}
                      <span style={{ color: 'var(--indigo)' }}>{r.service || r.service_key}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`tab ${tab === 'usage' ? 'active' : ''}`}>
                <div className="cost">
                  {[
                    [`$${(report.cost || 0).toFixed(3)}`, 'Estimated cost'],
                    [tokens ? tokens.toLocaleString() : '—', 'Total tokens'],
                    [tokensIn ? tokensIn.toLocaleString() : '—', 'Input tokens'],
                    [tokensOut ? tokensOut.toLocaleString() : '—', 'Output tokens'],
                  ].map(([v, l]) => (
                    <div key={l}>
                      <strong>{v}</strong>
                      <span>{l}</span>
                    </div>
                  ))}
                </div>
                <div className="h4">
                  <CheckCircle2 className="lucide svg" /> Processing log
                </div>
                {STEPS.map((s, i) => {
                  const done = report.status === 'completed' || (stepIdx >= 0 && i < stepIdx);
                  const current = report.status !== 'completed' && (report.status === 'failed' ? i === 1 : i === stepIdx);
                  const failed = report.status === 'failed' && current;
                  const cls = failed ? 'fail' : done ? 'pass' : current ? 'partial' : '';
                  return (
                    <div className={`ck ${cls}`} key={s} style={{ opacity: !done && !current ? 0.45 : 1 }}>
                      <div className={`ck-ic ${!done && !current ? 'idle' : ''}`}>
                        {done ? <Check className="lucide" /> : failed ? <X className="lucide" /> : current ? <LoaderCircle className="lucide" /> : <Circle className="lucide" />}
                      </div>
                      <div className="mono" style={{ fontSize: 12 }}>
                        {s}
                      </div>
                      <span>{done || current ? ago(report.completed_at || report.created_at) : ''}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <div className="drawer-f">
          <button className="btn btn-danger btn-sm" type="button" onClick={remove} disabled={busy}>
            <Trash2 className="lucide" /> Delete
          </button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={copyLink} disabled={!report}>
            <Link2 className="lucide" /> Copy public link
          </button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={rerun} disabled={busy || !report}>
            <RotateCcw className="lucide" /> Re-run
          </button>
          <button className="btn btn-primary btn-sm" type="button" onClick={openPdf} disabled={!report || busy}>
            <FileDown className="lucide" /> {busy ? 'Preparing…' : 'PDF'}
          </button>
        </div>
      </div>
    </>
  );
}

