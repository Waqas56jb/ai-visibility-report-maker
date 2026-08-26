import { useEffect, useState } from 'react';
import api from '../../api/index.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import CompetitorTable from '../../components/report/CompetitorTable.jsx';
import { useToast } from '../../lib/toast.jsx';

export default function Competitors() {
  const toast = useToast();
  const [businesses, setBusinesses] = useState([]);
  const [businessId, setBusinessId] = useState('');
  const [tracked, setTracked] = useState([]);
  const [fromReports, setFromReports] = useState([]);
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    api.listBusinesses().then((d) => {
      setBusinesses(d.items || []);
      if (d.items?.[0]) setBusinessId(d.items[0].id);
    });
  }, []);

  useEffect(() => {
    if (!businessId) return;
    api.listCompetitors(businessId).then((d) => setTracked(d.items || [])).catch((e) => toast(e.message));
    api.getHistory({ business_id: businessId }).then((d) => {
      const latest = [...(d.items || [])].reverse()[0];
      setFromReports(latest?.competitors || latest?.competitors_result || latest?.result_competitors || []);
    });
  }, [businessId, toast]);

  if (!businesses.length) {
    return <EmptyState title="Add a business first" body="Competitors are tracked per business." />;
  }

  return (
    <>
      <Select label="Business" value={businessId} onChange={(e) => setBusinessId(e.target.value)}>
        {businesses.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </Select>
      <div className="card panel">
        <h3>From latest report</h3>
        {fromReports.length ? <CompetitorTable rows={fromReports} /> : <p className="muted">No completed report yet.</p>}
      </div>
      <div className="card panel" style={{ marginTop: 16 }}>
        <h3>Tracked competitors</h3>
        <div className="row2">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Website (optional)" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
        <Button
          variant="grad"
          onClick={async () => {
            if (!name.trim()) return;
            await api.addCompetitor(businessId, { name: name.trim(), website });
            setName('');
            setWebsite('');
            const d = await api.listCompetitors(businessId);
            setTracked(d.items || []);
          }}
        >
          Add competitor
        </Button>
        <ul style={{ marginTop: 16 }}>
          {tracked.map((c) => (
            <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
              <span>
                {c.name} {c.website && <span className="muted">{c.website}</span>}
              </span>
              <button
                type="button"
                className="link"
                onClick={async () => {
                  await api.deleteCompetitor(c.id);
                  setTracked((prev) => prev.filter((x) => x.id !== c.id));
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
