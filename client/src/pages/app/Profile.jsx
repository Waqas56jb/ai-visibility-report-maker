import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/index.js';
import { profileSchema } from '../../schemas/profile.js';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../store/auth.js';
import { useToast } from '../../lib/toast.jsx';

const ZONES = ['Australia/Brisbane', 'Australia/Sydney', 'Australia/Melbourne', 'Australia/Perth', 'Pacific/Auckland', 'UTC'];

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const { register, reset, getValues } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      company_name: '',
      phone: '',
      timezone: 'Australia/Brisbane',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        company_name: user.company_name || '',
        phone: user.phone || '',
        timezone: user.timezone || 'Australia/Brisbane',
      });
    }
  }, [user, reset]);

  async function save(e) {
    e.preventDefault();
    const parsed = profileSchema.safeParse(getValues());
    if (!parsed.success) {
      toast(parsed.error.issues[0].message);
      return;
    }
    const updated = await api.updateProfile(parsed.data);
    setUser({ ...user, ...updated });
    toast('Profile saved');
  }

  return (
    <form className="card panel" onSubmit={save} style={{ maxWidth: 560 }}>
      <Input label="First name" {...register('first_name')} />
      <Input label="Last name" {...register('last_name')} />
      <Input label="Email" value={user?.email || ''} readOnly />
      <Input label="Company name" {...register('company_name')} />
      <Input label="Phone" {...register('phone')} />
      <Select label="Timezone" {...register('timezone')}>
        {ZONES.map((z) => (
          <option key={z}>{z}</option>
        ))}
      </Select>
      <p className="muted">Avatar upload will attach to storage when the media bucket is connected.</p>
      <Button variant="grad" type="submit">
        Save
      </Button>
    </form>
  );
}
