import { Link } from 'react-router-dom';

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="logo" onClick={() => window.scrollTo(0, 0)}>
      <img className="logo-ink" src="/logo.png" alt="MakeFlow" />
      <img className="logo-light" src="/logo-on-dark.png" alt="" aria-hidden="true" />
    </Link>
  );
}
