import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarCheck, Check, MessagesSquare, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar, { goToCheck } from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Reveal from '../components/Reveal.jsx';
import { useSite } from '../store/site.jsx';

// Grouped rather than flat, because the group labels are half the message: this
// page has to answer "do you do AEO, GEO, SEO and social?" before it answers
// "what does it cost?". A flat tick list buries all four in one column.
const PLANS = [
  {
    name: 'Foundation',
    scope: 'One-off build',
    desc: 'Get your site readable, quotable and consistent, so AI has something correct to repeat.',
    cta: 'check',
    ctaLabel: 'Start with the free report',
    groups: [
      {
        label: 'Measure',
        items: ['Full AI visibility report and your baseline score'],
      },
      {
        label: 'AEO · Answer engine optimisation',
        items: [
          'Five core pages rewritten answer-first',
          'Twelve FAQ answers written the way assistants quote them',
        ],
      },
      {
        label: 'SEO · Technical foundations',
        items: [
          'Schema across your key pages',
          'llms.txt and crawler access opened to AI systems',
          'Titles, headings and internal links cleaned up',
        ],
      },
      {
        label: 'GEO · Entity & citations',
        items: ['Google Business Profile and your top directories made consistent'],
      },
    ],
    note: 'One-off build · 3 to 4 weeks · two rounds of revisions',
  },
  {
    name: 'Growth',
    badge: 'Most popular',
    featured: true,
    scope: 'Monthly',
    desc: 'The gaps closed every month, and a score you can actually watch move.',
    cta: 'book',
    ctaLabel: 'Book a free call',
    inherits: 'Everything in Foundation',
    groups: [
      {
        label: 'Measure',
        items: [
          'Monthly re-scan, scored the same way every time',
          'Up to three competitors tracked beside you',
        ],
      },
      {
        label: 'AEO · Answer engine optimisation',
        items: ['Four answer pages or articles written each month'],
      },
      {
        label: 'Social',
        items: [
          'Twelve social posts a month, written from the questions your report says you are losing',
        ],
      },
      {
        label: 'GEO · Entity & citations',
        items: [
          'Five earned mentions and citations a month',
          'Monthly report showing what moved and why',
        ],
      },
    ],
    note: 'Monthly · no lock-in · replies within 4 hours',
  },
  {
    name: 'Authority',
    scope: 'Monthly, full service',
    desc: 'For teams who want the whole AI search surface run for them, end to end.',
    cta: 'book',
    ctaLabel: 'Talk to us',
    inherits: 'Everything in Growth',
    groups: [
      {
        label: 'Measure',
        items: [
          'Weekly re-scan with alerts when your score shifts',
          'Unlimited competitors and multi-location coverage',
        ],
      },
      {
        label: 'AEO · Answer engine optimisation',
        items: ['Eight answer pages or articles a month'],
      },
      {
        label: 'Social',
        items: ['Twenty-four social posts a month across your channels'],
      },
      {
        label: 'GEO · Entity & citations',
        items: [
          'Twelve earned mentions a month',
          'Digital PR and review-platform work',
          'Dedicated strategist and reporting built for your team',
        ],
      },
    ],
    note: 'Monthly · dedicated strategist · replies within 1 hour',
  },
];

const PLAN_FAQS = [
  {
    q: 'What is the difference between AEO, GEO and SEO?',
    a: 'SEO is the technical groundwork: can a machine crawl your site, read your markup and work out what each page is for. AEO is writing so an assistant can lift a clean answer straight off your page. GEO is the wider game, because a model does not read one website, it reads the web’s opinion of you: consistent listings, third-party mentions and citations. Every plan on this page does all three, because doing one without the others leaves the score where it was.',
  },
  {
    q: 'Where do the social posts fit in?',
    a: 'They are GEO work, not brand filler. Models weigh what the rest of the web says about you, so posts that answer the same questions your report says you are losing give them something recent and consistent to find. We write them from your gap list, not from a content calendar.',
  },
  {
    q: 'Which plan should I start on?',
    a: 'Run the free report first, whichever way you are leaning. It is the same report on every plan, and it is what tells us whether you need the Foundation build at all. Some sites are already readable and go straight to Growth.',
  },
  {
    q: 'Why are there no prices on this page?',
    a: 'Because the work is scoped to what your report finds. A site with clean schema and an open crawler needs a fraction of the work of one that blocks AI systems outright. We quote once we have both seen your score.',
  },
  {
    q: 'Which AI does the score track?',
    a: 'ChatGPT, in two modes: with web browsing on, and from its own knowledge. We report both separately, so you can see which one carries you. The AEO, GEO and SEO work itself is not ChatGPT-specific, it is the same groundwork every answer engine reads.',
  },
  {
    q: 'Do I have to sign a contract?',
    a: 'No. The monthly plans run month to month, you can move between them in either direction, and your report history stays yours if you leave.',
  },
];

