import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Link2,
  MapPin,
  MessageSquareText,
  Quote,
  Search,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react';
import { goToCheck } from './Navbar.jsx';
import CallCard from './CallCard.jsx';
import Shapes3D from './Shapes3D.jsx';
import { useSite } from '../store/site.jsx';
import { AI_ENGINES } from '../lib/aiEngineIcons.jsx';

// The engines the hero question rotates through. Google leads: this is an SEO
// agency, and the AI assistants are the newer half of the same search problem.
const GOOGLE = {
  key: 'google',
  label: 'Google',
  c: '#4285F4',
  d: 'M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z',
};
const HERO_ENGINES = [GOOGLE, ...AI_ENGINES.filter((e) => ['chatgpt', 'gemini', 'perplexity'].includes(e.key))];

function EngineIcon({ s }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={s.d} fill={s.c} />
    </svg>
  );
}

function EngineName({ s }) {
  return (
    <span className="hero-engine">
      <span className="hero-engine-icon" aria-hidden="true">
        <EngineIcon s={s} />
      </span>
      <span>{s.label}</span>
    </span>
  );
}

// The right-hand visual: one search, answered three ways. It is the whole
// service in a picture: the AI Overview cites you, the map pack lists you, the
// first organic result is yours. The business is a placeholder, not a client.
function SerpMock({ city }) {
  return (
    <div className="serp" aria-hidden="true">
      <div className="serp-bar">
        <Search className="lucide svg" />
        <span>best accountant in {city}</span>
      </div>

      <div className="serp-ai">
        <div className="serp-label">
          <Sparkles className="lucide svg" /> AI Overview
        </div>
        <p>
          For small businesses in {city}, <b>Harbourview Accountants</b> is frequently recommended for
          BAS, bookkeeping and hands-on SME advice.
        </p>
        <span className="serp-cite">
          <Link2 className="lucide svg" /> harbourview.com.au
        </span>
      </div>

      <div className="serp-map">
        <div className="serp-label">
          <MapPin className="lucide svg" /> Places
        </div>
        <div className="serp-place is-you">
          <span className="serp-pin">A</span>
          <span className="serp-place-name">Harbourview Accountants</span>
          <span className="serp-stars">
            4.9 <Star className="lucide svg" />
          </span>
        </div>
        <div className="serp-place">
          <span className="serp-pin">B</span>
          <span className="serp-place-name serp-skel" />
        </div>
      </div>

      <div className="serp-org">
        <span className="serp-url">harbourview.com.au › small-business</span>
        <span className="serp-title">Small Business Accountant {city} | Harbourview</span>
        <span className="serp-skel wide" />
        <span className="serp-skel" />
      </div>

      <ul className="serp-float">
        <li>
          <TrendingUp className="lucide svg" /> Ranked on Google
        </li>
        <li>
          <Quote className="lucide svg" /> Cited in AI Overviews
        </li>
        <li>
          <MessageSquareText className="lucide svg" /> Named by ChatGPT
        </li>
      </ul>
    </div>
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

  const engineI = useCycle(HERO_ENGINES.length, 3400);
  const queryI = useCycle(QUERIES.length, 2200);
  const cityI = useCycle(cityList.length, 2800);

  const engine = HERO_ENGINES[engineI];
  const query = QUERIES[queryI];
  const city = cityList[cityI];

  const opening = openingClause(hero.headline);

  return (
    <section className="hero">
      <Shapes3D set="hero" />
      <div className="wrap">
        <div className="hero-copy">
          {/* A flex row with hard breaks rather than free wrapping, so the
              question keeps its shape whichever words are showing and the
              lead underneath never jumps on a swap. */}
          <h1 className="hero-q">
            <span>{opening}</span>
            <Slot cycle={engineI}>
              <EngineName s={engine} />
            </Slot>
            <i className="hero-q-break" aria-hidden="true" />
            <Slot className="hero-slot-hl" cycle={queryI}>
              {query.ask}
            </Slot>
            <span>is the</span>
            <Slot className="hero-slot-hl" cycle={queryI}>
              {query.sup}
            </Slot>
            <Slot className="hero-slot-hl" cycle={queryI}>
              {query.trade}
            </Slot>
            <i className="hero-q-break" aria-hidden="true" />
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
          <div className="hero-ctas">
            <button type="button" className="btn btn-grad" onClick={() => goToCheck(navigate, '/')}>
              {hero.ctaPrimary} <ArrowRight className="lucide svg" />
            </button>
            <CallCard />
          </div>
        </div>

        <div className="hero-side">
          <div className="hero-panel tilt">
            <span className="hero-blob" aria-hidden="true" />
            <SerpMock city={city} />
          </div>
        </div>
      </div>
    </section>
  );
}
