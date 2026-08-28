import { useNavigate } from 'react-router-dom';
import { ScanSearch } from 'lucide-react';
import Reveal from './Reveal.jsx';
import { goToCheck } from './Navbar.jsx';
import { useSite } from '../store/site.jsx';

export default function LandingStory() {
  const navigate = useNavigate();
  const { content } = useSite();

  return (
    <section className="section why-ai" id="why">
      <div className="hero-glow" />
      <div className="wrap">
        <Reveal className="section-head center">
          <span className="eyebrow">Why this exists</span>
          <h2>
            Google is no longer the only <span className="hl">front door</span>
          </h2>
          <p>
            People ask ChatGPT who to hire, who to trust, and who is nearby. If the model does not
            know you, you are invisible in a conversation you never get to see. This report shows
            you what it actually says.
          </p>
          <div className="why-cta">
            <button type="button" className="btn btn-grad" onClick={() => goToCheck(navigate, '/')}>
              <ScanSearch className="lucide svg" /> {content.hero?.ctaPrimary || 'Run my free report'}
            </button>
            <span className="why-cta-note">{content.checker?.formSub || 'Takes about 3 minutes. One free report per email every 30 days.'}</span>
          </div>
        </Reveal>
        <div className="why-grid">
          <Reveal className="card why-card">
            <span className="why-n">01</span>
            <h3>Customers brief AI first</h3>
            <p>
              “Best accountant in Brisbane for a small business” is a real prompt. ChatGPT answers
              with names. If yours is missing, the shortlist is already set before they visit a
              website.
            </p>
          </Reveal>
          <Reveal delay="d1" className="card why-card">
            <span className="why-n">02</span>
            <h3>The model has favourites</h3>
            <p>
              It leans on directories, competitors with clearer service pages, and brands that
              look easy to trust. We show you who it names instead of you, question by question.
            </p>
          </Reveal>
          <Reveal delay="d2" className="card why-card">
            <span className="why-n">03</span>
            <h3>You can change the answer</h3>
            <p>
              Schema, FAQs, llms.txt and listings are how AI systems decide you are a real
              business. The report turns that into a plan with an order to it.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
