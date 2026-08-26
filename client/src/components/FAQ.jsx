import { Plus } from 'lucide-react';
import Reveal from './Reveal.jsx';

const ITEMS = [
  {
    q: 'Which AI is this tested against?',
    a: 'ChatGPT only, in two modes: with web browsing enabled and from its own knowledge. Both are reported separately so you can see whether your website or your reputation is doing the work.',
    open: true,
  },
  {
    q: 'How long does it take?',
    a: "Usually 2–3 minutes. We crawl your site, generate 30–50 questions, run each twice and score the results. You'll see live progress and we'll email you the link if you ask us to.",
  },
  {
    q: 'Will my score change if I run it again?',
    a: 'Yes, slightly. AI answers are non-deterministic. Treat the score as a snapshot and compare trends over time rather than single points. That is why re-run exists.',
  },
  {
    q: 'What if my site blocks crawlers?',
    a: 'We still run the visibility test. The readiness score reflects what we could observe and the report tells you exactly which crawler rules are blocking AI systems.',
  },
  {
    q: 'Is it really free?',
    a: "Yes. The report is a free lead magnet. If you want us to fix what it finds — schema, pages, listings, a chatbot — that's MakeFlow's paid work.",
  },
  {
    q: 'What does the PDF include?',
    a: 'Overall score, mention rate, position, citations, readiness, score by mode and category, competitor share of voice, highest-value gaps, sequenced recommendations, and how MakeFlow can deliver the work. Formatted for A4.',
  },
  {
    q: 'Do you test Google, Perplexity or Gemini?',
    a: 'Not in this product. One engine, done properly, beats a thin score across five. ChatGPT is the assistant most Australian SMEs hear about from customers today.',
  },
  {
    q: 'Will you spam my email?',
    a: 'We send the report link when you ask. No drip sequences from this form. You can create an account to keep history and re-run later.',
  },
];

export default function FAQ() {
  return (
    <section className="section" id="faq" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="section-head center">
          <span className="eyebrow">FAQ</span>
          <h2>Questions before you run it</h2>
        </Reveal>
        <Reveal delay="d1" className="faq">
          {ITEMS.map((item) => (
            <details key={item.q} open={item.open}>
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
