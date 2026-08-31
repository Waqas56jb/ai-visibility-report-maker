import { Link } from 'react-router-dom';
import { ArrowRight, Bot, PhoneCall, Users, Workflow } from 'lucide-react';
import Reveal from './Reveal.jsx';
import { TOOL_ROWS } from '../lib/toolLogos.js';

const SERVICES = [
  { icon: Workflow, label: 'Workflow automation' },
  { icon: PhoneCall, label: 'Voice agents' },
  { icon: Bot, label: 'Chatbots' },
  { icon: Users, label: 'Lead & CRM automation' },
];

// Each track scrolls by half its width, so the row content is repeated an even
// number of times and one half must still be wider than the widest viewport.
const COPIES = 8;
const DURATIONS = [62, 78, 70];

const ALL = TOOL_ROWS.flat();
const idOf = (tool) => `tool-${ALL.indexOf(tool)}`;

export default function AutomationBand() {
  return (
    <section className="section automate" id="automate">
      <svg className="tool-sprite" aria-hidden="true" focusable="false">
        {ALL.map((tool, i) => (
          <symbol key={tool.t} id={`tool-${i}`} viewBox="0 0 24 24">
            <path d={tool.d} fill={tool.c} />
          </symbol>
        ))}
      </svg>

      <div className="wrap">
        <Reveal className="section-head center">
          <span className="eyebrow">What we build</span>
          <h2>
            The report is one thing we do. The rest of it <span className="hl">runs itself</span>
          </h2>
          <p>
            MakeFlow is an AI automation studio. We connect the tools your business already runs on
            and put the repetitive work between them on autopilot: quoting, follow-ups, bookings,
            reporting, the lot.
          </p>
        </Reveal>
      </div>

      <div className="tool-rows" aria-hidden="true">
        {TOOL_ROWS.map((row, i) => (
          <div className="tool-row" key={i}>
            <div
              className={`tool-track${i % 2 === 1 ? ' tool-track-rev' : ''}`}
              style={{ '--dur': `${DURATIONS[i] || 66}s` }}
            >
              {Array.from({ length: COPIES }, (_, c) =>
                row.map((tool) => (
                  <span className="tool-tile" key={`${c}-${tool.t}`} title={tool.t}>
                    <svg viewBox="0 0 24 24">
                      <use href={`#${idOf(tool)}`} />
                    </svg>
                  </span>
                )),
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="wrap">
        <Reveal delay="d1" className="automate-foot">
          <ul className="automate-svcs">
            {SERVICES.map((s) => (
              <li key={s.label}>
                <s.icon className="lucide svg" /> {s.label}
              </li>
            ))}
          </ul>
          <Link className="automate-link" to="/services">
            See everything we build <ArrowRight className="lucide svg" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
