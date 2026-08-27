import { ArrowRight, Bot, CalendarCheck, Check, MessagesSquare, SearchCheck, Workflow } from 'lucide-react';
import { useSite } from '../../store/site.jsx';
import { withReportContext } from '../../lib/serviceLinks.js';

const GROUPS = {
  aiso: {
    title: 'AI Search Optimisation',
    body: 'Make your site readable, trustworthy and citable by AI systems.',
    icon: SearchCheck,
    cta: 'https://makeflow.com.au/contact?s=aiso',
  },
  automation: {
    title: 'AI Automation',
    body: 'Reviews, listings and content that keep improving visibility.',
    icon: Workflow,
    cta: 'https://makeflow.com.au/contact?s=automation',
  },
  chatbot: {
    title: 'AI Chatbots',
    body: 'Turn AI-driven visitors into booked calls.',
    icon: Bot,
    cta: 'https://makeflow.com.au/contact?s=chatbot',
  },
  custom: {
    title: 'Custom AI Solutions',
    body: 'Anything else the report uncovered.',
    icon: SearchCheck,
    cta: 'https://makeflow.com.au/contact',
  },
};


export default function HowMakeFlowHelps({ recommendations = [], report = null }) {
  const { content } = useSite();
  const bookUrl = (content.bookCall?.url || '').trim();

  // The server groups recommendations by service and attaches the CTA for each. Fall back to
  // grouping locally when an older report predates that field.
  const server = (report?.how_makeflow_helps || []).filter((g) => GROUPS[g.service_key]);
  const groups = server.length
    ? server.map((g) => ({
        key: g.service_key,
        ...GROUPS[g.service_key],
        title: g.name || GROUPS[g.service_key].title,
        body: g.description || GROUPS[g.service_key].body,
        cta: g.cta || GROUPS[g.service_key].cta,
        recs: g.items || [],
      }))
    : Object.entries(GROUPS)
        .map(([key, g]) => ({
          key,
          ...g,
          recs: recommendations.filter((r) => (r.service || r.service_key) === key).map((r) => r.title),
        }))
        .filter((g) => g.recs.length);

  const shown = groups.length
    ? groups
    : Object.entries(GROUPS)
        .slice(0, 3)
        .map(([key, g]) => ({ key, ...g, recs: [] }));

  const lead = shown[0];

  return (
    <div className="help">
      <span className="eyebrow" style={{ color: '#8B9BFB' }}>
        How MakeFlow fixes this
      </span>
      <h2>A plan, grouped by the service that delivers it</h2>
      <p>
        Every fix above maps to work we do for you. Pick the one that matters most, or talk it through
        with us first.
      </p>
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
                  {g.recs.map((title) => (
                    <li key={title}>
                      <Check className="lucide svg" />
                      {title}
                    </li>
                  ))}
                </ul>
              )}
              {g.cta && (
                <a
                  className="help-link"
                  href={withReportContext(g.cta, report)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get this fixed <ArrowRight className="lucide svg" />
                </a>
              )}
            </div>
          );
        })}
      </div>

      <div className="help-act">
        <div className="help-act-copy">
          <h3>Want us to do the work?</h3>
          <p>
            AI visibility is not a one-off job. Search answers move every week, so we treat it as
            ongoing work: fix the gaps, then keep you in the answer as your competitors catch on.
          </p>
        </div>
        <div className="help-act-btns">
          <a
            className="btn btn-light"
            href={withReportContext(bookUrl || lead?.cta, report)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CalendarCheck className="lucide svg" /> Book a call about this report
          </a>
          <a
            className="btn btn-ghost-light"
            href={withReportContext('https://makeflow.com.au/contact?s=other', report)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessagesSquare className="lucide svg" /> Ask about our other services
          </a>
        </div>
      </div>
    </div>
  );
}
