import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarCheck, Plus, Search, Sparkles } from 'lucide-react';
import Navbar, { goToCheck } from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Reveal from '../components/Reveal.jsx';
import FinalCta from '../components/FinalCta.jsx';
import { useSite } from '../store/site.jsx';
import { DEFAULT_CONTENT } from '../lib/siteDefaults.js';
import { enrichServices, SERVICE_GROUPS } from '../lib/seoServices.js';

// The page is built around one idea: a search now has three layers (the
// ranked link, the quoted answer, the model's recommendation), and each SEO
// discipline wins one of them. The hero shows the layers, the rest explains them.
//
// Copy lives here rather than in the CMS: the CMS still carries the old agency
// services list, and this page must stay SEO only.

const JOBS = [
  {
    tag: 'SEO',
    title: 'Rank on the page',
    body: 'Ten blue links. You compete for a position and hope the click follows. It still matters, it is just no longer the whole picture, or even the front of it.',
    wins: 'Wins you a position.',
  },
  {
    tag: 'AEO',
    title: 'Be the answer',
    body: 'The engine replies instead of listing. AEO makes your content the thing it quotes, so you are named inside the reply rather than buried three scrolls beneath it.',
    wins: 'Wins you the reply.',
  },
  {
    tag: 'GEO',
    title: 'Be in the model',
    body: 'Generative models draw on what the web says about you, not only what you say about yourself. GEO builds the entities, mentions and citations that put you in the answer at all.',
    wins: 'Wins you the recommendation.',
  },
];

const STEPS = [
  ['Measure', 'Start with the free visibility report. Three minutes, and it tells me more about where you stand than a discovery call would.'],
  ['Prioritise', 'I walk the results with you and agree the shortest path to a better answer. Sometimes a content programme, sometimes one line in your robots.txt.'],
  ['Fix', 'Technical, on-page and content, local SEO, AEO and GEO, in the order the report says matters. Scoped in stages so you see something move early.'],
  ['Re-measure', 'Run the report again. The score is the scoreboard, which is why I start there instead of finishing there.'],
];

const FAQS = [
  {
    q: 'What is the difference between SEO, AEO and GEO?',
    a: 'SEO gets you ranked on a results page. AEO makes your content the answer an engine quotes back. GEO gets you into what the model itself knows and cites. Most businesses need all three: the report tells you which one is costing you most right now.',
  },
  {
    q: 'Do I have to buy a package?',
    a: 'No. Every engagement starts with the free report and I scope it from what it finds. Sometimes the honest answer is that you need one of these, not six.',
  },
  {
    q: 'Can you work on a site you did not build?',
    a: 'Usually, yes. If the platform makes AI-readable structure genuinely impossible, I will tell you that before you spend anything on content rather than after.',
  },
  {
    q: 'How long before AI starts naming us?',
    a: 'Crawler and structure fixes can show up in browsing mode within weeks. Knowledge mode is slower, because that is the model’s training rather than your website, and nobody can honestly promise you a date for it.',
  },
  {
    q: 'Do you handle the writing?',
    a: 'Yes. Answer pages only work when they are specific, so I write from your actual expertise instead of generating filler that every competitor could have published.',
  },
];

// Hero illustration: the same search, three layers deep. Placeholder names
// only, it shows where you can appear, not a result anyone got.
function SearchStack({ active, onPick }) {
  return (
    <div className="sx-stack-wrap">
      <div className="sx-stack" aria-hidden="true">
        <div className={`sx-layer sx-l-seo${active === 0 ? ' on' : ''}`}>
          <span className="sx-layer-k">Search results</span>
          <span className="sx-url">yourbusiness.com.au</span>
          <span className="sx-title">Your Business | The service, in your suburb</span>
          <span className="sx-bar" /><span className="sx-bar short" />
        </div>
        <div className={`sx-layer sx-l-aeo${active === 1 ? ' on' : ''}`}>
          <span className="sx-layer-k"><Sparkles className="lucide svg" /> AI Overview</span>
          <span className="sx-answer">
            The quickest fix is usually a service call. <mark>Your Business</mark> explains the
            three signs to look for first.
          </span>
          <span className="sx-cite">yourbusiness.com.au</span>
        </div>
        <div className={`sx-layer sx-l-geo${active === 2 ? ' on' : ''}`}>
          <span className="sx-layer-k">AI assistant</span>
          <span className="sx-ask">Who should I call near me?</span>
          <span className="sx-reply">A well-reviewed local option is <mark>Your Business</mark>.</span>
        </div>
      </div>
      <div className="sx-tabs" role="tablist" aria-label="Where you can show up">
        {JOBS.map((j, i) => (
          <button
            key={j.tag}
            type="button"
            role="tab"
            aria-selected={active === i}
            className={active === i ? 'on' : ''}
            onClick={() => onPick(i)}
          >
            {j.tag}
          </button>
        ))}
      </div>
      <p className="sx-wins" aria-live="polite">
        <strong>{JOBS[active].tag}.</strong> {JOBS[active].wins}
      </p>
    </div>
  );
}

