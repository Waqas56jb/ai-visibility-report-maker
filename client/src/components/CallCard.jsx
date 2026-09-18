import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { OWNER } from '../lib/owner.js';
import { useSite } from '../store/site.jsx';

// The personal touch from the reference: a pill that puts a face and a live
// "available" state next to the primary action.
export default function CallCard({ className = '' }) {
  const { content } = useSite();
  const url = (content.bookCall?.url || 'https://cal.com/isuruabhishek/30min').trim();
  const [photoOk, setPhotoOk] = useState(true);
  const initial = (OWNER.name || 'MakeFlow').trim().charAt(0).toUpperCase();

  return (
    <a className={`call-card ${className}`.trim()} href={url} target="_blank" rel="noopener noreferrer">
      <span className="call-av">
        {photoOk ? (
          <img src={OWNER.photo} alt="" width="44" height="44" onError={() => setPhotoOk(false)} />
        ) : (
          <span aria-hidden="true">{initial}</span>
        )}
      </span>
      <span className="call-txt">
        <strong>Book a 15-min intro call</strong>
        <span className="call-live">
          <i aria-hidden="true" /> Available this week
        </span>
      </span>
      <ArrowUpRight className="lucide svg call-go" aria-hidden="true" />
    </a>
  );
}
