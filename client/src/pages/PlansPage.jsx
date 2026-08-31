import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarCheck, Check, MessagesSquare, Plus, ScanSearch } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar, { goToCheck } from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Reveal from '../components/Reveal.jsx';
import { useSite } from '../store/site.jsx';

const PLANS = [
  {
    name: 'Starter',
    scope: 'The free report',
    desc: 'See exactly where you stand with ChatGPT before you spend anything.',
    cta: 'check',
    ctaLabel: 'Run my free report',
    feats: [
      'One full AI visibility report',
      '30 to 50 real customer questions tested',
      'ChatGPT in both modes, browsing and knowledge',
      'Your score across all six weighted metrics',
      'PDF emailed to you plus a shareable link',
    ],
    note: 'Email support · replies within 2 business days',
  },
  {
    name: 'Growth',
    badge: 'Most popular',
    featured: true,
    scope: 'Ongoing',
    desc: 'For businesses closing the gaps the report found, and watching the score move.',
    cta: 'book',
    ctaLabel: 'Book a free call',
    feats: [
      'Everything in Starter',
      'Monthly re-scan so you can see the movement',
      'Up to 3 competitors tracked beside you',
      'Schema, llms.txt and crawler access fixed',
      'FAQ and service pages rewritten for AI readability',
      'Google Business Profile and citations tidied up',
    ],
    note: 'Priority support · replies within 4 hours',
  },
  {
    name: 'Scale',
    scope: 'Full service',
    desc: 'For teams who want the visibility work run for them, end to end.',
    cta: 'book',
    ctaLabel: 'Talk to us',
    feats: [
      'Everything in Growth',
      'Weekly re-scan with alerts when your score shifts',
      'Unlimited competitors and multi-location tracking',
      'AI-first content and answer pages written each month',
      'Chatbot and lead automation wired into the site',
      'Custom integrations and reporting for your team',
    ],
    note: 'Dedicated strategist · replies within 1 hour',
  },
];

const PLAN_FAQS = [
  {
    q: 'Which plan should I start on?',
    a: 'Starter, always. The free report is the same report on every plan, and it is what tells us whether the other two have any work to do. Nobody should buy visibility work before they can see the gaps.',
  },
  {
    q: 'Why are there no prices on this page?',
    a: 'Because the work is scoped to what your report finds. A site that already has clean schema and an open crawler needs a fraction of the work of one that blocks AI systems outright. We quote once we have both seen your score.',
  },
  {
    q: 'Can I move between plans later?',
    a: 'Yes, any time, in either direction. Nothing is locked in, there is no contract to break, and your reports stay yours if you leave.',
  },
  {
    q: 'How often do you re-run the report?',
    a: 'Monthly on Growth, weekly on Scale. Every run uses the same question set and the same scoring, so the numbers stay comparable month to month.',
  },
  {
    q: 'Do you work with more than one location?',
    a: 'Scale tracks multiple locations and unlimited competitors. Growth covers one business with up to three competitors beside it.',
  },
  {
    q: 'What if I only want the report and nothing else?',
    a: 'Then stay on Starter. It is free, it is the complete report, and there is no upsell wall inside the PDF.',
  },
];

export default function PlansPage() {
  const navigate = useNavigate();
  const { content } = useSite();
  const brand = content.brandName || 'MakeFlow';
  const bookUrl = (content.bookCall?.url || 'https://cal.com/isuruabhishek/30min').trim();

  useEffect(() => {
    document.title = `Plans | ${brand}`;
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
              <span className="eyebrow">Plans</span>
              <h1>Plans that match how serious you are about showing up.</h1>
              <p className="lead">
                Start with the free report. Move up when you want the gaps closed rather than just
                measured. No lock-in, and nothing to cancel if you only ever want the score.
              </p>
              <div className="hero-pills">
                <span>Free to start</span>
                <span>No lock-in</span>
                <span>Report on every plan</span>
                <span>Priced after the score</span>
              </div>
              <p className="hero-alt">
                Want to see the work itself?{' '}
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
                      <ScanSearch className="lucide svg" /> {plan.ctaLabel}
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
                  <ul className="plan-feats">
                    {plan.feats.map((f) => (
                      <li key={f}>
                        <Check className="lucide svg" /> {f}
                      </li>
                    ))}
                  </ul>
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
                    {item.q} <Plus className="lucide svg" />
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
                    <ScanSearch className="lucide svg" /> Run my free report
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
