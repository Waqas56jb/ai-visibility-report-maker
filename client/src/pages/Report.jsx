import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Calendar,
  Check,
  ClipboardCheck,
  EyeOff,
  FileDown,
  Info,
  LayoutGrid,
  Link as LinkIcon,
  ListChecks,
  ListOrdered,
  Mail,
  Megaphone,
  Minus,
  Scale,
  SearchCheck,
  Smile,
  Sparkles,
  Swords,
  Timer,
  TrendingUp,
  Workflow,
  X,
  XCircle,
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import { bandOf, reportData as data } from '../lib/reportData';
import { useToast } from '../lib/toast.jsx';

const KPI_ICONS = {
  megaphone: Megaphone,
  'list-ordered': ListOrdered,
  link: LinkIcon,
  smile: Smile,
};

const HELP_ICONS = {
  'search-check': SearchCheck,
  workflow: Workflow,
  bot: Bot,
};

function barColor(v) {
  if (v < 30) return '#F0625A';
  if (v < 60) return '#F5B84B';
  return '#22C55E';
}

function kpiWidth(k) {
  if (typeof k[2] !== 'number') return null;
  if (k[0] === 'Average position') return 100 - (k[2] - 1) * 20;
  if (k[0] === 'Citations') return k[2] * 10;
  return k[2];
}

