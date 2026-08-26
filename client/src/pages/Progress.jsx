import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, LoaderCircle, Sparkles } from 'lucide-react';

const STAGES = [
  ['Crawling your website', 'crawling'],
  ['Understanding your business', 'profiling'],
  ['Generating customer questions', 'generating_queries'],
  ['Asking ChatGPT (browsing + knowledge)', 'testing'],
  ['Extracting mentions & competitors', 'scoring'],
  ['Calculating your score', 'scoring'],
  ['Writing recommendations', 'writing_recommendations'],
  ['Building your PDF', 'generating_pdf'],
];

export default function Progress() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.title = 'Generating report — MakeFlow';
  }, []);

  useEffect(() => {
    if (ready) {
      const t = window.setTimeout(() => navigate('/report'), 900);
      return () => window.clearTimeout(t);
    }
    const delay = 1300 + Math.random() * 600;
    const t = window.setTimeout(() => {
      if (index + 1 >= STAGES.length) {
        setIndex(STAGES.length);
        setReady(true);
      } else {
        setIndex((i) => i + 1);
      }
    }, delay);
    return () => window.clearTimeout(t);
  }, [index, ready, navigate]);

  const pct = ready ? 100 : Math.round(((index + 1) / STAGES.length) * 100);
  const title = ready ? 'Report ready' : `${STAGES[Math.min(index, STAGES.length - 1)][0]}…`;
  const sub = ready
    ? 'Opening your report…'
    : `Hang tight — this takes about 3 minutes. We'll also email you the link.`;
  const pctLabel = ready
    ? '100%'
    : `${pct}% · ${STAGES[Math.min(index, STAGES.length - 1)][1]}`;

  return (
    <div className="progress-view">
      <div className="progress-box">
        <div className="orbit">
          <div className="ring" />
          <div className="ring r2">
            <i />
          </div>
          <div className="ring r3">
            <i />
          </div>
          <div className="core">
            <Sparkles className="lucide svg" />
          </div>
        </div>
        <h2>{title}</h2>
        <p>{sub}</p>
        <div className="pbar">
          <i style={{ width: `${pct}%` }} />
        </div>
        <p style={{ fontFamily: 'var(--font-m)', fontSize: 12 }}>{pctLabel}</p>
        <div className="plist">
          {STAGES.map((s, i) => {
            const done = i < index || ready;
            const now = !ready && i === index;
            return (
              <div key={s[0]} className={done ? 'done' : now ? 'now' : ''}>
                {done ? (
                  <CheckCircle2 className="lucide svg" />
                ) : now ? (
                  <LoaderCircle className="lucide svg spin" />
                ) : (
                  <Circle className="lucide svg" />
                )}
                {s[0]}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
