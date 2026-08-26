export default function CompetitorTable({ rows = [] }) {
  if (!rows.length) return <p className="muted">No competitor mentions stored for this report.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Business</th>
            <th>Mention rate</th>
            <th>Avg position</th>
            <th>Share of voice</th>
            <th>Est. score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr className={c.you ? 'you' : ''} key={c.name}>
              <td>
                <strong>{c.name}</strong>
                {c.you && (
                  <span className="tag svc" style={{ marginLeft: 6 }}>
                    you
                  </span>
                )}
              </td>
              <td>{c.mention_rate != null ? `${c.mention_rate}%` : '—'}</td>
              <td>{c.avg_position != null && c.avg_position !== '' ? Number(c.avg_position).toFixed(1) : '—'}</td>
              <td>
                <div className="sov">
                  <i>
                    <b style={{ width: `${Math.max(0, Math.min(100, Number(c.share_of_voice) || 0))}%` }} />
                  </i>
                  {c.share_of_voice != null ? `${c.share_of_voice}%` : '—'}
                </div>
              </td>
              <td>
                <strong>{c.est_score}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
