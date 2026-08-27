import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Lock, Plus, Zap } from 'lucide-react';
import Reveal from './Reveal.jsx';
import { useToast } from '../lib/toast.jsx';
import { useAuth } from '../store/auth.js';
import api from '../api/index.js';
import { useSite } from '../store/site.jsx';

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const URL_RE = /^https?:\/\/.+\..+/;

export default function Checker() {
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
      navigate('/login');
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
      navigate(`/app/reports/${reportId}`);
    } catch (err) {
      toast(err.message);
    }
  }

  return (
    <section className="section checker" id="check">
      <div className="wrap">
        <Reveal>
          <span className="eyebrow">{checker.eyebrow || 'Run the check'}</span>
          <h2>{checker.title || 'Three details and you have your score'}</h2>
          <p>
            {checker.lead ||
              'Tell us who you are and where your website lives. We crawl it, work out the questions your customers really ask, test them against ChatGPT and send you the full report. Free.'}
          </p>
          <ul>
            <li>
              <CheckCircle2 className="lucide svg" /> Score out of 100 with a plain-English band:
              Invisible → Leading
            </li>
            <li>
              <CheckCircle2 className="lucide svg" /> Every question ChatGPT answered without you,
              and who it named instead
            </li>
            <li>
              <CheckCircle2 className="lucide svg" /> A website AI-readiness audit covering schema,
              FAQ, llms.txt and crawler access
            </li>
            <li>
              <CheckCircle2 className="lucide svg" /> A prioritised fix list and a branded PDF you
              can share with your team
            </li>
          </ul>
        </Reveal>
        <Reveal delay="d1" className="form-card">
          <h3>{checker.formTitle || 'Check your AI visibility'}</h3>
          <p className="sub">{checker.formSub || 'Takes about 3 minutes. One free report per email every 30 days.'}</p>
          <form onSubmit={onSubmit} noValidate>
            <div className="field">
              <label>Business name</label>
              <input
                name="business"
                className={bad.business ? 'bad' : ''}
                placeholder="e.g. Harbourview Accountants"
                value={values.business}
                onChange={set('business')}
              />
            </div>
            <div className="field">
              <label>Website URL</label>
              <input
                name="website"
                type="url"
                className={bad.website ? 'bad' : ''}
                placeholder="https://yourbusiness.com.au"
                value={values.website}
                onChange={set('website')}
              />
            </div>
            <div className="field">
              <label>Work email</label>
              <input
                name="email"
                type="email"
                className={bad.email ? 'bad' : ''}
                placeholder="you@yourbusiness.com.au"
                value={values.email}
                onChange={set('email')}
              />
            </div>
            <button type="button" className="optional-toggle" onClick={() => setOpen((v) => !v)}>
              <Plus className="lucide svg" /> Add industry, location & competitors (improves
              accuracy)
            </button>
            <div className={`optional${open ? ' open' : ''}`}>
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
            <button
              className="btn btn-grad"
              style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
              type="submit"
            >
              <Zap className="lucide svg" /> Generate my report
            </button>
            <p className="fine">
              <Lock className="lucide svg" style={{ verticalAlign: '-2px' }} /> We'll email the PDF to this address.
              One free report per email every 30 days.
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
