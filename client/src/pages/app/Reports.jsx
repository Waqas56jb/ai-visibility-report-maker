import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/index.js';
import Modal from '../../components/ui/Modal.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Button from '../../components/ui/Button.jsx';
import { useToast } from '../../lib/toast.jsx';

export default function Reports() {
  const toast = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [params, setParams] = useState({ search: '', status: 'all', band: 'all', sort: 'newest', page: 1, pageSize: 10 });
  const [del, setDel] = useState(null);

  function load(next = params) {
    api.listReports(next).then(setData).catch((e) => toast(e.message));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.status, params.band, params.sort, params.page]);

  if (!data) return <Skeleton rows={8} />;

  return (
    <>
      <div className="filters">
        <input
          placeholder="Search business or website"
          value={params.search}
          onChange={(e) => setParams((p) => ({ ...p, search: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && load({ ...params, page: 1 })}
        />
        <select value={params.status} onChange={(e) => setParams((p) => ({ ...p, status: e.target.value, page: 1 }))}>
          <option value="all">All statuses</option>
          <option value="queued">Queued</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        <select value={params.band} onChange={(e) => setParams((p) => ({ ...p, band: e.target.value, page: 1 }))}>
          <option value="all">All bands</option>
          <option>Invisible</option>
          <option>Barely visible</option>
          <option>Getting there</option>
          <option>Visible</option>
          <option>Leading</option>
        </select>
        <select value={params.sort} onChange={(e) => setParams((p) => ({ ...p, sort: e.target.value }))}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="highest">Highest score</option>
          <option value="lowest">Lowest score</option>
        </select>
      </div>
      {!data.items.length ? (
        <EmptyState title="No reports yet" body="Run a report to see it here." />
      ) : (
        <div className="card panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Status</th>
                  <th>Band</th>
                  <th>Score</th>
                  <th>Date</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.items.map((r) => (
                  <tr key={r.id} className="row-clickable" onClick={() => navigate(`/app/reports/${r.id}`)}>
                    <td>
                      <strong>{r.business_name}</strong>
                      <div className="muted">{r.website}</div>
                    </td>
                    <td><span className={`dash-status ${r.status === 'completed' ? 'completed' : r.status === 'failed' ? 'failed' : 'queued'}`}>{r.status}</span></td>
                    <td>{r.score_band || '-'}</td>
                    <td>{r.overall_score ?? '-'}</td>
                    <td>{new Date(r.created_at).toLocaleString()}</td>
                    <td className="table-actions" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" className="btn-sm" onClick={() => navigate(`/app/reports/${r.id}`)}>
                        Open
                      </Button>
                      <Button
                        variant="ghost"
                        className="btn-sm"
                        onClick={async () => {
                          try {
                            await api.downloadPdf(r.id, `MakeFlow-AI-Visibility-${(r.business_name || 'report').replace(/[^\w]+/g, '-')}.pdf`);
                            toast('PDF downloaded');
                          } catch (err) {
                            toast(err.message);
                          }
                        }}
                      >
                        PDF
                      </Button>
                      <Button
                        variant="ghost"
                        className="btn-sm"
                        onClick={async () => {
                          try {
                            const { reportId } = await api.rerunReport(r.id);
                            toast('Re-run queued');
                            navigate(`/app/reports/${reportId}`);
                          } catch (err) {
                            toast(err.message);
                          }
                        }}
                      >
                        Re-run
                      </Button>
                      <Button variant="ghost" className="btn-sm" onClick={() => setDel(r)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pager">
            <Button variant="ghost" className="btn-sm" disabled={params.page <= 1} onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))}>
              Prev
            </Button>
            <Button
              variant="ghost"
              className="btn-sm"
              disabled={params.page * params.pageSize >= data.total}
              onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      <Modal open={Boolean(del)} title="Delete report?" onClose={() => setDel(null)}>
        <p className="muted">This cannot be undone.</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Button
            variant="primary"
            onClick={async () => {
              try {
                await api.deleteReport(del.id);
                setDel(null);
                load();
              } catch (err) {
                toast(err.message);
              }
            }}
          >
            Delete
          </Button>
          <Button variant="ghost" onClick={() => setDel(null)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
}
