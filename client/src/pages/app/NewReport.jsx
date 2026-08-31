import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../api/index.js';
import { reportSchema, reportStep1, reportStep2, reportStep3 } from '../../schemas/report.js';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import Chips from '../../components/ui/Chips.jsx';
import Button from '../../components/ui/Button.jsx';
import { useToast } from '../../lib/toast.jsx';
import { useAuth } from '../../store/auth.js';

const INDUSTRIES = ['Accounting', 'Physio', 'Plumbing', 'Dental', 'Legal', 'Marketing', 'Trades'];

function applyIssues(result, setError) {
  result.error.issues.forEach((i) => setError(i.path[0], { type: 'manual', message: i.message }));
}

export default function NewReport() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const settings = useAuth((s) => s.user?.settings) || {};
  const userEmail = useAuth((s) => s.user?.email) || '';
  const [step, setStep] = useState(1);
  const [businesses, setBusinesses] = useState([]);
  const [pending, setPending] = useState(false);
  const {
    register,
    getValues,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      business_id: '',
      business_name: '',
      website_url: '',
      industry: '',
      city_region: '',
      country: settings.default_country || 'Australia',
      competitors: settings.default_competitors
        ? String(settings.default_competitors)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 3)
        : [''],
      key_services: [],
      modes: settings.default_modes || { browsing: true, knowledge: true },
      notify_email: true,
      save_business: true,
    },
  });
  const competitors = watch('competitors') || [''];
  const services = watch('key_services') || [];
  const modes = watch('modes');

  useEffect(() => {
    api.listBusinesses().then((d) => setBusinesses(d.items || [])).catch(() => {});
    const pre = location.state?.prefill;
    if (pre) {
      setValue('business_name', pre.name || pre.business_name || '');
      setValue('website_url', pre.website || pre.website_url || '');
      setValue('industry', pre.industry || '');
      setValue('city_region', pre.city_region || '');
      setValue('business_id', pre.id || '');
    }
  }, [location.state, setValue]);

  function pickExisting(id) {
    const b = businesses.find((x) => x.id === id);
    setValue('business_id', id);
    if (!b) return;
    setValue('business_name', b.name);
    setValue('website_url', b.website);
    setValue('industry', b.industry || '');
    setValue('city_region', b.city_region || '');
    setValue('country', b.country || 'Australia');
  }

  function goNext() {
    const values = getValues();
    const schema = step === 1 ? reportStep1 : step === 2 ? reportStep2 : reportStep3;
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      applyIssues(parsed, setError);
      return;
    }
    clearErrors();
    if (step === 1) setValue('website_url', parsed.data.website_url);
    setStep((s) => s + 1);
  }

  async function onSubmit(e) {
    e.preventDefault();
    const parsed = reportSchema.safeParse(getValues());
    if (!parsed.success) {
      applyIssues(parsed, setError);
      toast('Please check the highlighted fields');
      return;
    }
    setPending(true);
    try {
      const payload = {
        ...parsed.data,
        competitors: (parsed.data.competitors || []).map((c) => c.trim()).filter(Boolean).slice(0, 3),
        email: String(location.state?.prefill?.email || userEmail || '').trim(),
      };
      const { reportId } = await api.createReport(payload);
      navigate(`/app/reports/${reportId}`);
    } catch (err) {
      toast(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="steps-ui">
        <span className={step >= 1 ? 'on' : ''} />
        <span className={step >= 2 ? 'on' : ''} />
        <span className={step >= 3 ? 'on' : ''} />
      </div>
      {step === 1 && (
        <div className="card panel">
          <h3>Business</h3>
          <Select label="Select existing" {...register('business_id')} onChange={(e) => pickExisting(e.target.value)}>
            <option value="">New business</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
          <Input label="Business name" error={errors.business_name?.message} {...register('business_name')} />
          <Input
            label="Website URL"
            placeholder="yourbusiness.com.au"
            error={errors.website_url?.message}
            {...register('website_url')}
          />
        </div>
      )}
      {step === 2 && (
        <div className="card panel">
          <h3>Context (optional)</h3>
          <Input label="Industry" list="industries" {...register('industry')} />
          <datalist id="industries">
            {INDUSTRIES.map((i) => (
              <option key={i} value={i} />
            ))}
          </datalist>
          <Input label="City / region" placeholder="Brisbane, QLD" {...register('city_region')} />
          <Select label="Country" {...register('country')}>
            <option>Australia</option>
            <option>New Zealand</option>
            <option>United Kingdom</option>
            <option>United States</option>
          </Select>
          <label>Competitors (up to 3)</label>
          {competitors.map((_, i) => (
            <div className="comp-row" key={i}>
              <input
                value={competitors[i]}
                onChange={(e) => {
                  const next = [...competitors];
                  next[i] = e.target.value;
                  setValue('competitors', next);
                }}
                placeholder="Competitor name"
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                aria-label={`Remove competitor ${i + 1}`}
                onClick={() => setValue('competitors', competitors.filter((_, idx) => idx !== i))}
                disabled={competitors.length <= 1}
              >
                <Trash2 className="lucide svg" />
              </button>
            </div>
          ))}
          {competitors.length < 3 && (
            <button type="button" className="optional-toggle" onClick={() => setValue('competitors', [...competitors, ''])}>
              <Plus className="lucide svg" /> Add competitor
            </button>
          )}
          <label>Key services</label>
          <Chips value={services} onChange={(v) => setValue('key_services', v)} placeholder="Type a service and press Enter" />
        </div>
      )}
      {step === 3 && (
        <div className="card panel">
          <h3>Options</h3>
          <Toggle
            label="Browsing mode"
            checked={modes.browsing}
            onChange={(v) => setValue('modes.browsing', v)}
          />
          <Toggle
            label="Knowledge mode"
            checked={modes.knowledge}
            onChange={(v) => setValue('modes.knowledge', v)}
          />
          <Toggle label="Email me when ready" checked={watch('notify_email')} onChange={(v) => setValue('notify_email', v)} />
          {watch('notify_email') && (
            <p className="desc" style={{ marginTop: 8 }}>
              We'll send the PDF to {location.state?.prefill?.email || userEmail || 'your account email'}. One free report per email every 30 days.
            </p>
          )}
          <Toggle label="Save this business for next time" checked={watch('save_business')} onChange={(v) => setValue('save_business', v)} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        {step > 1 && (
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        )}
        {step < 3 && (
          <Button variant="grad" onClick={goNext}>
            Continue
          </Button>
        )}
        {step === 3 && (
          <Button variant="grad" type="submit" disabled={pending}>
            {pending ? 'Starting…' : 'Generate report'}
          </Button>
        )}
      </div>
    </form>
  );
}
