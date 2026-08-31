import { useEffect, useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { api } from '../api.js';
import { downloadCsv, fmtDate } from '../lib.js';
import { ScorePill } from '../components/Badges.jsx';
import { useAdmin } from '../admin-context.js';
import { useToast } from '../toast.jsx';

export default function Leads() {
  const { search, refreshKey, openReport } = useAdmin();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [source, setSource] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    api
      .leads({ search, source })
      .then((d) => setItems(d.items || []))
      .catch((e) => setError(e.message));
  }, [search, source, refreshKey]);

  function exportRows() {
    downloadCsv('leads.csv', [
      ['name', 'business_name', 'email', 'website', 'industry', 'location', 'latest_score', 'source', 'created_at'],
      ...items.map((l) => [
        l.name,
        l.business_name,
        l.email,
        l.website,
        l.industry,
        l.location,
        l.latest_score ?? '',
        l.source,
        l.created_at,
      ]),
    ]);
    toast('leads.csv downloaded');
  }

  return (
    <div className="card panel">
      <div className="toolbar">
        <select value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">All sources</option>
          <option value="website">website</option>
          <option value="landing-page">landing-page</option>
          <option value="referral">referral</option>
        </select>
        <div className="sp" />
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{items.length} leads</span>
        <button className="btn btn-grad btn-sm" type="button" onClick={exportRows}>
          <FileSpreadsheet className="lucide" /> Export leads.csv
        </button>
      </div>
      {error && <p className="err">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Business</th>
              <th>Email</th>
              <th>Website</th>
              <th>Industry</th>
              <th>Location</th>
              <th>Latest score</th>
              <th>Source</th>
              <th>Captured</th>
            </tr>
          </thead>
          <tbody>
            {items.map((l) => (
              <tr key={l.id} onClick={() => l.report_id && openReport(l.report_id)}>
                <td>
                  <strong>{l.name || '-'}</strong>
                </td>
                <td>{l.business_name}</td>
                <td>
                  {l.email ? (
                    <a href={`mailto:${l.email}`} onClick={(e) => e.stopPropagation()} style={{ color: 'var(--indigo)' }}>
                      {l.email}
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="mono" style={{ fontSize: 12 }}>
                  {l.website}
                </td>
                <td>{l.industry || '-'}</td>
                <td>{l.location || '-'}</td>
                <td>
                  <ScorePill score={l.latest_score} />
                </td>
                <td>
                  <span className="badge queued">{l.source}</span>
                </td>
                <td style={{ fontSize: 13, color: 'var(--text-2)' }}>{fmtDate(l.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
