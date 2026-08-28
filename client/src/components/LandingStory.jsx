import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Eye, FileSearch, Globe2, MessageSquare, ScanSearch, Scale, Shield } from 'lucide-react';
import Reveal from './Reveal.jsx';
import { goToCheck } from './Navbar.jsx';
import { useSite } from '../store/site.jsx';

const INSIDE = [
  { icon: Eye, title: 'Overall score /100', body: 'One number for how often ChatGPT names you, plus a plain-English band from Invisible to Leading.' },
  { icon: MessageSquare, title: '40+ live questions', body: 'Discovery, comparison, local, brand and long-tail questions, written for your niche and your city.' },
  { icon: Globe2, title: 'Browsing vs knowledge', body: 'See whether the live web or ChatGPT’s training data is doing the work, so you know what to fix first.' },
  { icon: Scale, title: 'Share of voice', body: 'Who it recommends instead of you, how often, and where they sit in the answer.' },
  { icon: FileSearch, title: 'AI-readiness audit', body: 'Schema, FAQ, llms.txt, crawlers, sitemaps and how deep your service pages go. Each one scored, with the evidence shown.' },
  { icon: Shield, title: 'Prioritised plan', body: 'What to fix first, mapped to AI Search Optimisation, chatbots or automation, in the order we would do it.' },
];

const WHO = [
  ['Professional services', 'Accountants, lawyers, brokers, advisors'],
  ['Health & wellness', 'Clinics, physio, dental, allied health'],
  ['Home & trade', 'Builders, plumbers, solar, landscaping'],
  ['Local retail', 'Showrooms, specialists, destination stores'],
  ['Hospitality', 'Cafés, venues, boutique stays'],
  ['Education & coaching', 'Tutoring, RTOs, consultants'],
  ['Agencies & studios', 'Marketing, design, software houses'],
  ['Medical specialists', 'Dentists, optometry, allied clinics'],
];

const PROOF = [
  { n: 40, suffix: '+', label: 'customer questions per run' },
  { n: 2, suffix: '', label: 'ChatGPT modes, scored apart' },
  { n: 6, suffix: '', label: 'signals in the overall score' },
  { n: 3, suffix: ' min', label: 'typical time to a PDF' },
];

const PIPE = [
  ['Crawl', 'Homepage, services, schema, robots, FAQ and whether GPTBot is even allowed in.'],
  ['Questions', '30 to 50 prompts a real customer in your city would type. Not a keyword list.'],
  ['Ask twice', 'Each question runs with browsing and from knowledge. We store who was named.'],
  ['Score', 'Mentions, position, citations, sentiment, competitors and site readiness.'],
  ['Plan', 'Gaps ranked by what they are worth to you, then a branded A4 PDF you can send straight on.'],
];

function CountStat({ n, suffix, label }) {
  const [v, setV] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setV(n);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        let i = 0;
        const t = window.setInterval(() => {
          i += 1;
          setV(Math.round((n * i) / 24));
          if (i >= 24) window.clearInterval(t);
        }, 32);
        io.disconnect();
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [n]);

  return (
    <div className="proof-card" ref={ref}>
      <strong>
        {v}
        {suffix}
      </strong>
      <span>{label}</span>
    </div>
  );
}

