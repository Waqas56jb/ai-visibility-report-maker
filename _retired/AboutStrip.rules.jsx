import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Portrait from './Portrait.jsx';
import Reveal from './Reveal.jsx';
import { OWNER } from '../lib/owner.js';

// The short "about me" on the home page. Copy is lifted from the About page.
const RULES = [
  ['Show the working.', 'Every recommendation traces back to something I measured.'],
  ['Say the real number.', 'I would rather report an uncomfortable score than a flattering one.'],
  ['Keep it simple.', 'You read the plan once and know what to do first.'],
];

export default function AboutStrip() {
  return (
    <section className="section pf-about" id="about">
      <div className="wrap pf-about-in">
        <Reveal className="pf-about-photo">
          <Portrait size="md" className="tilt" />
        </Reveal>
        <Reveal delay="d1" className="pf-about-copy">
          <span className="eyebrow">A note from the founder</span>
          <h2>
            I get good businesses <span className="hl">found</span> in search.
          </h2>
          <p>
            {OWNER.name ? `I'm ${OWNER.name}. ` : ''}MakeFlow is my independent SEO practice in
            Australia. I started asking Google and the AI assistants the questions my clients'
            customers ask, and found most good businesses were simply missing from the answer. So I
            built a way to measure it, then I do the work to fix it.
          </p>
          <ul className="pf-rules">
            {RULES.map(([t, b]) => (
              <li key={t}>
                <strong>{t}</strong> {b}
              </li>
            ))}
          </ul>
          <p className="pf-sign">
            <b>{OWNER.name || 'Founder'}</b>
            <span>Founder, MakeFlow · SEO &amp; AI visibility</span>
          </p>
          <Link className="btn btn-ghost" to="/about">
            More about me <ArrowRight className="lucide svg" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
