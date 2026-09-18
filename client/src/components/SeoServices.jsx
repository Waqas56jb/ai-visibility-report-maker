import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import Reveal from './Reveal.jsx';
import { useSite } from '../store/site.jsx';
import { enrichServices } from '../lib/seoServices.js';

export default function SeoServices() {
  const { content } = useSite();
  const items = enrichServices(content.servicesPage?.items || []);

  return (
    <section className="section seo-svcs" id="services">
      <div className="wrap">
        <Reveal className="section-head seo-svcs-head">
          <div>
            <span className="eyebrow">What I do</span>
            <h2>
              SEO, and <span className="hl">only</span> SEO
            </h2>
          </div>
          <p>Every project starts from a measured report. These are the fixes that come out of it.</p>
        </Reveal>
        <div className="seo-svcs-grid pf-svc-list">
          {items.map((s, i) => {
            const Icon = s.icon || Search;
            return (
              <Reveal key={s.title || i} className="pf-svc">
                <span className="pf-svc-n">{String(s.n).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                <span className="pf-svc-ic" aria-hidden="true">
                  <Icon className="lucide svg" />
                </span>
              </Reveal>
            );
          })}
        </div>
        <Reveal delay="d1" className="seo-svcs-foot">
          <Link className="btn btn-ghost" to="/services">
            See every SEO service <ArrowRight className="lucide svg" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
