import { Sparkles, Timer, TrendingUp } from 'lucide-react';

const HELP = {
  aiso: 'AI Search Optimisation',
  automation: 'AI Automation',
  chatbot: 'AI Chatbots',
  custom: 'Custom AI Solutions',
};

export default function RecommendationList({ items = [] }) {
  if (!items.length) return <p className="muted">No recommendations stored for this report.</p>;
  return (
    <div className="rec-grid">
      {items.map((r, i) => (
        <div className="rec" key={r.title || i}>
          <div className="pr">{i + 1}</div>
          <div>
            <h4>{r.title}</h4>
            {r.why && (
              <div className="why">
                <b>Why:</b> {r.why}
              </div>
            )}
            {r.how && <p>{r.how}</p>}
            <div className="tags">
              {r.impact && (
                <span className={`tag ${r.impact === 'high' ? 'high' : r.impact === 'medium' ? 'med' : 'low'}`}>
                  <TrendingUp className="lucide svg" /> {r.impact} impact
                </span>
              )}
              {r.effort && (
                <span className="tag low">
                  <Timer className="lucide svg" /> {r.effort} effort
                </span>
              )}
              {(r.service || r.service_key) && (
                <span className="tag svc">
                  <Sparkles className="lucide svg" /> {HELP[r.service || r.service_key] || r.service}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
