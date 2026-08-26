import { useEffect, useState } from 'react';
import { Bot, Layers, Pencil, Plus, Save, Scale, Shield } from 'lucide-react';
import { api } from '../api.js';
import { useAdmin } from '../admin-context.js';
import { useToast } from '../toast.jsx';

function Switch({ on, onToggle }) {
  return <button type="button" className={`switch ${on ? 'on' : ''}`} onClick={onToggle} aria-pressed={on} />;
}

export default function Settings() {
  const toast = useToast();
  const { refreshKey } = useAdmin();
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

  function setWeight(key, pct) {
    setData({
      ...data,
      weights: data.weights.map((w) => (w.key === key ? { ...w, pct } : w)),
    });
  }

  function setEngine(patch) {
    setData({ ...data, engine: { ...data.engine, ...patch } });
  }

  function setLimits(patch) {
    setData({ ...data, limits: { ...data.limits, ...patch } });
  }

  async function save(part) {
    setBusy(part);
    try {
      const saved = await api.saveSettings({
        weights: data.weights,
        services: data.services,
        engine: data.engine,
        limits: data.limits,
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
    setData({
      ...data,
      services: [...data.services, { key, name, description: '', cta: '' }],
    });
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

  return (
    <div className="settings">
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

      <div className="card panel">
        <div className="panel-h">
          <div>
            <h3>
              <Layers className="lucide svg" /> MakeFlow services
            </h3>
            <p>Recommendations map to these via service_key.</p>
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
    </div>
  );
}
