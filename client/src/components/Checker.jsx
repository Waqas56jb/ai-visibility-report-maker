import { ScanSearch } from 'lucide-react';
import Reveal from './Reveal.jsx';
import { useSite } from '../store/site.jsx';
import { useCheckerModal } from '../store/checkerModal.js';

export default function Checker() {
  const { content } = useSite();
  const checker = content.checker || {};
  const openChecker = useCheckerModal((s) => s.openChecker);

  return (
    <section className="section checker" id="check">
      <div className="wrap">
        <Reveal className="check-band">
          <span className="form-badge">
            <ScanSearch className="lucide svg" />
          </span>
          <h2>{checker.formTitle || 'Check your AI visibility'}</h2>
          <p>{checker.formSub || 'Takes about 3 minutes. One free report per email every 30 days.'}</p>
          <button type="button" className="btn btn-grad" onClick={openChecker}>
            <ScanSearch className="lucide svg" /> Run my free report
          </button>
        </Reveal>
      </div>
    </section>
  );
}
