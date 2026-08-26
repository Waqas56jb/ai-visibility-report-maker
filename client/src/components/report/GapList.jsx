import { XCircle } from 'lucide-react';

export default function GapList({ gaps = [] }) {
  return (
    <div>
      {gaps.map((g) => (
        <div className="gap" key={g.question}>
          <div className="q">
            <XCircle className="lucide svg" />
            <span>{g.question}</span>
          </div>
          <div>
            <span className="cat">{g.category}</span>
          </div>
          <div className="rivals">
            Named instead:{' '}
            {(g.named_instead || []).map((r) => (
              <b key={r}>{r}</b>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
