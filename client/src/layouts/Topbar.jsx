import { Menu } from 'lucide-react';

export default function Topbar({ title, onMenu }) {
  return (
    <header className="topbar">
      <button type="button" className="hamburger" aria-label="Open menu" onClick={onMenu}>
        <Menu className="lucide svg" />
      </button>
      <h1>{title}</h1>
      <span />
    </header>
  );
}
