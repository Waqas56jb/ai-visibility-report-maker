import { Link } from 'react-router-dom';
import { AlertTriangle, ClipboardCheck, Eye, FileDown, Gauge, Table } from 'lucide-react';
import Reveal from './Reveal.jsx';

const CHIPS = [
  { icon: Gauge, label: 'Score by mode & category' },
  { icon: Table, label: 'Competitor share of voice' },
  { icon: AlertTriangle, label: 'Gap list with evidence' },
  { icon: ClipboardCheck, label: 'AI-readiness checklist' },
  { icon: FileDown, label: 'Branded A4 PDF' },
];

export default function Preview() {
  return (
    <section className="section preview">
      <div className="wrap">
        <Reveal className="section-head center">
          <span className="eyebrow">The report</span>
          <h2>See where every number came from</h2>
          <p>
            Every finding links back to a real question and a real answer. You see the exact wording
            ChatGPT used, and who it recommended instead of you.
          </p>
        </Reveal>
        <Reveal delay="d1" className="preview-shot">
          <div className="preview-paper" aria-hidden="true">
            <div className="pp-head">
              <span>MAKEFLOW</span>
              <em>AI Visibility Report</em>
              <b>Harbourview</b>
            </div>
            <div className="pp-hero">
              <div className="pp-score">
                <strong>23</strong>
                <small>/100</small>
              </div>
              <div>
                <span className="pp-band">Barely visible</span>
                <p>Named in 11 of 42 opportunity questions. Competitors take discovery and comparison.</p>
              </div>
            </div>
            <div className="pp-kpis">
              <div><span>Mention</span><b>26%</b></div>
              <div><span>Position</span><b>2.7</b></div>
              <div><span>Citations</span><b>3</b></div>
              <div><span>Readiness</span><b>44</b></div>
            </div>
            <div className="pp-rows">
              <i style={{ width: '27%' }} />
              <i style={{ width: '19%' }} />
              <i style={{ width: '71%' }} />
              <i style={{ width: '12%' }} />
            </div>
          </div>
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
        <Reveal delay="d3">
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
