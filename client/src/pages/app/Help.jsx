const FAQ = [
  ['Which AI is this tested against?', 'ChatGPT only, in browsing and knowledge modes.'],
  ['How long does a report take?', 'Usually about 3 minutes. You can leave this page — we email the PDF when it is ready if that toggle is on.'],
  ['How many free reports do I get?', 'One report per email every 30 days. Re-runs in that window count toward the same limit.'],
  ['Will my score change if I re-run?', 'Yes, slightly. Treat it as a snapshot and compare trends.'],
];

const WEIGHTS = [
  { name: 'Mention rate', weight: '35%', score: '—' },
  { name: 'Prominence', weight: '20%', score: '—' },
  { name: 'AI-readiness', weight: '15%', score: '—' },
  { name: 'Citation rate', weight: '10%', score: '—' },
  { name: 'Sentiment', weight: '10%', score: '—' },
  { name: 'Competitive position', weight: '10%', score: '—' },
];

export default function Help() {
  return (
    <>
      <div className="faq">
        {FAQ.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
      <div className="card panel" style={{ marginTop: 24 }}>
        <h3>How the score is built</h3>
        <p className="desc">These weights are fixed and transparent. Your live scores appear on each report.</p>
        <div className="weights">
          {WEIGHTS.map((w) => (
            <div className="wrow" key={w.name}>
              <span>{w.name}</span>
              <span className="pct">{w.weight}</span>
              <span className="sc">{w.score}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <a className="btn btn-grad" href="mailto:hello@makeflow.com.au">
          Book a call
        </a>
      </div>
    </>
  );
}
