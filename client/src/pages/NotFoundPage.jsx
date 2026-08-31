import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Reveal from '../components/Reveal.jsx';
import { useSite } from '../store/site.jsx';

/* The handful of places someone landing on a dead URL actually wanted. */
const ROUTES = [
  { to: '/services', label: 'Services', note: 'Everything we build' },
  { to: '/plans', label: 'Plans', note: 'What it costs' },
  { to: '/use-cases', label: 'Use cases', note: 'Work we have shipped' },
  { to: '/about', label: 'About', note: 'Who you would be working with' },
];

export default function NotFoundPage() {
  const { content } = useSite();
  const { pathname } = useLocation();
  const brand = content.brandName || 'MakeFlow';

  useEffect(() => {
    document.title = `Page not found | ${brand}`;
  }, [brand]);

  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <section className="page-hero nf-hero">
          <div className="hero-glow" />
          <div className="hero-grid" />
          <div className="wrap">
            <Reveal className="page-hero-in">
              <span className="eyebrow">Error 404</span>
              <h1>
                This page isn't <span className="nf-code">here</span>.
              </h1>
              <p className="lead">
                Nothing lives at <code className="nf-path">{pathname}</code>. It may have moved, or
                the link may have been mistyped. Here is where most people are headed:
              </p>
            </Reveal>
          </div>
        </section>

        <section className="section nf-sec">
          <div className="wrap">
            <Reveal className="nf-grid">
              {ROUTES.map((r) => (
                <Link key={r.to} to={r.to} className="nf-card">
                  <Compass className="lucide svg" />
                  <strong>{r.label}</strong>
                  <span>{r.note}</span>
                </Link>
              ))}
            </Reveal>
            <Reveal className="nf-back">
              <Link to="/" className="btn btn-dark">
                <ArrowLeft className="lucide svg" />
                Back to home
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
