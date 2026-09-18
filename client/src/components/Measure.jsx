import Reveal from './Reveal.jsx';

const METRICS = [
  { title: 'Mention rate', body: 'How often ChatGPT names you at all', w: '35%' },
  { title: 'Prominence', body: 'Are you first, or an afterthought?', w: '20%' },
  { title: 'Website AI-readiness', body: 'Schema, FAQ, llms.txt, crawler access, clarity', w: '15%' },
  { title: 'Citation rate', body: 'Does browsing mode link to your site?', w: '10%' },
  { title: 'Sentiment', body: 'Positive, neutral or negative descriptions', w: '10%' },
  { title: 'Competitive position', body: 'Your share of voice vs the leader', w: '10%' },
];

export default function Measure() {
  return (
    <section className="section pf-measure" id="measure">
      <div className="wrap">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow">What I measure</span>
            <h2>
              Six signals, weighted into <span className="hl">one score</span>
            </h2>
          </div>
          <p>
            Every weight is shown up front. If ChatGPT never mentions you at all, a tidy website will
            not save you, so mentions carry the most.
          </p>
        </Reveal>
        <div className="pf-svc-list">
          {METRICS.map((m, i) => (
            <Reveal key={m.title} className="pf-svc pf-row">
              <span className="pf-svc-n">{String(i + 1).padStart(2, '0')}</span>
              <h3>{m.title}</h3>
              <p>{m.body}</p>
              <span className="pf-weight">{m.w}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
