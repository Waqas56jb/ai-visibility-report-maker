import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Globe2, Lock, Mail, Plus, ScanSearch, Zap } from 'lucide-react';
import { useToast } from '../lib/toast.jsx';
import { useAuth } from '../store/auth.js';
import api from '../api/index.js';
import { useSite } from '../store/site.jsx';

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const URL_RE = /^https?:\/\/.+\..+/;

export default function CheckerForm({ autoFocus = false, onLeave }) {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useAuth((s) => s.user);
  const { content } = useSite();
  const checker = content.checker || {};
  const [open, setOpen] = useState(false);
  const [bad, setBad] = useState({});
  const [values, setValues] = useState({
    business: '',
    website: '',
    email: '',
    industry: '',
    location: '',
    competitors: '',
  });

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setBad((b) => ({ ...b, [key]: false }));
  };

  const leave = (to) => {
    if (onLeave) onLeave();
    navigate(to);
  };

  async function onSubmit(e) {
    e.preventDefault();
    const website = values.website.trim();
    const websiteNorm = /^https?:\/\//i.test(website) ? website.replace(/\/+$/, '') : `https://${website.replace(/\/+$/, '')}`;
    const next = {
      business: !values.business.trim(),
      website: !URL_RE.test(websiteNorm),
      email: !EMAIL_RE.test(values.email.trim()),
    };
    setBad(next);
    if (Object.values(next).some(Boolean)) {
      toast('Please check the highlighted fields');
      return;
    }
    const payload = {
      businessName: values.business.trim(),
      websiteUrl: websiteNorm,
      email: values.email.trim(),
      industry: values.industry.trim(),
      location: values.location.trim(),
      competitors: values.competitors.trim(),
    };
    if (!user) {
      sessionStorage.setItem(
        'mf_report',
        JSON.stringify({
          business: payload.businessName,
          website: payload.websiteUrl,
          email: payload.email,
        })
      );
      leave('/login');
      return;
    }
    try {
      const { reportId } = await api.createReport({
        business_name: payload.businessName,
        website_url: payload.websiteUrl,
        industry: payload.industry,
        city_region: payload.location,
        competitors: payload.competitors ? payload.competitors.split(',').map((s) => s.trim()).filter(Boolean) : [],
        notify_email: true,
        email: payload.email,
        save_business: true,
        modes: { browsing: true, knowledge: true },
      });
      leave(`/app/reports/${reportId}`);
    } catch (err) {
      toast(err.message);
    }
  }

  return (
    <>
      <span className="form-badge">
        <ScanSearch className="lucide svg" />
      </span>
      <h3>{checker.formTitle || 'Check your AI visibility'}</h3>
      <p className="sub">{checker.formSub || 'Takes about 3 minutes. One free report per email every 30 days.'}</p>
      <form onSubmit={onSubmit} noValidate>
        <div className="field">
          <label>Business name</label>
          <div className="input-icon">
            <Building2 className="lucide svg" />
            <input
              name="business"
              autoFocus={autoFocus}
              className={bad.business ? 'bad' : ''}
              placeholder="e.g. Harbourview Accountants"
              value={values.business}
              onChange={set('business')}
            />
          </div>
        </div>
        <div className="field">
          <label>Website URL</label>
          <div className="input-icon">
            <Globe2 className="lucide svg" />
            <input
              name="website"
              type="url"
              className={bad.website ? 'bad' : ''}
              placeholder="https://yourbusiness.com.au"
              value={values.website}
              onChange={set('website')}
            />
          </div>
        </div>
        <div className="field">
          <label>Work email</label>
          <div className="input-icon">
            <Mail className="lucide svg" />
            <input
              name="email"
              type="email"
              className={bad.email ? 'bad' : ''}
              placeholder="you@yourbusiness.com.au"
              value={values.email}
              onChange={set('email')}
            />
          </div>
        </div>
        <button
          type="button"
          className={`optional-toggle${open ? ' open' : ''}`}
          onClick={() => setOpen((v) => !v)}
        >
          <Plus className="lucide svg" />
          Add industry, location &amp; competitors <em>(improves accuracy)</em>
        </button>
        <div className={`optional${open ? ' open' : ''}`}>
          <div className="optional-inner">
            <div className="row2">
              <div className="field">
                <label>
                  Industry <span>(optional)</span>
                </label>
                <input placeholder="Accounting" value={values.industry} onChange={set('industry')} />
              </div>
              <div className="field">
                <label>
                  City / region <span>(optional)</span>
                </label>
                <input
                  placeholder="Brisbane, QLD"
                  value={values.location}
                  onChange={set('location')}
                />
              </div>
            </div>
            <div className="field">
              <label>
                Competitors <span>(optional, up to 3, comma separated)</span>
              </label>
              <input
                placeholder="Rival One, Rival Two"
                value={values.competitors}
                onChange={set('competitors')}
              />
            </div>
          </div>
        </div>
        <button
          className="btn btn-grad"
          style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
          type="submit"
        >
          <Zap className="lucide svg" /> Generate my report
        </button>
        <p className="fine">
          <Lock className="lucide svg" style={{ verticalAlign: '-2px' }} /> We&apos;ll email the PDF to this address.
          One free report per email every 30 days.
        </p>
      </form>
    </>
  );
}
