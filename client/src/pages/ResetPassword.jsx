import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthShell, { BackLink, Field } from '../components/auth/AuthShell.jsx';
import { resetPassword } from '../lib/auth';
import { passwordValid } from '../components/auth/validation.js';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const expired = params.get('expired') === '1';
  const submitting = useRef(false);
  const [values, setValues] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.title = 'Reset password — MakeFlow';
  }, []);

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((err) => ({ ...err, [key]: undefined }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting.current || loading) return;
    const next = {
      password: passwordValid(values.password)
        ? undefined
        : 'Use 8+ characters with a number, uppercase letter and symbol.',
      confirm: values.confirm === values.password ? undefined : 'Passwords do not match.',
    };
    setErrors(next);
    if (next.password || next.confirm) return;

    submitting.current = true;
    setLoading(true);
    try {
      await resetPassword(values.password);
      setDone(true);
      window.setTimeout(() => navigate('/login'), 1200);
    } finally {
      submitting.current = false;
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
      {expired ? (
        <>
          <h1>Link expired</h1>
          <p>This reset link is no longer valid. Request a new one and try again.</p>
          <Link to="/forgot-password" className="btn btn-primary">
            Request a new link
          </Link>
        </>
      ) : done ? (
        <>
          <h1>Password updated</h1>
          <p>Redirecting you to log in…</p>
        </>
      ) : (
        <>
          <h1>Set a new password</h1>
          <p>Choose a strong password you haven't used before.</p>
          <form onSubmit={handleSubmit} noValidate>
            <Field
              label="New password"
              type="password"
              required
              placeholder="Create a new password"
              value={values.password}
              onChange={set('password')}
              error={errors.password}
              disabled={loading}
            />
            <Field
              label="Confirm password"
              type="password"
              required
              placeholder="Re-enter your password"
              value={values.confirm}
              onChange={set('confirm')}
              error={errors.confirm}
              disabled={loading}
            />
            <button className="btn btn-primary" type="submit" disabled={loading}>
              Update password
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
