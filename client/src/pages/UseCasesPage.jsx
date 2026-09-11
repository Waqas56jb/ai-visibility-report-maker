import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Plus,
  Scale,
  ScanSearch,
  Search,
  Stethoscope,
  UtensilsCrossed,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar, { goToCheck } from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Reveal from '../components/Reveal.jsx';
import { useSite } from '../store/site.jsx';

const INDUSTRIES = [
  {
    icon: Wrench,
    title: 'Local & home services',
    body: '"Best electrician in Brisbane" is an AI question now, not a Google one. We ask it the way your customers actually phrase it and show you whether ChatGPT names you or the franchise up the road.',
  },
  {
    icon: Stethoscope,
    title: 'Clinics & allied health',
    body: 'Patients ask an assistant who to see before they ask a friend. We test the treatment and suburb questions that bring new patients in, and show which ones return someone else.',
  },
  {
    icon: Scale,
    title: 'Professional services',
    body: 'Law, accounting, consulting. Trust decisions start with "who should I hire?" We show whether the answer contains your name, and whether the reasoning behind it is right about you.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Hospitality & venues',
    body: 'Menus stuck in PDFs and a story that lives only on Instagram give AI nothing to cite. We check what it can actually read on your site, and what it says when someone asks where to eat.',
  },
  {
    icon: Building2,
    title: 'Multi-location & franchise',
    body: 'Head office ranks and the branches do not. Run a report per location and see, suburb by suburb, which ones AI has never heard of.',
  },
];

const OUTCOMES = [
  {
    quote: '"We had no idea ChatGPT was leaving us out."',
    body: 'Most businesses have never asked an assistant the questions their customers ask every day. The first report is usually the wake-up call: named in some answers, invisible in others, and nobody inside the business knew either way.',
    line: 'A score across all six weighted metrics, and a ranked list of what to fix first.',
  },
  {
    quote: '"A competitor kept getting named instead of us."',
    body: 'The report shows you the exact questions where someone else appears in the answer and you do not, in both browsing and knowledge mode, plus how often each competitor is named across the whole run.',
    line: 'The questions you are losing, who is winning them, and how far behind you sit.',
  },
  {
    quote: '"We looked fine on Google and invisible to AI."',
    body: 'Ranking first counts for nothing if your robots.txt blocks AI crawlers, your services live in a PDF, or you have no structured data for an assistant to read. Google forgives that. AI does not.',
    line: 'A website AI-readiness score with the blockers listed in plain words.',
  },
];

const SCENARIOS = [
  {
    tag: 'Local & home services',
    title: 'A two-van electrical business',
    problem:
      'Ranking on page one for "electrician Brisbane" and getting steady work, so nobody thought to check anything else. Meanwhile customers had started asking ChatGPT the same question.',
    found:
      'Named in 4 of 40 answers. Browsing mode found them occasionally, knowledge mode had never heard of them. Their robots.txt blocked GPTBot outright, so half the test had nothing to work with.',
    did: 'Opened the crawler, added service and suburb pages, and put the licence details somewhere readable. The next report is the proof, not the promise.',
    quote: '"We were blocking the thing we were trying to rank in."',
  },
  {
    tag: 'Hospitality',
    title: 'A single-site restaurant',
    problem:
      'Weekend visitors ask an assistant where to eat, and the answers kept naming three places down the street. The menu lived inside a PDF and the story existed only on Instagram.',
    found:
      'A website AI-readiness score in the low twenties. No structured data, no readable menu, no opening hours in text. Mentioned in 2 of 38 answers, and one of those got the cuisine wrong.',
    did: 'Menu, hours and story moved onto real pages an assistant can quote, with schema behind them. Sentiment was the metric that moved first.',
    quote: '"AI could not read our menu, so it recommended someone whose menu it could."',
  },
  {
    tag: 'Professional services',
    title: 'A three-partner accounting firm',
    problem:
      'Business owners increasingly ask AI who to hire for tax advice before they ever search. The firm\'s expertise lived in the partners\' heads and a brochure site that said very little.',
    found:
      'Named in 11 of 40 answers but almost never first, so prominence scored 18. National brands with deep content libraries took every top slot.',
    did: 'Plain-English answer pages written from the partners\' actual specialities, aimed at the exact advisory questions the report showed them losing.',
    quote: '"Being mentioned last is not the same as being recommended."',
  },
];

const FAQS = [
  {
    q: 'My industry is not on this page. Does the report still work?',
    a: 'Yes. The question set is generated from your business, your services and your location, not from a fixed industry list. If your customers ask an assistant anything before they buy, there is something to measure.',
  },
  {
    q: 'Are the example scenarios real customers?',
    a: 'No, and we label them as illustrative on purpose. They are composites built from the patterns the report keeps finding: a blocked crawler, a menu trapped in a PDF, a firm named last instead of first. We would rather show you the shape of the problem than invent a testimonial.',
  },
  {
    q: 'How is this different from an SEO audit?',
    a: 'An SEO audit tells you where you rank on a results page. This tells you whether an assistant names you in the answer it writes instead of that page. The two overlap, but a site can rank first and still be invisible to AI, usually because it blocks the crawlers or has nothing readable to quote.',
  },
  {
    q: 'Can I run a separate report for each location?',
    a: 'Yes. Location is part of the input, so a franchise or multi-site business gets a different question set and a different score per suburb. That is usually where the gaps show up most sharply.',
  },
  {
    q: 'What if my competitors are national brands?',
    a: 'Then you will probably see them named ahead of you, and the report will tell you exactly which questions they are winning. Beating a national brand on every question is not the goal: being named on the ones that actually bring you work is.',
  },
  {
    q: 'I have the report. What do I do with it?',
    a: 'The report is the diagnosis. Fixing it is AEO, GEO, technical work on the site, or all three, depending on what it found. Our services page walks through what each of those actually involves.',
  },
];

