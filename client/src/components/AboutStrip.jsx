import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal.jsx';
import { OWNER } from '../lib/owner.js';

// The short "about me" on the home page. Copy is lifted from the About page.
// Why hire me directly: each line restates something the site already promises
// (independent practice, free report, monthly plans with no lock-in).

const RULES = [
  ['You work with me.', 'No agency layer and no account manager. The person you talk to does the work.'],
  ['The report is free. The work is optional.', 'Read it, hand it to your marketer, or have me do the fixes.'],
  ['Monthly, no lock-in.', 'Stay because the score moves, not because a contract says so.'],
];

export default function AboutStrip() {
  return (
    <section className="section pf-about" id="about">
      <div className="wrap pf-about-in">
        <Reveal className="pf-note">
          <span className="eyebrow">A note from the founder</span>
          <h2>
            Direct specialist work. <span className="hl">No agency</span> layers.
          </h2>
          <p className="pf-note-lead">
            {OWNER.name ? `I'm ${OWNER.name}. ` : ''}MakeFlow is my independent SEO practice in
            Australia. I started asking Google and the AI assistants the questions my clients'
            customers ask, and found most good businesses were simply missing from the answer. So I
            built a way to measure it, then I do the work to fix it.
          </p>
          <ol className="pf-promises">
            {RULES.map(([t, b], i) => (
              <li key={t}>
                <span className="pf-promise-n">{String(i + 1).padStart(2, '0')}</span>
                <strong>{t}</strong>
                <span>{b}</span>
              </li>
            ))}
          </ol>
          <div className="pf-note-foot">
            <div className="pf-sign">
              <img src="/me.jpg" alt="" width="52" height="52" loading="lazy" />
              <p>
                <b>{OWNER.name || 'Founder'}</b>
                <span>Founder, MakeFlow · SEO &amp; AI visibility</span>
              </p>
            </div>
            <Link className="btn btn-ghost" to="/about">
              More about me <ArrowRight className="lucide svg" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
