import { useEffect } from 'react';
import {
  ArrowRight,
  Blocks,
  CalendarCheck,
  Gauge,
  Globe2,
  ListChecks,
  Plus,
  Quote,
  Rocket,
  ScanSearch,
  Search,
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Reveal from '../components/Reveal.jsx';
import { useSite } from '../store/site.jsx';
import { enrichServices, SERVICE_GROUPS } from '../lib/seoServices.js';


const DISCIPLINES = [
  {
    tag: 'SEO',
    icon: Search,
    title: 'Rank on the page',
    body: 'Ten blue links. You compete for a position and hope the click follows. It still matters, it is just no longer the whole picture, or even the front of it.',
    line: 'Wins you a position.',
  },
  {
    tag: 'AEO',
    icon: Quote,
    title: 'Be the answer',
    body: 'The engine replies instead of listing. AEO makes your content the thing it quotes, so you are named inside the reply rather than buried three scrolls beneath it.',
    line: 'Wins you the reply.',
  },
  {
    tag: 'GEO',
    icon: Globe2,
    title: 'Be in the model',
    body: 'Generative models draw on what the web says about you, not only what you say about yourself. GEO builds the entities, mentions and citations that put you in the answer at all.',
    line: 'Wins you the recommendation.',
  },
];

const STEPS = [
  {
    icon: Gauge,
    title: 'Measure',
    body: 'Start with the free visibility report. Three minutes, and it tells me more about where you stand than a discovery call would.',
  },
  {
    icon: ListChecks,
    title: 'Prioritise',
    body: 'I walk the results with you and agree the shortest path to a better answer. Sometimes that is a content programme. Sometimes it is one line in your robots.txt.',
  },
  {
    icon: Rocket,
    title: 'Fix',
    body: 'Technical fixes, on-page and content work, local SEO, AEO and GEO, in the order the report says matters. Scoped in stages so you see something move early rather than at the end.'
  },
  {
    icon: ScanSearch,
    title: 'Re-measure',
    body: 'Run the report again. The score is the scoreboard, which is the whole reason I start there instead of finishing there.',
  },
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

export default function ServicesPage() {
  const { content } = useSite();
  const page = content.servicesPage || {};
  const items = page.items || [];
  const brand = content.brandName || 'MakeFlow';
  const contactUrl = (content.bookCall?.url || 'https://cal.com/isuruabhishek/30min').trim();
  const contactExternal = /^https?:\/\//i.test(contactUrl);
  const contactProps = contactExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  const enriched = enrichServices(items);
  // Anything the CMS added under a title we do not recognise still gets shown,
  // parked in the last group rather than silently dropped.
  const grouped = SERVICE_GROUPS.map((g, gi) => ({
    ...g,
    items: enriched.filter((s) =>
      s.group ? s.group === g.key : gi === SERVICE_GROUPS.length - 1,
    ),
  })).filter((g) => g.items.length);

  useEffect(() => {
    document.title = `${page.title || 'Services'} | ${brand}`;
  }, [page.title, brand]);

  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <section className="page-hero sv-hero">
          <div className="hero-glow" />
          <div className="hero-grid" />
          <div className="wrap">
            <Reveal className="page-hero-in">
              <span className="eyebrow">{page.eyebrow}</span>
              <h1>{page.title}</h1>
              <p className="lead">{page.lead}</p>
              <div className="hero-pills">
                <span>Technical SEO</span>
                <span>Local SEO</span>
                <span>On-page &amp; content</span>
                <span>AEO</span>
                <span>GEO</span>
              </div>
              <p className="hero-alt">
                Already know which service you need?{' '}
                <a href={contactUrl} {...contactProps}>
                  Talk to me directly <ArrowRight className="lucide svg" />
                </a>
              </p>
            </Reveal>
          </div>
        </section>

        <section className="section sv-disciplines">
          <div className="wrap">
            <Reveal className="section-head center">
              <span className="eyebrow">SEO vs AEO vs GEO</span>
              <h2>Search has split into three jobs</h2>
              <p>
                They get used interchangeably and they are not the same work. Here is the difference,
                in the order it now matters.
              </p>
            </Reveal>
            <div className="sv-disc-grid">
              {DISCIPLINES.map((d, i) => {
                const Icon = d.icon;
                return (
                  <Reveal
                    key={d.tag}
                    delay={i === 0 ? '' : `d${i}`}
                    className={`sv-disc${i > 0 ? ' sv-disc-on' : ''}`}
                  >
                    <div className="sv-disc-top">
                      <span className="sv-disc-tag">{d.tag}</span>
                      <span className="sv-ic">
                        <Icon className="lucide svg" />
                      </span>
                    </div>
                    <h3>{d.title}</h3>
                    <p>{d.body}</p>
                    <p className="sv-disc-line">
                      <ArrowRight className="lucide svg" /> {d.line}
                    </p>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section sv-catalog" id="services">
          <div className="wrap">
            <Reveal className="section-head center">
              <span className="eyebrow">The full list</span>
              <h2>Every SEO job I can take off your hands</h2>
              <p>
                Start with one. Most people do. The report is what tells you which one is worth
                starting with.
              </p>
            </Reveal>
            {grouped.map((g) => (
              <div className="sv-group" key={g.key}>
                <Reveal className="sv-group-head">
                  <span className="eyebrow">{g.eyebrow}</span>
                  <h3>{g.title}</h3>
                  <p>{g.body}</p>
                </Reveal>
                <div className="sv-cards">
                  {g.items.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <Reveal
                        key={s.title || i}
                        delay={i === 0 ? '' : `d${i % 3}`}
                        className="sv-card"
                      >
                        <div className="sv-card-top">
                          <span className="sv-ic">
                            {Icon ? <Icon className="lucide svg" /> : <Blocks className="lucide svg" />}
                          </span>
                          <span className="sv-num">{String(s.n).padStart(2, '0')}</span>
                        </div>
                        <h4>{s.title}</h4>
                        <p>{s.body}</p>
                        {s.points ? (
                          <ul className="sv-points">
                            {s.points.map((p) => (
                              <li key={p}>{p}</li>
                            ))}
                          </ul>
                        ) : null}
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section sv-process">
          <div className="wrap">
            <Reveal className="section-head center">
              <span className="eyebrow">How it runs</span>
              <h2>Measure first, then fix, then measure again</h2>
              <p>
                No engagement starts with a proposal. It starts with a number, so we both know
                whether the work moved anything.
              </p>
            </Reveal>
            <div className="sv-steps">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <Reveal key={s.title} delay={i === 0 ? '' : `d${i % 3}`} className="sv-step">
                    <span className="sv-step-n">{i + 1}</span>
                    <span className="sv-ic">
                      <Icon className="lucide svg" />
                    </span>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section sv-faq">
          <div className="wrap">
            <Reveal className="section-head center">
              <span className="eyebrow">FAQ</span>
              <h2>Questions about the work itself</h2>
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

        <section className="section sv-cta-sec">
          <div className="wrap">
            <Reveal className="cta">
              <div className="cta-copy">
                <span className="eyebrow">{page.ctaEyebrow}</span>
                <h2>{page.ctaTitle}</h2>
                <p>{page.ctaBody}</p>
                <div className="cta-btns">
                  <a className="btn btn-light btn-lead" href={contactUrl} {...contactProps}>
                    <CalendarCheck className="lucide svg" /> {page.ctaButton}
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
