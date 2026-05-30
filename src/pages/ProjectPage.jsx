import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import ProgressiveImage from '../components/ProgressiveImage';
import ProjectVisual from '../components/ProjectVisual';
import { getProjectBySlug, projects } from '../data/projects';

function getVariantCaption(item) {
  const variant = typeof item === 'string' ? item : item?.variant;

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

function ProjectVisualFrame({
  project,
  variant,
  alt,
  className,
  decoding = 'auto',
  fetchPriority,
  src,
}) {
  const imageSrc = src || (variant === 'hero' ? project.heroImage : '');

  if (imageSrc) {
    return (
      <ProgressiveImage
        alt={alt}
        className={className}
        decoding={decoding}
        draggable={false}
        fetchPriority={fetchPriority}
        loading={fetchPriority === 'high' ? 'eager' : 'lazy'}
        src={imageSrc}
      />
    );
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
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const maxZoomLevel = 2.5;
  const viewportRef = useRef(null);
  const imageShellRef = useRef(null);
  const dragStateRef = useRef({
    active: false,
    moved: false,
    originX: 0,
    originY: 0,
    pointerId: null,
    startX: 0,
    startY: 0,
  });
  const suppressClickRef = useRef(false);

  function getPanBounds(nextZoom = zoomLevel) {
    const viewport = viewportRef.current;
    const imageShell = imageShellRef.current;

    if (!viewport || !imageShell || nextZoom <= 1) {
      return { x: 0, y: 0 };
    }

    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;
    const imageWidth = imageShell.offsetWidth;
    const imageHeight = imageShell.offsetHeight;

    return {
      x: Math.max(0, (imageWidth * nextZoom - viewportWidth) / 2),
      y: Math.max(0, (imageHeight * nextZoom - viewportHeight) / 2),
    };
  }

  function clampPan(nextPan, nextZoom = zoomLevel) {
    const bounds = getPanBounds(nextZoom);

    return {
      x: Math.min(bounds.x, Math.max(-bounds.x, nextPan.x)),
      y: Math.min(bounds.y, Math.max(-bounds.y, nextPan.y)),
    };
  }

  function increaseZoom(step = 0.25) {
    setZoomLevel((current) =>
      Math.min(maxZoomLevel, Number((current + step).toFixed(2))),
    );
  }

  function decreaseZoom(step = 0.25) {
    setZoomLevel((current) =>
      Math.max(1, Number((current - step).toFixed(2))),
    );
  }

  function handleImageClick() {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    if (zoomLevel >= maxZoomLevel) {
      setZoomLevel(1);
      return;
    }

    increaseZoom(0.5);
  }

  useEffect(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
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

  useEffect(() => {
    function handleResize() {
      setPanOffset((current) => clampPan(current));
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [zoomLevel]);

  useEffect(() => {
    if (zoomLevel <= 1) {
      setPanOffset({ x: 0, y: 0 });
      return;
    }

    setPanOffset((current) => clampPan(current));
  }, [zoomLevel]);

  function endDrag(event) {
    const dragState = dragStateRef.current;

    if (!dragState.active || dragState.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.releasePointerCapture) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    suppressClickRef.current = dragState.moved;
    dragStateRef.current = {
      active: false,
      moved: false,
      originX: 0,
      originY: 0,
      pointerId: null,
      startX: 0,
      startY: 0,
    };
    setIsDragging(false);
  }

  function handlePointerDown(event) {
    if (zoomLevel <= 1) {
      return;
    }

    dragStateRef.current = {
      active: true,
      moved: false,
      originX: panOffset.x,
      originY: panOffset.y,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };

    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    setIsDragging(true);
  }

  function handlePointerMove(event) {
    const dragState = dragStateRef.current;

    if (!dragState.active || dragState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    if (!dragState.moved && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
      dragStateRef.current = {
        ...dragState,
        moved: true,
      };
    }

    setPanOffset(
      clampPan({
        x: dragState.originX + deltaX,
        y: dragState.originY + deltaY,
      }),
    );
  }

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

        <div className="project-lightbox__viewport" ref={viewportRef}>
          <div className="project-lightbox__media">
            <button
              aria-label={
                zoomLevel >= maxZoomLevel
                  ? 'Reset image zoom'
                  : 'Zoom further into image'
              }
              className={`project-lightbox__image-button ${
                zoomLevel > 1 ? 'is-pannable' : ''
              } ${isDragging ? 'is-dragging' : ''}`}
              onClick={handleImageClick}
              onPointerCancel={endDrag}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              type="button"
            >
              <div
                className="project-lightbox__image-shell"
                ref={imageShellRef}
                style={{
                  '--lightbox-pan-x': `${panOffset.x}px`,
                  '--lightbox-pan-y': `${panOffset.y}px`,
                  '--lightbox-zoom': zoomLevel,
                }}
              >
                <ProjectVisualFrame
                  alt={`${project.title} enlarged visual`}
                  className="project-lightbox__image"
                  decoding="async"
                  project={project}
                  src={activeItem.src}
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
  const galleryItems = useMemo(
    () =>
      project.gallery.map((item, index) => {
        if (typeof item === 'string') {
          return {
            id: `${item}-${index}`,
            variant: item,
            caption: getVariantCaption(item),
          };
        }

        return {
          id: item.id || `image-${index + 1}`,
          variant: item.variant || `image-${index + 1}`,
          src: item.src,
          thumbnail: item.thumbnail || item.src,
          caption: item.caption || `Project visual ${index + 1}`,
        };
      }),
    [project.gallery],
  );
  const visualItems = useMemo(
    () => [
      {
        id: 'hero',
        variant: 'hero',
        src: project.heroImage,
        thumbnail: project.image || project.heroImage,
        caption: 'Project hero image',
      },
      ...galleryItems,
    ],
    [galleryItems, project.heroImage, project.image],
  );
  const resolvedHeroIndex = 0;
  const detailSections = [
    ['Overview', project.overview],
    ['Concept', project.concept],
    ['Functions', project.functions],
    ['Architectural Solution', project.architecturalSolution],
    ['Sustainability / Research Focus', project.sustainabilityFocus],
  ].filter(([, content]) => content);

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
                decoding="async"
                fetchPriority="high"
                project={project}
                src={project.heroImage}
                variant="hero"
              />
            </button>
            {project.presentationBoard ? (
              <a
                className="button button--solid project-sheet__board-link"
                href={project.presentationBoard}
                rel="noreferrer"
                target="_blank"
              >
                View Presentation Board
              </a>
            ) : null}
          </div>
        </section>

        <section className="content-section">
          <div className="detail-grid">
            {detailSections.map(([title, content], index) => (
              <article
                className={`detail-card ${index > 1 ? 'detail-card--wide' : ''}`}
                key={title}
              >
                <h2>{title}</h2>
                <p>{content}</p>
              </article>
            ))}
          </div>
        </section>

        {galleryItems.length ? (
          <section className="content-section">
          <div className="gallery-heading">
            <p className="eyebrow">Selected visuals</p>
            <h2 className="project-gallery__title">
              Spatial studies and project fragments
            </h2>
          </div>
          <div className="visual-gallery">
            {galleryItems.map((item, index) => (
              <figure className="gallery-card" key={item.id}>
                <button
                  className="gallery-card__visual gallery-card__trigger"
                  onClick={() => openLightbox(index + 1)}
                  type="button"
                >
                  <ProjectVisualFrame
                    alt={`${project.title} ${item.variant} visual`}
                    className="gallery-card__image"
                    decoding="async"
                    project={project}
                    src={item.thumbnail || item.src}
                    variant={item.variant}
                  />
                </button>
                <figcaption>{item.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>
        ) : null}

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
