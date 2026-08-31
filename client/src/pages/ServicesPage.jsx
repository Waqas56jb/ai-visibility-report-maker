import { useEffect } from 'react';
import {
  ArrowRight,
  Blocks,
  CalendarCheck,
  Contact,
  Gauge,
  Globe2,
  ListChecks,
  MessagesSquare,
  MonitorSmartphone,
  PhoneCall,
  Plus,
  Quote,
  Rocket,
  ScanSearch,
  Search,
  Workflow,
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Reveal from '../components/Reveal.jsx';
import { useSite } from '../store/site.jsx';

// Titles come from the CMS (content.servicesPage.items) so they stay editable.
// The icon, grouping and deliverable bullets are presentation, so they live here
// and are attached by slug — an item the CMS renames simply renders without them.
const slug = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const DETAIL = {
  'ai-visibility': {
    group: 'found',
    icon: ScanSearch,
    points: [
      'A scored report across mentions, prominence, sentiment and citations',
      'Competitor share on the questions that actually matter',
      'A ranked fix list, not a data dump',
    ],
  },
  'aeo-answer-engine-optimisation': {
    group: 'found',
    icon: Quote,
    points: [
      'Question-led pages written to be quoted verbatim',
      'Schema and structured data an engine can parse',
      'Content shaped for AI Overviews and featured answers',
    ],
  },
  'geo-generative-engine-optimisation': {
    group: 'found',
    icon: Globe2,
    points: [
      'Entity and business-detail consistency across the sources models trust',
      'Third-party mentions, directories and citation building',
      'Crawler access for GPTBot, PerplexityBot and the rest',
    ],
  },
  'ai-workflow-automation': {
    group: 'run',
    icon: Workflow,
    points: [
      'The repeat jobs mapped end to end before anything is built',
      'AI and no-code tooling wired between the apps you already pay for',
      'Handover docs so your team owns it, not us',
    ],
  },
  'ai-voice-agents': {
    group: 'run',
    icon: PhoneCall,
    points: [
      'Answers the usual questions in your own words',
      'Books straight into your calendar',
      'Every call transcribed and logged',
    ],
  },
  'ai-chatbots': {
    group: 'run',
    icon: MessagesSquare,
    points: [
      'Trained on your real services, pricing and policies',
      'Website, Instagram and Messenger from one brain',
      'Qualifies and captures before they click away',
    ],
  },
  'lead-crm-automation': {
    group: 'run',
    icon: Contact,
    points: [
      'Every enquiry captured, from every channel',
      'Follow-up sequences that run without anyone remembering',
      'Clean records in the CRM you already use',
    ],
  },
  'web-design-development': {
    group: 'build',
    icon: MonitorSmartphone,
    points: [
      'A new build, or a rebuild of what you have',
      'Fast, responsive and accessible by default',
      'AI-readable structure baked in, not bolted on later',
    ],
  },
  'ai-integration-custom-development': {
    group: 'build',
    icon: Blocks,
    points: [
      'AI built into the product you already run',
      'Or a new one built from scratch around it',
      'Our deepest, most tailored engagement',
    ],
  },
};

const GROUPS = [
  {
    key: 'found',
    eyebrow: 'Get found',
    title: 'Being the answer, not a link',
    body: 'The three disciplines that decide whether an assistant says your name.',
  },
  {
    key: 'run',
    eyebrow: 'Run it for you',
    title: 'The work that runs itself',
    body: 'Once the enquiries arrive, none of them should depend on somebody remembering.',
  },
  {
    key: 'build',
    eyebrow: 'Build it properly',
    title: 'The thing it all sits on',
    body: 'A site and a product an assistant can actually read, and a team can actually run.',
  },
];

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
    body: 'Start with the free visibility report. Three minutes, and it tells us more about where you stand than a discovery call would.',
  },
  {
    icon: ListChecks,
    title: 'Prioritise',
    body: 'We walk the results with you and agree the shortest path to a better answer. Sometimes that is a content programme. Sometimes it is one line in your robots.txt.',
  },
  {
    icon: Rocket,
    title: 'Build',
    body: 'AEO, GEO, a new site, an automation, or all four. Scoped in stages so you see something move early rather than at the end.',
  },
  {
    icon: ScanSearch,
    title: 'Re-measure',
    body: 'Run the report again. The score is the scoreboard, which is the whole reason we start there instead of finishing there.',
  },
];

const FAQS = [
  {
    q: 'What is the difference between SEO, AEO and GEO?',
    a: 'SEO gets you ranked on a results page. AEO makes your content the answer an engine quotes back. GEO gets you into what the model itself knows and cites. Most businesses need all three: the report tells you which one is costing you most right now.',
  },
  {
    q: 'Do I have to buy a package?',
    a: 'No. Every engagement starts with the free report and we scope from what it finds. Sometimes the honest answer is that you need one of these, not six.',
  },
  {
    q: 'Can you work on a site you did not build?',
    a: 'Usually, yes. If the platform makes AI-readable structure genuinely impossible, we will tell you that before you spend anything on content rather than after.',
  },
  {
    q: 'How long before AI starts naming us?',
    a: 'Crawler and structure fixes can show up in browsing mode within weeks. Knowledge mode is slower, because that is the model’s training rather than your website, and nobody can honestly promise you a date for it.',
  },
  {
    q: 'Do you handle the writing?',
    a: 'Yes. Answer pages only work when they are specific, so we write from your actual expertise instead of generating filler that every competitor could have published.',
  },
  {
    q: 'Is web design available on its own?',
    a: 'Yes. We build every site AI-readable by default, so you get the structural half of AEO whether you asked for it or not.',
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

  const enriched = items.map((item, i) => ({
    ...item,
    n: i + 1,
    ...(DETAIL[slug(item.title)] || {}),
  }));
  // Anything the CMS added under a title we do not recognise still gets shown,
  // parked in the last group rather than silently dropped.
  const grouped = GROUPS.map((g, gi) => ({
    ...g,
    items: enriched.filter((s) =>
      s.group ? s.group === g.key : gi === GROUPS.length - 1,
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
                <span>AEO</span>
                <span>GEO</span>
                <span>AI visibility</span>
                <span>Automation</span>
                <span>Web design</span>
              </div>
              <p className="hero-alt">
                Already know which service you need?{' '}
                <a href={contactUrl} {...contactProps}>
                  Talk to us directly <ArrowRight className="lucide svg" />
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
              <h2>Everything we can take off your hands</h2>
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
              <h2>Measure first, then build, then measure again</h2>
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
                    {f.q} <Plus className="lucide svg" />
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
                  <a className="btn btn-light" href={contactUrl} {...contactProps}>
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
