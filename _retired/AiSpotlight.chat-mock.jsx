import { ArrowRight, Sparkles } from 'lucide-react';
import Reveal from './Reveal.jsx';
import { goToCheck } from './Navbar.jsx';
import { AI_ENGINES } from '../lib/aiEngineIcons.jsx';

// The hook of the whole site: customers now ask ChatGPT who to hire. The chat is
// an illustration; the businesses in it are made-up placeholders, not clients.
const ENGINES = AI_ENGINES.filter((e) => ['chatgpt', 'gemini', 'perplexity'].includes(e.key));
const NAMED = ['Harbour Plumbing Co.', 'Northside Plumbers', 'Bondi Pipe & Drain'];

function EngineIcon({ e }) {
  return e.d ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={e.d} fill={e.c} />
    </svg>
  ) : null;
}

export default function AiSpotlight() {
  return (
    <section className="section pf-ai" id="ai-visibility">
      <div className="wrap pf-ai-in">
        <Reveal className="pf-ai-copy">
          <span className="eyebrow">Free AI visibility report</span>
          <h2>
            Ask ChatGPT who to hire. <span className="hl">Are you</span> in the answer?
          </h2>
          <p>
            More of your customers now skip Google and ask ChatGPT, Gemini or Perplexity who to
            call. The AI names three or four businesses and the choice is made. I ask the AI the
            questions your customers ask, and show you whether you are named, where, and who gets
            picked instead.
          </p>
          <div className="pf-ai-engines" aria-label="AI assistants checked">
            {ENGINES.map((e) => (
              <span key={e.key} className="pf-ai-engine">
                <EngineIcon e={e} /> {e.label}
              </span>
            ))}
          </div>
          <button type="button" className="btn btn-grad" onClick={() => goToCheck()}>
            Check if ChatGPT recommends me <ArrowRight className="lucide svg" />
          </button>
        </Reveal>

        <Reveal delay="d1" className="pf-chat tilt" aria-hidden="true">
          <div className="pf-chat-top">
            <span className="pf-chat-dot" />
            <span className="pf-chat-dot" />
            <span className="pf-chat-dot" />
            <span className="pf-chat-title">Example answer</span>
          </div>
          <div className="pf-chat-q">Who's the best plumber in Sydney?</div>
          <div className="pf-chat-a">
            <span className="pf-chat-av">
              <Sparkles className="lucide svg" />
            </span>
            <div>
              <p>Here are some well-reviewed plumbers in Sydney:</p>
              <ol>
                {NAMED.map((n, i) => (
                  <li key={n} style={{ '--i': i }}>
                    <b>{n}</b>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="pf-chat-you">
            <span>Your business</span>
            <em>Not mentioned</em>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
