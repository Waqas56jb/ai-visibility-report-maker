import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  Settings2,
  Users,
} from 'lucide-react';
import Brand from './Brand.jsx';
import Drawer from './Drawer.jsx';
import { useAuth } from '../auth.jsx';
import { api } from '../api.js';
import { initials } from '../lib.js';
import { useToast } from '../toast.jsx';
import { AdminCtx } from '../admin-context.js';

const TITLES = {
  '/': 'Dashboard',
  '/reports': 'Reports',
  '/leads': 'Leads',
  '/settings': 'Settings',
};

export default function Shell() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sideOpen, setSideOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [counts, setCounts] = useState({ reports: 0, leads: 0 });
  const [refreshKey, setRefreshKey] = useState(0);
  const [drawerId, setDrawerId] = useState(null);

  const title = TITLES[location.pathname] || 'Dashboard';
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email || 'Admin';

  useEffect(() => {
    setSideOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let live = true;
    Promise.all([api.reports(), api.leads()])
      .then(([r, l]) => {
        if (!live) return;
        setCounts({ reports: r.total ?? r.items?.length ?? 0, leads: l.total ?? l.items?.length ?? 0 });
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [refreshKey]);

  function refresh() {
    setRefreshKey((k) => k + 1);
    toast('Refreshed');
  }

  function onSearch(value) {
    setSearch(value);
    if (location.pathname !== '/reports' && location.pathname !== '/leads') {
      navigate('/reports');
    }
  }

  const ctx = useMemo(
    () => ({
      search,
      refreshKey,
      openReport: setDrawerId,
      refreshSilent: () => setRefreshKey((k) => k + 1),
    }),
    [search, refreshKey]
  );

  return (
    <AdminCtx.Provider value={ctx}>
      <div className="shell">
        <div className={`scrim ${sideOpen ? 'show' : ''}`} onClick={() => setSideOpen(false)} />
        <aside className={`side ${sideOpen ? 'open' : ''}`}>
          <div className="brand">
            <Brand onDark />
          </div>
          <nav>
            <NavLink to="/" end>
              <LayoutDashboard className="lucide svg" /> Dashboard
            </NavLink>
            <NavLink to="/reports">
              <FileBarChart className="lucide svg" /> Reports <span className="cnt">{counts.reports}</span>
            </NavLink>
            <NavLink to="/leads">
              <Users className="lucide svg" /> Leads <span className="cnt">{counts.leads}</span>
            </NavLink>
            <div className="sec">System</div>
            <NavLink to="/settings">
              <Settings2 className="lucide svg" /> Settings
            </NavLink>
            <a
              href="https://makeflow.com.au"
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                e.preventDefault();
                toast('Docs open in a new tab');
                window.open('https://makeflow.com.au', '_blank', 'noreferrer');
              }}
            >
              <BookOpen className="lucide svg" /> Documentation
            </a>
          </nav>
          <div className="usr">
            {user?.avatar_url ? <img src={user.avatar_url} alt="" /> : <div className="av">{initials(name)}</div>}
            <div>
              <strong>{name}</strong>
              <span>Owner · MakeFlow</span>
            </div>
            <button
              type="button"
              aria-label="Sign out"
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
            >
              <LogOut className="lucide" />
            </button>
          </div>
        </aside>
        <div className="main">
          <div className="topbar">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button className="burger" type="button" id="burger" onClick={() => setSideOpen((o) => !o)}>
                <Menu className="lucide" />
              </button>
              <h2>{title}</h2>
            </div>
            <div className="search">
              <Search className="lucide" />
              <input
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search business, website or email…"
              />
            </div>
            <button className="btn btn-ghost btn-sm" type="button" onClick={refresh}>
              <RefreshCw className="lucide" /> <span className="hide-sm">Refresh</span>
            </button>
          </div>
          <div className="content">
            <Outlet />
          </div>
        </div>
        <Drawer
          id={drawerId}
          onClose={() => setDrawerId(null)}
          onChanged={() => setRefreshKey((k) => k + 1)}
        />
      </div>
    </AdminCtx.Provider>
  );
}
