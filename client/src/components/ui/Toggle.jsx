export default function Toggle({ label, checked, onChange, disabled }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} />
      <span className="toggle-ui" />
      <span>{label}</span>
    </label>
  );
}
