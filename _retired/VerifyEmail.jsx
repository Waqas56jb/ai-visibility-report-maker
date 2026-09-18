import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthShell, { BackLink } from '../components/auth/AuthShell.jsx';
import { signup } from '../lib/auth';

const COOLDOWN = 30;

export default function VerifyEmail() {
  const location = useLocation();
  const email = location.state?.email;
  const display = email || 'your inbox';
  const submitting = useRef(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Confirm your email | MakeFlow';
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = window.setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  async function resend() {
    if (cooldown > 0 || submitting.current || !email) return;
    submitting.current = true;
    setLoading(true);
    try {
      await signup({ email, resend: true });
      setCooldown(COOLDOWN);
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  return (
    <AuthShell
      image="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1400&q=80"
      headline="Track your AI visibility over time."
      quote="Save reports, re-run monthly and watch the number move as fixes go live."
    >
      <BackLink to="/login" label="Back to log in" />
      <h1>Confirm your email</h1>
      <p>
        We sent a confirmation link to <strong>{display}</strong>.
      </p>
      <button
        type="button"
        className="btn btn-primary"
        onClick={resend}
        disabled={cooldown > 0 || loading || !email}
      >
        {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend email'}
      </button>
      <p className="alt">
        <Link to="/login">Back to log in</Link>
      </p>
    </AuthShell>
  );
}
