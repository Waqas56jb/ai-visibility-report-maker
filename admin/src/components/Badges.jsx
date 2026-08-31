import { badgeClass, badgeLabel, scoreClass } from '../lib.js';

export function StatusBadge({ report }) {
  return (
    <span className={`badge ${badgeClass(report)}`}>
      <i className="dot" />
      {badgeLabel(report)}
    </span>
  );
}

export function ScorePill({ score }) {
  if (score == null || score === '') return <span style={{ color: 'var(--text-3)' }}>-</span>;
  return <span className={`score-pill ${scoreClass(score)}`}>{score}</span>;
}
