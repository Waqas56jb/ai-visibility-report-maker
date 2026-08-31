import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  CalendarCheck,
  Gem,
  LayoutDashboard,
  LogIn,
  Menu,
  PlusCircle,
  ScanSearch,
  Sparkles,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import Logo from './Logo.jsx';
import { useAuth } from '../store/auth.js';
import { useSite } from '../store/site.jsx';
import { useCheckerModal } from '../store/checkerModal.js';

// Kept signature-compatible with its old scroll-to-section behaviour so every
// existing call site works unchanged; the checker now opens as a modal instead.
export function goToCheck() {
  useCheckerModal.getState().openChecker();
}

export default function Navbar({ variant = 'landing' }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const user = useAuth((s) => s.user);
  const { content } = useSite();
  const navCta = content.navCta || 'Check my visibility';
  const bookCall = content.bookCall || {};
  const bookUrl = (bookCall.url || '').trim();
  const bookLabel = bookCall.label || 'Book a call';
  const bookExternal = /^https?:\/\//i.test(bookUrl);
  const bookProps = bookExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  const dark = variant === 'landing';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30 || variant === 'report');
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [variant]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle('nav-open', open);
    return () => document.body.classList.remove('nav-open');
  }, [open]);

  return (
    <>
      <header className={`nav${dark ? ' dark' : ''}${scrolled ? ' scrolled' : ''}`}>
        <div className="wrap">
          <Logo />
          <nav className="nav-links">
            <Link to="/services">Services</Link>
            <Link to="/use-cases">Use cases</Link>
            <Link to="/plans">Plans</Link>
            <Link to="/about">About</Link>
          </nav>
          <div className="nav-actions">
            {user ? (
              <Link to="/app/dashboard" className="btn btn-ghost btn-sm">
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="btn btn-ghost btn-sm">
                Log in
              </Link>
            )}
            {bookUrl ? (
              <a href={bookUrl} className="btn btn-ghost btn-sm" {...bookProps}>
                {bookLabel}
              </a>
            ) : null}
            {user ? (
              <Link to="/app/new" className="btn btn-primary btn-sm">
                New report
              </Link>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => goToCheck(navigate, pathname)}
              >
                {navCta}
              </button>
            )}
          </div>
          <button
            className="burger"
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="lucide svg" /> : <Menu className="lucide svg" />}
          </button>
        </div>
      </header>
      <div className={`mobile-menu${open ? ' open' : ''}`}>
        {!user && (
          <button
            type="button"
            className="btn btn-grad"
            onClick={() => {
              setOpen(false);
              goToCheck(navigate, pathname);
            }}
          >
            <ScanSearch className="lucide svg" /> {navCta}
          </button>
        )}
        <Link to="/services">
          <Sparkles className="lucide svg" /> Services
        </Link>
        <Link to="/use-cases">
          <Building2 className="lucide svg" /> Use cases
        </Link>
        <Link to="/plans">
          <Gem className="lucide svg" /> Plans
        </Link>
        <Link to="/about">
          <Users className="lucide svg" /> About
        </Link>
        {bookUrl ? (
          <a href={bookUrl} {...bookProps}>
            <CalendarCheck className="lucide svg" /> {bookLabel}
          </a>
        ) : null}
        {user ? (
          <>
            <Link to="/app/dashboard">
              <LayoutDashboard className="lucide svg" /> Dashboard
            </Link>
            <Link to="/app/new">
              <PlusCircle className="lucide svg" /> New report
            </Link>
          </>
        ) : (
          <>
            <Link to="/login">
              <LogIn className="lucide svg" /> Log in
            </Link>
            <Link to="/signup">
              <UserPlus className="lucide svg" /> Create account
            </Link>
          </>
        )}
      </div>
    </>
  );
}
