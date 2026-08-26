export function band(s) {
  if (s == null || s === '') return '—';
  const n = Number(s);
  if (n <= 20) return 'Invisible';
  if (n <= 40) return 'Barely visible';
  if (n <= 60) return 'Getting there';
  if (n <= 80) return 'Visible';
  return 'Leading';
}

export function scoreClass(s) {
  const n = Number(s) || 0;
  if (n <= 20) return 's1';
  if (n <= 40) return 's2';
  if (n <= 60) return 's3';
  return 's4';
}

export function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function ago(d) {
  if (!d) return '';
  const m = (Date.now() - new Date(d)) / 60000;
  if (m < 60) return `${Math.max(1, Math.round(m))}m ago`;
  if (m < 1440) return `${Math.round(m / 60)}h ago`;
  return `${Math.round(m / 1440)}d ago`;
}

export function badgeLabel(r) {
  if (!r) return 'queued';
  if (r.status === 'processing') return (r.progress_step || 'processing').replace(/_/g, ' ');
  return String(r.status || 'queued').replace(/_/g, ' ');
}

export function badgeClass(r) {
  if (!r) return 'queued';
  if (r.status === 'processing') return r.progress_step || 'processing';
  return r.status || 'queued';
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'MF';
}

export function downloadCsv(filename, rows) {
  const csv = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
