export default function Input({ label, error, extra, className = '', ...props }) {
  return (
    <div className={`field ${className}`.trim()}>
      {extra ? (
        <div className="top">
          {label && <label>{label}</label>}
          {extra}
        </div>
      ) : (
        label && <label>{label}</label>
      )}
      <input className={error ? 'bad' : ''} {...props} />
      {error && <span className="err">{error}</span>}
    </div>
  );
}
