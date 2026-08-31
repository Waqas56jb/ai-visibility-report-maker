import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import { useAuth } from '../store/auth.js';
import api from '../api/index.js';
import PageError from '../components/ui/PageError.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';

const TITLES = {
  '/app/dashboard': 'Overview',
  '/app/new': 'New report',
  '/app/reports': 'My reports',
  '/app/businesses': 'My businesses',
  '/app/competitors': 'Competitors',
  '/app/history': 'Score history',
  '/app/profile': 'Profile',
  '/app/settings': 'Settings',
  '/app/help': 'Help & how it works',
};

export default function AppLayout() {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [reportCount, setReportCount] = useState(0);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!user) return undefined;
    api
      .listReports({ pageSize: 1 })
      .then((d) => setReportCount(d.total || 0))
      .catch(() => setReportCount(0));
  }, [user, pathname]);

  if (loading && !user) {
    return (
      <div className="app-content">
        <Skeleton />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  const title =
    TITLES[pathname] ||
    (pathname.startsWith('/app/reports/') ? 'Report' : 'MakeFlow');

  return (
    <div className="app-shell">
      <Sidebar open={open} onClose={() => setOpen(false)} reportCount={reportCount} />
      <div className="app-main">
        <div className="app-bg" aria-hidden="true">
          <span />
          <span />
        </div>
        <Topbar title={title} onMenu={() => setOpen(true)} />
        <div className="app-content">
          <PageError>
            <div key={pathname} className="page-fade">
              <Outlet />
            </div>
          </PageError>
        </div>
      </div>
    </div>
  );
}
