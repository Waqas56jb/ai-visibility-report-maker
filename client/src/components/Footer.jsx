import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail } from 'lucide-react';
import Logo from './Logo.jsx';
import { useSite } from '../store/site.jsx';

const FOR_AI = [
  { href: '/llms.txt', label: 'llms.txt', note: 'Machine-readable summary' },
  { href: '/ai.txt', label: 'ai.txt', note: 'AI usage policy' },
  { href: '/robots.txt', label: 'robots.txt', note: 'Crawler rules' },
];

export default function Footer() {
  const { content } = useSite();
  const services = (content.servicesPage?.items || []).slice(0, 4);
  const brand = content.brandName || 'MakeFlow';
  const year = new Date().getFullYear();

  return (
    <footer>
      <div className="wrap">
        <div className="foot">
          <div className="foot-brand">
            <Logo />
            <p>{content.footerBlurb}</p>
            <a className="foot-mail" href="mailto:hello@makeflow.com.au">
              <Mail className="lucide svg" /> hello@makeflow.com.au
            </a>
          </div>

          <div className="foot-cols">
            <div className="foot-col">
              <h4>Product</h4>
              <ul>
                <li><a href="#check">AI Visibility Report</a></li>
                <li><a href="#measure">Methodology</a></li>
                <li><Link to="/plans">Plans</Link></li>
                <li><Link to="/use-cases">Use cases</Link></li>
              </ul>
            </div>

            <div className="foot-col">
              <h4>Services</h4>
              <ul>
                {services.map((s) => (
                  <li key={s.title}><Link to="/services">{s.title}</Link></li>
                ))}
                <li><Link to="/services">All services</Link></li>
              </ul>
            </div>

            <div className="foot-col">
              <h4>Company</h4>
              <ul>
                <li><Link to="/about">About us</Link></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="mailto:hello@makeflow.com.au">Talk to us</a></li>
                <li><Link to="/login">Client login</Link></li>
              </ul>
            </div>

            <div className="foot-col">
              <h4>For AI</h4>
              <ul className="foot-ai">
                {FOR_AI.map((f) => (
                  <li key={f.href}>
                    <a href={f.href} target="_blank" rel="noreferrer">
                      {f.label} <ArrowUpRight className="lucide svg" />
                    </a>
                    <span>{f.note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="foot-bottom">
          <span>&copy;{year} {brand}. All rights reserved.</span>
          <nav className="foot-legal">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-and-conditions">Terms and Conditions</Link>
          </nav>
        </div>
      </div>

      <div className="foot-mark" aria-hidden="true">MakeFlow</div>
    </footer>
  );
}
