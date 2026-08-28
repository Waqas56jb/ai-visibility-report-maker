import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  FileText,
  Globe2,
  Play,
  ScanSearch,
  Sparkles,
  User,
  XCircle,
  Zap,
} from 'lucide-react';
import { goToCheck } from './Navbar.jsx';
import { useSite } from '../store/site.jsx';

// Replaces the word "ChatGPT" in a CMS-editable string with the ChatGPT
// wordmark logo image, without assuming the word is always present.
function withChatGptIcon(text) {
  if (!text) return text;
  const idx = text.indexOf('ChatGPT');
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const after = text.slice(idx + 'ChatGPT'.length);
  return (
    <>
      {before}
      <img className="chatgpt-wordmark" src="/chatgpt-wordmark.png" alt="ChatGPT" />
      {after}
    </>
  );
}

const SIM_QS = [
  {
    q: 'Best accountant for a small business in Brisbane?',
    a: 'For small businesses in Brisbane, well-regarded options include <b class="b rival">Bright Ledger Advisory</b>, <b class="b rival">Keystone Tax Partners</b> and <b class="b rival">QuayCounts</b>. Each offers…',
    hit: false,
  },
  {
    q: 'Is Harbourview Accountants any good?',
    a: '<b class="b you">Harbourview Accountants</b> is a Brisbane firm known for SME bookkeeping and BAS lodgement, with generally positive client feedback…',
    hit: true,
  },
  {
    q: 'Harbourview Accountants vs Bright Ledger: which is better?',
    a: '<b class="b rival">Bright Ledger Advisory</b> is often cited for cloud accounting; <b class="b you">Harbourview Accountants</b> tends to be recommended for hands-on support…',
    hit: true,
  },
  {
    q: 'Who can help with an ATO audit in Brisbane?',
    a: 'Consider <b class="b rival">Keystone Tax Partners</b> or a firm with tax-dispute experience such as <b class="b rival">Riverside CPA</b>…',
    hit: false,
  },
  {
    q: 'Top 5 accounting firms in Brisbane for startups',
    a: '1. <b class="b rival">Bright Ledger Advisory</b> 2. <b class="b rival">QuayCounts</b> 3. <b class="b rival">Riverside CPA</b> 4. <b class="b rival">Keystone Tax Partners</b> 5. Lumen Advisory…',
    hit: false,
  },
];

function Simulator() {
  const [lines, setLines] = useState([]);
  const [count, setCount] = useState(0);
  const [hits, setHits] = useState(0);
  const [score, setScore] = useState(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let simI = 0;
    let simHits = 0;
    const timers = [];

    const later = (fn, ms) => {
      const id = window.setTimeout(fn, ms);
      timers.push(id);
      return id;
    };

    function step() {
      if (cancelled) return;
      if (simI >= SIM_QS.length) {
        later(() => {
          if (cancelled) return;
          simI = 0;
          simHits = 0;
          setLines([]);
          setHits(0);
          setScore(null);
          setCount(0);
          step();
        }, 4200);
        return;
      }
      const item = SIM_QS[simI];
      const qId = `q-${simI}-${Date.now()}`;
      setLines((prev) => [...prev, { id: qId, type: 'q', text: '' }]);
      let k = 0;
      const type = window.setInterval(() => {
        if (cancelled) {
          window.clearInterval(type);
          return;
        }
        k += 1;
        const slice = item.q.slice(0, k);
        setLines((prev) => prev.map((line) => (line.id === qId ? { ...line, text: slice } : line)));
        if (k >= item.q.length) {
          window.clearInterval(type);
          later(() => {
            if (cancelled) return;
            if (item.hit) simHits += 1;
            simI += 1;
            setHits(simHits);
            setCount(simI);
            setScore(Math.round((simHits / simI) * 100 * 0.55 + 10));
            setLines((prev) => {
              const next = [
                ...prev,
                { id: `a-${qId}`, type: 'a', html: item.a },
                { id: `t-${qId}`, type: 'tag', hit: item.hit },
              ];
              return next.length > 6 ? next.slice(next.length - 6) : next;
            });
            later(step, 1400);
          }, 500);
        }
      }, 28);
      timers.push(type);
    }

    step();
    return () => {
      cancelled = true;
      timers.forEach((id) => {
        window.clearTimeout(id);
        window.clearInterval(id);
      });
    };
  }, []);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  return (
    <div className="sim">
      <div className="sim-head">
        <span className="dots">
          <span />
          <span />
          <span />
        </span>
        <span className="sim-head-label">visibility-test · chatgpt</span>
        <span className="sim-live">
          <i /> live
        </span>
        <span className="sim-count">
          {count} / {SIM_QS.length}
        </span>
      </div>
      <div className="sim-body" ref={bodyRef}>
        {lines.map((line) => {
          if (line.type === 'q') {
            return (
              <div key={line.id} className="sim-q fade-in">
                <User className="lucide svg" />
                <span>{line.text}</span>
              </div>
            );
          }
          if (line.type === 'a') {
            return (
              <div key={line.id} className="sim-a-row fade-in">
                <span className="sim-avatar">
                  <Sparkles className="lucide svg" />
                </span>
                <div className="sim-a" dangerouslySetInnerHTML={{ __html: line.html }} />
              </div>
            );
          }
          return (
            <span key={line.id} className={`sim-tag fade-in ${line.hit ? 'yes' : 'no'}`}>
              {line.hit ? <CheckCircle2 className="lucide svg" /> : <XCircle className="lucide svg" />}
              {line.hit ? 'mentioned' : 'not mentioned'}
            </span>
          );
        })}
      </div>
      <div className="sim-foot">
        <span>
          Mentioned in <b>{hits}</b> answers
        </span>
        <span className="sim-score">
          {score == null ? '—' : score}
          <small>/100</small>
        </span>
      </div>
    </div>
  );
}