export default function LandingStory() {
  const navigate = useNavigate();
  const { content } = useSite();

  return (
    <>
      <section className="proof-band">
        <div className="wrap proof-grid">
          {PROOF.map((p) => (
            <CountStat key={p.label} n={p.n} suffix={p.suffix} label={p.label} />
          ))}
        </div>
      </section>

      <section className="section why-ai" id="why">
        <div className="hero-glow" />
        <div className="wrap">
          <Reveal className="section-head center">
            <span className="eyebrow">Why this exists</span>
            <h2>
              Google is no longer the only <span className="hl">front door</span>
            </h2>
            <p>
              People ask ChatGPT who to hire, who to trust, and who is nearby. If the model does not
              know you, you are invisible in a conversation you never get to see. This report shows
              you what it actually says.
            </p>
            <div className="why-cta">
              <button type="button" className="btn btn-grad" onClick={() => goToCheck(navigate, '/')}>
                <ScanSearch className="lucide svg" /> {content.hero?.ctaPrimary || 'Run my free report'}
              </button>
              <span className="why-cta-note">{content.checker?.formSub || 'Takes about 3 minutes. One free report per email every 30 days.'}</span>
            </div>
          </Reveal>
          <div className="why-grid">
            <Reveal className="card why-card">
              <span className="why-n">01</span>
              <h3>Customers brief AI first</h3>
              <p>
                “Best accountant in Brisbane for a small business” is a real prompt. ChatGPT answers
                with names. If yours is missing, the shortlist is already set before they visit a
                website.
              </p>
            </Reveal>
            <Reveal delay="d1" className="card why-card">
              <span className="why-n">02</span>
              <h3>The model has favourites</h3>
              <p>
                It leans on directories, competitors with clearer service pages, and brands that
                look easy to trust. We show you who it names instead of you, question by question.
              </p>
            </Reveal>
            <Reveal delay="d2" className="card why-card">
              <span className="why-n">03</span>
              <h3>You can change the answer</h3>
              <p>
                Schema, FAQs, llms.txt and listings are how AI systems decide you are a real
                business. The report turns that into a plan with an order to it.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section pipe" id="method">
        <div className="wrap">
          <Reveal className="section-head center">
            <span className="eyebrow">The engine</span>
            <h2>Five steps, run the same way every time</h2>
            <p>
              Because nothing changes between runs, the report you get next month lines up against
              this one. You can see how every part of the score was built.
            </p>
          </Reveal>
          <div className="timeline">
            <span className="timeline-line" aria-hidden="true" />
            {PIPE.map((row, i) => (
              <Reveal
                key={row[0]}
                delay={i === 0 ? '' : `d${Math.min(i, 3)}`}
                className={`timeline-item ${i % 2 === 0 ? 'tl-left' : 'tl-right'}`}
              >
                <span className="timeline-dot" aria-hidden="true" />
                <div className="timeline-card">
                  <span className="timeline-tag">Step {String(i + 1).padStart(2, '0')}</span>
                  <h3>{row[0]}</h3>
                  <p>{row[1]}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section inside" id="inside">
        <div className="wrap">
          <Reveal className="section-head center">
            <span className="eyebrow">What’s in the PDF</span>
            <h2>A proper A4 report, not a screenshot</h2>
            <p>Every free run gives you the analysis on screen and a branded A4 report to keep or send on.</p>
          </Reveal>
          <div className="inside-grid">
            {INSIDE.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={i % 3 === 0 ? '' : `d${i % 3}`} className="card inside-card">
                  <div className="ic">
                    <Icon className="lucide svg" />
                  </div>
                  <h4>{item.title}</h4>
                  <p>{item.body}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="compare-band">
        <div className="wrap compare">
          <Reveal>
            <span className="eyebrow">Google vs ChatGPT</span>
            <h2>Rankings and recommendations are not the same job</h2>
          </Reveal>
          <div className="compare-table">
            <div>
              <h4>Classic SEO</h4>
              <ul>
                <li>Optimise for ten blue links</li>
                <li>Keywords and backlinks</li>
                <li>You hope they click</li>
                <li>Success is a position on a page</li>
              </ul>
            </div>
            <div className="vs">vs</div>
            <div>
              <h4>AI visibility</h4>
              <ul>
                <li>Optimise to be named in an answer</li>
                <li>Clarity, citations, trust signals</li>
                <li>The model shortlists for them</li>
                <li>Success is being the name it says out loud</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section who">
        <div className="wrap">
          <Reveal className="section-head">
            <span className="eyebrow">Built for Australian SMEs</span>
            <h2>If locals ask ChatGPT for a recommendation, this is for you</h2>
          </Reveal>
          <div className="who-grid who-grid-8">
            {WHO.map((row) => (
              <div className="card who-card" key={row[0]}>
                <Building2 className="lucide svg" />
                <div>
                  <strong>{row[0]}</strong>
                  <span>{row[1]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
