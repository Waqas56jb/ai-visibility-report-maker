import { useNavigate } from 'react-router-dom';
import { ScanSearch } from 'lucide-react';
import Reveal from './Reveal.jsx';
import { goToCheck } from './Navbar.jsx';
import { useSite } from '../store/site.jsx';

export default function FinalCta() {
  const navigate = useNavigate();
  const { content } = useSite();
  const cta = content.cta || {};
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="cta">
          <span className="eyebrow">
            {cta.eyebrow || 'Ready?'}
          </span>
          <h2>{cta.title}</h2>
          <p>{cta.body}</p>
          <button type="button" className="btn btn-light" onClick={() => goToCheck(navigate, '/')}>
            <ScanSearch className="lucide svg" /> {cta.button}
          </button>
        </Reveal>
      </div>
    </section>
  );
}