// Extra endings that rotate alongside the CMS-edited hero.highlight, so the
// hero keeps making the same point ("does it ___?") from a few angles
// without needing a new admin field. The CMS value always plays first.
const EXTRA_HIGHLIGHTS = ['get it right?', 'recommend you first?'];

export default function Hero() {
  const navigate = useNavigate();
  const { content } = useSite();
  const hero = content.hero || {};
  const bookCall = content.bookCall || {};
  const highlights = [hero.highlight, ...EXTRA_HIGHLIGHTS].filter(Boolean);
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    if (highlights.length < 2) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = window.setInterval(() => {
      setHighlightIndex((i) => (i + 1) % highlights.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, [highlights.length]);
  const bookUrl = (bookCall.url || 'https://makeflow.com.au/contact').trim();
  const bookExternal = /^https?:\/\//i.test(bookUrl);
  const bookProps = bookExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-glow" />
      <div className="hero-grid" />
      <div className="wrap">
        {/* hero-mock (Simulator card + floating badges) removed for now — Simulator kept above, add it back later */}
        <div className="hero-copy">
          <h1>
            {withChatGptIcon(hero.headline)}{' '}
            <span className="hl" key={highlightIndex}>
              {highlights[highlightIndex]}
            </span>
          </h1>
          <p className="lead">{hero.lead}</p>
          <div className="hero-ctas">
            <button type="button" className="btn btn-grad" onClick={() => goToCheck(navigate, '/')}>
              <ScanSearch className="lucide svg" /> {hero.ctaPrimary}
            </button>
            <Link to="/report" className="btn btn-ghost">
              <Play className="lucide svg" /> {hero.ctaSecondary}
            </Link>
          </div>
          <div className="hero-stats">
            <div>
              <strong>{hero.stat1n}</strong>
              <span>{hero.stat1l}</span>
            </div>
            <div>
              <strong>{hero.stat2n}</strong>
              <span>{hero.stat2l}</span>
            </div>
            <div>
              <strong>{hero.stat3n}</strong>
              <span>{hero.stat3l}</span>
            </div>
          </div>
        </div>

        <div className="hero-side">
          <div className="hero-agency">
            <h2>AI, Made Personal.</h2>
            <p>We build the automation and AI-visibility systems behind this report. Book a call and we&rsquo;ll build yours.</p>
            <div className="hero-agency-ctas">
              <a href={bookUrl} className="btn btn-grad" {...bookProps}>
                <CalendarCheck className="lucide svg" /> Book a free call
              </a>
              <Link to="/services" className="btn btn-ghost">
                <Sparkles className="lucide svg" /> Discover services
              </Link>
            </div>
          </div>

          <div className="hero-mock">
          <div className="mock-window">
            <div className="mock-topbar">
              <span className="mock-dots">
                <i />
                <i />
                <i />
              </span>
              <span className="mock-url">app.makeflow.com.au/visibility</span>
            </div>
            <div className="mock-body">
              <div className="mock-sidebar">
                <span className="mock-side-icon active">
                  <ScanSearch className="lucide svg" />
                </span>
                <span className="mock-side-icon">
                  <BarChart3 className="lucide svg" />
                </span>
                <span className="mock-side-icon">
                  <Globe2 className="lucide svg" />
                </span>
                <span className="mock-side-icon">
                  <FileText className="lucide svg" />
                </span>
              </div>
              <div className="mock-main">
                <h4>AI Visibility Overview</h4>
                <div className="mock-stats">
                  <div className="mock-stat">
                    <span>Visibility score</span>
                    <strong>78%</strong>
                  </div>
                  <div className="mock-stat">
                    <span>Questions tested</span>
                    <strong>42</strong>
                  </div>
                </div>
                <div className="mock-chart" aria-hidden="true">
                  <svg viewBox="0 0 240 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="mockChartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7287fa" stopOpacity="0.55" />
                        <stop offset="100%" stopColor="#7287fa" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,80 L30,72 L60,76 L90,54 L120,58 L150,34 L180,38 L210,16 L240,20 L240,100 L0,100 Z"
                      fill="url(#mockChartFill)"
                    />
                    <path
                      d="M0,80 L30,72 L60,76 L90,54 L120,58 L150,34 L180,38 L210,16 L240,20"
                      fill="none"
                      stroke="#7287fa"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-badge hero-badge-1 stat-card">
            <div className="mock-bar-row">
              <span>Mentioned</span>
              <b>32/42</b>
            </div>
            <div className="mock-bar-track">
              <i style={{ width: '76%' }} />
            </div>
            <div className="mock-bar-row">
              <span>Cited</span>
              <b>18/42</b>
            </div>
            <div className="mock-bar-track alt">
              <i style={{ width: '43%' }} />
            </div>
          </div>

          <div className="hero-badge hero-badge-2">
            <Zap className="lucide svg" />
            Report ready in ~3 min
          </div>

          <div className="hero-badge hero-badge-3">
            <span className="dot" />
            42 questions tested live
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
