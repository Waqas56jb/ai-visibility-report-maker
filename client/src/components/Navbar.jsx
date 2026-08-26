import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CircleHelp,
  Layers,
  LayoutDashboard,
  LogIn,
  Menu,
  PlusCircle,
  Route as RouteIcon,
  ScanSearch,
  UserPlus,
} from 'lucide-react';
import Logo from './Logo.jsx';
import { useAuth } from '../store/auth.js';

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
            <a href="#how" onClick={(e) => onSection(e, 'how')}>
              How it works
            </a>
            <a href="#measure" onClick={(e) => onSection(e, 'measure')}>
              What we measure
            </a>
            <a href="#services" onClick={(e) => onSection(e, 'services')}>
              Services
            </a>
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
                Check my visibility
              </button>
            )}
            <button className="burger" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
              <Menu className="lucide svg" />
            </button>
          </div>
        </div>
      </header>
      <div className={`mobile-menu${open ? ' open' : ''}`}>
        <a href="#how" onClick={(e) => onSection(e, 'how')}>
          <RouteIcon className="lucide svg" /> How it works
        </a>
        <a href="#measure" onClick={(e) => onSection(e, 'measure')}>
          <ScanSearch className="lucide svg" /> What we measure
        </a>
        <a href="#services" onClick={(e) => onSection(e, 'services')}>
          <Layers className="lucide svg" /> Services
        </a>
        <a href="#faq" onClick={(e) => onSection(e, 'faq')}>
          <CircleHelp className="lucide svg" /> FAQ
        </a>
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
