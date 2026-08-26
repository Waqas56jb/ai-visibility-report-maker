import ScoreGauge from './ScoreGauge.jsx';
import KpiCard from './KpiCard.jsx';
import BarList from './BarList.jsx';
import WeightsTable from './WeightsTable.jsx';
import ReadinessChecklist from './ReadinessChecklist.jsx';
import CompetitorTable from './CompetitorTable.jsx';
import GapList from './GapList.jsx';
import RecommendationList from './RecommendationList.jsx';
import HowMakeFlowHelps from './HowMakeFlowHelps.jsx';

export default function ReportView({ report }) {
  const m = report.metrics || {};
  const competitors = report.competitors || report.competitors_result || report.result_competitors || [];
  return (
    <>
      <div className="report-top">
        <div>
          <span className="eyebrow">AI Visibility Report · Tested against ChatGPT</span>
          <h1>{report.business_name}</h1>
          <div className="meta">
            <span>{report.website}</span>
            <span>·</span>
            <span>{report.created_at ? new Date(report.created_at).toLocaleDateString() : ''}</span>
          </div>
          {report.ai_readiness?.audit_incomplete && (
            <p className="muted">The website could not be fully crawled, so the readiness audit is incomplete.</p>
          )}
          {report.executive_summary && <p className="desc">{report.executive_summary}</p>}
        </div>
      </div>
      <div className="score-hero">
        <ScoreGauge score={report.overall_score} band={report.score_band} />
        <div className="kpis">
          <KpiCard label="Mention rate" value={`${m.mention_rate ?? '—'}%`} hint={m.mention_label} width={m.mention_rate} />
          <KpiCard label="Average position" value={m.avg_position ?? '—'} hint="when mentioned" />
          <KpiCard label="Citations" value={m.citations ?? '—'} hint="browsing answers linked you" />
          <KpiCard label="Sentiment" value={m.sentiment ?? '—'} hint="across mentions" />
        </div>
      </div>
      <div className="grid2">
        <div className="card panel">
          <h3>Score by mode</h3>
          <p className="desc">Browsing vs knowledge.</p>
          <BarList items={report.score_by_mode || []} />
        </div>
        <div className="card panel">
          <h3>Score by question category</h3>
          <p className="desc">Where you show up and where you vanish.</p>
          <BarList items={report.score_by_category || []} colored />
        </div>
      </div>
      <div className="grid2">
        <div className="card panel">
          <h3>How the score is built</h3>
          <WeightsTable items={report.weights || m.weights || []} />
        </div>
        <div className="card panel">
          <h3>Website AI-readiness {report.readability_score != null ? `${report.readability_score}/100` : ''}</h3>
          <ReadinessChecklist checks={report.ai_readiness?.checks || []} />
        </div>
      </div>
      <div className="card panel" style={{ marginBottom: 20 }}>
        <h3>Competitors ChatGPT recommends</h3>
        <CompetitorTable rows={competitors} />
      </div>
      <div className="grid2">
        <div className="card panel">
          <h3>Highest-value gaps</h3>
          <GapList gaps={report.gaps || []} />
        </div>
        <div className="card panel">
          <h3>Prioritised recommendations</h3>
          <RecommendationList items={report.recommendations || []} />
        </div>
      </div>
      <HowMakeFlowHelps recommendations={report.recommendations || []} />
      <div className="method">
        Methodology: tested against ChatGPT (browsing and knowledge). AI answers are non-deterministic; scores vary over time.
      </div>
    </>
  );
}
