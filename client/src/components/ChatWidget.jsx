import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Check, Copy, RotateCcw, Square, X } from 'lucide-react';
import LogoMark from './LogoMark.jsx';
import { useSite } from '../store/site.jsx';
import { goToCheck } from './Navbar.jsx';
import { matchRule, OPENING } from '../lib/chatRules.js';

/* The three timings that give the bot its cadence. A rule-based answer is ready
   instantly; revealing it word by word after a short pause is what makes it read
   as a conversation rather than a lookup table. */
const THINK_MS = 420; // pause before the first word lands
const WORD_MS = 26; // per-word reveal while "typing"
const TEASER_MS = 14000; // how long before the closed launcher offers a nudge
const TEASER_SCROLL = 600; // …and only once the visitor is past the hero
const TEASER_LINGER_MS = 9000; // retract it on its own if it goes ignored

let seq = 0;
const uid = () => `m${(seq += 1)}`;

const greeting = () => [
  { id: 'greeting', role: 'assistant', content: OPENING.answer, chips: OPENING.chips, plain: true },
];

/* Answers may mark a phrase with **bold** — service names mostly, so a long reply
   still has something for the eye to land on. */
function Rich({ text }) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
}

function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="chat-copy"
      aria-label={done ? 'Copied' : 'Copy answer'}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard blocked — nothing useful to say, so stay quiet */
        }
      }}
    >
      {done ? <Check className="lucide svg" /> : <Copy className="lucide svg" />}
    </button>
  );
}

