import { NavLink } from 'react-router-dom';
import { siteMeta } from '../data/siteContent';

const navigation = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Contact', to: '/contact' },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <p className="footer-brand__name">{siteMeta.name}</p>
          <p className="footer-brand__text">
            Sustainable architecture, climate-adaptive design, and resilient
            urban research.
          </p>
        </div>

        <div className="footer-socials" aria-label="Footer contact shortcuts">
          <a
            aria-label="LinkedIn"
            className="footer-social-link"
            href={siteMeta.contactLinkedInUrl}
          >
            <span aria-hidden="true" className="hero__social-mark hero__social-mark--linkedin">
              in
            </span>
          </a>
          <a
            aria-label="Instagram"
            className="footer-social-link"
            href={siteMeta.contactInstagramUrl}
          >
            <svg
              aria-hidden="true"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                height="15.5"
                rx="4.75"
                stroke="currentColor"
                strokeWidth="1.8"
                width="15.5"
                x="4.25"
                y="4.25"
              />
              <circle
                cx="12"
                cy="12"
                r="3.7"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <circle cx="16.9" cy="7.1" fill="currentColor" r="1.15" />
            </svg>
          </a>
          <a aria-label="Contact page" className="footer-social-link" href="/contact">
            <svg
              aria-hidden="true"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                height="14"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.6"
                width="18"
                x="3"
                y="5"
              />
              <path
                d="M5.5 8L12 13L18.5 8"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
              />
            </svg>
          </a>
        </div>

        <nav aria-label="Footer" className="footer-nav">
          {navigation.map((item) => (
            <NavLink className="footer-nav__link" key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </footer>
  );
}
