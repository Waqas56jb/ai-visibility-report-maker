import { ArrowUpRight } from 'lucide-react';
import Reveal from './Reveal.jsx';
import { visibleWork } from '../lib/work.js';

export default function Work() {
  const items = visibleWork();
  if (!items.length) return null;

  return (
    <section className="section work" id="work">
      <div className="wrap">
        <Reveal className="section-head work-head">
          <div>
            <span className="eyebrow">Selected work</span>
            <h2>
              Recent <span className="hl">work</span>
            </h2>
          </div>
          <p>A few of the sites I have worked on, what was holding them back, and what I changed.</p>
        </Reveal>
        <div className="work-grid">
          {items.map((w, i) => (
            <Reveal
              key={`${w.client}-${i}`}
              delay={i % 2 ? 'd1' : ''}
              className={`work-card${i === 0 ? ' is-lead' : ''}`}
            >
              <div className={`work-shot tone-${w.tone || 'blue'}`} aria-hidden="true">
                <div className="work-browser">
                  <div className="work-bar">
                    <i />
                    <i />
                    <i />
                    <span>{w.domain}</span>
                  </div>
                  {w.image ? (
                    <img src={w.image} alt="" loading="lazy" />
                  ) : (
                    <div className="work-skel">
                      <b />
                      <span />
                      <span />
                      <em />
                    </div>
                  )}
                </div>
              </div>
              <div className="work-meta">
                <div className="work-tags">
                  {w.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <h3>
                  {w.client}
                  {w.draft ? <small className="work-draft">Draft, dev only</small> : null}
                </h3>
                <p>{w.summary}</p>
                {w.url ? (
                  <a className="work-link" href={w.url} target="_blank" rel="noopener noreferrer">
                    Visit site <ArrowUpRight className="lucide svg" />
                  </a>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
