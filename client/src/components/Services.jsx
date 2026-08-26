import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal.jsx';

const ITEMS = [
  {
    img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    title: 'AI Search Optimisation',
    body: 'Schema, llms.txt, crawler access, FAQ and service pages written so AI systems can read, trust and cite you.',
  },
  {
    img: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=800&q=80',
    title: 'AI Chatbots',
    body: 'Custom assistants on your site and WhatsApp that answer, qualify and book — trained on your real content.',
  },
  {
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    title: 'AI Automation',
    body: 'Lead routing, review collection and content pipelines that keep your visibility improving without manual work.',
  },
];

export default function Services() {
  return (
    <section className="section" id="services">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="eyebrow">How MakeFlow helps</span>
          <h2>Every gap maps to a fix we deliver</h2>
          <p>Your report ends with a plan. These are the services behind that plan.</p>
        </Reveal>
        <div className="services">
          {ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={i === 0 ? '' : `d${i}`} className="card service">
              <img src={item.img} alt="" />
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
