import { ArrowUpRight, Sparkles, Timer, TrendingUp } from 'lucide-react';
import { serviceLink, withReportContext } from '../../lib/serviceLinks.js';

export default function RecommendationList({ items = [], report = null }) {
  if (!items.length) return <p className="muted">No recommendations stored for this report.</p>;
  return (
    <div className="rec-grid">
      {items.map((r, i) => {
        const key = r.service || r.service_key;
        const svc = key ? serviceLink(key) : null;
        return (
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
                {svc ? (
                  <a
                    className="tag svc svc-link"
                    href={withReportContext(svc.cta, report)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`See how MakeFlow delivers ${svc.label}`}
                  >
                    <Sparkles className="lucide svg" /> {svc.label}
                    <ArrowUpRight className="lucide svg go" />
                  </a>
                ) : key ? (
                  <span className="tag svc">
                    <Sparkles className="lucide svg" /> {key}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
