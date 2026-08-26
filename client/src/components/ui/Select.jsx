export default function Select({ label, error, children, ...props }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <select className={error ? 'bad' : ''} {...props}>
        {children}
      </select>
      {error && <span className="err">{error}</span>}
    </div>
  );
}
