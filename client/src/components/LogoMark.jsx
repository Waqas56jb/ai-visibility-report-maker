import { useId } from 'react';

const PATH =
  'M1160,445h-318.9c-27.4,0-41,33.1-21.7,52.5l340.7,340.6v160.2h-367.2v-196.3h-326.4v196.3H99.2v-160.2l340.6-340.6c19.3-19.4,5.6-52.5-21.7-52.5H99.2v-193.3c102.7,0,205.4,0,308,0l86.6,191.7h0c0,0,12.5,27.6,12.5,27.6l123.2,272.3,123.1-272.3,12.5-27.6h0c0,0,86.6-191.6,86.6-191.6,102.7.4,205.4.9,308,1.3v192Z';

/* The MakeFlow mark on its own, inline so it stays sharp at avatar sizes and can
   take the ink gradient or flip to a flat fill on dark backgrounds.
   `solid` renders in currentColor; the gradient id is per-instance so multiple
   marks on one page never collide. */
export default function LogoMark({ solid = false, className = 'svg' }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 1259.3 1250" className={className} aria-hidden="true" focusable="false">
      {!solid && (
        <defs>
          <linearGradient id={id} x1="0" y1="1250" x2="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#5b6ef0" />
            <stop offset="1" stopColor="#8b9bfb" />
          </linearGradient>
        </defs>
      )}
      <path d={PATH} fill={solid ? 'currentColor' : `url(#${id})`} />
    </svg>
  );
}
