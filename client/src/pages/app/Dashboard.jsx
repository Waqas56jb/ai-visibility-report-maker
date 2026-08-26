import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, FileBarChart, Gauge, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import api from '../../api/index.js';
import ScoreGauge from '../../components/report/ScoreGauge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';

function Status({ value }) {
  const cls = value === 'completed' ? 'completed' : value === 'failed' ? 'failed' : 'queued';
  return <span className={`dash-status ${cls}`}>{value}</span>;
}

export default function Dashboard() {
  const [reports, setReports] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    Promise.all([api.listReports({ pageSize: 8, sort: 'newest' }), api.listBusinesses()])
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

  const items = reports.items || [];
  const completed = items.filter((r) => r.status === 'completed' && r.overall_score != null);
  const latest = completed[0];
  const prev = completed[1];
  const delta = latest && prev ? latest.overall_score - prev.overall_score : null;
  const maxScore = Math.max(1, ...completed.map((r) => r.overall_score || 0));

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
    <div className="dash">
      <div className="dash-intro">
        <div>
          <span className="eyebrow">Overview</span>
          <h2>Your AI visibility at a glance</h2>
          <p className="muted">Scores, businesses and the latest ChatGPT tests — all in one place.</p>
        </div>
        <Link to="/app/new" className="btn btn-grad">
          <Sparkles className="lucide svg" /> Run new report
        </Link>
      </div>

      <div className="dash-hero">
        <div className="dash-latest card">
          <div className="dash-latest-copy">
            <span className="eyebrow">Latest completed report</span>
            <h3>{latest?.business_name || 'Waiting on a completed run'}</h3>
            {latest ? (
              <>
                <p className="muted">{String(latest.website || '').replace(/^https?:\/\//, '')}</p>
                <div className="analysis-chips">
                  {latest.score_band && <span>{latest.score_band}</span>}
                  {latest.metrics?.mention_rate != null && <span>Mention {latest.metrics.mention_rate}%</span>}
                  {latest.readability_score != null && <span>Readiness {latest.readability_score}/100</span>}
                  <span>{new Date(latest.created_at).toLocaleDateString('en-AU')}</span>
                </div>
                <Link to={`/app/reports/${latest.id}`} className="btn btn-primary btn-sm">
                  Open analysis <ArrowRight className="lucide svg" />
                </Link>
              </>
            ) : (
              <p className="muted">A report is still running. The score and PDF appear here when ChatGPT finishes answering.</p>
            )}
          </div>
          {latest && <ScoreGauge score={latest.overall_score} band={latest.score_band} />}
        </div>
        <div className="dash-stats">
          <div className="card kpi">
            <div className="l">
              <TrendingUp className="lucide svg" /> Score change
            </div>
            <strong>
              {delta == null ? '—' : `${delta > 0 ? '+' : ''}${delta}`}
            </strong>
            <div className="s">vs previous completed report</div>
          </div>
          <div className="card kpi">
            <div className="l">
              <FileBarChart className="lucide svg" /> Reports
            </div>
            <strong>{reports.total}</strong>
            <div className="s">{items.filter((r) => r.status === 'processing' || r.status === 'queued').length} running</div>
          </div>
          <div className="card kpi">
            <div className="l">
              <Building2 className="lucide svg" /> Businesses
            </div>
            <strong>{businesses.length}</strong>
            <div className="s">saved profiles</div>
          </div>
          <div className="card kpi">
            <div className="l">
              <Gauge className="lucide svg" /> Avg score
            </div>
            <strong>
              {completed.length ? Math.round(completed.reduce((s, r) => s + r.overall_score, 0) / completed.length) : '—'}
            </strong>
            <div className="s">across completed runs</div>
          </div>
        </div>
      </div>

      {completed.length >= 1 && (
        <div className="card panel" style={{ marginBottom: 20 }}>
          <h3>Score history</h3>
          <p className="desc">Completed reports, newest first.</p>
          <div className="dash-chart">
            {completed.slice(0, 8).reverse().map((r) => (
              <Link to={`/app/reports/${r.id}`} className="dash-col" key={r.id} title={r.business_name}>
                <i style={{ height: `${(r.overall_score / maxScore) * 100}%` }} />
                <span>{r.overall_score}</span>
                <em>{new Date(r.created_at).toLocaleDateString('en-AU', { day: '2-digit', month: 'short' })}</em>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="card panel">
        <div className="panel-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Recent reports</h3>
          <Link to="/app/reports" className="btn btn-ghost btn-sm">
            View all <ArrowRight className="lucide svg" />
          </Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Business</th>
                <th>Status</th>
                <th>Score</th>
                <th>Date</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.business_name}</strong>
                    <div className="muted" style={{ fontSize: 12 }}>{String(r.website || '').replace(/^https?:\/\//, '')}</div>
                  </td>
                  <td>
                    <Status value={r.status} />
                  </td>
                  <td>
                    <strong>{r.overall_score ?? '—'}</strong>
                    {delta != null && r.id === latest?.id && (
                      <span className={`dash-delta ${delta >= 0 ? 'up' : 'dn'}`}>
                        {delta >= 0 ? <TrendingUp className="lucide svg" /> : <TrendingDown className="lucide svg" />}
                        {delta > 0 ? '+' : ''}
                        {delta}
                      </span>
                    )}
                  </td>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                  <td>
                    <Link to={`/app/reports/${r.id}`} className="btn btn-ghost btn-sm">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
