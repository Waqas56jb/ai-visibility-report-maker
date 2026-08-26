import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm.jsx';
import PublicReport from './pages/PublicReport.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import Dashboard from './pages/app/Dashboard.jsx';
import NewReport from './pages/app/NewReport.jsx';
import Reports from './pages/app/Reports.jsx';
import ReportDetail from './pages/app/ReportDetail.jsx';
import Businesses from './pages/app/Businesses.jsx';
import Competitors from './pages/app/Competitors.jsx';
import History from './pages/app/History.jsx';
import Profile from './pages/app/Profile.jsx';
import Settings from './pages/app/Settings.jsx';
import Help from './pages/app/Help.jsx';
import { ToastProvider } from './lib/toast.jsx';
import { useAuth } from './store/auth.js';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AuthBoot() {
  const restore = useAuth((s) => s.restore);
  useEffect(() => {
    restore();
  }, [restore]);
  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AuthBoot />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ForgotPassword />} />
          <Route path="/forgot-password" element={<Navigate to="/reset-password" replace />} />
          <Route path="/reset-password/confirm" element={<ResetPasswordConfirm />} />
          <Route path="/report/:id" element={<PublicReport />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="new" element={<NewReport />} />
            <Route path="reports" element={<Reports />} />
            <Route path="reports/:id" element={<ReportDetail />} />
            <Route path="businesses" element={<Businesses />} />
            <Route path="competitors" element={<Competitors />} />
            <Route path="history" element={<History />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
