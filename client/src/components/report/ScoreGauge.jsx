import { useId } from 'react';
import { bandOf } from '../../api/generate.js';

export default function ScoreGauge({ score, band }) {
  const rawId = useId().replace(/:/g, '');
  const gid = `gauge-${rawId}`;
  const n = score == null || score === '' ? null : Number(score);
  const label = band || (n == null ? '—' : bandOf(n));
  const offset = 628 - (628 * (n || 0)) / 100;
  const bandClass = n == null ? '' : n <= 20 ? 'b1' : n <= 40 ? 'b2' : n <= 60 ? 'b3' : 'b4';
  return (
    <div className="card gauge-card">
      <div className="gauge">
        <svg viewBox="0 0 230 230">
          <defs>
            <linearGradient id={gid} x1="0" x2="1">
              <stop offset="0" stopColor="#7287FA" />
              <stop offset="1" stopColor="#5B6EF0" />
            </linearGradient>
          </defs>
          <circle className="track" cx="115" cy="115" r="100" />
          <circle className="val" cx="115" cy="115" r="100" style={{ stroke: `url(#${gid})`, strokeDashoffset: offset }} />
        </svg>
        <div className="num">
          <div>
            <strong>{n ?? '—'}</strong>
            <span>overall AI visibility</span>
          </div>
        </div>
      </div>
      <span className={`band ${bandClass}`}>{label}</span>
    </div>
  );
}
