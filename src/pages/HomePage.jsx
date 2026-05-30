import { Link } from 'react-router-dom';
import PageIntro from '../components/PageIntro';
import ProjectVisual from '../components/ProjectVisual';
import { getFeaturedProjects } from '../data/projects';
import { focusPillars, siteMeta } from '../data/siteContent';

export default function HomePage() {
  const featuredProjects = getFeaturedProjects().slice(0, 3);

  return (
    <>
      <div className="page-frame page-frame--home page-frame--hero">
        <section className="hero hero--home">
          <div className="hero__copy hero__copy--home">
            <p className="eyebrow">Warm, resilient, research-led architecture</p>
            <h1 className="hero__title">{siteMeta.name}</h1>
            <p className="hero__subtitle">{siteMeta.subtitle}</p>
            <p className="hero__lead">{siteMeta.intro}</p>
            <div className="button-row">
              <Link className="button button--solid" to="/portfolio">
                View Portfolio
              </Link>
            </div>
            <div className="hero__socials" aria-label="Contact shortcuts">
              <a
                aria-label="LinkedIn"
                className="hero__social-link"
                href={siteMeta.contactLinkedInUrl}
              >
                <span aria-hidden="true" className="hero__social-mark hero__social-mark--linkedin">
                  in
                </span>
              </a>
              <a
                aria-label="Instagram"
                className="hero__social-link"
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
              <Link aria-label="Contact page" className="hero__social-link" to="/contact">
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
              </Link>
            </div>
          </div>

          <div className="hero-stage" aria-hidden="true">
            <div className="hero-stage__shape" />
            <div className="hero-stage__frame">
              <img
                alt=""
                className="hero__photo hero__photo--home"
                decoding="async"
                fetchPriority="high"
                src={siteMeta.heroImage}
              />
            </div>
          </div>
        </section>

        <section className="featured-strip featured-strip--home">
          <div className="featured-strip__grid">
            <div className="featured-strip__label">
              <p className="eyebrow">Featured projects</p>
            </div>
            {featuredProjects.map((project) => (
              <Link
                className="featured-tile"
                key={project.slug}
                to={`/portfolio/${project.slug}`}
              >
                <div className="featured-tile__visual">
                  {project.image || project.heroImage ? (
                    <img
                      alt={project.title}
                      className="featured-tile__image"
                      decoding="async"
                      src={project.image ?? project.heroImage}
                    />
                  ) : (
                    <ProjectVisual
                      theme={project.theme}
                      title={`${project.title} featured visual`}
                      variant="card"
                    />
                  )}
                </div>
                <div className="featured-tile__body">
                  <h2>{project.title}</h2>
                  <p>{project.category}</p>
                </div>
              </Link>
            ))}

            <Link className="featured-cta" to="/portfolio">
              <span className="featured-cta__copy">
                <span className="featured-cta__kicker">Explore All</span>
                <span className="featured-cta__title">Projects</span>
              </span>
              <span aria-hidden="true" className="featured-cta__arrow">
                →
              </span>
            </Link>
          </div>
        </section>
      </div>

      <section className="content-section page-frame page-frame--soft">
        <div className="split-panel split-panel--approach">
          <div className="split-panel__intro split-panel__intro--approach">
            <PageIntro
              eyebrow="Design approach"
              title="Architecture shaped by climate, community, and ecology"
              description="My work connects spatial design with environmental performance, urban thinking, and research-led inquiry, translating sustainability into clear, well-crafted architectural proposals."
            />
          </div>

          <div className="pillar-grid pillar-grid--approach">
            {focusPillars.map((pillar, index) => (
              <article className="info-card" key={pillar.title}>
                <p className="info-card__index">{`0${index + 1}`}</p>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
