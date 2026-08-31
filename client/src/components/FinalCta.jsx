import { CalendarCheck } from 'lucide-react';
import Reveal from './Reveal.jsx';
import { useSite } from '../store/site.jsx';

export default function FinalCta() {
  const { content } = useSite();
  const cta = content.cta || {};
  const bookUrl = (content.bookCall?.url || 'https://cal.com/isuruabhishek/30min').trim();

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="cta">
          <div className="cta-copy">
            <h2>{cta.title || 'Want to be visible on AI?'}</h2>
            <p>
              {cta.body ||
                "Every day, people ask ChatGPT, Gemini and Perplexity who to trust with their business. Book a free call and we'll show you exactly where you stand, and what to fix."}
            </p>
            <a href={bookUrl} className="btn btn-light" target="_blank" rel="noopener noreferrer">
              <CalendarCheck className="lucide svg" /> Book a free call
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
