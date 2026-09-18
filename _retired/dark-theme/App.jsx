import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import PlansPage from './pages/PlansPage.jsx';
import UseCasesPage from './pages/UseCasesPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import CheckerModal from './components/CheckerModal.jsx';
import ChatWidget from './components/ChatWidget.jsx';
import Motion3D from './components/Motion3D.jsx';
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
import { SiteProvider } from './store/site.jsx';
import { useTheme } from './store/theme.js';

function PageFade({ children }) {
  return <div className="page-enter">{children}</div>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AuthBoot() {
  const restore = useAuth((s) => s.restore);
  const user = useAuth((s) => s.user);
  useEffect(() => {
    restore();
  }, [restore]);
  useEffect(() => {
    if (!user) return undefined;
    const id = window.setInterval(() => restore(), 20 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [user, restore]);
  return null;
}

// The public marketing pages share the deep-ink look of the final CTA card; the
// app, auth screens and shared reports keep the light theme.
function ThemeScope() {
  const { pathname } = useLocation();
  const theme = useTheme((s) => s.theme);
  const appRoute = /^\/(app|login|signup|reset-password|forgot-password|report)(\/|$)/.test(pathname);
  const dark = theme === 'dark' && !appRoute;
  useEffect(() => {
    document.documentElement.classList.toggle('mf-dark', dark);
  }, [dark]);
  return null;
}

function SiteChat() {
  const { pathname } = useLocation();
  const hidden = /^\/(app|login|signup|reset-password|forgot-password)/.test(pathname);
  return hidden ? null : <ChatWidget />;
}

export default function App() {
  return (
    <ToastProvider>
      <SiteProvider>
      <BrowserRouter>
        <AuthBoot />
        <ScrollToTop />
        <ThemeScope />
        <Motion3D />
        <a className="skip-link" href="#main">Skip to content</a>
        <Routes>
          <Route path="/" element={<PageFade><Landing /></PageFade>} />
          <Route path="/services" element={<PageFade><ServicesPage /></PageFade>} />
          <Route path="/plans" element={<PageFade><PlansPage /></PageFade>} />
          <Route path="/use-cases" element={<PageFade><UseCasesPage /></PageFade>} />
          <Route path="/about" element={<PageFade><AboutPage /></PageFade>} />
          <Route path="/privacy-policy" element={<PageFade><PrivacyPolicyPage /></PageFade>} />
          <Route path="/terms-and-conditions" element={<PageFade><TermsPage /></PageFade>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ForgotPassword />} />
          <Route path="/forgot-password" element={<Navigate to="/reset-password" replace />} />
          <Route path="/reset-password/confirm" element={<ResetPasswordConfirm />} />
          <Route path="/report/:id" element={<PageFade><PublicReport /></PageFade>} />
          <Route path="/app" element={<PageFade><AppLayout /></PageFade>}>
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
          <Route path="*" element={<PageFade><NotFoundPage /></PageFade>} />
        </Routes>
        <CheckerModal />
        <SiteChat />
      </BrowserRouter>
      </SiteProvider>
    </ToastProvider>
  );
}
