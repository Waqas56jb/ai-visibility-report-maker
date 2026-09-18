import { useState } from 'react';
import { OWNER } from '../lib/owner.js';

// The owner's photo in a rounded card. Until client/public/me.jpg exists it
// falls back to a gradient card with the initial, so the layout never breaks.
export default function Portrait({ className = '', size = 'lg' }) {
  const [ok, setOk] = useState(true);
  const initial = (OWNER.name || 'MakeFlow').trim().charAt(0).toUpperCase();
  return (
    <div className={`portrait portrait-${size} ${className}`.trim()}>
      {ok ? (
        <img
          src={OWNER.photo}
          alt={OWNER.name ? `${OWNER.name}, ${OWNER.role}` : OWNER.role}
          onError={() => setOk(false)}
        />
      ) : (
        <span className="portrait-fallback" aria-hidden="true">
          {initial}
        </span>
      )}
    </div>
  );
}