function Bubble({ role, content, plain }) {
  return (
    <div className={`chat-row ${role}`}>
      {role === 'assistant' && (
        <span className="chat-avatar" aria-hidden="true">
          <LogoMark solid />
        </span>
      )}
      <div className={`chat-msg ${role}`}>
        <Rich text={content} />
        {role === 'assistant' && !plain && <CopyBtn text={content} />}
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const { content } = useSite();
  const brand = content.brandName || 'MakeFlow';

  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState(greeting);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const [stream, setStream] = useState(null); // { words, i, chips }
  const [pinned, setPinned] = useState(true); // log is following the newest turn
  const [teaser, setTeaser] = useState(false);

  const inputRef = useRef(null);
  const logRef = useRef(null);
  const think = useRef(null);

  const busy = thinking || !!stream;

  useEffect(() => () => clearTimeout(think.current), []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    inputRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  /* Reveal the answer a word at a time, then commit it to the log so its chips
     and copy button appear only once the sentence has finished arriving. */
  useEffect(() => {
    if (!stream) return undefined;
    if (stream.i >= stream.words.length) {
      const { id, words, chips } = stream;
      setStream(null);
      setMsgs((m) =>
        m.some((x) => x.id === id) ? m : [...m, { id, role: 'assistant', content: words.join(' '), chips }]
      );
      inputRef.current?.focus();
      return undefined;
    }
    const t = setTimeout(
      () => setStream((s) => (s ? { ...s, i: s.i + 1 } : s)),
      stream.i === 0 ? 0 : WORD_MS
    );
    return () => clearTimeout(t);
  }, [stream]);

  /* Follow the newest message, but stop fighting the visitor the moment they
     scroll up to re-read something. */
  useLayoutEffect(() => {
    const log = logRef.current;
    if (log && pinned) log.scrollTop = log.scrollHeight;
  }, [msgs, thinking, stream, open, pinned]);

  const onScroll = () => {
    const log = logRef.current;
    if (!log) return;
    setPinned(log.scrollHeight - log.scrollTop - log.clientHeight < 56);
  };

  const send = useCallback(
    (raw) => {
      const text = String(raw || '').trim();
      if (!text || thinking || stream) return;
      const rule = matchRule(text);
      const id = uid();
      setMsgs((m) => [...m, { id, role: 'user', content: text }]);
      setDraft('');
      setPinned(true);
      setThinking(true);
      think.current = setTimeout(() => {
        setThinking(false);
        setStream({ id: uid(), words: rule.answer.split(' '), i: 0, chips: rule.chips });
      }, THINK_MS);
    },
    [thinking, stream]
  );

  // The stop control finishes the current answer immediately instead of killing it —
  // the text is already known, so cutting it off mid-sentence would only lose information.
  const finish = () => setStream((s) => (s ? { ...s, i: s.words.length } : s));

  const reset = () => {
    clearTimeout(think.current);
    setThinking(false);
    setStream(null);
    setMsgs(greeting());
    setDraft('');
    setPinned(true);
    inputRef.current?.focus();
  };

  const grow = (el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 116)}px`;
  };

  useEffect(() => {
    if (!draft) grow(inputRef.current);
  }, [draft]);

  const markTeaserSeen = useCallback(() => {
    try {
      sessionStorage.setItem('mf-chat-teaser', '1');
    } catch {
      /* storage blocked — the nudge simply shows again next visit */
    }
  }, []);

  /* A single, dismissible nudge on the closed launcher. Once per session, and
     only after the visitor has read a little and scrolled past the hero — a
     bubble that covers the headline on load is an interruption, not an invite.
     If it goes ignored it retracts itself rather than sitting over the page. */
  useEffect(() => {
    if (open) return undefined;
    let seen = false;
    try {
      seen = sessionStorage.getItem('mf-chat-teaser') === '1';
    } catch {
      seen = false;
    }
    if (seen) return undefined;

    let linger;
    const reveal = () => {
      setTeaser(true);
      linger = setTimeout(() => {
        setTeaser(false);
        markTeaserSeen();
      }, TEASER_LINGER_MS);
    };
    const armed = setTimeout(() => {
      if (window.scrollY >= TEASER_SCROLL) {
        reveal();
        return;
      }
      const onScroll = () => {
        if (window.scrollY >= TEASER_SCROLL) {
          window.removeEventListener('scroll', onScroll);
          reveal();
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      linger = () => window.removeEventListener('scroll', onScroll);
    }, TEASER_MS);

    return () => {
      clearTimeout(armed);
      if (typeof linger === 'function') linger();
      else clearTimeout(linger);
    };
  }, [open, markTeaserSeen]);

  const dropTeaser = () => {
    setTeaser(false);
    markTeaserSeen();
  };

  // Only the newest assistant turn offers chips; older ones would pile into a
  // wall of buttons the visitor has already moved past.
  const lastAssistant = msgs.map((m) => m.role).lastIndexOf('assistant');
  const chips = busy ? null : msgs[lastAssistant]?.chips;

  return (
    <>
      {teaser && !open && (
        <div className="chat-teaser">
          <button type="button" onClick={() => { dropTeaser(); setOpen(true); }}>
            Curious what we build? Ask me.
          </button>
          <button type="button" className="chat-teaser-x" onClick={dropTeaser} aria-label="Dismiss">
            <X className="lucide svg" />
          </button>
        </div>
      )}

      <button
        type="button"
        className={`chat-fab${open ? ' is-open' : ''}`}
        onClick={() => {
          dropTeaser();
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-controls="mf-chat-panel"
        aria-label={open ? 'Close chat' : `Chat with ${brand}`}
      >
        <span className="chat-fab-ico">
          {open ? <X className="lucide svg" /> : <LogoMark solid className="svg chat-fab-mark" />}
        </span>
      </button>

      {open && (
        <div className="chat-panel" id="mf-chat-panel" role="dialog" aria-label={`${brand} chat`}>
          <header className="chat-head">
            <span className="chat-brand" aria-hidden="true">
              <LogoMark />
            </span>
            <div className="chat-head-txt">
              <strong>Ask {brand}</strong>
              <span>
                <i className="chat-dot" aria-hidden="true" />
                Online
              </span>
            </div>
            {msgs.length > 1 && (
              <button type="button" onClick={reset} aria-label="Start a new chat" title="New chat">
                <RotateCcw className="lucide svg" />
              </button>
            )}
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">
              <X className="lucide svg" />
            </button>
          </header>

          <div className="chat-log" ref={logRef} onScroll={onScroll}>
            <div className="chat-stream" aria-live="polite" aria-atomic="false">
              {msgs.map((m) => (
                <Bubble key={m.id} role={m.role} content={m.content} plain={m.plain} />
              ))}

              {thinking && (
                <div className="chat-row assistant">
                  <span className="chat-avatar is-live" aria-hidden="true">
                    <LogoMark solid />
                  </span>
                  <div className="chat-msg assistant chat-typing" aria-label="Thinking">
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              )}

              {stream && (
                <div className="chat-row assistant">
                  <span className="chat-avatar is-live" aria-hidden="true">
                    <LogoMark solid />
                  </span>
                  <div className="chat-msg assistant">
                    <Rich text={stream.words.slice(0, stream.i).join(' ')} />
                    <span className="chat-caret" aria-hidden="true" />
                  </div>
                </div>
              )}

              {chips?.length ? (
                <div className="chat-starters">
                  {chips.map((s, i) => (
                    <button
                      key={s}
                      type="button"
                      style={{ animationDelay: `${i * 60}ms` }}
                      onClick={() => send(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {!pinned && (
            <button
              type="button"
              className="chat-jump"
              onClick={() => {
                setPinned(true);
                const log = logRef.current;
                if (log) log.scrollTop = log.scrollHeight;
              }}
              aria-label="Jump to latest"
            >
              <ArrowDown className="lucide svg" />
            </button>
          )}

          <form
            className="chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                grow(e.target);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(draft);
                }
              }}
              placeholder="Ask about our AI services…"
              maxLength={400}
              aria-label="Your message"
            />
            {stream ? (
              <button type="button" className="is-stop" onClick={finish} aria-label="Finish answer">
                <Square className="lucide svg" />
              </button>
            ) : (
              <button type="submit" disabled={!draft.trim() || thinking} aria-label="Send">
                <ArrowUp className="lucide svg" />
              </button>
            )}
          </form>

          <button
            type="button"
            className="chat-cta"
            onClick={() => {
              setOpen(false);
              goToCheck();
            }}
          >
            Or just run the free report
          </button>
        </div>
      )}
    </>
  );
}
