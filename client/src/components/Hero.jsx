import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Play,
  ScanSearch,
  Sparkles,
  User,
  XCircle,
} from 'lucide-react';
import { goToCheck } from './Navbar.jsx';
import { useSite } from '../store/site.jsx';
import { AI_ENGINES, AUTOMATION_TOOLS, CopilotMark, SlackMark, MicrosoftMark } from '../lib/aiEngineIcons.jsx';

// ChatGPT sits in the hub, dead center, and the eight tools we integrate with
// are spaced evenly around it on the circumference of a single circle — a
// true wheel/orbit layout, not a grid. The card is square (CARD_ASPECT = 1,
// must match .hub-spoke's aspect-ratio) so that circle actually reads as a
// circle instead of an ellipse.
const CARD_ASPECT = 1; // height / width — must match .hub-spoke's aspect-ratio
const CIRCLE_R = 38; // orbit radius, as a % of the card's width
const CHATGPT = AI_ENGINES.find((e) => e.key === 'chatgpt');
const CIRCLE_ORDER = ['zapier', 'slack', 'gmail', 'notion', 'calendly', 'hubspot', 'airtable', 'microsoft'];
const CORNERS = CIRCLE_ORDER.map((key, i) => {
  const tool = AUTOMATION_TOOLS.find((t) => t.key === key);
  const angleDeg = -90 + i * 45; // start at 12 o'clock, evenly spaced clockwise
  const rad = (angleDeg * Math.PI) / 180;
  const dx = CIRCLE_R * Math.cos(rad);
  const dy = CIRCLE_R * Math.sin(rad) * CARD_ASPECT;
  return {
    ...tool,
    left: 50 + dx,
    top: 50 + dy,
    angle: angleDeg,
    length: CIRCLE_R - 9,
  };
});

const CUSTOM_MARKS = { copilot: CopilotMark, slack: SlackMark, microsoft: MicrosoftMark };

function EngineIcon({ s }) {
  const Mark = CUSTOM_MARKS[s.key];
  return Mark ? (
    <Mark />
  ) : (
    <svg viewBox="0 0 24 24">
      <path d={s.d} fill={s.c} />
    </svg>
  );
}

function HubSpoke() {
  return (
    <div className="hub-spoke">
      <div className="hub-spoke-plane">
        {CORNERS.map((s, i) => (
          <div
            key={s.key}
            className="hub-line"
            style={{ width: `${s.length}%`, transform: `rotate(${s.angle}deg)` }}
          >
            <span className="hub-line-strand a" />
            <span className="hub-line-strand b">
              <span className="hub-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
            </span>
          </div>
        ))}

        {CORNERS.map((s) => (
          <div key={s.key} className="hub-icon" style={{ left: `${s.left}%`, top: `${s.top}%` }} title={s.label}>
            <EngineIcon s={s} />
          </div>
        ))}

        <div className="hub-center" title={CHATGPT.label}>
          <EngineIcon s={CHATGPT} />
        </div>
      </div>
    </div>
  );
}

// The hero sits on the dark ink gradient, so each engine's flat brand colour
// needs a lighter stand-in — ChatGPT's near-black in particular would vanish.
const ENGINE_ON_DARK = {
  chatgpt: '#FFFFFF',
  gemini: '#A78BD9',
  claude: '#E4885F',
  perplexity: '#3FC8D8',
  copilot: '#8FB6FF',
};

function EngineName({ s }) {
  const Mark = CUSTOM_MARKS[s.key];
  const colour = ENGINE_ON_DARK[s.key] || s.c;
  return (
    <span className="hero-engine">
      <span className="hero-engine-icon" aria-hidden="true">
        {Mark ? (
          <Mark />
        ) : (
          <svg viewBox="0 0 24 24">
            <path d={s.d} fill={colour} />
          </svg>
        )}
      </span>
      <span style={{ color: colour }}>{s.label}</span>
    </span>
  );
}

