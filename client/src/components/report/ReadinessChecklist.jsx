import { Check, Minus, X } from 'lucide-react';

function asCheck(raw) {
  if (Array.isArray(raw)) {
    return { status: raw[0], label: raw[1], evidence: raw[2], points: raw[3] };
  }
  return {
    status: raw.status,
    label: raw.label,
    evidence: raw.evidence,
    points: raw.points || `${raw.points_awarded ?? 0}/${raw.points_max ?? 0}`,
  };
}

export default function ReadinessChecklist({ checks = [] }) {
  if (!checks.length) return <p className="muted">No website audit stored for this report.</p>;
  return (
    <div className="checklist">
      {checks.map((raw) => {
        const c = asCheck(raw);
        return (
          <div className={`check ${c.status}`} key={c.label}>
            <div className="ic">
              {c.status === 'pass' ? <Check className="lucide svg" /> : c.status === 'fail' ? <X className="lucide svg" /> : <Minus className="lucide svg" />}
            </div>
            <div>
              <strong>{c.label}</strong>
              {c.evidence && <span>{c.evidence}</span>}
            </div>
            <span className="pts">{c.points}</span>
          </div>
        );
      })}
    </div>
  );
}
