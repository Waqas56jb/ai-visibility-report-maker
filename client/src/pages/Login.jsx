import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AuthShell, { BackLink, Field } from '../components/auth/AuthShell.jsx';
import { loginSchema } from '../schemas/auth.js';
import { useAuth } from '../store/auth.js';
import { useToast } from '../lib/toast.jsx';

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const login = useAuth((s) => s.login);
  const user = useAuth((s) => s.user);
  const submitting = useRef(false);
  const [values, setValues] = useState({ email: '', password: '', remember_me: true });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Log in — MakeFlow';
    if (user) navigate('/app/dashboard', { replace: true });
  }, [user, navigate]);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((err) => ({ ...err, [key]: undefined }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting.current) return;
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      const next = {};
      parsed.error.issues.forEach((i) => {
        next[i.path[0]] = i.message;
      });
      setErrors(next);
      return;
    }
    submitting.current = true;
    setLoading(true);
    try {
      await login({ email: parsed.data.email.trim(), password: parsed.data.password }, parsed.data.remember_me !== false);
      toast('Signed in');
      const pending = sessionStorage.getItem('mf_report');
      if (pending) {
        sessionStorage.removeItem('mf_report');
        const p = JSON.parse(pending);
        navigate('/app/new', { state: { prefill: { name: p.business, website: p.website } } });
      } else {
        navigate('/app/dashboard');
      }
    } catch (err) {
      toast(err.message);
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  return (
    <AuthShell
      image="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80"
      headline="Your reports, your leads, one login."
      quote="Revisit any report, re-run checks and track your score over time."
    >
      <BackLink />
      <h1>Welcome back</h1>
      <p>Log in to see your saved reports.</p>
      <form onSubmit={handleSubmit} noValidate>
        <Field label="Email" type="email" value={values.email} onChange={set('email')} error={errors.email} disabled={loading} placeholder="you@company.com.au" />
        <Field
          label="Password"
          type="password"
          value={values.password}
          onChange={set('password')}
          extra={<Link to="/reset-password" className="link">Forgot?</Link>}
          error={errors.password}
          disabled={loading}
          placeholder="••••••••"
        />
        <label className="toggle">
          <input type="checkbox" checked={values.remember_me} onChange={set('remember_me')} />
          <span className="toggle-ui" />
          <span>Remember me</span>
        </label>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          Log in <ArrowRight className="lucide svg" />
        </button>
      </form>
      <p className="alt">
        No account? <Link to="/signup">Create one</Link>
      </p>
    </AuthShell>
  );
}
