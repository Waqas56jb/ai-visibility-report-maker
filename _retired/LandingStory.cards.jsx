import { MapPinned, MessagesSquare, Wrench } from 'lucide-react';
import Reveal from './Reveal.jsx';

const REASONS = [
  {
    icon: MapPinned,
    title: 'Search starts in two places now',
    body: '“Best accountant in Brisbane” gets typed into Google and asked of ChatGPT. Both answer with names. If yours is missing from either, the shortlist is set before anyone visits a website.',
  },
  {
    icon: MessagesSquare,
    title: 'The engines have favourites',
    body: 'Google and AI models lean on directories, reviews, and competitors with clearer service pages. I show you who gets named instead of you, and why.',
  },
  {
    icon: Wrench,
    title: 'You can change the answer',
    body: 'Technical fixes, local listings, schema and content written to be quoted are how search engines decide you are the answer. I do that work, in the right order.',
  },
];

export default function LandingStory() {
  return (
    <section className="section why-ai" id="why">
      <div className="wrap">
        <Reveal className="section-head why-head">
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
        <div className="why-grid">
          {REASONS.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i ? `d${i}` : ''} className="why-card">
              <span className="why-ic">
                <Icon className="lucide svg" />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
