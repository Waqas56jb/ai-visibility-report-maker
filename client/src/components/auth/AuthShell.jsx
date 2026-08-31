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
        <div className="auth-form-bg" aria-hidden="true" />
        <div className="auth-box">
          <div className="auth-logo-mobile">
            <Logo />
          </div>
          {children}
        </div>
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
