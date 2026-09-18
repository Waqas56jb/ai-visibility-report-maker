import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarCheck } from 'lucide-react';
import { goToCheck } from './Navbar.jsx';
import Reveal from './Reveal.jsx';
import Shapes3D from './Shapes3D.jsx';
import { useSite } from '../store/site.jsx';

export default function FinalCta() {
  const navigate = useNavigate();
  const { content } = useSite();
  const cta = content.cta || {};
  const bookUrl = (content.bookCall?.url || 'https://cal.com/isuruabhishek/30min').trim();

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="cta">
          <Shapes3D set="footer" />
          <div className="cta-copy">
            <h2>{cta.title || 'Find out where you stand in search'}</h2>
            <p>
              {cta.body ||
                'Run the free report, or book a call and I will walk you through what to fix first.'}
            </p>
            <div className="cta-actions">
              <button type="button" className="btn btn-grad" onClick={() => goToCheck(navigate, '/')}>
                {cta.button || 'Get my free report'} <ArrowRight className="lucide svg" />
              </button>
              <a href={bookUrl} className="btn btn-light btn-lead" target="_blank" rel="noopener noreferrer">
                <CalendarCheck className="lucide svg" /> Book a free call
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
