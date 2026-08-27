import { Bot, FileBarChart, Globe, MessageSquareText } from 'lucide-react';
import Reveal from './Reveal.jsx';

const STEPS = [
  {
    n: 'Step 1',
    icon: Globe,
    title: 'We read your website',
    body: 'Homepage plus key pages. We extract services, locations, structured data, FAQ content and whether AI crawlers are even allowed in.',
  },
  {
    n: 'Step 2',
    icon: MessageSquareText,
    title: 'We write real questions',
    body: '30 to 50 questions a customer in your niche and city would actually ask: discovery, comparison, brand, local and long-tail.',
  },
  {
    n: 'Step 3',
    icon: Bot,
    title: 'We ask ChatGPT',
    body: 'Each question runs twice: with browsing and from its own knowledge. We record who it names, in what order, and how it describes you.',
  },
  {
    n: 'Step 4',
    icon: FileBarChart,
    title: 'You get the report',
    body: 'Score, breakdown, competitor share of voice, gap list and a prioritised fix plan, on screen and as a branded PDF.',
  },
];

export default function HowItWorks() {
  return (
    <section className="section" id="how">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="eyebrow">How it works</span>
          <h2>From URL to evidence in four steps</h2>
          <p>
            The order matters: we can't ask the right questions until we understand your business,
            and we can't score you until ChatGPT has answered them.
          </p>
        </Reveal>
        <div className="steps">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const delay = i === 0 ? '' : `d${i}`;
            return (
              <Reveal key={step.n} delay={delay} className="card step">
                <div className="n">{step.n}</div>
                <div className="ic">
                  <Icon className="lucide svg" />
                </div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
