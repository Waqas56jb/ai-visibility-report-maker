import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/index.js';
import ReportView from '../../components/report/ReportView.jsx';
import ProgressTracker from '../../components/report/ProgressTracker.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import Button from '../../components/ui/Button.jsx';
import { useToast } from '../../lib/toast.jsx';

export default function ReportDetail() {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [notes, setNotes] = useState('');
  const [past, setPast] = useState([]);
  const [compareId, setCompareId] = useState('');
  const [busy, setBusy] = useState('');

  async function load() {
    const r = await api.getReport(id);
    setReport(r);
    setNotes(r.notes || localStorage.getItem(`mf_notes_${id}`) || '');
    if (r.business_id) {
      const h = await api.getHistory({ business_id: r.business_id });
      setPast((h.items || []).filter((x) => x.id !== id));
    }
  }

  useEffect(() => {
    let timer;
    let live = true;
    async function tick() {
      try {
        const status = await api.getReportStatus(id);
        if (!live) return;
        if (status.status === 'completed' || status.status === 'failed') {
          await load();
        } else {
          setReport((prev) => ({ ...(prev || { id }), ...status }));
          timer = window.setTimeout(tick, 2000);
        }
      } catch (err) {
        if (live) toast(err.message);
      }
    }
    tick();
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!report) return <Skeleton rows={8} />;

  const running = report.status && report.status !== 'completed' && report.status !== 'failed';

  async function copyLink() {
    const url = `${window.location.origin}/report/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast('Public link copied');
    } catch {
      window.prompt('Copy this public link', url);
    }
  }

  async function downloadPdf() {
    setBusy('pdf');
    try {
      await api.downloadPdf(id, `MakeFlow-AI-Visibility-${(report.business_name || 'report').replace(/[^\w]+/g, '-')}.pdf`);
      toast('PDF downloaded');
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy('');
    }
  }

  async function rerun() {
    setBusy('rerun');
    try {
      const { reportId } = await api.rerunReport(id);
      toast('Re-run queued');
      navigate(`/app/reports/${reportId}`);
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy('');
    }
  }

  return (
    <>
      {running || report.status === 'failed' ? (
        <ProgressTracker
          step={report.progress_step}
          status={report.status}
          error={report.error}
          metrics={report.metrics}
          onRetry={async () => {
            const { reportId } = await api.rerunReport(id);
            navigate(`/app/reports/${reportId}`);
          }}
        />
      ) : (
        <>
          <div className="table-actions" style={{ marginBottom: 16 }}>
            <Button variant="ghost" className="btn-sm" onClick={copyLink}>
              Copy public link
            </Button>
            <Button variant="ghost" className="btn-sm" onClick={downloadPdf} disabled={busy === 'pdf'}>
              {busy === 'pdf' ? 'Preparing PDF…' : 'Download PDF'}
            </Button>
            <Button variant="ghost" className="btn-sm" onClick={rerun} disabled={busy === 'rerun'}>
              {busy === 'rerun' ? 'Queuing…' : 'Re-run report'}
            </Button>
            {past.length > 0 && (
              <select value={compareId} onChange={(e) => setCompareId(e.target.value)}>
                <option value="">Compare with previous</option>
                {past.map((p) => (
                  <option key={p.id} value={p.id}>
                    {new Date(p.created_at).toLocaleDateString()} · {p.overall_score}
                  </option>
                ))}
              </select>
            )}
          </div>
          {compareId && (
            <p className="muted" style={{ marginBottom: 12 }}>
              Comparing with {past.find((p) => p.id === compareId)?.overall_score} from a previous run.
            </p>
          )}
          <ReportView report={report} />
          <div className="card panel" style={{ marginTop: 20 }}>
            <h3>Notes</h3>
            <textarea
              rows={5}
              style={{ width: '100%', border: '1px solid var(--line-2)', borderRadius: 12, padding: 12 }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => {
                localStorage.setItem(`mf_notes_${id}`, notes);
                api.updateReport(id, { notes }).catch(() => {});
              }}
            />
          </div>
        </>
      )}
    </>
  );
}
