import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Play, ScanSearch } from 'lucide-react';
import Navbar, { goToCheck } from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Reveal from '../components/Reveal.jsx';
import { useSite } from '../store/site.jsx';

export default function ServicesPage() {
  const navigate = useNavigate();
  const { content } = useSite();
  const page = content.servicesPage || {};
  const items = page.items || [];
  const brand = content.brandName || 'MakeFlow';

  useEffect(() => {
    document.title = `${page.title || 'Services'} | ${brand}`;
  }, [page.title, brand]);

  return (
    <>
      <Navbar />
      <main>
        <section className="page-hero">
          <div className="hero-grid" />
          <div className="wrap">
            <Reveal className="page-hero-in">
              <span className="eyebrow">{page.eyebrow}</span>
              <h1>{page.title}</h1>
              <p className="lead">{page.lead}</p>
              <div className="hero-ctas">
                <button
                  type="button"
                  className="btn btn-grad"
                  onClick={() => goToCheck(navigate, '/services')}
                >
                  <ScanSearch className="lucide svg" /> {page.ctaButton}
                </button>
                <Link
                  to="/report"
                  className="btn btn-ghost"
                  style={{ borderColor: 'rgba(255,255,255,.25)', color: '#fff' }}
                >
                  <Play className="lucide svg" /> {content.hero?.ctaSecondary}
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section" id="services">
          <div className="wrap">
            <div className="services">
              {items.map((item, i) => (
                <Reveal
                  key={item.title || i}
                  delay={i === 0 ? '' : `d${i % 3}`}
                  className="card service"
                >
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <Reveal className="cta">
              <span className="eyebrow" style={{ color: '#8B9BFB' }}>
                {page.ctaEyebrow}
              </span>
              <h2>{page.ctaTitle}</h2>
              <p>{page.ctaBody}</p>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => goToCheck(navigate, '/services')}
              >
                <ArrowRight className="lucide svg" /> {page.ctaButton}
              </button>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
