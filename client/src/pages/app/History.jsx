import { useEffect, useMemo, useState } from 'react';
import api from '../../api/index.js';
import Select from '../../components/ui/Select.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

function metricValue(r, metric) {
  if (metric === 'readability') return r.readability_score;
  if (metric === 'mention') return r.metrics?.mention_rate;
  if (metric === 'browsing') return r.score_by_mode?.[0]?.value;
  return r.overall_score;
}

export default function History() {
  const [businesses, setBusinesses] = useState([]);
  const [businessId, setBusinessId] = useState('');
  const [range, setRange] = useState('all');
  const [metric, setMetric] = useState('overall');
  const [items, setItems] = useState(null);

  useEffect(() => {
    api.listBusinesses().then((d) => {
      setBusinesses(d.items || []);
      if (d.items?.[0]) setBusinessId(d.items[0].id);
    });
  }, []);

  useEffect(() => {
    api.getHistory({ business_id: businessId || undefined }).then((d) => setItems(d.items || []));
  }, [businessId]);

  const filtered = useMemo(() => {
    if (!items) return [];
    const now = Date.now();
    const days = range === '30' ? 30 : range === '90' ? 90 : range === '365' ? 365 : null;
    return items.filter((r) => {
      if (!days) return true;
      return now - new Date(r.created_at).getTime() <= days * 86400000;
    });
  }, [items, range]);

  if (!items) return <Skeleton />;
  if (!filtered.length) return <EmptyState title="No history yet" body="Completed reports will plot here." />;

  const values = filtered.map((r) => metricValue(r, metric) || 0);
  const max = Math.max(100, ...values);
  const pts = values
    .map((v, i) => {
      const x = (i / Math.max(1, values.length - 1)) * 100;
      const y = 100 - (v / max) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <>
      <div className="filters">
        <Select value={businessId} onChange={(e) => setBusinessId(e.target.value)}>
          <option value="">All businesses</option>
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
        <select value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last 365 days</option>
          <option value="all">All time</option>
        </select>
        <select value={metric} onChange={(e) => setMetric(e.target.value)}>
          <option value="overall">Overall</option>
          <option value="readability">Readability</option>
          <option value="mention">Mention rate</option>
          <option value="browsing">Browsing mode</option>
        </select>
      </div>
      <div className="chart">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="180">
          <defs>
            <linearGradient id="histFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7287FA" stopOpacity="0.35" />
              <stop offset="1" stopColor="#5B6EF0" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <polygon fill="url(#histFill)" points={`0,100 ${pts} 100,100`} />
          <polyline fill="none" stroke="#7287FA" strokeWidth="1.8" points={pts} />
        </svg>
      </div>
      <div className="card panel" style={{ marginTop: 16 }}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Score</th>
              <th>Band</th>
              <th>Delta</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const prev = filtered[i - 1];
              const delta = prev && r.overall_score != null ? r.overall_score - prev.overall_score : null;
              return (
                <tr key={r.id}>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>{r.overall_score ?? '—'}</td>
                  <td>{r.score_band || '—'}</td>
                  <td>{delta == null ? '—' : `${delta > 0 ? '+' : ''}${delta}`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
