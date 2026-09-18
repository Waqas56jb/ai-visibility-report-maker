import Reveal from './Reveal.jsx';

// Same four steps as the Services page, laid out as a timeline.
const STEPS = [
  {
    title: 'Measure',
    body: 'Start with the free visibility report. It tells me more about where you stand than a discovery call would.',
  },
  {
    title: 'Prioritise',
    body: 'I walk the results with you and agree the shortest path to a better answer. Sometimes a content programme, sometimes one line in your robots.txt.',
  },
  {
    title: 'Fix',
    body: 'Technical, on-page and content, local SEO, AEO and GEO, in the order the report says matters. Scoped in stages so you see something move early.',
  },
  {
    title: 'Re-measure',
    body: 'Run the report again. The score is the scoreboard, which is why I start there instead of finishing there.',
  },
];

export default function Process() {
  return (
    <section className="section pf-process" id="process">
      <div className="wrap">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow">How it works</span>
            <h2>
              From a score to a <span className="hl">better answer</span>
            </h2>
          </div>
          <p>SEO does not have to be confusing. Every project runs the same four steps, and you see the evidence at each one.</p>
        </Reveal>
        <ol className="pf-steps">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i ? `d${Math.min(i, 3)}` : ''} className="pf-step">
              <span className="pf-step-n">Step {String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
