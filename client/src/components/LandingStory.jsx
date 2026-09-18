import Reveal from './Reveal.jsx';

const REASONS = [
  {
    title: 'Search starts in two places now',
    body: '“Best accountant in Brisbane” gets typed into Google and asked of ChatGPT. Both answer with names. If yours is missing from either, the shortlist is set before anyone visits a website.',
  },
  {
    title: 'The engines have favourites',
    body: 'Google and AI models lean on directories, reviews, and competitors with clearer service pages. I show you who gets named instead of you, and why.',
  },
  {
    title: 'You can change the answer',
    body: 'Technical fixes, local listings, schema and content written to be quoted are how search engines decide you are the answer. I do that work, in the right order.',
  },
];

export default function LandingStory() {
  return (
    <section className="section pf-why" id="why">
      <div className="wrap">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow">Why SEO changed</span>
            <h2>
              Google is no longer the only <span className="hl">front door</span>
            </h2>
          </div>
          <p>
            Customers still search Google, and more of them now ask AI who to hire. Good SEO today wins
            both, and the free report shows you where you stand in each.
          </p>
        </Reveal>
        <div className="pf-svc-list">
          {REASONS.map(({ title, body }, i) => (
            <Reveal key={title} className="pf-svc pf-row">
              <span className="pf-svc-n">{String(i + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
