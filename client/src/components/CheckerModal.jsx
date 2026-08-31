import { useCallback, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import CheckerForm from './CheckerForm.jsx';
import { useCheckerModal } from '../store/checkerModal.js';

export default function CheckerModal() {
  const open = useCheckerModal((s) => s.open);
  const closeChecker = useCheckerModal((s) => s.closeChecker);
  const cardRef = useRef(null);
  const returnTo = useRef(null);

  const close = useCallback(() => closeChecker(), [closeChecker]);

  useEffect(() => {
    if (!open) return undefined;
    returnTo.current = document.activeElement;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    const onKey = (e) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key !== 'Tab' || !cardRef.current) return;
      const focusable = cardRef.current.querySelectorAll(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
      if (returnTo.current && returnTo.current.focus) returnTo.current.focus();
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      className="checker-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Check your AI visibility"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="checker-modal-card form-card" ref={cardRef}>
        <button type="button" className="checker-modal-close" onClick={close} aria-label="Close">
          <X className="lucide svg" />
        </button>
        <CheckerForm autoFocus onLeave={close} />
      </div>
    </div>
  );
}