export default function ServicesPage() {
  const navigate = useNavigate();
  const { content } = useSite();
  const brand = content.brandName || 'MakeFlow';
  const bookUrl = (content.bookCall?.url || 'https://cal.com/isuruabhishek/30min').trim();

  const [layer, setLayer] = useState(1);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(1);

  const services = enrichServices(DEFAULT_CONTENT.servicesPage.items);
  const groupOf = Object.fromEntries(SERVICE_GROUPS.map((g) => [g.key, g]));
  const shown = services.filter((s) => filter === 'all' || s.group === filter);

  useEffect(() => {
    document.title = `SEO Services | ${brand}`;
  }, [brand]);

  // Walk the three layers until the visitor picks one themselves.
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => setLayer((l) => (l + 1) % 3), 3400);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <section className="sx-hero">
          <div className="wrap sx-hero-in">
            <Reveal className="sx-hero-copy">
              <span className="eyebrow">SEO services</span>
              <h1>
                SEO for Google, and for the <span className="hl">AI answers</span> above it
              </h1>
              <p className="sx-lead">
                I do SEO and only SEO. Technical, local, content, AEO and GEO: the work that gets
                you ranked, cited and recommended, measured before and after.
              </p>
              <div className="sx-ctas">
                <button type="button" className="btn btn-grad" onClick={() => goToCheck(navigate, '/services')}>
                  Get my free report <ArrowRight className="lucide svg" />
                </button>
                <a className="btn btn-ghost btn-lead" href={bookUrl} target="_blank" rel="noopener noreferrer">
                  <CalendarCheck className="lucide svg" /> Book a call
                </a>
              </div>
            </Reveal>
            <Reveal delay="d1" className="sx-hero-art">
              <SearchStack
                active={layer}
                onPick={(i) => {
                  setPaused(true);
                  setLayer(i);
                }}
              />
            </Reveal>
          </div>
        </section>

        <section className="section sx-jobs">
          <div className="wrap">
            <Reveal className="section-head">
              <div>
                <span className="eyebrow">SEO vs AEO vs GEO</span>
                <h2>
                  Search has split into <span className="hl">three jobs</span>
                </h2>
              </div>
              <p>They get used interchangeably and they are not the same work. Here is the difference, in the order it now matters.</p>
            </Reveal>
            <ol className="sx-job-list">
              {JOBS.map((j, i) => (
                <Reveal as="li" key={j.tag} delay={i ? `d${i}` : ''} className="sx-job">
                  <span className="sx-job-tag">{j.tag}</span>
                  <div>
                    <h3>{j.title}</h3>
                    <p>{j.body}</p>
                  </div>
                  <p className="sx-job-wins">{j.wins}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section className="section sx-index" id="services">
          <div className="wrap sx-index-in">
            <Reveal className="sx-index-side">
              <span className="eyebrow">The full list</span>
              <h2>
                Every SEO job I can take <span className="hl">off your hands</span>
              </h2>
              <p>Start with one. Most people do. The report is what tells you which one is worth starting with.</p>
              <div className="sx-filter" role="group" aria-label="Filter services">
                {[{ key: 'all', eyebrow: 'All' }, ...SERVICE_GROUPS].map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    aria-pressed={filter === g.key}
                    className={filter === g.key ? 'on' : ''}
                    onClick={() => {
                      setFilter(g.key);
                      setOpen(-1);
                    }}
                  >
                    {g.eyebrow}
                  </button>
                ))}
              </div>
              {filter !== 'all' && groupOf[filter] ? (
                <p className="sx-group-note">
                  <strong>{groupOf[filter].title}.</strong> {groupOf[filter].body}
                </p>
              ) : null}
            </Reveal>
            <ul className="sx-rows">
              {shown.map((s) => {
                const Icon = s.icon || Search;
                const isOpen = open === s.n;
                return (
                  <li key={s.title} className={`sx-row${isOpen ? ' open' : ''}`}>
                    <button
                      type="button"
                      className="sx-row-head"
                      aria-expanded={isOpen}
                      onClick={() => setOpen(isOpen ? -1 : s.n)}
                    >
                      <span className="sx-row-n">{String(s.n).padStart(2, '0')}</span>
                      <span className="sx-row-ic" aria-hidden="true"><Icon className="lucide svg" /></span>
                      <span className="sx-row-t">{s.title}</span>
                      <span className="sx-row-x" aria-hidden="true"><Plus className="lucide svg" /></span>
                    </button>
                    <div className="sx-row-body">
                      <div>
                        <p>{s.body}</p>
                        {s.points ? (
                          <ul className="sx-points">
                            {s.points.map((p) => <li key={p}>{p}</li>)}
                          </ul>
                        ) : null}
                        {groupOf[s.group] ? <span className="sx-row-g">{groupOf[s.group].eyebrow}</span> : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="section sx-loop-sec">
          <div className="wrap">
            <Reveal className="section-head">
              <div>
                <span className="eyebrow">How it runs</span>
                <h2>
                  Measure, fix, then <span className="hl">measure again</span>
                </h2>
              </div>
              <p>No engagement starts with a proposal. It starts with a number, so we both know whether the work moved anything.</p>
            </Reveal>
            <Reveal delay="d1" className="sx-loop">
              <ol>
                {STEPS.map(([t, b], i) => (
                  <li key={t}>
                    <span className="sx-loop-dot">{i + 1}</span>
                    <h3>{t}</h3>
                    <p>{b}</p>
                  </li>
                ))}
              </ol>
              <p className="sx-loop-back">
                <span>And round again, with the score as the scoreboard</span>
              </p>
            </Reveal>
          </div>
        </section>

        <section className="section sx-faq">
          <div className="wrap sx-faq-in">
            <Reveal className="sx-faq-side">
              <span className="eyebrow">FAQ</span>
              <h2>
                Questions about <span className="hl">the work</span>
              </h2>
              <p>Anything else, ask me on the call. It is free and there is no pitch deck.</p>
            </Reveal>
            <Reveal delay="d1" className="faq">
              {FAQS.map((f, i) => (
                <details key={f.q} open={i === 0}>
                  <summary>
                    <span>{f.q}</span>
                    <span className="faq-i" aria-hidden="true"><Plus className="lucide svg" /></span>
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </Reveal>
          </div>
        </section>

        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
