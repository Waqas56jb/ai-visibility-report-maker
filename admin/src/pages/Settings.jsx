import { useEffect, useState } from 'react';
import { Bot, Layers, Palette, Pencil, Plus, Save, Scale, Shield, Trash2, Type } from 'lucide-react';
import { api } from '../api.js';
import { useAdmin } from '../admin-context.js';
import { useToast } from '../toast.jsx';

function Switch({ on, onToggle }) {
  return <button type="button" className={`switch ${on ? 'on' : ''}`} onClick={onToggle} aria-pressed={on} />;
}

const TABS = [
  { id: 'website', label: 'Website', icon: Type },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'weights', label: 'Weights', icon: Scale },
  { id: 'services', label: 'Services', icon: Layers },
  { id: 'engine', label: 'Engine', icon: Bot },
  { id: 'limits', label: 'Limits', icon: Shield },
];

const THEME_FIELDS = [
  ['ink', 'Ink / header'],
  ['ink2', 'Ink secondary'],
  ['paper', 'Page background'],
  ['text', 'Body text'],
  ['indigo', 'Indigo'],
  ['cyan', 'Cyan'],
  ['violet', 'Violet'],
  ['coral', 'Coral'],
  ['amber', 'Amber'],
  ['mint', 'Mint'],
];

