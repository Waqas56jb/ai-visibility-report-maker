import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../api/index.js';
import { businessSchema } from '../../schemas/business.js';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { useToast } from '../../lib/toast.jsx';

export default function Businesses() {
  const toast = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, getValues, reset } = useForm({
    defaultValues: { business_name: '', website_url: '', industry: '', city_region: '', competitors: '' },
  });

  function load() {
    api.listBusinesses().then((d) => setItems(d.items || [])).catch((e) => toast(e.message));
  }

  useEffect(load, []);

  async function save(e) {
    e.preventDefault();
    const values = getValues();
    const parsed = businessSchema.safeParse({
      ...values,
      competitors: values.competitors ? values.competitors.split(',').map((s) => s.trim()).filter(Boolean) : [],
    });
    if (!parsed.success) {
      toast(parsed.error.issues[0].message);
      return;
    }
    try {
      if (editing) await api.updateBusiness(editing.id, parsed.data);
      else await api.saveBusiness(parsed.data);
      setOpen(false);
      setEditing(null);
      reset();
      load();
    } catch (err) {
      toast(err.message);
    }
  }

  if (!items) return <Skeleton />;

  return (
    <>
      <Button variant="grad" onClick={() => { reset(); setEditing(null); setOpen(true); }}>
        Add business
      </Button>
      {!items.length ? (
        <EmptyState title="No businesses saved" body="Add one so you can re-run reports faster." />
      ) : (
        <div className="card panel" style={{ marginTop: 16 }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Website</th>
                <th>Industry</th>
                <th>Location</th>
                <th>Latest score</th>
                <th>Reports</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td>{b.website}</td>
                  <td>{b.industry || '—'}</td>
                  <td>{b.city_region || '—'}</td>
                  <td>{b.latest_score ?? '—'}</td>
                  <td>{b.reports_count}</td>
                  <td className="table-actions">
                    <Button variant="ghost" className="btn-sm" onClick={() => navigate('/app/new', { state: { prefill: b } })}>
                      Run report
                    </Button>
                    <Button
                      variant="ghost"
                      className="btn-sm"
                      onClick={() => {
                        setEditing(b);
                        reset({ business_name: b.name, website_url: b.website, industry: b.industry, city_region: b.city_region, competitors: '' });
                        setOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      className="btn-sm"
                      onClick={async () => {
                        await api.deleteBusiness(b.id);
                        load();
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={open} title={editing ? 'Edit business' : 'Add business'} onClose={() => setOpen(false)}>
        <form onSubmit={save}>
          <Input label="Business name" {...register('business_name')} />
          <Input label="Website URL" {...register('website_url')} />
          <Input label="Industry" {...register('industry')} />
          <Input label="City / region" {...register('city_region')} />
          {!editing && <Input label="Competitors (comma separated)" {...register('competitors')} />}
          <Button variant="grad" type="submit">
            Save
          </Button>
        </form>
      </Modal>
    </>
  );
}
