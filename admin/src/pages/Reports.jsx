import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, SearchX } from 'lucide-react';
import { api } from '../api.js';
import { downloadCsv, fmtDate } from '../lib.js';
import { ScorePill, StatusBadge } from '../components/Badges.jsx';
import { useAdmin } from '../admin-context.js';
import { useToast } from '../toast.jsx';

const PER = 8;

export default function Reports() {
  const { search, refreshKey, openReport } = useAdmin();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [band, setBand] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [search, status, band]);

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .reports({ search, status, band })
      .then((d) => setItems(d.items || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [search, status, band, refreshKey]);

  const pages = Math.max(1, Math.ceil(items.length / PER));
  const safePage = Math.min(page, pages);
  const rows = items.slice((safePage - 1) * PER, safePage * PER);

  function exportRows() {
    downloadCsv('reports.csv', [
      ['id', 'business_name', 'website', 'status', 'overall_score', 'score_band', 'readability_score', 'queries', 'estimated_cost', 'created_at'],
      ...items.map((r) => [
        r.id,
        r.business_name,
        r.website,
        r.status,
        r.overall_score ?? '',
        r.score_band || '',
        r.readability_score ?? '',
        r.query_count ?? '',
        (r.cost ?? 0).toFixed(3),
        r.created_at,
      ]),
    ]);
    toast('reports.csv downloaded');
  }

  return (
    <div className="card panel">
      <div className="toolbar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="completed">completed</option>
          <option value="processing">processing</option>
          <option value="queued">queued</option>
          <option value="failed">failed</option>
        </select>
        <select value={band} onChange={(e) => setBand(e.target.value)}>
          <option value="">All bands</option>
          <option>Invisible</option>
          <option>Barely visible</option>
          <option>Getting there</option>
          <option>Visible</option>
          <option>Leading</option>
        </select>
        <div className="sp" />
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{items.length} reports</span>
        <button className="btn btn-ghost btn-sm" type="button" onClick={exportRows}>
          <Download className="lucide" /> Export
        </button>
      </div>
      {error && <p className="err">{error}</p>}
      {loading && <p className="loading">Loading reports…</p>}
      {!loading && (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Lead</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Readability</th>
                  <th>Queries</th>
                  <th>Cost</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} onClick={() => openReport(r.id)}>
                    <td>
                      <div className="biz">
                        <strong>{r.business_name}</strong>
                        <span>{r.website}</span>
                      </div>
                    </td>
                    <td>
                      <div className="lead">
                        <strong>{r.lead_name || '—'}</strong>
                        <span>{r.lead_email}</span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge report={r} />
                    </td>
                    <td>
                      <ScorePill score={r.overall_score} />
                    </td>
                    <td>{r.readability_score ?? '—'}</td>
                    <td className="mono" style={{ fontSize: 12 }}>
                      {r.query_count || '—'}
                    </td>
                    <td className="mono" style={{ fontSize: 12 }}>
                      ${(r.cost || 0).toFixed(2)}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-2)' }}>{fmtDate(r.created_at)}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-icon"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openReport(r.id);
                        }}
                      >
                        <ChevronRight className="lucide" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!items.length && (
            <div className="empty">
              <SearchX className="lucide svg" />
              <h4>No reports match</h4>
              <p>Try clearing the filters or search.</p>
            </div>
          )}
          <div className="pager">
            <span>
              Page {safePage} of {pages}
            </span>
            <div>
              <button className="btn btn-ghost btn-sm" type="button" disabled={safePage === 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="lucide" />
              </button>
              <button className="btn btn-ghost btn-sm" type="button" disabled={safePage === pages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="lucide" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
