import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { siteMeta } from '../data/siteContent';

const navigation = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Contact', to: '/contact' },
];

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <NavLink className="brand" to="/">
          <span className="brand__name">{siteMeta.name}</span>
          <span className="brand__role">ARCHITECT • RESEARCHER</span>
        </NavLink>

        <button
          aria-controls="primary-navigation"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          className="nav-toggle"
          onClick={() => setIsOpen((open) => !open)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          aria-label="Primary"
          className={`site-nav ${isOpen ? 'is-open' : ''}`}
          id="primary-navigation"
        >
          {navigation.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `site-nav__link ${isActive ? 'is-active' : ''}`
              }
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
