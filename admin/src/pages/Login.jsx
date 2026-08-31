import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Brand from '../components/Brand.jsx';
import { useAuth } from '../auth.jsx';
import { useToast } from '../toast.jsx';

export default function Login() {
  const { user, ready, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;
  if (!ready) return <p className="loading">Checking session…</p>;

  async function submit(e) {
    e.preventDefault();
    const emailOk = /^\S+@\S+\.\S+$/.test(email);
    if (!emailOk || !password) {
      setError('Enter your email and password');
      toast('Enter your email and password');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <div className="login-art">
        <img
          src="https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1400&q=80"
          alt=""
        />
        <Brand onDark showAdmin />
        <div>
          <h2>Every report is a lead. Every lead is here.</h2>
          <p>Watch reports come in, open any result and export your leads, all behind one secure login.</p>
          <div className="live">
            <div>
              <span>Harbourview Accountants</span>
              <span className="badge testing">
                <i className="dot" /> testing
              </span>
            </div>
            <div>
              <span>Coastline Physio</span>
              <span className="badge completed">completed · 61</span>
            </div>
            <div>
              <span>Ross & Co Conveyancing</span>
              <span className="badge queued">queued</span>
            </div>
          </div>
        </div>
        <p style={{ fontSize: 12 }}>© 2026 MakeFlow</p>
      </div>
      <div className="login-form">
        <div className="login-box">
          <Brand />
          <h1>Admin sign in</h1>
          <p>Authorised team members only. Sessions expire after 24h.</p>
          <form onSubmit={submit} noValidate>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@makeflow.com.au"
                required
                style={{ borderColor: error && !/^\S+@\S+\.\S+$/.test(email) ? 'var(--coral)' : undefined }}
              />
            </div>
            <div className="field">
              <label>Password</label>
              <div className="pw-wrap">
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  style={{ borderColor: error && !password ? 'var(--coral)' : undefined }}
                />
                <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)}>
                  {show ? <EyeOff className="lucide" /> : <Eye className="lucide" />}
                </button>
              </div>
            </div>
            {error && <p className="err">{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'} <ArrowRight className="lucide" />
            </button>
          </form>
          <p className="note">
            <ShieldCheck className="lucide" /> Protected by Supabase Auth. Admin accounts only.
          </p>
        </div>
      </div>
    </div>
  );
}
