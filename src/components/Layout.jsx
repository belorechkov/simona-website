import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';

export default function Layout({ children }) {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <div className="ambient ambient--one" aria-hidden="true" />
      <div className="ambient ambient--two" aria-hidden="true" />
      <div className="ambient ambient--three" aria-hidden="true" />
      <SiteHeader />
      <main className="page-main" id="content">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
