import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal.jsx';
import { goToCheck } from './Navbar.jsx';
import { useSite } from '../store/site.jsx';
import { AI_ENGINES } from '../lib/aiEngineIcons.jsx';

// The MakeFlow question, brought back from the old hero: the engine, the search
// and the city each rotate on their own clock, so it reads as a stream of real
// customer searches.
const GOOGLE = {
  key: 'google',
  label: 'Google',
  c: '#4285F4',
  d: 'M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z',
};
const ENGINES = [
  ...AI_ENGINES.filter((e) => e.key === 'chatgpt'),
  ...AI_ENGINES.filter((e) => ['gemini', 'perplexity'].includes(e.key)),
  GOOGLE,
];

// Whole phrasings rotate together, so "who is the best gym" never comes out.
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

// A slot exactly as wide as the word in it; the width animates on each swap so
// the rest of the line slides instead of jumping.
function Slot({ cycle, hl = false, children }) {
  const measure = useRef(null);
  const [width, setWidth] = useState(null);
  useLayoutEffect(() => {
    const el = measure.current;
    if (!el) return undefined;
    setWidth(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width) setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [cycle, children]);
  return (
    <span className={`pf-slot${hl ? ' pf-slot-hl' : ''}`} style={width == null ? undefined : { width }}>
      <span className="pf-slot-measure" aria-hidden="true" ref={measure}>
        {children}
      </span>
      <span className="pf-slot-live" key={cycle}>
        {children}
      </span>
    </span>
  );
}

function Engine({ e }) {
  return (
    <span className="pf-q-engine">
      {e.d && (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d={e.d} fill={e.c} />
        </svg>
      )}
      {e.label}
    </span>
  );
}

export default function AiSpotlight() {
  const { content } = useSite();
  const cities = (content.cities || []).filter(Boolean);
  const cityList = cities.length ? cities : ['Brisbane'];

  const engineI = useCycle(ENGINES.length, 3400);
  const queryI = useCycle(QUERIES.length, 2200);
  const cityI = useCycle(cityList.length, 2800);
  const q = QUERIES[queryI];

  return (
    <section className="section pf-ai" id="ai-visibility">
      <div className="wrap">
        <Reveal className="pf-q-card">
          <span className="eyebrow">Free AI visibility report</span>
          <h2 className="pf-q">
            <span>When customers ask</span>
            <Slot cycle={engineI}>
              <Engine e={ENGINES[engineI]} />
            </Slot>
            <i className="pf-q-br" aria-hidden="true" />
            <Slot hl cycle={queryI}>{q.ask}</Slot>
            <span>is the</span>
            <Slot hl cycle={queryI}>{q.sup}</Slot>
            <Slot hl cycle={queryI}>{q.trade}</Slot>
            <i className="pf-q-br" aria-hidden="true" />
            <span>in</span>
            <span className="pf-q-tail">
              <Slot hl cycle={cityI}>{cityList[cityI]}</Slot>,
            </span>
            <i className="pf-q-br" aria-hidden="true" />
            <span>does it</span>
            <span className="hl">say your name?</span>
          </h2>
          <p>
            More customers now ask AI who to hire, and it names three or four businesses. The free
            report asks ChatGPT the questions your customers ask and shows whether you are named,
            where, and who gets picked instead.
          </p>
          <button type="button" className="btn btn-grad" onClick={() => goToCheck()}>
            Get my free AI visibility report <ArrowRight className="lucide svg" />
          </button>
        </Reveal>
      </div>
    </section>
  );
}
