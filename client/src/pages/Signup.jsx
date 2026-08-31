import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AuthShell, { BackLink, Field } from '../components/auth/AuthShell.jsx';
import { signupSchema } from '../schemas/auth.js';
import { useAuth } from '../store/auth.js';
import { useToast } from '../lib/toast.jsx';

export default function Signup() {
  const navigate = useNavigate();
  const toast = useToast();
  const signup = useAuth((s) => s.signup);
  const user = useAuth((s) => s.user);
  const submitting = useRef(false);
  const [values, setValues] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    company_name: '',
    accept_terms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Create account | MakeFlow';
    if (user && !sessionStorage.getItem('mf_report')) navigate('/app/dashboard', { replace: true });
    try {
      const pending = JSON.parse(sessionStorage.getItem('mf_report') || 'null');
      if (pending?.email) {
        setValues((v) => (v.email ? v : { ...v, email: pending.email }));
      }
    } catch {
      /* ignore */
    }
  }, [user, navigate]);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((err) => ({ ...err, [key]: undefined }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting.current) return;
    const parsed = signupSchema.safeParse(values);
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
      await signup(parsed.data);
      toast('Account created');
      const pending = sessionStorage.getItem('mf_report');
      if (pending) {
        sessionStorage.removeItem('mf_report');
        const p = JSON.parse(pending);
        navigate('/app/new', { state: { prefill: { name: p.business, website: p.website, email: p.email } } });
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
      image="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1400&q=80"
      headline="Track your AI visibility over time."
      quote="Save reports, re-run monthly and watch the number move as fixes go live."
    >
      <BackLink />
      <h1>Create your account</h1>
      <p>Free. Keep every report in one place.</p>
      <form onSubmit={handleSubmit} noValidate>
        <div className="row2">
          <Field label="First name" value={values.first_name} onChange={set('first_name')} error={errors.first_name} disabled={loading} />
          <Field label="Last name" value={values.last_name} onChange={set('last_name')} error={errors.last_name} disabled={loading} />
        </div>
        <Field label="Work email" type="email" value={values.email} onChange={set('email')} error={errors.email} disabled={loading} placeholder="you@company.com.au" />
        <Field label="Company name" value={values.company_name} onChange={set('company_name')} disabled={loading} placeholder="Optional" />
        <Field label="Password" type="password" value={values.password} onChange={set('password')} error={errors.password} disabled={loading} placeholder="At least 8 characters" />
        <Field label="Confirm password" type="password" value={values.confirm_password} onChange={set('confirm_password')} error={errors.confirm_password} disabled={loading} />
        <label className="toggle">
          <input type="checkbox" checked={values.accept_terms} onChange={set('accept_terms')} />
          <span className="toggle-ui" />
          <span>I accept the terms</span>
        </label>
        {errors.accept_terms && <span className="err">{errors.accept_terms}</span>}
        <button className="btn btn-grad" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : (<>Create account <ArrowRight className="lucide svg" /></>)}
        </button>
      </form>
      <p className="alt">
        Already have one? <Link to="/login">Log in</Link>
      </p>
    </AuthShell>
  );
}
