import { Link } from 'react-router-dom';
import { AlertTriangle, ClipboardCheck, Eye, FileDown, Gauge, Table } from 'lucide-react';
import Reveal from './Reveal.jsx';

const CHIPS = [
  { icon: Gauge, label: 'Score by mode & category' },
  { icon: Table, label: 'Competitor share of voice' },
  { icon: AlertTriangle, label: 'Gap list with evidence' },
  { icon: ClipboardCheck, label: 'AI-readiness checklist' },
  { icon: FileDown, label: 'Branded PDF' },
];

export default function Preview() {
  return (
    <section className="section preview">
      <div className="wrap">
        <Reveal className="section-head center">
          <span className="eyebrow">The report</span>
          <h2>Proof, not opinions</h2>
          <p>
            Every finding links back to a real question and a real answer. You'll see the exact
            wording ChatGPT used — and who it recommended instead of you.
          </p>
        </Reveal>
        <Reveal delay="d1" className="preview-shot">
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1800&q=80"
            alt="Report dashboard preview"
          />
        </Reveal>
        <Reveal delay="d2" className="chips">
          {CHIPS.map((c) => {
            const Icon = c.icon;
            return (
              <span className="chip" key={c.label}>
                <Icon className="lucide svg" /> {c.label}
              </span>
            );
          })}
        </Reveal>
        <Reveal delay="d3" style={{ textAlign: 'center', marginTop: 34 }}>
          <div style={{ textAlign: 'center', marginTop: 34 }}>
            <Link to="/report" className="btn btn-primary">
              <Eye className="lucide svg" /> Open the sample report
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
