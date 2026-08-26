export default function Brand({ onDark = false, showAdmin = false }) {
  return (
    <div className={`logo ${onDark ? 'logo-on-dark' : ''}`}>
      <img src="/logo.png" alt="MakeFlow" />
      {showAdmin && <span className="logo-admin">Admin</span>}
    </div>
  );
}
