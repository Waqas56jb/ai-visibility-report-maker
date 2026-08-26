import { Link } from 'react-router-dom';

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="logo" onClick={() => window.scrollTo(0, 0)}>
      <img src="/logo.png" alt="MakeFlow" />
    </Link>
  );
}
