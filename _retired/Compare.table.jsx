import Reveal from './Reveal.jsx';

// How the work differs from a typical SEO retainer. Each right-hand cell is a
// promise the site already makes elsewhere.
const ROWS = [
  ['Starting point', 'A sales call and a pitch', 'A free, measured report'],
  ['Where you show up', 'Google rankings only', 'Google, Maps, and ChatGPT, Gemini and Perplexity answers'],
  ['Reporting', 'Traffic graphs and vanity metrics', 'One score, with every weight shown up front'],
  ['Order of work', 'A generic checklist', 'Fixes in the order your report says matters'],
  ['Who does it', 'An account manager between you and the work', 'Me, directly'],
  ['Commitment', 'Long lock-in contracts', 'Monthly, no lock-in'],
];

export default function Compare() {
  return (
    <section className="section pf-compare" id="compare">
      <div className="wrap">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow">Why this approach</span>
            <h2>
              What proper SEO <span className="hl">actually</span> looks like
            </h2>
          </div>
          <p>Not all SEO is built the same. Here is the difference before you spend a dollar.</p>
        </Reveal>
        <Reveal delay="d1" className="pf-table" role="table" aria-label="Typical SEO compared with how I work">
          <div className="pf-tr pf-th" role="row">
            <span role="columnheader" />
            <span role="columnheader">Typical SEO</span>
            <span role="columnheader">How I work</span>
          </div>
          {ROWS.map(([area, them, me]) => (
            <div key={area} className="pf-tr" role="row">
              <span role="rowheader">{area}</span>
              <span role="cell" className="pf-them">{them}</span>
              <span role="cell" className="pf-me">{me}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