export default function UseCasesPage() {
  const navigate = useNavigate();
  const { content } = useSite();
  const brand = content.brandName || 'MakeFlow';
  const bookUrl = (content.bookCall?.url || 'https://cal.com/isuruabhishek/30min').trim();

  useEffect(() => {
    document.title = `Use cases | ${brand}`;
  }, [brand]);

  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <section className="page-hero uc-hero">
          <div className="hero-glow" />
          <div className="hero-grid" />
          <div className="wrap">
            <Reveal className="page-hero-in">
              <span className="eyebrow">Use cases</span>
              <h1>Wherever your customers ask AI, you should be the answer.</h1>
              <p className="lead">
                The report is the same for everyone. What it finds is not. Here is what businesses
                like yours tend to discover when they run it for the first time.
              </p>
              <button
                type="button"
                className="btn btn-grad"
                onClick={() => goToCheck(navigate, '/use-cases')}
              >
                <Search className="lucide svg" /> Run my free report
              </button>
              <div className="hero-pills">
                <span>Local services</span>
                <span>Clinics</span>
                <span>Professional services</span>
                <span>Hospitality</span>
                <span>Multi-location</span>
              </div>
              <p className="hero-alt">
                Already know what needs fixing?{' '}
                <Link to="/services">
                  See what we build <ArrowRight className="lucide svg" />
                </Link>
              </p>
            </Reveal>
          </div>
        </section>

        <section className="section uc-industry">
          <div className="wrap">
            <Reveal className="section-head center">
              <span className="eyebrow">By industry</span>
              <h2>Different industries. Same problem: AI is naming someone else.</h2>
            </Reveal>
            <div className="uc-grid">
              {INDUSTRIES.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Reveal key={item.title} delay={i === 0 ? '' : `d${i % 3}`} className="uc-card">
                    <div className="uc-ic">
                      <Icon className="lucide svg" />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </Reveal>
                );
              })}
              <Reveal delay="d2" className="uc-card uc-card-cta">
                <div className="uc-ic">
                  <ScanSearch className="lucide svg" />
                </div>
                <h3>Not on the list?</h3>
                <p>
                  If your customers ask an assistant before they buy, the report works for you. Run
                  it and find out where you stand.
                </p>
                <button
                  type="button"
                  className="btn btn-grad btn-sm"
                  onClick={() => goToCheck(navigate, '/use-cases')}
                >
                  <Search className="lucide svg" /> Run my free report
                </button>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="section uc-outcome">
          <div className="wrap">
            <Reveal className="section-head center">
              <span className="eyebrow">By outcome</span>
              <h2>The moment it lands is different for everyone</h2>
              <p>
                For some it is the first score. For others it is seeing a competitor named in an
                answer that should have been theirs. Here is how each one plays out.
              </p>
            </Reveal>
            <div className="uc-outs">
              {OUTCOMES.map((o, i) => (
                <Reveal key={o.quote} delay={i === 0 ? '' : `d${i}`} className="uc-out">
                  <h3>{o.quote}</h3>
                  <p>{o.body}</p>
                  <p className="uc-out-line">
                    <ArrowRight className="lucide svg" /> {o.line}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section uc-scenarios">
          <div className="wrap">
            <Reveal className="section-head center">
              <span className="eyebrow">Example scenarios</span>
              <h2>How a first report tends to go</h2>
              <p>
                Three composite examples, built from the kinds of gaps the report keeps finding. Not
                case studies, and not anyone in particular.
              </p>
            </Reveal>
            <div className="uc-cases">
              {SCENARIOS.map((s, i) => (
                <Reveal key={s.title} delay={i === 0 ? '' : `d${i}`} className="uc-case">
                  <div className="uc-tags">
                    <span className="uc-tag">{s.tag}</span>
                    <span className="uc-tag uc-tag-note">Illustrative</span>
                  </div>
                  <h3>{s.title}</h3>
                  <p>
                    <strong>The problem.</strong> {s.problem}
                  </p>
                  <p>
                    <strong>What the report showed.</strong> {s.found}
                  </p>
                  <p>
                    <strong>What they did with it.</strong> {s.did}
                  </p>
                  <p className="uc-quote">{s.quote}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section uc-faq">
          <div className="wrap">
            <Reveal className="section-head center">
              <span className="eyebrow">FAQ</span>
              <h2>Questions about your situation</h2>
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

        <section className="section uc-cta-sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <Reveal className="cta">
              <div className="cta-copy">
                <h2>Find your use case with a free report</h2>
                <p>
                  See where AI leaves you out, then close the gaps before the business down the road
                  does. Three minutes to fill in, about three to run.
                </p>
                <div className="cta-btns">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => goToCheck(navigate, '/use-cases')}
                  >
                    <Search className="lucide svg" /> Run my free report
                  </button>
                  <a
                    className="btn btn-ghost-light"
                    href={bookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CalendarCheck className="lucide svg" /> Book a free call
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
