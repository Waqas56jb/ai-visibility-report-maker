import { Check, Minus, X } from 'lucide-react';

export default function ReadinessChecklist({ checks = [] }) {
  return (
    <div className="checklist">
      {checks.map((c) => (
        <div className={`check ${c[0]}`} key={c[1]}>
          <div className="ic">
            {c[0] === 'pass' ? <Check className="lucide svg" /> : c[0] === 'fail' ? <X className="lucide svg" /> : <Minus className="lucide svg" />}
          </div>
          <div>
            <strong>{c[1]}</strong>
            <span>{c[2]}</span>
          </div>
          <span className="pts">{c[3]}</span>
        </div>
      ))}
    </div>
  );
}
