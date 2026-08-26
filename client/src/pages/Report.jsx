import { useEffect } from 'react';
import { FileDown, Link as LinkIcon } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import ReportView from '../components/report/ReportView.jsx';
import { sampleReport } from '../lib/reportData.js';
import { useToast } from '../lib/toast.jsx';

export default function Report() {
  const toast = useToast();

  useEffect(() => {
    document.title = `${sampleReport.business_name} — AI Visibility Report`;
  }, []);

  return (
    <>
      <Navbar variant="report" />
      <div className="report">
        <div className="wrap">
          <div className="table-actions" style={{ marginBottom: 16 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => toast('Sample report — sign in to copy a live public link')}>
              <LinkIcon className="lucide svg" /> Copy link
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => toast('Sample report — run a live report to download the branded PDF')}>
              <FileDown className="lucide svg" /> Download PDF
            </button>
          </div>
          <ReportView report={sampleReport} />
        </div>
      </div>
    </>
  );
}
