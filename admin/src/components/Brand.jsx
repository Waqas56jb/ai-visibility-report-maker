export default function Brand({ onDark = false, showAdmin = false }) {
  return (
    <div className="logo">
      <img src={onDark ? '/logo-on-dark.png' : '/logo.png'} alt="MakeFlow" />
      {showAdmin && <span className="logo-admin">Admin</span>}
    </div>
  );
}
