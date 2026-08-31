import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthShell, { BackLink, Field } from '../components/auth/AuthShell.jsx';
import { resetConfirmSchema } from '../schemas/auth.js';
import api from '../api/index.js';
import { useToast } from '../lib/toast.jsx';

function tokenFromLocation() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const query = new URLSearchParams(window.location.search);
  return hash.get('access_token') || query.get('access_token') || '';
}

export default function ResetPasswordConfirm() {
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const expired = params.get('expired') === '1';
  const access_token = useMemo(tokenFromLocation, []);
  const [values, setValues] = useState({ new_password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Set a new password | MakeFlow';
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = resetConfirmSchema.safeParse(values);
    if (!parsed.success) {
      const next = {};
      parsed.error.issues.forEach((i) => {
        next[i.path[0]] = i.message;
      });
      setErrors(next);
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword({ access_token, ...parsed.data, confirm_password: parsed.data.confirm });
      toast('Password updated');
      navigate('/login');
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
      quote="Choose a password you have not used before."
    >
      <BackLink to="/login" label="Back to log in" />
      {expired ? (
        <>
          <h1>Link expired</h1>
          <p>Request a new reset link.</p>
          <Link to="/reset-password" className="btn btn-primary">
            Request a new link
          </Link>
        </>
      ) : (
        <>
          <h1>Set a new password</h1>
          <form onSubmit={handleSubmit} noValidate>
            <Field label="New password" type="password" value={values.new_password} onChange={(e) => setValues((v) => ({ ...v, new_password: e.target.value }))} error={errors.new_password} disabled={loading} />
            <Field label="Confirm" type="password" value={values.confirm} onChange={(e) => setValues((v) => ({ ...v, confirm: e.target.value }))} error={errors.confirm} disabled={loading} />
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
