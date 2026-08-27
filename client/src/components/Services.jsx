import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal.jsx';
import { useSite } from '../store/site.jsx';

export default function Services() {
  const { content } = useSite();
  const items = content.services || [];
  return (
    <section className="section" id="services">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="eyebrow">{content.servicesEyebrow}</span>
          <h2>{content.servicesTitle}</h2>
          <p>{content.servicesLead}</p>
        </Reveal>
        <div className="services">
          {items.map((item, i) => (
            <Reveal key={item.title || i} delay={i === 0 ? '' : `d${i}`} className="card service">
              <span className="num">{String(i + 1).padStart(2, '0')}</span>
              {item.img ? <img src={item.img} alt="" /> : null}
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <a href="#services">
                Learn more <ArrowRight className="lucide svg" />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
