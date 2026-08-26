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
  MapPin,
  PieChart,
  Settings2,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
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
const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'reports', label: 'Reports' },
  { id: 'audience', label: 'Audience' },
  { id: 'spend', label: 'Spend' },
];

function Bars({ rows, valueKey = 'count', anim }) {
  const max = Math.max(1, ...rows.map((d) => Number(d[valueKey]) || 0));
  return (
    <div className="chart">
      {rows.map((d) => (
        <div className="col" key={d.date}>
          <i style={{ height: anim ? `${((Number(d[valueKey]) || 0) / max) * 100}%` : 0 }} />
          <span>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function RankList({ items, empty }) {
  const max = Math.max(1, ...(items || []).map((i) => i.count));
  if (!items?.length) return <p className="empty">{empty}</p>;
  return (
    <div className="dist">
      {items.map((b) => (
        <div key={b.label}>
          <span>{b.label}</span>
          <div className="t">
            <i style={{ width: `${(b.count / max) * 100}%`, background: 'var(--indigo)' }} />
          </div>
          <span className="v">{b.count}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { refreshKey, openReport } = useAdmin();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [anim, setAnim] = useState(false);
  const [tab, setTab] = useState('overview');

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

  const bandTotal = (stats.bands || []).reduce((s, b) => s + b.count, 0) || 1;
  const delta = stats.reports_delta || 0;
  const days = stats.per_day || [];

  return (
    <>
      <div className="tabs page-tabs">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
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
                <Users className="lucide svg" /> Accounts
              </div>
              <strong>{stats.users_total || 0}</strong>
              <div className={`d ${(stats.users_delta || 0) >= 0 ? 'up' : 'dn'}`}>
                {(stats.users_delta || 0) >= 0 ? <TrendingUp className="lucide svg" /> : <TrendingDown className="lucide svg" />}
                {stats.users_30d || 0} new this month
              </div>
            </div>
            <div className="card stat">
              <div className="l">
                <Gauge className="lucide svg" /> Avg visibility score
              </div>
              <strong>{stats.avg_score}</strong>
              <div className={`d ${stats.avg_score < 40 ? 'dn' : 'up'}`}>
                {stats.avg_score < 40 ? <TrendingDown className="lucide svg" /> : <TrendingUp className="lucide svg" />}
                {stats.completion_rate || 0}% reports complete
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
                  <p>Last 14 days · live pipeline volume</p>
                </div>
              </div>
              <Bars rows={days} anim={anim} />
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
      )}

      {tab === 'reports' && (
        <>
          <div className="stats">
            <div className="card stat">
              <div className="l">Completed (30d)</div>
              <strong>{stats.completed_30d || 0}</strong>
              <div className="d up">{stats.completion_rate || 0}% completion</div>
            </div>
            <div className="card stat">
              <div className="l">Failed (30d)</div>
              <strong>{stats.failed_30d || 0}</strong>
              <div className="d dn">Needs a look</div>
            </div>
            <div className="card stat">
              <div className="l">In progress</div>
              <strong>{stats.in_progress || 0}</strong>
              <div className="d">Live queue</div>
            </div>
            <div className="card stat">
              <div className="l">All-time reports</div>
              <strong>{stats.reports_total}</strong>
              <div className="d">{stats.leads_total} leads captured</div>
            </div>
          </div>
          <div className="grid">
            <div className="card panel">
              <div className="panel-h">
                <div>
                  <h3>
                    <PieChart className="lucide svg" /> Score bands
                  </h3>
                  <p>Where completed reports land</p>
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
            <div className="card panel">
              <div className="panel-h">
                <div>
                  <h3>Status mix</h3>
                  <p>All stored reports</p>
                </div>
              </div>
              <RankList items={stats.status_counts} empty="No reports yet." />
            </div>
          </div>
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
        </>
      )}

      {tab === 'audience' && (
        <>
          <div className="stats">
            <div className="card stat">
              <div className="l">Users</div>
              <strong>{stats.users_total || 0}</strong>
              <div className="d">{stats.admins || 0} admins</div>
            </div>
            <div className="card stat">
              <div className="l">New this month</div>
              <strong>{stats.users_30d || 0}</strong>
              <div className={`d ${(stats.users_delta || 0) >= 0 ? 'up' : 'dn'}`}>
                {stats.users_delta || 0}% vs previous
              </div>
            </div>
            <div className="card stat">
              <div className="l">Blocked</div>
              <strong>{stats.blocked_users || 0}</strong>
              <div className="d">Cannot sign in</div>
            </div>
            <div className="card stat">
              <div className="l">Leads (30d)</div>
              <strong>{stats.leads_30d}</strong>
              <div className="d up">{stats.capture_rate}% capture</div>
            </div>
          </div>
          <div className="grid">
            <div className="card panel">
              <div className="panel-h">
                <div>
                  <h3>
                    <MapPin className="lucide svg" /> Top cities
                  </h3>
                  <p>From reports in the last 30 days</p>
                </div>
              </div>
              <RankList items={stats.cities} empty="No location data yet." />
            </div>
            <div className="card panel">
              <div className="panel-h">
                <div>
                  <h3>Industries</h3>
                  <p>Where demand is clustering</p>
                </div>
              </div>
              <RankList items={stats.industries} empty="No industry data yet." />
            </div>
          </div>
          <div className="card panel">
            <div className="panel-h">
              <div>
                <h3>New users / day</h3>
                <p>Last 14 days</p>
              </div>
              <Link to="/users" className="btn btn-ghost btn-sm">
                Manage users <ArrowRight className="lucide" />
              </Link>
            </div>
            <Bars rows={days} valueKey="users" anim={anim} />
          </div>
        </>
      )}

      {tab === 'spend' && (
        <>
          <div className="stats">
            <div className="card stat">
              <div className="l">
                <Coins className="lucide svg" /> OpenAI spend (30d)
              </div>
              <strong>${stats.openai_spend}</strong>
              <div className="d">
                <Info className="lucide svg" /> ~${stats.avg_cost} avg per report
              </div>
            </div>
            <div className="card stat">
              <div className="l">Reports billed</div>
              <strong>{stats.reports_30d}</strong>
              <div className="d">Includes failed runs</div>
            </div>
            <div className="card stat">
              <div className="l">Completed</div>
              <strong>{stats.completed_30d || 0}</strong>
              <div className="d up">{stats.completion_rate || 0}% success</div>
            </div>
            <div className="card stat">
              <div className="l">Failed</div>
              <strong>{stats.failed_30d || 0}</strong>
              <div className="d dn">Still consume tokens</div>
            </div>
          </div>
          <div className="card panel">
            <div className="panel-h">
              <div>
                <h3>Daily spend</h3>
                <p>Estimated from token usage · last 14 days</p>
              </div>
            </div>
            <Bars rows={days} valueKey="spend" anim={anim} />
          </div>
        </>
      )}
    </>
  );
}
