export default function KpiCard({ label, value, hint, width }) {
  return (
    <div className="card kpi">
      <div className="l">{label}</div>
      <strong>{value}</strong>
      {hint && <div className="s">{hint}</div>}
      {width != null && (
        <div className="bar">
          <i style={{ width: `${Math.max(0, Math.min(100, width))}%` }} />
        </div>
      )}
    </div>
  );
}
