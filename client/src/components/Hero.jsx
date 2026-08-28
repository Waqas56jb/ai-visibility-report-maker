import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Play, ScanSearch, Sparkles, User, XCircle } from 'lucide-react';
import { goToCheck } from './Navbar.jsx';
import { useSite } from '../store/site.jsx';

// Inserts the ChatGPT logo badge right before the word "ChatGPT" in a
// CMS-editable string, without assuming the word is always present.
function withChatGptIcon(text) {
  if (!text) return text;
  const idx = text.indexOf('ChatGPT');
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const after = text.slice(idx + 'ChatGPT'.length);
  return (
    <>
      {before}
      <span className="chatgpt-inline">
        <img src="/chatgpt-logo.png" alt="" aria-hidden="true" />
        ChatGPT
      </span>
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

export default function Hero() {
  const navigate = useNavigate();
  const { content } = useSite();
  const hero = content.hero || {};

  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-glow" />
      <div className="hero-grid" />
      <div className="wrap">
        {/* hero-mock (Simulator card + floating badges) removed for now — Simulator kept above, add it back later */}
        <div className="hero-copy">
          <h1>
            {withChatGptIcon(hero.headline)} <span className="hl">{hero.highlight}</span>
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
          <p className="hero-trademark-note">
            ChatGPT is a trademark of OpenAI. MakeFlow is not affiliated with or endorsed by OpenAI.
          </p>
        </div>
      </div>
    </section>
  );
}
