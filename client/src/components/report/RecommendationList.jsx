import { Sparkles, Timer, TrendingUp } from 'lucide-react';

const HELP = {
  aiso: 'AI Search Optimisation',
  automation: 'AI Automation',
  chatbot: 'AI Chatbots',
  custom: 'Custom AI Solutions',
};

export default function RecommendationList({ items = [] }) {
  return (
    <div>
      {items.map((r, i) => (
        <div className="rec" key={r.title}>
          <div className="pr">{i + 1}</div>
          <div>
            <h4>{r.title}</h4>
            <div className="why">
              <b>Why:</b> {r.why}
            </div>
            <p>{r.how}</p>
            <div className="tags">
              <span className={`tag ${r.impact === 'high' ? 'high' : r.impact === 'medium' ? 'med' : 'low'}`}>
                <TrendingUp className="lucide svg" /> {r.impact} impact
              </span>
              <span className="tag low">
                <Timer className="lucide svg" /> {r.effort} effort
              </span>
              <span className="tag svc">
                <Sparkles className="lucide svg" /> {HELP[r.service] || r.service}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
