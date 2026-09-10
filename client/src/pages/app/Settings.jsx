import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/index.js';
import { passwordSchema } from '../../schemas/profile.js';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../store/auth.js';
import { useToast } from '../../lib/toast.jsx';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const toast = useToast();
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const settings = user?.settings || {};
  const { register, getValues } = useForm({ defaultValues: { current_password: '', new_password: '', confirm: '' } });
  const [notify, setNotify] = useState({
    notify_complete: settings.notify_complete !== false,
    monthly_reminder: Boolean(settings.monthly_reminder),
    tips: settings.tips !== false,
  });
  const [defaults, setDefaults] = useState({
    default_country: settings.default_country || 'Australia',
    default_modes: settings.default_modes || { browsing: true, knowledge: true },
    default_competitors: settings.default_competitors || '',
  });
  const [confirmDelete, setConfirmDelete] = useState('');

  async function savePassword(e) {
    e.preventDefault();
    const parsed = passwordSchema.safeParse(getValues());
    if (!parsed.success) {
      toast(parsed.error.issues[0].message);
      return;
    }
    try {
      await api.changePassword(parsed.data);
      toast('Password updated');
    } catch (err) {
      toast(err.message);
    }
  }

  async function saveNotes() {
    const updated = await api.updateProfile({ settings: { ...settings, ...notify, ...defaults } });
    setUser({ ...user, ...updated });
    toast('Settings saved');
  }

  return (
    <>
      <form className="card panel" onSubmit={savePassword} style={{ maxWidth: 560 }}>
        <h3>Change password</h3>
        <Input label="Current password" type="password" {...register('current_password')} />
        <Input label="New password" type="password" {...register('new_password')} />
        <Input label="Confirm" type="password" {...register('confirm')} />
        <Button variant="primary" type="submit">
          Update password
        </Button>
      </form>
      <div className="card panel" style={{ maxWidth: 560, marginTop: 16 }}>
        <h3>Notifications</h3>
        <Toggle label="Email when a report completes" checked={notify.notify_complete} onChange={(v) => setNotify((s) => ({ ...s, notify_complete: v }))} />
        <Toggle label="Monthly re-run reminder" checked={notify.monthly_reminder} onChange={(v) => setNotify((s) => ({ ...s, monthly_reminder: v }))} />
        <Toggle label="MakeFlow tips" checked={notify.tips} onChange={(v) => setNotify((s) => ({ ...s, tips: v }))} />
        <Button variant="grad" onClick={saveNotes}>
          Save
        </Button>
      </div>
      <div className="card panel" style={{ maxWidth: 560, marginTop: 16 }}>
        <h3>Defaults for new reports</h3>
        <Select
          label="Default country"
          value={defaults.default_country}
          onChange={(e) => setDefaults((d) => ({ ...d, default_country: e.target.value }))}
        >
          <option>Australia</option>
          <option>New Zealand</option>
          <option>United Kingdom</option>
          <option>United States</option>
        </Select>
        <Toggle
          label="Browsing mode on by default"
          checked={defaults.default_modes.browsing}
          onChange={(v) => setDefaults((d) => ({ ...d, default_modes: { ...d.default_modes, browsing: v } }))}
        />
        <Toggle
          label="Knowledge mode on by default"
          checked={defaults.default_modes.knowledge}
          onChange={(v) => setDefaults((d) => ({ ...d, default_modes: { ...d.default_modes, knowledge: v } }))}
        />
        <Input
          label="Default competitors (comma separated)"
          value={defaults.default_competitors}
          onChange={(e) => setDefaults((d) => ({ ...d, default_competitors: e.target.value }))}
        />
        <Button variant="grad" onClick={saveNotes}>
          Save defaults
        </Button>
      </div>
      <div className="danger" style={{ maxWidth: 560 }}>
        <h3>Danger zone</h3>
        <p className="muted">Type DELETE to permanently remove your account.</p>
        <Input value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} placeholder="DELETE" />
        <Button
          variant="primary"
          onClick={async () => {
            try {
              await api.deleteAccount(confirmDelete);
              await logout();
              navigate('/');
            } catch (err) {
              toast(err.message);
            }
          }}
        >
          Delete account
        </Button>
      </div>
    </>
  );
}
