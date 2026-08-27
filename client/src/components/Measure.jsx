import { FileSearch, Link as LinkIcon, ListOrdered, Megaphone, Smile, Swords } from 'lucide-react';
import Reveal from './Reveal.jsx';

const METRICS = [
  { icon: Megaphone, title: 'Mention rate', body: 'How often ChatGPT names you at all', w: '35%' },
  { icon: ListOrdered, title: 'Prominence', body: 'Are you first, or an afterthought?', w: '20%' },
  {
    icon: FileSearch,
    title: 'Website AI-readiness',
    body: 'Schema, FAQ, llms.txt, crawler access, clarity',
    w: '15%',
  },
  { icon: LinkIcon, title: 'Citation rate', body: 'Does browsing mode link to your site?', w: '10%' },
  { icon: Smile, title: 'Sentiment', body: 'Positive, neutral or negative descriptions', w: '10%' },
  { icon: Swords, title: 'Competitive position', body: 'Your share of voice vs the leader', w: '10%' },
];

export default function Measure() {
  return (
    <section className="section measure" id="measure">
      <div className="wrap">
        <Reveal className="measure-img">
          <img
            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80"
            alt="Business owner reviewing results"
          />
          <div className="float">
            <span className="sc">23</span>
            <p>
              <strong>Barely visible</strong>
              Absent from 31 of 42 questions. Competitors named 4× more often.
            </p>
          </div>
        </Reveal>
        <Reveal delay="d1">
          <span className="eyebrow">What we measure</span>
          <h2 style={{ fontSize: 'clamp(30px,3.8vw,46px)', margin: '16px 0 14px' }}>
            Six signals, weighted into one score
          </h2>
          <p className="muted">
            Every weight is shown up front. If ChatGPT never mentions you at all, a tidy website
            will not save you, so mentions carry the most.
          </p>
          <div className="metrics">
            {METRICS.map((m) => {
              const Icon = m.icon;
              return (
                <div className="metric" key={m.title} style={{ '--w': m.w }}>
                  <div className="ic">
                    <Icon className="lucide svg" />
                  </div>
                  <div>
                    <h4>{m.title}</h4>
                    <p>{m.body}</p>
                  </div>
                  <span className="w">{m.w}</span>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
