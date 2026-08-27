import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useSite } from '../store/site.jsx';

export default function Footer() {
  const { content } = useSite();
  return (
    <footer>
      <div className="wrap">
        <div className="foot">
          <div>
            <Logo />
            <p>{content.footerBlurb}</p>
          </div>
          <div>
            <h4>Product</h4>
            <ul>
              <li>
                <a href="#check">AI Visibility Report</a>
              </li>
              <li>
                <a href="#measure">Methodology</a>
              </li>
              <li>
                <Link to="/report">Sample report</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Services</h4>
            <ul>
              {(content.servicesPage?.items || []).slice(0, 3).map((s) => (
                <li key={s.title}>
                  <Link to="/services">{s.title}</Link>
                </li>
              ))}
              <li>
                <Link to="/services">All services</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li>
                <a href="#faq">About</a>
              </li>
              <li>
                <a href="mailto:hello@makeflow.com.au">Contact</a>
              </li>
              <li>
                <a href="#faq">Privacy</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>{content.footerCopy}</span>
          <span>{content.footerNote}</span>
        </div>
      </div>
    </footer>
  );
}
