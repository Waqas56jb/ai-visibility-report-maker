import { useEffect } from 'react';

// Site-wide 3D motion, mounted once. Two jobs, both written straight to CSS
// custom properties so React never re-renders on pointer or scroll:
//  1. Tilt: cards under a fine pointer lean towards it (--rx/--ry) with a glare
//     spot that follows (--gx/--gy).
//  2. Depth: every [data-depth] element drifts against the scroll (--sy),
//     which the floating 3D shapes use for parallax.
// Both stay off for touch and for prefers-reduced-motion.
const TILT = '.work-card, .seo-svc, .plan, .uc-card, .tilt';
const MAX = 7;

export default function Motion3D() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return undefined;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    let active = null;
    const release = (el) => {
      el.classList.remove('is-tilting');
      el.style.removeProperty('--rx');
      el.style.removeProperty('--ry');
    };
    const onMove = (e) => {
      const el = e.target.closest?.(TILT);
      if (active && active !== el) release(active);
      active = el || null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.classList.add('is-tilting');
      el.style.setProperty('--rx', `${((0.5 - py) * MAX).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((px - 0.5) * MAX).toFixed(2)}deg`);
      el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
    };
    const onLeave = () => active && release(active);

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const vh = window.innerHeight;
        document.querySelectorAll('[data-depth]').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const k = Number(el.dataset.depth) || 0.2;
          el.style.setProperty('--sy', `${((r.top + r.height / 2 - vh / 2) * -k).toFixed(1)}px`);
        });
      });
    };

    if (fine) {
      document.addEventListener('pointermove', onMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onLeave);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
