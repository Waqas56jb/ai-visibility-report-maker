import { Plus } from 'lucide-react';
import Reveal from './Reveal.jsx';
import { useSite } from '../store/site.jsx';

export default function FAQ() {
  const { content } = useSite();
  const items = content.faqs || [];
  return (
    <section className="section" id="faq" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="section-head center">
          <span className="eyebrow">{content.faqEyebrow || 'FAQ'}</span>
          <h2>{content.faqTitle}</h2>
        </Reveal>
        <Reveal delay="d1" className="faq">
          {items.map((item, i) => (
            <details key={item.q || i} open={i === 0}>
              <summary>
                {item.q} <Plus className="lucide svg" />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
