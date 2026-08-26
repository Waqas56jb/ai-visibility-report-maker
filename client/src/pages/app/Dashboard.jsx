import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/index.js';
import ScoreGauge from '../../components/report/ScoreGauge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import Button from '../../components/ui/Button.jsx';

export default function Dashboard() {
  const [reports, setReports] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    Promise.all([api.listReports({ pageSize: 5, sort: 'newest' }), api.listBusinesses()])
      .then(([r, b]) => {
        if (!live) return;
        setReports(r);
        setBusinesses(b.items || []);
      })
      .catch((e) => live && setError(e.message));
    return () => {
      live = false;
    };
  }, []);

  if (error) return <p className="err">{error}</p>;
  if (!reports) return <Skeleton rows={6} />;

  const completed = (reports.items || []).filter((r) => r.status === 'completed' && r.overall_score != null);
  const latest = completed[0];
  const prev = completed[1];
  const delta = latest && prev ? latest.overall_score - prev.overall_score : null;

  if (!reports.total) {
    return (
      <EmptyState
        title="Run your first report"
        body="We will ask ChatGPT the questions your customers ask and show you whether it names you."
        action={
          <Link to="/app/new" className="btn btn-grad">
            Run new report
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="kpis-row">
        <ScoreGauge score={latest?.overall_score} band={latest?.score_band} />
        <div className="card kpi">
          <div className="l">Score change</div>
          <strong>{delta == null ? '—' : `${delta > 0 ? '+' : ''}${delta}`}</strong>
          <div className="s">vs previous completed report</div>
        </div>
        <div className="card kpi">
          <div className="l">Total reports</div>
          <strong>{reports.total}</strong>
        </div>
        <div className="card kpi">
          <div className="l">Businesses</div>
          <strong>{businesses.length}</strong>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <Link to="/app/new" className="btn btn-grad">
          Run new report
        </Link>
      </div>
      <div className="card panel">
        <h3>Last reports</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Business</th>
                <th>Status</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reports.items.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link to={`/app/reports/${r.id}`}>{r.business_name}</Link>
                  </td>
                  <td>{r.status}</td>
                  <td>{r.overall_score ?? '—'}</td>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
