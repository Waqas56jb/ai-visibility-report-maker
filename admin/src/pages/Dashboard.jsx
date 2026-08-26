import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Clock,
  Coins,
  Download,
  FileBarChart,
  FileCheck,
  Gauge,
  Info,
  PieChart,
  Settings2,
  TrendingDown,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import { api } from '../api.js';
import { ago } from '../lib.js';
import { ScorePill, StatusBadge } from '../components/Badges.jsx';
import { useAdmin } from '../admin-context.js';

const ICONS = {
  'file-check': FileCheck,
  'user-plus': UserPlus,
  'alert-triangle': AlertTriangle,
  download: Download,
  'settings-2': Settings2,
  'file-bar-chart': FileBarChart,
};

const BAND_COLORS = ['#F0625A', '#F5B84B', '#06B6D4', '#22C55E', '#4F46E5'];

export default function Dashboard() {
  const { refreshKey, openReport } = useAdmin();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [anim, setAnim] = useState(false);

  useEffect(() => {
    setError('');
    api
      .stats()
      .then((d) => {
        setStats(d);
        setAnim(false);
        requestAnimationFrame(() => setAnim(true));
      })
      .catch((e) => setError(e.message));
  }, [refreshKey]);

  if (error) return <p className="err">{error}</p>;
  if (!stats) return <p className="loading">Loading dashboard…</p>;

  const maxDay = Math.max(1, ...(stats.per_day || []).map((d) => d.count));
  const bandTotal = (stats.bands || []).reduce((s, b) => s + b.count, 0) || 1;
  const delta = stats.reports_delta || 0;

  return (
    <>
      <div className="stats">
        <div className="card stat">
          <div className="l">
            <FileBarChart className="lucide svg" /> Reports (30 days)
          </div>
          <strong>{stats.reports_30d}</strong>
          <div className={`d ${delta >= 0 ? 'up' : 'dn'}`}>
            {delta >= 0 ? <TrendingUp className="lucide svg" /> : <TrendingDown className="lucide svg" />}
            {delta >= 0 ? '+' : ''}
            {delta}% vs previous
          </div>
        </div>
        <div className="card stat">
          <div className="l">
            <UserPlus className="lucide svg" /> New leads
          </div>
          <strong>{stats.leads_30d}</strong>
          <div className="d up">
            <TrendingUp className="lucide svg" /> {stats.capture_rate}% capture rate
          </div>
        </div>
        <div className="card stat">
          <div className="l">
            <Gauge className="lucide svg" /> Avg visibility score
          </div>
          <strong>{stats.avg_score}</strong>
          <div className={`d ${stats.avg_score < 40 ? 'dn' : 'up'}`}>
            {stats.avg_score < 40 ? <TrendingDown className="lucide svg" /> : <TrendingUp className="lucide svg" />}
            {stats.avg_score < 40 ? 'Most leads score under 40' : 'Leads trending up'}
          </div>
        </div>
        <div className="card stat">
          <div className="l">
            <Coins className="lucide svg" /> OpenAI spend
          </div>
          <strong>${stats.openai_spend}</strong>
          <div className="d">
            <Info className="lucide svg" /> ~${stats.avg_cost} avg per report
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="card panel">
          <div className="panel-h">
            <div>
              <h3>
                <BarChart3 className="lucide svg" /> Reports per day
              </h3>
              <p>Last 14 days</p>
            </div>
          </div>
          <div className="chart">
            {(stats.per_day || []).map((d) => (
              <div className="col" key={d.date}>
                <i style={{ height: anim ? `${(d.count / maxDay) * 100}%` : 0 }} />
                <span>{d.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card panel">
          <div className="panel-h">
            <div>
              <h3>
                <PieChart className="lucide svg" /> Score bands
              </h3>
              <p>Where your leads land</p>
            </div>
          </div>
          <div className="dist">
            {(stats.bands || []).map((b, i) => (
              <div key={b.label}>
                <span>{b.label}</span>
                <div className="t">
                  <i style={{ width: anim ? `${(b.count / bandTotal) * 100}%` : 0, background: BAND_COLORS[i] }} />
                </div>
                <span className="v">{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="card panel">
          <div className="panel-h">
            <div>
              <h3>
                <Clock className="lucide svg" /> Latest reports
              </h3>
            </div>
            <Link to="/reports" className="btn btn-ghost btn-sm">
              View all <ArrowRight className="lucide" />
            </Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {(stats.recent || []).map((r) => (
                  <tr key={r.id} onClick={() => openReport(r.id)}>
                    <td>
                      <div className="biz">
                        <strong>{r.business_name}</strong>
                        <span>{r.website}</span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge report={r} />
                    </td>
                    <td>
                      <ScorePill score={r.overall_score} />
                    </td>
                    <td className="mono" style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      {ago(r.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card panel">
          <div className="panel-h">
            <div>
              <h3>
                <Activity className="lucide svg" /> Activity
              </h3>
            </div>
          </div>
          <div className="activity">
            {(stats.activity || []).map((a, i) => {
              const Icon = ICONS[a.icon] || FileBarChart;
              return (
                <div className="act" key={`${a.title}-${i}`}>
                  <div className="ic">
                    <Icon className="lucide svg" />
                  </div>
                  <div>
                    <strong>{a.title}</strong>
                    <span>{a.detail}</span>
                  </div>
                  <time>{ago(a.at)}</time>
                </div>
              );
            })}
            {!stats.activity?.length && <p className="empty">No activity yet.</p>}
          </div>
        </div>
      </div>
    </>
  );
}
