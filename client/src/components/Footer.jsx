import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot">
          <div>
            <Logo />
            <p>
              Australian AI studio. We make businesses visible to AI assistants and build the
              chatbots and automations that turn that visibility into customers.
            </p>
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
              <li>
                <a href="#services">AI Search Optimisation</a>
              </li>
              <li>
                <a href="#services">AI Chatbots</a>
              </li>
              <li>
                <a href="#services">AI Automation</a>
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
          <span>© 2026 MakeFlow Pty Ltd · makeflow.com.au</span>
          <span>Results tested against ChatGPT · Scores vary over time</span>
        </div>
      </div>
    </footer>
  );
}