export default function Report() {
  const toast = useToast();
  const [score, setScore] = useState(0);
  const [barsOn, setBarsOn] = useState(false);

  const saved = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('mf_report') || 'null');
    } catch {
      return null;
    }
  }, []);

  const biz = saved?.business || 'Harbourview Accountants';
  const site = saved?.website || 'harbourviewaccountants.com.au';
  const band = bandOf(data.score);
  const offset = 628 - (628 * data.score) / 100;

  useEffect(() => {
    document.title = `${biz} — AI Visibility Report`;
    let interval;
    const start = window.setTimeout(() => {
      setBarsOn(true);
      let n = 0;
      interval = window.setInterval(() => {
        n += 1;
        setScore(n);
        if (n >= data.score) window.clearInterval(interval);
      }, 1400 / Math.max(data.score, 1));
    }, 120);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [biz]);

  return (
    <>
      <Navbar variant="report" />
      <div className="report">
        <div className="wrap">
          <div className="report-top">
            <div>
              <span className="eyebrow">AI Visibility Report · Tested against ChatGPT</span>
              <h1>{biz}</h1>
              <div className="meta">
                <span>{site}</span>
                <span>·</span>
                <span>{data.date}</span>
                <span>·</span>
                <span>{data.queries} queries</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-ghost" onClick={() => toast('Report link copied')}>
                <LinkIcon className="lucide svg" /> Copy link
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => toast('Downloading branded PDF…')}
              >
                <FileDown className="lucide svg" /> Download PDF
              </button>
            </div>
          </div>

          <div className="score-hero">
            <div className="card gauge-card">
              <div className="gauge">
                <svg viewBox="0 0 230 230">
                  <defs>
                    <linearGradient id="g" x1="0" x2="1">
                      <stop offset="0" stopColor="#4F46E5" />
                      <stop offset="1" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                  <circle className="track" cx="115" cy="115" r="100" />
                  <circle
                    className="val"
                    cx="115"
                    cy="115"
                    r="100"
                    style={{ strokeDashoffset: barsOn ? offset : 628 }}
                  />
                </svg>
                <div className="num">
                  <div>
                    <strong>{score}</strong>
                    <span>overall AI visibility</span>
                  </div>
                </div>
              </div>
              <span className={`band ${band[1]}`}>
                <EyeOff className="lucide svg" /> {band[0]}
              </span>
              <p>{band[2]}</p>
            </div>
            <div className="kpis">
              {data.kpis.map((k) => {
                const Icon = KPI_ICONS[k[3]];
                const w = kpiWidth(k);
                return (
                  <div className="card kpi" key={k[0]}>
                    <div className="l">
                      {Icon && <Icon className="lucide svg" />}
                      {k[0]}
                    </div>
                    <strong>
                      {k[2]}
                      {typeof k[2] === 'number' && k[0] === 'Mention rate' ? '%' : ''}
                    </strong>
                    <div className="s">{k[1]}</div>
                    {w != null && (
                      <div className="bar">
                        <i style={{ width: barsOn ? `${w}%` : 0 }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid2">
            <div className="card panel">
              <h3>
                <Bot className="lucide svg" /> Score by mode
              </h3>
              <p className="desc">
                Same engine, two behaviours. Browsing reads the live web; knowledge answers from
                what ChatGPT already "knows".
              </p>
              <div className="bars">
                {data.mode.map((m) => (
                  <div className="bar-row" key={m[0]}>
                    <span className="n">{m[0]}</span>
                    <div className="t">
                      <i style={{ width: barsOn ? `${m[1]}%` : 0, background: 'var(--grad)' }} />
                    </div>
                    <span className="v">{m[1]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card panel">
              <h3>
                <LayoutGrid className="lucide svg" /> Score by question category
              </h3>
              <p className="desc">Where you show up and where you vanish.</p>
              <div className="bars">
                {data.cats.map((m) => (
                  <div className="bar-row" key={m[0]}>
                    <span className="n">{m[0]}</span>
                    <div className="t">
                      <i
                        style={{
                          width: barsOn ? `${m[1]}%` : 0,
                          background: barColor(m[1]),
                        }}
                      />
                    </div>
                    <span className="v">{m[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid2">
            <div className="card panel">
              <h3>
                <Scale className="lucide svg" /> How the score is built
              </h3>
              <p className="desc">Weights are fixed and transparent.</p>
              <div className="weights">
                {data.weights.map((w) => (
                  <div className="wrow" key={w[0]}>
                    <span>{w[0]}</span>
                    <span className="pct">{w[1]}</span>
                    <span className="sc">{w[2]}/100</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card panel">
              <h3>
                <ClipboardCheck className="lucide svg" /> Website AI-readiness{' '}
                <span
                  style={{
                    marginLeft: 'auto',
                    fontFamily: 'var(--font-m)',
                    fontSize: 14,
                    color: 'var(--text-2)',
                  }}
                >
                  {data.readability}/100
                </span>
              </h3>
              <p className="desc">Can AI systems read, understand and cite your site?</p>
              <div className="checklist">
                {data.checks.map((c) => (
                  <div className={`check ${c[0]}`} key={c[1]}>
                    <div className="ic">
                      {c[0] === 'pass' ? (
                        <Check className="lucide svg" />
                      ) : c[0] === 'fail' ? (
                        <X className="lucide svg" />
                      ) : (
                        <Minus className="lucide svg" />
                      )}
                    </div>
                    <div>
                      <strong>{c[1]}</strong>
                      <span>{c[2]}</span>
                    </div>
                    <span className="pts">{c[3]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card panel" style={{ marginBottom: 20 }}>
            <h3>
              <Swords className="lucide svg" /> Competitors ChatGPT recommends
            </h3>
            <p className="desc">
              Who gets named when you don't. Share of voice = their mentions ÷ all business
              mentions.
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Mention rate</th>
                    <th>Avg position</th>
                    <th>Share of voice</th>
                    <th>Est. score</th>
                  </tr>
                </thead>
                <tbody>
                  {data.comps.map((c) => (
                    <tr className={c[5] ? 'you' : ''} key={c[0]}>
                      <td>
                        <strong>{c[0]}</strong>
                        {c[5] && (
                          <span className="tag svc" style={{ marginLeft: 6 }}>
                            you
                          </span>
                        )}
                      </td>
                      <td>{c[1]}%</td>
                      <td>{c[2].toFixed(1)}</td>
                      <td>
                        <div className="sov">
                          <i>
                            <b style={{ width: `${c[3] * 3}%` }} />
                          </i>
                          {c[3]}%
                        </div>
                      </td>
                      <td>
                        <strong>{c[4]}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid2">
            <div className="card panel">
              <h3>
                <AlertTriangle className="lucide svg" /> Highest-value gaps
              </h3>
              <p className="desc">
                Questions where you were absent and a competitor was named. Ordered by value to
                your business.
              </p>
              {data.gaps.map((g) => (
                <div className="gap" key={g[1]}>
                  <div className="q">
                    <XCircle className="lucide svg" />
                    <span>{g[1]}</span>
                  </div>
                  <div>
                    <span className="cat">{g[0]}</span>
                  </div>
                  <div className="rivals">
                    Named instead:{' '}
                    {g[2].map((r) => (
                      <b key={r}>{r}</b>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="card panel">
              <h3>
                <ListChecks className="lucide svg" /> Prioritised recommendations
              </h3>
              <p className="desc">Every item is tied to a finding in this report.</p>
              {data.recs.map((r, i) => (
                <div className="rec" key={r[0]}>
                  <div className="pr">{i + 1}</div>
                  <div>
                    <h4>{r[0]}</h4>
                    <div className="why">
                      <b>Why:</b> {r[1]}
                    </div>
                    <p>{r[2]}</p>
                    <div className="tags">
                      <span className={`tag ${r[3] === 'high' ? 'high' : r[3] === 'medium' ? 'med' : 'low'}`}>
                        <TrendingUp className="lucide svg" /> {r[3]} impact
                      </span>
                      <span className="tag low">
                        <Timer className="lucide svg" /> {r[4]} effort
                      </span>
                      <span className="tag svc">
                        <Sparkles className="lucide svg" /> {data.help[r[5]][0]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="help">
            <span className="eyebrow" style={{ color: '#67E8F9' }}>
              How MakeFlow fixes this
            </span>
            <h2>A plan, grouped by the service that delivers it</h2>
            <p>
              Your recommendations map to three MakeFlow services. Book a call and we'll walk
              through them against your actual answers.
            </p>
            <div className="help-grid">
              {Object.entries(data.help).map(([k, h]) => {
                const Icon = HELP_ICONS[h[2]];
                return (
                  <div className="help-item" key={k}>
                    <div className="ic">{Icon && <Icon className="lucide svg" />}</div>
                    <h4>{h[0]}</h4>
                    <p>{h[1]}</p>
                    <ul>
                      {data.recs
                        .filter((r) => r[5] === k)
                        .map((r) => (
                          <li key={r[0]}>
                            <Check className="lucide svg" />
                            {r[0]}
                          </li>
                        ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="mailto:hello@makeflow.com.au" className="btn btn-light">
                <Calendar className="lucide svg" /> Book a free call
              </a>
              <a
                href="mailto:hello@makeflow.com.au"
                className="btn btn-ghost"
                style={{ borderColor: 'rgba(255,255,255,.25)', color: '#fff' }}
              >
                <Mail className="lucide svg" /> Email us the report
              </a>
            </div>
          </div>

          <div className="method">
            <Info className="lucide svg" style={{ flex: 'none', marginTop: 2 }} />
            <span>
              Methodology: based on {data.queries} questions tested against ChatGPT (with browsing
              and from knowledge) on {data.date}. AI answers are non-deterministic; scores vary
              over time and re-running is expected. Business name matching handles common variants.
              Queries that errored are excluded from denominators.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
