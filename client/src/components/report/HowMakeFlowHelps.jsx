import { Bot, Check, SearchCheck, Workflow } from 'lucide-react';

const GROUPS = {
  aiso: { title: 'AI Search Optimisation', body: 'Make your site readable, trustworthy and citable by AI systems.', icon: SearchCheck },
  automation: { title: 'AI Automation', body: 'Reviews, listings and content that keep improving visibility.', icon: Workflow },
  chatbot: { title: 'AI Chatbots', body: 'Turn AI-driven visitors into booked calls.', icon: Bot },
  custom: { title: 'Custom AI Solutions', body: 'Anything else the report uncovered.', icon: SearchCheck },
};

export default function HowMakeFlowHelps({ recommendations = [] }) {
  const groups = Object.entries(GROUPS)
    .map(([key, g]) => ({ key, ...g, recs: recommendations.filter((r) => (r.service || r.service_key) === key) }))
    .filter((g) => g.recs.length);
  const shown = groups.length ? groups : Object.entries(GROUPS).slice(0, 3).map(([key, g]) => ({ key, ...g, recs: [] }));

  return (
    <div className="help">
      <span className="eyebrow" style={{ color: '#67E8F9' }}>
        How MakeFlow fixes this
      </span>
      <h2>A plan, grouped by the service that delivers it</h2>
      <div className={`help-grid help-n${Math.min(shown.length, 3)}`}>
        {shown.map((g) => {
          const Icon = g.icon;
          return (
            <div className="help-item" key={g.key}>
              <div className="ic">
                <Icon className="lucide svg" />
              </div>
              <h4>{g.title}</h4>
              <p>{g.body}</p>
              {g.recs.length > 0 && (
                <ul>
                  {g.recs.map((r) => (
                    <li key={r.title}>
                      <Check className="lucide svg" />
                      {r.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
