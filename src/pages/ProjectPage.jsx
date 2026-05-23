import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import ProjectVisual from '../components/ProjectVisual';
import { getProjectBySlug, projects } from '../data/projects';

function getVariantCaption(variant) {
  if (variant === 'hero') {
    return 'Atmospheric perspective';
  }

  if (variant === 'plan') {
    return 'Plan and systems diagram';
  }

  if (variant === 'section') {
    return 'Spatial section study';
  }

  if (variant === 'detail') {
    return 'Facade and landscape detail';
  }

  return 'Project visual';
}

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
      className={className}
      theme={project.theme}
      title={alt}
      variant={variant}
    />
  );
}

function ProjectLightbox({
  activeIndex,
  items,
  onClose,
  onNext,
  onPrevious,
  project,
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const maxZoomLevel = 2.5;

  function increaseZoom(step = 0.25) {
    setZoomLevel((current) => Math.min(maxZoomLevel, Number((current + step).toFixed(2))));
  }

  function decreaseZoom(step = 0.25) {
    setZoomLevel((current) => Math.max(1, Number((current - step).toFixed(2))));
  }

  function handleImageClick() {
    if (zoomLevel >= maxZoomLevel) {
      setZoomLevel(1);
      return;
    }

    increaseZoom(0.5);
  }

  useEffect(() => {
    setZoomLevel(1);
  }, [activeIndex]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key === 'ArrowRight' && items.length > 1) {
        onNext();
      }

      if (event.key === 'ArrowLeft' && items.length > 1) {
        onPrevious();
      }

      if ((event.key === '+' || event.key === '=') && zoomLevel < maxZoomLevel) {
        increaseZoom();
      }

      if (event.key === '-' && zoomLevel > 1) {
        decreaseZoom();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [items.length, maxZoomLevel, onClose, onNext, onPrevious, zoomLevel]);

  const activeItem = items[activeIndex];

  return (
    <div
      aria-modal="true"
      className="project-lightbox"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="project-lightbox__panel"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          aria-label="Close enlarged image"
          className="project-lightbox__close"
          onClick={onClose}
          type="button"
        >
          X
        </button>

        {items.length > 1 ? (
          <button
            aria-label="Previous image"
            className="project-lightbox__nav project-lightbox__nav--prev"
            onClick={onPrevious}
            type="button"
          >
            {'<'}
          </button>
        ) : null}

        <div className="project-lightbox__viewport">
          <div
            className="project-lightbox__media"
            style={{ '--lightbox-zoom': zoomLevel }}
          >
            <button
              aria-label={
                zoomLevel >= maxZoomLevel
                  ? 'Reset image zoom'
                  : 'Zoom further into image'
              }
              className="project-lightbox__image-button"
              onClick={handleImageClick}
              type="button"
            >
              <div className="project-lightbox__image-shell">
                <ProjectVisualFrame
                  alt={`${project.title} enlarged visual`}
                  className="project-lightbox__image"
                  project={project}
                  variant={activeItem.variant}
                />
              </div>
            </button>
          </div>
        </div>

        {items.length > 1 ? (
          <button
            aria-label="Next image"
            className="project-lightbox__nav project-lightbox__nav--next"
            onClick={onNext}
            type="button"
          >
            {'>'}
          </button>
        ) : null}

        <div className="project-lightbox__footer">
          <div className="project-lightbox__meta">
            <p className="eyebrow">Selected visual</p>
            <p className="project-lightbox__caption">{activeItem.caption}</p>
          </div>

          <div className="project-lightbox__controls" aria-label="Zoom controls">
            <button
              className="project-lightbox__control"
              disabled={zoomLevel <= 1}
              onClick={() => decreaseZoom()}
              type="button"
            >
              -
            </button>
            <button
              className="project-lightbox__control project-lightbox__control--label"
              onClick={() => setZoomLevel(1)}
              type="button"
            >
              {`${Math.round(zoomLevel * 100)}%`}
            </button>
            <button
              className="project-lightbox__control"
              disabled={zoomLevel >= maxZoomLevel}
              onClick={() => increaseZoom()}
              type="button"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectPage() {
  const { slug } = useParams();
  const project = getProjectBySlug(slug);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);

  if (!project) {
    return <Navigate to="/portfolio" replace />;
  }

  const nextProject =
    projects[(projects.findIndex((item) => item.slug === project.slug) + 1) % projects.length];
  const visualItems = useMemo(
    () =>
      project.gallery.map((variant, index) => ({
        id: `${variant}-${index}`,
        variant,
        caption: getVariantCaption(variant),
      })),
    [project.gallery],
  );
  const heroIndex = visualItems.findIndex((item) => item.variant === 'hero');
  const resolvedHeroIndex = heroIndex >= 0 ? heroIndex : 0;

  function openLightbox(index) {
    setActiveLightboxIndex(index);
  }

  function closeLightbox() {
    setActiveLightboxIndex(null);
  }

  function showNextImage() {
    setActiveLightboxIndex((current) =>
      current === null ? resolvedHeroIndex : (current + 1) % visualItems.length,
    );
  }

  function showPreviousImage() {
    setActiveLightboxIndex((current) =>
      current === null
        ? resolvedHeroIndex
        : (current - 1 + visualItems.length) % visualItems.length,
    );
  }

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
            <button
              className="project-sheet__hero-frame project-sheet__hero-trigger"
              onClick={() => openLightbox(resolvedHeroIndex)}
              type="button"
            >
              <ProjectVisualFrame
                alt={project.title}
                className="project-page-hero__image"
                project={project}
                variant="hero"
              />
            </button>
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
            {visualItems.map((item, index) => (
              <figure className="gallery-card" key={item.id}>
                <button
                  className="gallery-card__visual gallery-card__trigger"
                  onClick={() => openLightbox(index)}
                  type="button"
                >
                  <ProjectVisualFrame
                    alt={`${project.title} ${item.variant} visual`}
                    className="gallery-card__image"
                    project={project}
                    variant={item.variant}
                  />
                </button>
                <figcaption>{item.caption}</figcaption>
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

      {activeLightboxIndex !== null ? (
        <ProjectLightbox
          activeIndex={activeLightboxIndex}
          items={visualItems}
          onClose={closeLightbox}
          onNext={showNextImage}
          onPrevious={showPreviousImage}
          project={project}
        />
      ) : null}
    </>
  );
}
