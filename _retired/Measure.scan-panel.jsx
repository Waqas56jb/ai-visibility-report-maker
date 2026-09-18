import { useEffect, useRef, useState } from 'react';
import { FileSearch, Link as LinkIcon, ListOrdered, Megaphone, Smile, Swords } from 'lucide-react';
import Reveal from './Reveal.jsx';

// Count the score up from zero the first time the panel is on screen — the number
// arriving is what sells the "we just measured this" read. Static under
// prefers-reduced-motion.
function useCountUp(target, ref) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(target);
      return undefined;
    }
    let raf;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (t) => {
          const p = Math.min(1, (t - start) / 900);
          setN(Math.round(target * (1 - (1 - p) ** 3)));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, ref]);
  return n;
}

const METRICS = [
  { icon: Megaphone, title: 'Mention rate', body: 'How often ChatGPT names you at all', w: '35%' },
  { icon: ListOrdered, title: 'Prominence', body: 'Are you first, or an afterthought?', w: '20%' },
  {
    icon: FileSearch,
    title: 'Website AI-readiness',
    body: 'Schema, FAQ, llms.txt, crawler access, clarity',
    w: '15%',
  },
  { icon: LinkIcon, title: 'Citation rate', body: 'Does browsing mode link to your site?', w: '10%' },
  { icon: Smile, title: 'Sentiment', body: 'Positive, neutral or negative descriptions', w: '10%' },
  { icon: Swords, title: 'Competitive position', body: 'Your share of voice vs the leader', w: '10%' },
];

// The panel visualises the float card's own numbers: 42 questions asked, 11 of
// them naming you, 31 not — a branded stand-in for the old stock photo.
const ANSWERS = Array.from({ length: 42 }, (_, i) => i < 11);

export default function Measure() {
  const scoreRef = useRef(null);
  const score = useCountUp(23, scoreRef);
  return (
    <section className="section measure" id="measure">
      <div className="wrap">
        <Reveal className="measure-img measure-art">
          <span className="measure-art-grid" aria-hidden="true" />
          <span className="measure-art-glow" aria-hidden="true" />
          <div className="measure-scan" aria-hidden="true">
            <div className="measure-scan-head">
              <span>42 customer questions</span>
              <span className="measure-scan-hit">11 name you</span>
            </div>
            <div className="measure-scan-grid">
              <i className="measure-scan-beam" />
              {ANSWERS.map((hit, i) => (
                <span key={i} className={hit ? 'on' : ''} style={{ '--i': i }} />
              ))}
            </div>
          </div>
          <div className="float">
            <span className="sc" ref={scoreRef}>{score}</span>
            <p>
              <strong>Barely visible</strong>
              Absent from 31 of 42 questions. Competitors named 4× more often.
            </p>
          </div>
        </Reveal>
        <Reveal delay="d1">
          <span className="eyebrow">What I measure</span>
          <h2 style={{ fontSize: 'clamp(30px,3.8vw,46px)', margin: '16px 0 14px' }}>
            Six signals, weighted into one score
          </h2>
          <p className="muted">
            Every weight is shown up front. If ChatGPT never mentions you at all, a tidy website
            will not save you, so mentions carry the most.
          </p>
          <div className="metrics">
            {METRICS.map((m) => {
              const Icon = m.icon;
              return (
                <div className="metric" key={m.title} style={{ '--w': m.w }}>
                  <div className="ic">
                    <Icon className="lucide svg" />
                  </div>
                  <div>
                    <h4>{m.title}</h4>
                    <p>{m.body}</p>
                  </div>
                  <span className="w">{m.w}</span>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
