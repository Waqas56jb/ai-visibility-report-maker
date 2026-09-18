import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarCheck, Check, Plus, Search } from 'lucide-react';
import Navbar, { goToCheck } from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Reveal from '../components/Reveal.jsx';
import { useSite } from '../store/site.jsx';

// The plans stack: each tier is everything below it plus more. So instead of
// three cards repeating "Everything in X", the page shows one plan at a time
// and marks which lines that tier adds, grouped by discipline, because the
// group labels (AEO, GEO, SEO, social) are half the message.

const DISCIPLINES = [
  { key: 'measure', label: 'Measure' },
  { key: 'aeo', label: 'AEO', sub: 'Answer engine optimisation' },
  { key: 'seo', label: 'SEO', sub: 'Technical foundations' },
  { key: 'social', label: 'Social' },
  { key: 'geo', label: 'GEO', sub: 'Entity & citations' },
];

const PLANS = [
  {
    name: 'Foundation',
    scope: 'One-off build',
    depth: 1,
    desc: 'Get your site readable, quotable and consistent, so AI has something correct to repeat.',
    cta: 'check',
    ctaLabel: 'Start with the free report',
    note: ['3 to 4 weeks', 'Two rounds of revisions'],
    adds: {
      measure: ['Full AI visibility report and your baseline score'],
      aeo: ['Five core pages rewritten answer-first', 'Twelve FAQ answers written the way assistants quote them'],
      seo: ['Schema across your key pages', 'llms.txt and crawler access opened to AI systems', 'Titles, headings and internal links cleaned up'],
      geo: ['Google Business Profile and your top directories made consistent'],
    },
  },
  {
    name: 'Growth',
    scope: 'Monthly',
    depth: 2,
    badge: 'Most popular',
    desc: 'The gaps closed every month, and a score you can actually watch move.',
    cta: 'book',
    ctaLabel: 'Book a free call',
    note: ['No lock-in', 'Replies within 4 hours'],
    adds: {
      measure: ['Monthly re-scan, scored the same way every time', 'Up to three competitors tracked beside you'],
      aeo: ['Four answer pages or articles written each month'],
      social: ['Twelve social posts a month, written from the questions your report says you are losing'],
      geo: ['Five earned mentions and citations a month', 'Monthly report showing what moved and why'],
    },
  },
  {
    name: 'Authority',
    scope: 'Monthly, full service',
    depth: 3,
    desc: 'For teams who want the whole AI search surface run for them, end to end.',
    cta: 'book',
    ctaLabel: 'Talk to me',
    note: ['Priority access, still just me', 'Replies within 1 hour'],
    adds: {
      measure: ['Weekly re-scan with alerts when your score shifts', 'Unlimited competitors and multi-location coverage'],
      aeo: ['Eight answer pages or articles a month'],
      social: ['Twenty-four social posts a month across your channels'],
      geo: ['Twelve earned mentions a month', 'Digital PR and review-platform work', 'Priority attention and reporting built for your team'],
    },
  },
];

const PLAN_FAQS = [
  {
    q: 'What is the difference between AEO, GEO and SEO?',
    a: 'SEO is the technical groundwork: can a machine crawl your site, read your markup and work out what each page is for. AEO is writing so an assistant can lift a clean answer straight off your page. GEO is the wider game, because a model does not read one website, it reads the web’s opinion of you: consistent listings, third-party mentions and citations. Every plan on this page does all three, because doing one without the others leaves the score where it was.',
  },
  {
    q: 'Where do the social posts fit in?',
    a: 'They are GEO work, not brand filler. Models weigh what the rest of the web says about you, so posts that answer the same questions your report says you are losing give them something recent and consistent to find. I write them from your gap list, not from a content calendar.',
  },
  {
    q: 'Which plan should I start on?',
    a: 'Run the free report first, whichever way you are leaning. It is the same report on every plan, and it is what tells us whether you need the Foundation build at all. Some sites are already readable and go straight to Growth.',
  },
  {
    q: 'Why are there no prices on this page?',
    a: 'Because the work is scoped to what your report finds. A site with clean schema and an open crawler needs a fraction of the work of one that blocks AI systems outright. I quote once we have both seen your score.',
  },
  {
    q: 'Which AI does the score track?',
    a: 'ChatGPT, in two modes: with web browsing on, and from its own knowledge. I report both separately, so you can see which one carries you. The AEO, GEO and SEO work itself is not ChatGPT-specific, it is the same groundwork every answer engine reads.',
  },
  {
    q: 'Do I have to sign a contract?',
    a: 'No. The monthly plans run month to month, you can move between them in either direction, and your report history stays yours if you leave.',
  },
];

