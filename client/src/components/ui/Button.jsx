export default function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  const map = { primary: 'btn-primary', grad: 'btn-grad', ghost: 'btn-ghost', light: 'btn-light' };
  return (
    <button type={type} className={`btn ${map[variant] || 'btn-primary'} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
