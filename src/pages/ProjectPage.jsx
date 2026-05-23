import { Link, Navigate, useParams } from 'react-router-dom';
import ProjectVisual from '../components/ProjectVisual';
import { getProjectBySlug, projects } from '../data/projects';

function ProjectFactList({ project }) {
  const items = [
    ['Category', project.category],
    ['Year', project.year],
    ['Location', project.location],
    ['Role', project.role],
    ['Tools', project.tools.join(', ')],
    ['Keywords', project.keywords.join(', ')],
  ];

  return (
    <dl className="project-fact-list">
      {items.map(([label, value]) => (
        <div className="project-fact" key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ProjectVisualFrame({ project, variant, alt, className }) {
  if (variant === 'hero' && project.heroImage) {
    return <img alt={alt} className={className} src={project.heroImage} />;
  }

  return (
    <ProjectVisual
      theme={project.theme}
      title={alt}
      variant={variant}
    />
  );
}

export default function ProjectPage() {
  const { slug } = useParams();
  const project = getProjectBySlug(slug);

  if (!project) {
    return <Navigate to="/portfolio" replace />;
  }

  const nextProject =
    projects[(projects.findIndex((item) => item.slug === project.slug) + 1) % projects.length];

  return (
    <>
      <div className="page-frame page-frame--project">
        <section className="project-sheet">
          <div className="project-sheet__copy">
            <Link className="back-link" to="/portfolio">
              Back to Portfolio
            </Link>
            <p className="eyebrow">
              {project.category} | {project.year}
            </p>
            <h1 className="project-sheet__title">{project.title}</h1>
            <p className="project-sheet__description">{project.shortDescription}</p>
            <ProjectFactList project={project} />
          </div>

          <div className="project-sheet__visuals">
            <div className="project-sheet__hero-frame">
              <ProjectVisualFrame
                alt={project.title}
                className="project-page-hero__image"
                project={project}
                variant="hero"
              />
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="detail-grid">
            <article className="detail-card">
              <h2>Overview</h2>
              <p>{project.overview}</p>
            </article>
            <article className="detail-card">
              <h2>Concept</h2>
              <p>{project.concept}</p>
            </article>
            <article className="detail-card detail-card--wide">
              <h2>Sustainability / Research Focus</h2>
              <p>{project.sustainabilityFocus}</p>
            </article>
          </div>
        </section>

        <section className="content-section">
          <div className="gallery-heading">
            <p className="eyebrow">Selected visuals</p>
            <h2 className="project-gallery__title">
              Spatial studies and project fragments
            </h2>
          </div>
          <div className="visual-gallery">
            {project.gallery.map((variant, index) => (
              <figure className="gallery-card" key={`${variant}-${index}`}>
                <div className="gallery-card__visual">
                  <ProjectVisualFrame
                    alt={`${project.title} ${variant} visual`}
                    className="gallery-card__image"
                    project={project}
                    variant={variant}
                  />
                </div>
                <figcaption>
                  {variant === 'hero' ? 'Atmospheric perspective' : null}
                  {variant === 'plan' ? 'Plan and systems diagram' : null}
                  {variant === 'section' ? 'Spatial section study' : null}
                  {variant === 'detail' ? 'Facade and landscape detail' : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="content-section">
          <article className="reflection-card">
            <p className="eyebrow">Reflection</p>
            <h2 className="section-title">What this project clarified in my practice</h2>
            <p className="reflection-card__body">{project.reflection}</p>
            <Link className="button button--ghost" to={`/portfolio/${nextProject.slug}`}>
              Next Project
            </Link>
          </article>
        </section>
      </div>
    </>
  );
}
