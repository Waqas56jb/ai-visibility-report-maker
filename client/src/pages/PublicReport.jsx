import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/index.js';
import Navbar from '../components/Navbar.jsx';
import ReportView from '../components/report/ReportView.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import Button from '../components/ui/Button.jsx';
import { useToast } from '../lib/toast.jsx';

export default function PublicReport() {
  const { id } = useParams();
  const toast = useToast();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getPublicReport(id).then(setReport).catch((e) => setError(e.message));
  }, [id]);

  async function copyLink() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast('Public link copied');
    } catch {
      window.prompt('Copy this public link', url);
    }
  }

  async function downloadPdf() {
    setBusy(true);
    try {
      await api.downloadPublicPdf(id, `MakeFlow-AI-Visibility-${(report.business_name || 'report').replace(/[^\w]+/g, '-')}.pdf`);
      toast('PDF downloaded');
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Navbar variant="report" />
      <div className="report">
        <div className="wrap">
          {error && <p className="err">{error}</p>}
          {!report && !error && <Skeleton rows={8} />}
          {report && (
            <>
              <div className="table-actions" style={{ marginBottom: 16 }}>
                <Button variant="ghost" className="btn-sm" onClick={copyLink}>
                  Copy public link
                </Button>
                <Button variant="ghost" className="btn-sm" onClick={downloadPdf} disabled={busy}>
                  {busy ? 'Preparing PDF…' : 'Download PDF'}
                </Button>
              </div>
              <ReportView report={report} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
