import { NavLink, useNavigate } from 'react-router-dom';
import {
  Building2,
  CircleHelp,
  FileBarChart,
  LayoutDashboard,
  PlusCircle,
  Settings2,
  Swords,
  TrendingUp,
  User,
} from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../store/auth.js';

const MAIN = [
  { to: '/app/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/app/new', label: 'New report', icon: PlusCircle, cta: true },
  { to: '/app/reports', label: 'My reports', icon: FileBarChart, badge: true },
  { to: '/app/businesses', label: 'My businesses', icon: Building2 },
  { to: '/app/competitors', label: 'Competitors', icon: Swords },
  { to: '/app/history', label: 'Score history', icon: TrendingUp },
];

const ACCOUNT = [
  { to: '/app/profile', label: 'Profile', icon: User },
  { to: '/app/settings', label: 'Settings', icon: Settings2 },
  { to: '/app/help', label: 'Help & how it works', icon: CircleHelp },
];

export default function Sidebar({ open, onClose, reportCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Account';
  const initials = (user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase();

  async function signOut() {
    await logout();
    navigate('/login');
  }

  function linkClass({ isActive }, extra = '') {
    return `${isActive ? 'active' : ''} ${extra}`.trim();
  }

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="brand">
          <Logo />
        </div>
        <nav>
          {MAIN.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={(p) => linkClass(p, item.cta ? 'nav-cta' : '')}
                onClick={onClose}
              >
                <Icon className="lucide svg" />
                {item.label}
                {item.badge && reportCount > 0 ? <span className="badge">{reportCount}</span> : null}
              </NavLink>
            );
          })}
          <div className="div">Account</div>
          {ACCOUNT.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={linkClass} onClick={onClose}>
                <Icon className="lucide svg" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-user">
          <div className="av">{initials}</div>
          <div>
            <strong>{name}</strong>
            <span>{user?.email}</span>
            <button type="button" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
