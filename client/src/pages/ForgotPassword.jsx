import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import AuthShell, { BackLink, Field } from '../components/auth/AuthShell.jsx';
import { forgotSchema } from '../schemas/auth.js';
import api from '../api/index.js';
import { useToast } from '../lib/toast.jsx';

export default function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.title = 'Reset password | MakeFlow';
  }, []);

  async function send(e) {
    e.preventDefault();
    const parsed = forgotSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await api.forgotPassword(parsed.data.email);
      setSent(true);
      toast('Reset link sent');
    } catch (err) {
      toast(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      image="https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=1400&q=80"
      headline="Locked out? It happens."
      quote="We'll send a reset link that works for 30 minutes."
    >
      <BackLink to="/login" label="Back to log in" />
      {sent ? (
        <>
          <h1>Check your email</h1>
          <p>
            We sent a reset link to <strong>{email}</strong>.
          </p>
          <p className="alt">
            <Link to="/login">Back to log in</Link>
          </p>
        </>
      ) : (
        <>
          <h1>Reset password</h1>
          <p>Enter your email and we'll send a link.</p>
          <form onSubmit={send} noValidate>
            <Field label="Email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(); }} error={error} disabled={loading} />
            <button className="btn btn-primary" type="submit" disabled={loading}>
              Send reset link <Send className="lucide svg" />
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
