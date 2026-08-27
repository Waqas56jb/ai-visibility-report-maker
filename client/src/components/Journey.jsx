import { Fragment } from 'react';
import { ArrowRight, CalendarCheck, ScanSearch, TrendingDown } from 'lucide-react';
import Reveal from './Reveal.jsx';
import { useSite } from '../store/site.jsx';

const STEPS = [
  {
    icon: ScanSearch,
    title: 'Check your score',
    body: 'Free, about 3 minutes. We run real customer questions through ChatGPT for your business.',
  },
  {
    icon: TrendingDown,
    title: 'See the gap',
    body: 'The exact questions where a competitor gets named instead of you, and why.',
  },
];

export default function Journey() {
  const { content } = useSite();
  const bookUrl = (content.bookCall?.url || 'https://makeflow.com.au/contact').trim();
  const bookExternal = /^https?:\/\//i.test(bookUrl);
  const bookProps = bookExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <section className="journey" aria-label="How this works, start to finish">
      <div className="wrap journey-row">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <Fragment key={s.title}>
              <Reveal delay={i === 0 ? '' : 'd1'} className="journey-step">
                <span className="jn">{i + 1}</span>
                <div className="ic">
                  <Icon className="lucide svg" />
                </div>
                <div>
                  <h4>{s.title}</h4>
                  <p>{s.body}</p>
                </div>
              </Reveal>
              <span className="journey-arrow" aria-hidden="true">
                <ArrowRight className="lucide svg" />
              </span>
            </Fragment>
          );
        })}

        <Reveal delay="d2" as="a" href={bookUrl} {...bookProps} className="journey-step journey-cta">
          <span className="jn jn-brand">3</span>
          <div className="ic ic-brand">
            <CalendarCheck className="lucide svg" />
          </div>
          <div>
            <h4>
              We fix it <ArrowRight className="lucide svg go" />
            </h4>
            <p>AI Search Optimisation, chatbots or automation. Book a call and we get to work.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
