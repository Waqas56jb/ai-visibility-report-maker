import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '../Logo.jsx';

export default function AuthShell({ image, headline, quote, children }) {
  return (
    <div className="auth">
      <div className="auth-art">
        <img src={image} alt="" />
        <Logo />
        <div>
          <h2>{headline}</h2>
          <p className="q">{quote}</p>
        </div>
      </div>
      <div className="auth-form">
        <div className="auth-box">{children}</div>
      </div>
    </div>
  );
}

export function BackLink({ to = '/', label = 'Back to site' }) {
  return (
    <Link to={to} className="back">
      <ArrowLeft className="lucide svg" /> {label}
    </Link>
  );
}

export function Field({ label, extra, error, ...input }) {
  return (
    <div className="field">
      {extra ? (
        <div className="top">
          <label>{label}</label>
          {extra}
        </div>
      ) : (
        <label>{label}</label>
      )}
      <input className={error ? 'bad' : ''} {...input} />
      {error && <span className="err">{error}</span>}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.72.12-1.42.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function OAuthRow({ onClick }) {
  return (
    <div className="oauth">
      <button type="button" onClick={() => onClick('Google')}>
        <GoogleMark /> Google
      </button>
      <button type="button" onClick={() => onClick('GitHub')}>
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.77.12 3.06.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.07.78 2.16 0 1.56-.01 2.81-.01 3.2 0 .31.21.67.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
        </svg>
        GitHub
      </button>
    </div>
  );
}
