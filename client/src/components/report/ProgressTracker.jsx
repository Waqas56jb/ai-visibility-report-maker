import { CheckCircle2, Circle, LoaderCircle } from 'lucide-react';
import { STAGES } from '../../api/generate.js';

const LABELS = {
  queued: 'Queued',
  crawling: 'Crawling your website',
  generating_queries: 'Generating customer questions',
  testing: 'Asking ChatGPT',
  scoring: 'Calculating your score',
  writing_recommendations: 'Writing recommendations',
  generating_pdf: 'Building your PDF',
  completed: 'Completed',
  failed: 'Failed',
};

export default function ProgressTracker({ step, status, error, onRetry }) {
  const idx = STAGES.indexOf(step);
  return (
    <div className="progress-box" style={{ margin: '40px auto' }}>
      <h2>{status === 'failed' ? 'Report failed' : LABELS[step] || 'Working…'}</h2>
      {error && <p>{error}</p>}
      <div className="plist">
        {STAGES.map((s, i) => {
          const done = status === 'completed' || (idx > i && idx >= 0);
          const now = status !== 'completed' && status !== 'failed' && s === step;
          return (
            <div key={s} className={done ? 'done' : now ? 'now' : ''}>
              {done ? (
                <CheckCircle2 className="lucide svg" />
              ) : now ? (
                <LoaderCircle className="lucide svg spin" />
              ) : (
                <Circle className="lucide svg" />
              )}
              {LABELS[s]}
            </div>
          );
        })}
      </div>
      {status === 'failed' && onRetry && (
        <button type="button" className="btn btn-grad" style={{ marginTop: 20 }} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
