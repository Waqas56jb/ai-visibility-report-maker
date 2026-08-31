import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarCheck, ScanSearch } from 'lucide-react';
import Navbar, { goToCheck } from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Reveal from '../components/Reveal.jsx';
import { useSite } from '../store/site.jsx';

const STORY = [
  {
    label: 'The shift',
    title: 'Search stopped being a list of links.',
    body: 'People used to type a few words and pick from ten blue links. Now they ask an assistant a full question and get one answer back, with two or three businesses named in it. If you are not one of them, the customer never learns you exist: there is no second page to be on.',
  },
  {
    label: 'Our answer',
    title: 'Measure it before you spend a dollar fixing it.',
    body: 'Most advice about AI search is guesswork sold with confidence. So we built the measurement first: real customer questions, asked of ChatGPT in both browsing and knowledge mode, scored across six weighted metrics. You see exactly where you are named, where a competitor is named instead, and where nobody is.',
  },
  {
    label: 'How we work',
    title: 'The report is free. The work is optional.',
    body: 'You can run the report, read it, hand it to whoever already does your marketing, and never speak to us. If you would rather we did the work, we build the fixes too: content, structure, automation, chatbots. Either way you start from evidence instead of a pitch.',
  },
];

const BELIEFS = [
  {
    title: 'Show the working.',
    body: 'Every score in the report traces back to a question we asked and an answer we got. No black box, no vanity metric you cannot check.',
  },
  {
    title: 'Say the real number.',
    body: 'AI answers move around. We say so, we tell you to re-run it, and we would rather report an uncomfortable score than a flattering one.',
  },
  {
    title: 'Keep it simple.',
    body: 'You should be able to read the report once and know what to do first. If a feature makes that harder, it does not ship.',
  },
];

export default function AboutPage() {
  const navigate = useNavigate();
  const { content } = useSite();
  const brand = content.brandName || 'MakeFlow';
  const bookUrl = (content.bookCall?.url || 'https://cal.com/isuruabhishek/30min').trim();

  useEffect(() => {
    document.title = `About us | ${brand}`;
  }, [brand]);

  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <section className="page-hero about-hero">
          <div className="hero-glow" />
          <div className="hero-grid" />
          <div className="wrap">
            <Reveal className="page-hero-in">
              <span className="eyebrow">About us</span>
              <h1>We build the thing that gets you named by AI.</h1>
              <p className="lead">
                {brand} is an Australian AI automation studio. We started asking assistants the
                questions our own clients' customers ask, and found most good businesses were
                simply missing from the answer. So we built a way to measure it, then a way to fix
                it.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="section about-story">
          <div className="wrap">
            <Reveal className="section-head">
              <span className="eyebrow">Why we exist</span>
              <h2>The way people find a business changed. Most businesses have not.</h2>
            </Reveal>
            <div className="about-track">
              {STORY.map((s, i) => (
                <Reveal key={s.label} delay={i === 0 ? '' : `d${i}`} className="about-step">
                  <span className="about-step-label">{s.label}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section about-beliefs">
          <div className="wrap">
            <Reveal className="section-head center">
              <span className="eyebrow">What we believe</span>
              <h2>Three rules we hold ourselves to</h2>
            </Reveal>
            <div className="about-beliefs-grid">
              {BELIEFS.map((b, i) => (
                <Reveal key={b.title} delay={i === 0 ? '' : `d${i}`} className="about-belief">
                  <h3>{b.title}</h3>
                  <p>{b.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section about-cta-sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <Reveal className="cta">
              <div className="cta-copy">
                <h2>See where you stand today</h2>
                <p>
                  The report is free and takes about three minutes to run. Read it yourself, or talk
                  it through with us, no obligation either way.
                </p>
                <div className="cta-btns">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => goToCheck(navigate, '/about')}
                  >
                    <ScanSearch className="lucide svg" /> Run my free report
                  </button>
                  <a
                    className="btn btn-ghost-light"
                    href={bookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CalendarCheck className="lucide svg" /> Book a free call
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