export default function PlansPage() {
  const navigate = useNavigate();
  const { content } = useSite();
  const brand = content.brandName || 'MakeFlow';
  const bookUrl = (content.bookCall?.url || 'https://cal.com/isuruabhishek/30min').trim();

  useEffect(() => {
    document.title = `AI SEO Plans | ${brand}`;
  }, [brand]);

  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <section className="page-hero plans-hero">
          <div className="hero-glow" />
          <div className="hero-grid" />
          <div className="wrap">
            <Reveal className="page-hero-in">
              <span className="eyebrow">AI SEO plans</span>
              <h1>Get recommended by AI, not just ranked on Google.</h1>
              <p className="lead">
                Every plan is the same three disciplines in different amounts: AEO so your pages
                answer cleanly, GEO so the rest of the web backs you up, and the SEO groundwork both
                stand on. Start with the free report, then close the gaps it finds.
              </p>
              <div className="hero-pills">
                <span>AEO</span>
                <span>GEO</span>
                <span>Technical SEO</span>
                <span>Social posts</span>
                <span>Free report first</span>
              </div>
              <p className="hero-alt">
                Want the detail on each discipline?{' '}
                <Link to="/services">
                  Browse the services <ArrowRight className="lucide svg" />
                </Link>
              </p>
            </Reveal>
          </div>
        </section>

        <section className="section plans-sec">
          <div className="wrap">
            <div className="plans">
              {PLANS.map((plan, i) => (
                <Reveal
                  key={plan.name}
                  delay={i === 0 ? '' : `d${i}`}
                  className={`plan${plan.featured ? ' plan-featured' : ''}`}
                >
                  <div className="plan-head">
                    <h3>{plan.name}</h3>
                    {plan.badge ? <span className="plan-badge">{plan.badge}</span> : null}
                  </div>
                  <p className="plan-scope">{plan.scope}</p>
                  <p className="plan-desc">{plan.desc}</p>
                  {plan.cta === 'check' ? (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => goToCheck(navigate, '/plans')}
                    >
                      <Search className="lucide svg" /> {plan.ctaLabel}
                    </button>
                  ) : (
                    <a
                      href={bookUrl}
                      className={`btn ${plan.featured ? 'btn-grad' : 'btn-ghost'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <CalendarCheck className="lucide svg" /> {plan.ctaLabel}
                    </a>
                  )}
                  {plan.inherits ? <p className="plan-inherits">{plan.inherits}</p> : null}
                  <div className="plan-groups">
                    {plan.groups.map((group) => (
                      <div className="plan-group" key={group.label}>
                        <p className="plan-group-label">{group.label}</p>
                        <ul className="plan-feats">
                          {group.items.map((f) => (
                            <li key={f}>
                              <Check className="lucide svg" /> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <p className="plan-note">{plan.note}</p>
                </Reveal>
              ))}
            </div>
            <Reveal delay="d2" className="plans-note">
              <p>
                <strong>Every plan starts with the same free report.</strong> We scope and quote the
                rest once we can both see what actually needs fixing, so you are never paying for
                work your site does not need.
              </p>
              <p>Switch plans whenever you like. No lock-in, and your report data stays yours.</p>
            </Reveal>
          </div>
        </section>

        <section className="section plans-faq" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <Reveal className="section-head center">
              <span className="eyebrow">Plan questions</span>
              <h2>Before you pick one</h2>
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

        <section className="section plans-cta-sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <Reveal className="cta">
              <div className="cta-copy">
                <h2>Not sure which plan fits?</h2>
                <p>
                  Run the free report first. Three minutes, and it tells us both which tier is
                  honest for your business right now.
                </p>
                <div className="cta-btns">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => goToCheck(navigate, '/plans')}
                  >
                    <Search className="lucide svg" /> Run my free report
                  </button>
                  <a
                    className="btn btn-ghost-light"
                    href={bookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessagesSquare className="lucide svg" /> Book a free call
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
