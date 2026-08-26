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
  const site = String(report.website || '').replace(/^https?:\/\//, '');
  const date = report.created_at ? new Date(report.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const queries = m.opportunity_count || m.query_count || report.query_count;

  return (
    <div className="analysis">
      <div className="analysis-hero">
        <div className="analysis-hero-copy">
          <span className="eyebrow">AI Visibility Report · Tested against ChatGPT</span>
          <h1>{report.business_name}</h1>
          <div className="meta">
            {site && <span>{site}</span>}
            {report.industry && <span>{report.industry}</span>}
            {report.city_region && <span>{report.city_region}</span>}
            {date && <span>{date}</span>}
          </div>
          {report.ai_readiness?.audit_incomplete && (
            <p className="muted">The website could not be fully crawled, so the readiness audit is incomplete.</p>
          )}
          {report.executive_summary && <p className="desc">{report.executive_summary}</p>}
          <div className="analysis-chips">
            {queries != null && <span>{queries} questions tested</span>}
            <span>Browsing + knowledge</span>
            {report.score_band && <span>{report.score_band}</span>}
            {report.readability_score != null && <span>Readiness {report.readability_score}/100</span>}
          </div>
        </div>
        <ScoreGauge score={report.overall_score} band={report.score_band} />
      </div>

      <div className="analysis-kpis">
        <KpiCard label="Mention rate" value={`${m.mention_rate ?? '—'}%`} hint={m.mention_label} width={m.mention_rate} />
        <KpiCard label="Average position" value={m.avg_position ?? '—'} hint="when mentioned" />
        <KpiCard label="Citations" value={m.citations ?? '—'} hint="browsing answers linked you" />
        <KpiCard label="Sentiment" value={m.sentiment ?? '—'} hint="across mentions" />
      </div>

      <div className="grid2">
        <div className="card panel">
          <h3>Score by mode</h3>
          <p className="desc">Browsing uses the live web. Knowledge is what ChatGPT already “knows”.</p>
          <BarList items={report.score_by_mode || []} />
        </div>
        <div className="card panel">
          <h3>Score by question category</h3>
          <p className="desc">Where you show up — and where you disappear.</p>
          <BarList items={report.score_by_category || []} colored />
        </div>
      </div>

      <div className="grid2">
        <div className="card panel">
          <h3>How the score is built</h3>
          <p className="desc">Transparent weights. Mentions carry the most.</p>
          <WeightsTable items={report.weights || m.weights || []} />
        </div>
        <div className="card panel">
          <h3>Website AI-readiness {report.readability_score != null ? `${report.readability_score}/100` : ''}</h3>
          <p className="desc">Technical signals that help ChatGPT find, trust and cite you.</p>
          <ReadinessChecklist checks={report.ai_readiness?.checks || []} />
        </div>
      </div>

      <div className="card panel" style={{ marginBottom: 20 }}>
        <h3>Competitors ChatGPT recommends</h3>
        <p className="desc">Share of voice when ChatGPT names providers in your category.</p>
        <CompetitorTable rows={competitors} />
      </div>

      <div className="card panel" style={{ marginBottom: 20 }}>
        <h3>Prioritised recommendations</h3>
        <p className="desc">Do these first. Each maps to a MakeFlow service.</p>
        <RecommendationList items={report.recommendations || []} />
      </div>

      <div className="card panel" style={{ marginBottom: 20 }}>
        <h3>Highest-value gaps</h3>
        <p className="desc">Live questions where ChatGPT named someone else — or named nobody.</p>
        <GapList gaps={report.gaps || []} />
      </div>

      <HowMakeFlowHelps recommendations={report.recommendations || []} />
      <div className="method">
        Methodology: tested against ChatGPT in browsing and knowledge modes. AI answers are non-deterministic; scores
        vary over time. Re-run later to track change.
      </div>
    </div>
  );
}