// A rotating word sits in a slot that is exactly as wide as the word currently
// in it, and that width is animated. Reserving the widest option instead would
// hold the layout perfectly still, but it leaves a visible pocket of dead space
// around every short word ("Perth" sitting in a slot cut for "Gold Coast"), so
// the slot is measured on each swap and transitions to the new width — the rest
// of the line slides with it rather than jumping.
function Slot({ cycle, className = '', children }) {
  const measure = useRef(null);
  const [width, setWidth] = useState(null);

  // Observed rather than measured once per swap: the word's rendered width also
  // changes when the word itself does not — the viewport crossing into a new
  // clamp() font size, or the webfont landing after first paint. Measuring only
  // on swap leaves the slot pinned to a width taken at the old size, which is
  // wide enough to push the line over and cost the headline its fixed shape.
  useLayoutEffect(() => {
    const el = measure.current;
    if (!el) return undefined;
    setWidth(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [cycle, children]);

  return (
    <span className={`hero-slot ${className}`} style={width == null ? undefined : { width }}>
      {/* Sized by the live value but never painted: it is what the animated
          width is measured from, since the slot's own width is pinned. */}
      <span className="hero-slot-measure" aria-hidden="true" ref={measure}>
        {children}
      </span>
      <span className="hero-slot-live" key={cycle}>
        {children}
      </span>
    </span>
  );
}

// The middle of the question rotates as whole phrasings rather than as
// independent words, so "who is the best gym" can never come out.
const QUERIES = [
  { ask: 'who', sup: 'best', trade: 'accountant' },
  { ask: 'what', sup: 'top', trade: 'law firm' },
  { ask: 'who', sup: '#1', trade: 'plumber' },
  { ask: 'where', sup: 'best', trade: 'dentist' },
  { ask: 'what', sup: 'best', trade: 'gym' },
  { ask: 'who', sup: 'top', trade: 'electrician' },
  { ask: 'where', sup: 'top', trade: 'cafe' },
  { ask: 'who', sup: 'best', trade: 'physio' },
];

// The opening clause stays exactly as the CMS wrote it, minus the engine name
// itself — that now rotates. "When customers ask ChatGPT, does it" gives back
// "When customers ask".
function openingClause(headline) {
  if (typeof headline !== 'string') return 'When customers ask';
  const cut = headline.split('ChatGPT')[0].trim();
  return cut || 'When customers ask';
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
    a: '<b class="b rival">Bright Ledger Advisory</b> is often cited for cloud accounting, while <b class="b you">Harbourview Accountants</b> tends to be recommended for hands-on support…',
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
          {score == null ? '-' : score}
          <small>/100</small>
        </span>
      </div>
    </div>
  );
}

// Each slot runs on its own clock. Staggering them is what makes the question
// read as a stream of different customer searches rather than one block of text
// swapping over all at once.
function useCycle(length, ms) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (length < 2) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = window.setInterval(() => setI((n) => (n + 1) % length), ms);
    return () => window.clearInterval(id);
  }, [length, ms]);
  return i % Math.max(length, 1);
}

export default function Hero() {
  const navigate = useNavigate();
  const { content } = useSite();
  const hero = content.hero || {};
  const cities = (content.cities || []).filter(Boolean);
  const cityList = cities.length ? cities : ['Brisbane'];

  const engineI = useCycle(AI_ENGINES.length, 3400);
  const queryI = useCycle(QUERIES.length, 2200);
  const cityI = useCycle(cityList.length, 2800);

  const engine = AI_ENGINES[engineI];
  const query = QUERIES[queryI];
  const city = cityList[cityI];

  const opening = openingClause(hero.headline);

  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-glow" />
      <div className="hero-grid" />
      <div className="wrap">
        {/* hero-mock (Simulator card + floating badges) removed for now — Simulator kept above, add it back later */}
        <div className="hero-copy">
          {/* A flex row with hard breaks rather than free wrapping. Every line
              is cut so that even its widest possible combination still fits the
              column at the headline's own font size, which is what keeps the
              question at four lines no matter which words are showing — if it
              reflowed, the lead and everything under it would jump a whole line
              on each swap. */}
          <h1 className="hero-q">
            <span>{opening}</span>
            <i className="hero-q-break" aria-hidden="true" />
            <Slot cycle={engineI}>
              <EngineName s={engine} />
            </Slot>
            <Slot className="hero-slot-hl" cycle={queryI}>
              {query.ask}
            </Slot>
            <span>is the</span>
            <Slot className="hero-slot-hl" cycle={queryI}>
              {query.sup}
            </Slot>
            <i className="hero-q-break" aria-hidden="true" />
            <Slot className="hero-slot-hl" cycle={queryI}>
              {query.trade}
            </Slot>
            <span>in</span>
            <span className="hero-q-tail">
              <Slot className="hero-slot-hl" cycle={cityI}>
                {city}
              </Slot>
              ,
            </span>
            <i className="hero-q-break" aria-hidden="true" />
            <span>does it</span>
            <span className="hl">{hero.highlight}</span>
          </h1>
          <p className="lead">{hero.lead}</p>
          <div className="hero-engines" aria-label="The assistants your customers ask">
            {AI_ENGINES.map((s) => (
              <span key={s.key} className="hero-engine-chip" title={s.label}>
                <EngineIcon s={s} />
              </span>
            ))}
          </div>
          <div className="hero-ctas">
            <button type="button" className="btn btn-grad" onClick={() => goToCheck(navigate, '/')}>
              <ScanSearch className="lucide svg" /> {hero.ctaPrimary}
            </button>
            <Link to="/report" className="btn btn-ghost">
              <Play className="lucide svg" /> {hero.ctaSecondary}
            </Link>
          </div>
        </div>

        <div className="hero-side">
          <div className="hero-agency">
            <h2>AI, Made Personal.</h2>
            <p>We build the automation and AI-visibility systems behind this report. Book a call and we&rsquo;ll build yours.</p>
          </div>

          <div className="hero-mock">
            <HubSpoke />
            <p className="hub-spoke-caption">Connected to the tools you already run, and the AI that recommends you</p>
          </div>
        </div>
      </div>
    </section>
  );
}
