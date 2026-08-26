import { useNavigate } from 'react-router-dom';
import { ScanSearch } from 'lucide-react';
import Reveal from './Reveal.jsx';
import { goToCheck } from './Navbar.jsx';

export default function FinalCta() {
  const navigate = useNavigate();
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="cta">
          <span className="eyebrow" style={{ color: '#67E8F9' }}>
            Ready?
          </span>
          <h2>Find out what ChatGPT says about you</h2>
          <p>Two minutes to fill in. Three minutes to wait. One honest score.</p>
          <button type="button" className="btn btn-light" onClick={() => goToCheck(navigate, '/')}>
            <ScanSearch className="lucide svg" /> Run my free report
          </button>
        </Reveal>
      </div>
    </section>
  );
}
