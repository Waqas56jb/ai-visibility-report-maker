import { ArrowDown, ArrowUpRight } from 'lucide-react';
import Portrait from './Portrait.jsx';
import Shapes3D from './Shapes3D.jsx';
import { OWNER } from '../lib/owner.js';
import { useSite } from '../store/site.jsx';

// Portfolio intro, Cohesion-style: who I am, a face, what I do, two ways in.
// The name comes from lib/owner.js; with no name set the line still reads.
const SKILLS = ['Technical SEO', 'Local SEO', 'On-page & content', 'AI Visibility'];

export default function Hero() {
  const { content } = useSite();
  const bookUrl = (content.bookCall?.url || 'https://cal.com/isuruabhishek/30min').trim();
  const name = OWNER.name.trim();

  return (
    <section className="hero pf-hero">
      <Shapes3D set="hero" />
      <div className="wrap pf-hero-in">
        <span className="pf-status">
          <i aria-hidden="true" /> Available for new projects
        </span>
        <h1 className="pf-hi">
          Hi, I'm {name ? <span className="hl">{name}</span> : <>your <span className="hl">SEO</span> consultant</>}
        </h1>
        <p className="pf-role">
          Founder of <b>MakeFlow</b> · SEO &amp; AI visibility, Australia
        </p>

        <div className="pf-portrait-stage">
          <Portrait className="tilt" />
          <ul className="pf-skills" aria-label="What I do">
            {SKILLS.map((s, i) => (
              <li key={s} className={`pf-skill pf-skill-${i}`}>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <p className="pf-lead">
          I get Australian businesses found on Google, in Maps, and recommended by ChatGPT,
          Gemini and AI Overviews. One specialist, doing only SEO and AI visibility.
        </p>
        <div className="pf-ctas">
          <a className="btn btn-grad" href="#ai-visibility">
            Am I visible on ChatGPT? <ArrowDown className="lucide svg" />
          </a>
          <a className="btn btn-ghost" href={bookUrl} target="_blank" rel="noopener noreferrer">
            Book a call <ArrowUpRight className="lucide svg" />
          </a>
        </div>
      </div>
    </section>
  );
}