// Every line up to and including the chosen tier, tagged with the tier that
// introduced it.
function linesFor(tier) {
  return DISCIPLINES.map((d) => ({
    ...d,
    lines: PLANS.slice(0, tier + 1).flatMap((p, pi) =>
      (p.adds[d.key] || []).map((text) => ({ text, from: p.name, isNew: pi === tier })),
    ),
  })).filter((d) => d.lines.length);
}

export default function PlansPage() {
  const navigate = useNavigate();
  const { content } = useSite();
  const brand = content.brandName || 'MakeFlow';
  const bookUrl = (content.bookCall?.url || 'https://cal.com/isuruabhishek/30min').trim();
  const [tier, setTier] = useState(1);
  const builderRef = useRef(null);
  const plan = PLANS[tier];
  const groups = linesFor(tier);
  const total = groups.reduce((n, g) => n + g.lines.length, 0);
  const added = groups.reduce((n, g) => n + g.lines.filter((l) => l.isNew).length, 0);

  useEffect(() => {
    document.title = `AI SEO Plans | ${brand}`;
  }, [brand]);

  const pickFromHero = (i) => {
    setTier(i);
    builderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <section className="px-hero">
          <div className="wrap px-hero-in">
            <Reveal className="px-hero-copy">
              <span className="eyebrow">AI SEO plans</span>
              <h1>
                Get recommended by AI, <span className="hl">not just ranked</span> on Google
              </h1>
              <p className="px-lead">
                Every plan is the same three disciplines in different amounts: AEO so your pages
                answer cleanly, GEO so the rest of the web backs you up, and the SEO groundwork both
                stand on.
              </p>
              <p className="px-alt">
                Want the detail on each discipline?{' '}
                <Link to="/services">Browse the services <ArrowRight className="lucide svg" /></Link>
              </p>
            </Reveal>
            <Reveal delay="d1" className="px-strata" aria-label="The three plans, from lightest to deepest">
              {PLANS.slice().reverse().map((p) => {
                const i = PLANS.indexOf(p);
                return (
                  <button
                    key={p.name}
                    type="button"
                    className={`px-stratum px-d${p.depth}${tier === i ? ' on' : ''}`}
                    onClick={() => pickFromHero(i)}
                  >
                    <span className="px-stratum-n">{p.name}</span>
                    <span className="px-stratum-s">{p.scope}</span>
                    <ArrowRight className="lucide svg" aria-hidden="true" />
                  </button>
                );
              })}
              <p className="px-strata-base">
                <Search className="lucide svg" aria-hidden="true" /> Every plan sits on the same free report
              </p>
            </Reveal>
          </div>
        </section>

        <section className="section px-builder" ref={builderRef} id="plans">
          <div className="wrap">
            <Reveal className="section-head">
              <div>
                <span className="eyebrow">Pick your depth</span>
                <h2>
                  Each plan is the one before it, <span className="hl">plus more</span>
                </h2>
              </div>
              <p>Choose a plan to see everything in it. New lines are marked, so you can see exactly what the step up buys.</p>
            </Reveal>

            <Reveal delay="d1" className="px-picker" role="tablist" aria-label="Plans">
              {PLANS.map((p, i) => (
                <button
                  key={p.name}
                  type="button"
                  role="tab"
                  id={`px-tab-${i}`}
                  aria-selected={tier === i}
                  aria-controls="px-panel"
                  className={tier === i ? 'on' : ''}
                  onClick={() => setTier(i)}
                >
                  <span className="px-pick-n">{p.name}</span>
                  <span className="px-pick-s">{p.scope}</span>
                  {p.badge ? <span className="px-pick-b">{p.badge}</span> : null}
                </button>
              ))}
            </Reveal>

            <div className="px-panel" id="px-panel" role="tabpanel" aria-labelledby={`px-tab-${tier}`}>
              <aside className="px-summary" key={plan.name}>
                <div className="px-sum-top">
                  <h3>{plan.name}</h3>
                  {plan.badge ? <span className="px-badge">{plan.badge}</span> : null}
                </div>
                <p className="px-sum-scope">{plan.scope}</p>
                <p className="px-sum-desc">{plan.desc}</p>
                <div className="px-count">
                  <span><b>{total}</b> deliverables</span>
                  {tier > 0 ? <span><b>+{added}</b> on {PLANS[tier - 1].name}</span> : null}
                </div>
                {plan.cta === 'check' ? (
                  <button type="button" className="btn btn-grad" onClick={() => goToCheck(navigate, '/plans')}>
                    {plan.ctaLabel} <ArrowRight className="lucide svg" />
                  </button>
                ) : (
                  <a href={bookUrl} className="btn btn-grad btn-lead" target="_blank" rel="noopener noreferrer">
                    <CalendarCheck className="lucide svg" /> {plan.ctaLabel}
                  </a>
                )}
                <ul className="px-note">
                  {plan.note.map((n) => <li key={n}>{n}</li>)}
                </ul>
              </aside>

              <div className="px-lines">
                {groups.map((g) => (
                  <div className="px-group" key={g.key}>
                    <p className="px-group-h">
                      <b>{g.label}</b>
                      {g.sub ? <span>{g.sub}</span> : null}
                    </p>
                    <ul>
                      {g.lines.map((l) => (
                        <li key={l.text} className={l.isNew && tier > 0 ? 'new' : ''}>
                          <Check className="lucide svg" aria-hidden="true" />
                          <span>{l.text}</span>
                          {tier > 0 ? (
                            <em className="px-from">{l.isNew ? 'New' : l.from}</em>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section px-free">
          <div className="wrap">
            <Reveal className="px-free-in">
              <p className="px-free-k">No prices on this page, on purpose</p>
              <h2>
                Every plan starts with the <span className="hl">same free report</span>
              </h2>
              <p>
                I scope and quote once we can both see what actually needs fixing, so you are never
                paying for work your site does not need. Switch plans whenever you like. No lock-in,
                and your report data stays yours.
              </p>
              <div className="px-free-ctas">
                <button type="button" className="btn btn-grad" onClick={() => goToCheck(navigate, '/plans')}>
                  Run my free report <ArrowRight className="lucide svg" />
                </button>
                <a className="btn btn-ghost btn-lead" href={bookUrl} target="_blank" rel="noopener noreferrer">
                  <CalendarCheck className="lucide svg" /> Book a free call
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section px-faq">
          <div className="wrap sx-faq-in">
            <Reveal className="sx-faq-side">
              <span className="eyebrow">Plan questions</span>
              <h2>
                Before you <span className="hl">pick one</span>
              </h2>
              <p>Still torn between two? Run the report. It is the fastest way to an honest answer.</p>
            </Reveal>
            <Reveal delay="d1" className="faq">
              {PLAN_FAQS.map((item, i) => (
                <details key={item.q} open={i === 0}>
                  <summary>
                    <span>{item.q}</span>
                    <span className="faq-i" aria-hidden="true"><Plus className="lucide svg" /></span>
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