export default function Settings() {
  const toast = useToast();
  const { refreshKey } = useAdmin();
  const [tab, setTab] = useState('website');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    api
      .settings()
      .then(setData)
      .catch((e) => setError(e.message));
  }, [refreshKey]);

  if (error) return <p className="err">{error}</p>;
  if (!data) return <p className="loading">Loading settings…</p>;

  const total = (data.weights || []).reduce((s, w) => s + (Number(w.pct) || 0), 0);
  const site = data.site || { theme: {}, content: {} };
  const content = site.content || {};
  const theme = site.theme || {};
  const hero = content.hero || {};
  const checker = content.checker || {};
  const cta = content.cta || {};

  function setWeight(key, pct) {
    setData({ ...data, weights: data.weights.map((w) => (w.key === key ? { ...w, pct } : w)) });
  }
  function setEngine(patch) {
    setData({ ...data, engine: { ...data.engine, ...patch } });
  }
  function setLimits(patch) {
    setData({ ...data, limits: { ...data.limits, ...patch } });
  }
  function setContent(patch) {
    setData({ ...data, site: { ...site, content: { ...content, ...patch } } });
  }
  function setHero(patch) {
    setContent({ hero: { ...hero, ...patch } });
  }
  function setChecker(patch) {
    setContent({ checker: { ...checker, ...patch } });
  }
  function setCta(patch) {
    setContent({ cta: { ...cta, ...patch } });
  }
  function setTheme(patch) {
    setData({ ...data, site: { ...site, theme: { ...theme, ...patch } } });
  }

  async function save(part, extra = {}) {
    setBusy(part);
    try {
      const saved = await api.saveSettings({
        weights: data.weights,
        services: data.services,
        engine: data.engine,
        limits: data.limits,
        site: data.site,
        ...extra,
      });
      setData(saved);
      toast(part);
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy('');
    }
  }

  function addService() {
    const key = window.prompt('Service key (e.g. custom)');
    if (!key) return;
    const name = window.prompt('Service name') || key;
    setData({ ...data, services: [...data.services, { key, name, description: '', cta: '' }] });
  }

  function editService(svc) {
    const name = window.prompt('Service name', svc.name);
    if (name == null) return;
    const description = window.prompt('Description', svc.description || '');
    if (description == null) return;
    setData({
      ...data,
      services: data.services.map((s) => (s.key === svc.key ? { ...s, name, description } : s)),
    });
  }

  const faqs = content.faqs || [];
  const landingServices = content.services || [];

  return (
    <>
      <div className="tabs page-tabs">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} type="button" className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
              <Icon className="lucide" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'website' && (
        <div className="settings settings-stack">
          <div className="card panel">
            <div className="panel-h">
              <div>
                <h3>Brand & hero</h3>
                <p>Saved copy appears on the live website within a few seconds.</p>
              </div>
            </div>
            <div className="field">
              <label>Document title</label>
              <input value={content.documentTitle || ''} onChange={(e) => setContent({ documentTitle: e.target.value })} />
            </div>
            <div className="row2">
              <div className="field">
                <label>Nav button</label>
                <input value={content.navCta || ''} onChange={(e) => setContent({ navCta: e.target.value })} />
              </div>
              <div className="field">
                <label>Cities marquee (comma separated)</label>
                <input
                  value={(content.cities || []).join(', ')}
                  onChange={(e) =>
                    setContent({
                      cities: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            </div>
            <div className="field">
              <label>Strip line</label>
              <input value={content.strip || ''} onChange={(e) => setContent({ strip: e.target.value })} />
            </div>
            <div className="field">
              <label>Hero eyebrow</label>
              <input value={hero.eyebrow || ''} onChange={(e) => setHero({ eyebrow: e.target.value })} />
            </div>
            <div className="field">
              <label>Headline</label>
              <input value={hero.headline || ''} onChange={(e) => setHero({ headline: e.target.value })} />
            </div>
            <div className="field">
              <label>Highlighted phrase</label>
              <input value={hero.highlight || ''} onChange={(e) => setHero({ highlight: e.target.value })} />
            </div>
            <div className="field">
              <label>Lead paragraph</label>
              <textarea rows={4} value={hero.lead || ''} onChange={(e) => setHero({ lead: e.target.value })} />
            </div>
            <div className="row2">
              <div className="field">
                <label>Primary CTA</label>
                <input value={hero.ctaPrimary || ''} onChange={(e) => setHero({ ctaPrimary: e.target.value })} />
              </div>
              <div className="field">
                <label>Secondary CTA</label>
                <input value={hero.ctaSecondary || ''} onChange={(e) => setHero({ ctaSecondary: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="card panel">
            <div className="panel-h">
              <div>
                <h3>Checker form</h3>
              </div>
            </div>
            <div className="field">
              <label>Section title</label>
              <input value={checker.title || ''} onChange={(e) => setChecker({ title: e.target.value })} />
            </div>
            <div className="field">
              <label>Section lead</label>
              <textarea rows={3} value={checker.lead || ''} onChange={(e) => setChecker({ lead: e.target.value })} />
            </div>
            <div className="row2">
              <div className="field">
                <label>Form title</label>
                <input value={checker.formTitle || ''} onChange={(e) => setChecker({ formTitle: e.target.value })} />
              </div>
              <div className="field">
                <label>Form subtitle</label>
                <input value={checker.formSub || ''} onChange={(e) => setChecker({ formSub: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="card panel">
            <div className="panel-h">
              <div>
                <h3>FAQ</h3>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                onClick={() => setContent({ faqs: [...faqs, { q: 'New question', a: 'Answer' }] })}
              >
                <Plus className="lucide" /> Add
              </button>
            </div>
            {faqs.map((item, i) => (
              <div className="faq-edit" key={`${item.q}-${i}`}>
                <input
                  value={item.q}
                  onChange={(e) =>
                    setContent({ faqs: faqs.map((f, idx) => (idx === i ? { ...f, q: e.target.value } : f)) })
                  }
                />
                <textarea
                  rows={2}
                  value={item.a}
                  onChange={(e) =>
                    setContent({ faqs: faqs.map((f, idx) => (idx === i ? { ...f, a: e.target.value } : f)) })
                  }
                />
                <button
                  className="btn btn-ghost btn-icon"
                  type="button"
                  onClick={() => setContent({ faqs: faqs.filter((_, idx) => idx !== i) })}
                >
                  <Trash2 className="lucide" />
                </button>
              </div>
            ))}
          </div>

          <div className="card panel">
            <div className="panel-h">
              <div>
                <h3>Landing services</h3>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                onClick={() => setContent({ services: [...landingServices, { title: 'New service', body: '', img: '' }] })}
              >
                <Plus className="lucide" /> Add
              </button>
            </div>
            {landingServices.map((item, i) => (
              <div className="faq-edit" key={`${item.title}-${i}`}>
                <input
                  value={item.title}
                  onChange={(e) =>
                    setContent({
                      services: landingServices.map((s, idx) => (idx === i ? { ...s, title: e.target.value } : s)),
                    })
                  }
                />
                <textarea
                  rows={2}
                  value={item.body}
                  onChange={(e) =>
                    setContent({
                      services: landingServices.map((s, idx) => (idx === i ? { ...s, body: e.target.value } : s)),
                    })
                  }
                />
                <input
                  placeholder="Image URL"
                  value={item.img || ''}
                  onChange={(e) =>
                    setContent({
                      services: landingServices.map((s, idx) => (idx === i ? { ...s, img: e.target.value } : s)),
                    })
                  }
                />
                <button
                  className="btn btn-ghost btn-icon"
                  type="button"
                  onClick={() => setContent({ services: landingServices.filter((_, idx) => idx !== i) })}
                >
                  <Trash2 className="lucide" />
                </button>
              </div>
            ))}
          </div>

          <div className="card panel">
            <div className="panel-h">
              <div>
                <h3>Footer & final CTA</h3>
              </div>
            </div>
            <div className="field">
              <label>CTA title</label>
              <input value={cta.title || ''} onChange={(e) => setCta({ title: e.target.value })} />
            </div>
            <div className="field">
              <label>CTA body</label>
              <input value={cta.body || ''} onChange={(e) => setCta({ body: e.target.value })} />
            </div>
            <div className="field">
              <label>Footer blurb</label>
              <textarea rows={3} value={content.footerBlurb || ''} onChange={(e) => setContent({ footerBlurb: e.target.value })} />
            </div>
            <div className="row2">
              <div className="field">
                <label>Footer copyright</label>
                <input value={content.footerCopy || ''} onChange={(e) => setContent({ footerCopy: e.target.value })} />
              </div>
              <div className="field">
                <label>Footer note</label>
                <input value={content.footerNote || ''} onChange={(e) => setContent({ footerNote: e.target.value })} />
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button className="btn btn-primary" type="button" disabled={busy === 'site'} onClick={() => save('Website updated')}>
                <Save className="lucide" /> Publish to website
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'theme' && (
        <div className="card panel">
          <div className="panel-h">
            <div>
              <h3>Colour theme</h3>
              <p>These tokens drive the public site. Save to push live.</p>
            </div>
          </div>
          <div className="theme-grid">
            {THEME_FIELDS.map(([key, label]) => (
              <label className="swatch" key={key}>
                <span>{label}</span>
                <div>
                  <input type="color" value={theme[key] || '#000000'} onChange={(e) => setTheme({ [key]: e.target.value })} />
                  <input value={theme[key] || ''} onChange={(e) => setTheme({ [key]: e.target.value })} />
                </div>
              </label>
            ))}
          </div>
          <div className="theme-preview" style={{ background: theme.ink, color: '#fff' }}>
            <strong style={{ background: `linear-gradient(120deg, ${theme.indigo}, ${theme.cyan})`, WebkitBackgroundClip: 'text', color: 'transparent' }}>
              Preview
            </strong>
            <span>Buttons, links and the hero use indigo → cyan.</span>
            <em style={{ background: `linear-gradient(120deg, ${theme.indigo}, ${theme.cyan})` }}>Primary</em>
          </div>
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <button className="btn btn-primary" type="button" onClick={() => save('Theme published')}>
              <Save className="lucide" /> Publish theme
            </button>
          </div>
        </div>
      )}

      {tab === 'weights' && (
        <div className="card panel">
          <div className="panel-h">
            <div>
              <h3>
                <Scale className="lucide svg" /> Score weights
              </h3>
              <p>Must total 100. Applied to new reports only.</p>
            </div>
          </div>
          {(data.weights || []).map((w) => (
            <div className="wrow" key={w.key}>
              <span>{w.label}</span>
              <input type="number" value={w.pct} onChange={(e) => setWeight(w.key, Number(e.target.value))} />
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <span className="mono" style={{ fontSize: 13, color: total === 100 ? undefined : '#B91C1C' }}>
              Total: {total}
            </span>
            <button className="btn btn-primary btn-sm" type="button" disabled={busy === 'weights' || total !== 100} onClick={() => save('Weights saved')}>
              <Save className="lucide" /> Save weights
            </button>
          </div>
        </div>
      )}

      {tab === 'services' && (
        <div className="card panel">
          <div className="panel-h">
            <div>
              <h3>
                <Layers className="lucide svg" /> Recommendation services
              </h3>
              <p>Report recommendations map to these via service_key.</p>
            </div>
            <button className="btn btn-ghost btn-sm" type="button" onClick={addService}>
              <Plus className="lucide" /> Add
            </button>
          </div>
          {(data.services || []).map((s) => (
            <div className="svc" key={s.key}>
              <div>
                <strong>
                  {s.name} <code>{s.key}</code>
                </strong>
                <span>{s.description}</span>
              </div>
              <button className="btn btn-ghost btn-icon" type="button" onClick={() => editService(s)}>
                <Pencil className="lucide" />
              </button>
            </div>
          ))}
          <div style={{ textAlign: 'right' }}>
            <button className="btn btn-primary btn-sm" type="button" onClick={() => save('Services saved')}>
              <Save className="lucide" /> Save
            </button>
          </div>
        </div>
      )}

      {tab === 'engine' && (
        <div className="card panel">
          <div className="panel-h">
            <div>
              <h3>
                <Bot className="lucide svg" /> Engine
              </h3>
              <p>All calls go through one OpenAI service module.</p>
            </div>
          </div>
          <div className="field">
            <label>Extraction / classification model</label>
            <select value={data.engine.modelMini} onChange={(e) => setEngine({ modelMini: e.target.value })}>
              <option>gpt-4o-mini</option>
              <option>gpt-4.1-mini</option>
            </select>
          </div>
          <div className="field">
            <label>Recommendations model</label>
            <select value={data.engine.modelStrong} onChange={(e) => setEngine({ modelStrong: e.target.value })}>
              <option>gpt-4o</option>
              <option>gpt-4.1</option>
            </select>
          </div>
          <div className="field">
            <label>Queries per report</label>
            <input type="number" min={20} max={60} value={data.engine.maxQueries} onChange={(e) => setEngine({ maxQueries: Number(e.target.value) })} />
          </div>
          <div className="field">
            <label>Pages crawled per site</label>
            <input type="number" min={5} max={20} value={data.engine.maxPages} onChange={(e) => setEngine({ maxPages: Number(e.target.value) })} />
          </div>
          <div className="opt">
            <div>
              Run browsing mode<span>Uses the Responses API web_search tool</span>
            </div>
            <Switch on={data.engine.browsing !== false} onToggle={() => setEngine({ browsing: data.engine.browsing === false })} />
          </div>
          <div className="opt">
            <div>
              Run knowledge mode<span>Same queries without web search</span>
            </div>
            <Switch on={data.engine.knowledge !== false} onToggle={() => setEngine({ knowledge: data.engine.knowledge === false })} />
          </div>
          <div className="opt">
            <div>
              Email report link on completion<span>Transactional email provider, pluggable</span>
            </div>
            <Switch on={data.engine.emailOnComplete !== false} onToggle={() => setEngine({ emailOnComplete: data.engine.emailOnComplete === false })} />
          </div>
          <div style={{ marginTop: 14, textAlign: 'right' }}>
            <button className="btn btn-primary btn-sm" type="button" disabled={busy === 'engine'} onClick={() => save('Engine settings saved')}>
              <Save className="lucide" /> Save
            </button>
          </div>
        </div>
      )}

      {tab === 'limits' && (
        <div className="card panel">
          <div className="panel-h">
            <div>
              <h3>
                <Shield className="lucide svg" /> Limits & access
              </h3>
              <p>Rate limiting and CORS.</p>
            </div>
          </div>
          <div className="field">
            <label>Reports per IP per day</label>
            <input type="number" value={data.limits.reportsPerIp} onChange={(e) => setLimits({ reportsPerIp: Number(e.target.value) })} />
          </div>
          <div className="field">
            <label>Reports per email per day</label>
            <input type="number" value={data.limits.reportsPerEmail} onChange={(e) => setLimits({ reportsPerEmail: Number(e.target.value) })} />
          </div>
          <div className="field">
            <label>Allowed origins</label>
            <input value={data.limits.allowedOrigins || ''} onChange={(e) => setLimits({ allowedOrigins: e.target.value })} />
          </div>
          <div className="field">
            <label>Competitor exclusion list</label>
            <input value={data.limits.exclusions || ''} onChange={(e) => setLimits({ exclusions: e.target.value })} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <button className="btn btn-primary btn-sm" type="button" onClick={() => save('Limits saved')}>
              <Save className="lucide" /> Save
            </button>
          </div>
        </div>
      )}
    </>
  );
}
