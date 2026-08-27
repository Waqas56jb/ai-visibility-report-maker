import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  CircleHelp,
  Layers,
  LayoutDashboard,
  LogIn,
  Menu,
  PlusCircle,
  Route as RouteIcon,
  ScanSearch,
  Sparkles,
  UserPlus,
  X,
} from 'lucide-react';
import Logo from './Logo.jsx';
import { useAuth } from '../store/auth.js';
import { useSite } from '../store/site.jsx';

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export function goToCheck(navigate, pathname) {
  if (pathname === '/') {
    scrollToId('check');
  } else {
    navigate('/');
    window.setTimeout(() => scrollToId('check'), 80);
  }
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

  function onSection(e, id) {
    e.preventDefault();
    setOpen(false);
    if (pathname === '/') {
      scrollToId(id);
    } else {
      navigate('/');
      window.setTimeout(() => scrollToId(id), 80);
    }
  }

  return (
    <>
      <header className={`nav${dark ? ' dark' : ''}${scrolled ? ' scrolled' : ''}`}>
        <div className="wrap">
          <Logo />
          <nav className="nav-links">
            <a href="#why" onClick={(e) => onSection(e, 'why')}>
              Why AI
            </a>
            <a href="#how" onClick={(e) => onSection(e, 'how')}>
              How it works
            </a>
            <a href="#inside" onClick={(e) => onSection(e, 'inside')}>
              The report
            </a>
            <Link to="/services">Services</Link>
            <a href="#faq" onClick={(e) => onSection(e, 'faq')}>
              FAQ
            </a>
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
        <a href="#why" onClick={(e) => onSection(e, 'why')}>
          <ScanSearch className="lucide svg" /> Why AI
        </a>
        <a href="#how" onClick={(e) => onSection(e, 'how')}>
          <RouteIcon className="lucide svg" /> How it works
        </a>
        <a href="#inside" onClick={(e) => onSection(e, 'inside')}>
          <Layers className="lucide svg" /> The report
        </a>
        <Link to="/services">
          <Sparkles className="lucide svg" /> Services
        </Link>
        <a href="#faq" onClick={(e) => onSection(e, 'faq')}>
          <CircleHelp className="lucide svg" /> FAQ
        </a>
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
