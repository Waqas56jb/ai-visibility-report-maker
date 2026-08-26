import { XCircle } from 'lucide-react';

export default function GapList({ gaps = [] }) {
  if (!gaps.length) {
    return <p className="muted">No high-value gaps stored for this report.</p>;
  }
  return (
    <div className="gap-grid">
      {gaps.map((g) => {
        const named = (g.named_instead || g.competitors_named || []).filter(Boolean);
        return (
          <div className="gap" key={g.question || g.query}>
            <div className="q">
              <XCircle className="lucide svg" />
              <span>{g.question || g.query}</span>
            </div>
            <div className="gap-meta">
              {g.category && <span className="cat">{g.category}</span>}
              {g.mode && <span className="cat">{g.mode}</span>}
            </div>
            <div className="rivals">
              {named.length ? (
                <>
                  Named instead:
                  {named.slice(0, 4).map((r) => (
                    <b key={r}>{r}</b>
                  ))}
                </>
              ) : (
                <span className="none">No competitor named in this answer</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
