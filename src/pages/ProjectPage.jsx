import { useEffect, useMemo, useRef, useState } from 'react';
import pdfjsLegacyWorkerSrc from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { Link, Navigate, useParams } from 'react-router-dom';
import ProgressiveImage from '../components/ProgressiveImage';
import ProjectVisual from '../components/ProjectVisual';
import { getProjectBySlug, projects } from '../data/projects';

const imageMaxZoomLevel = 2.5;
const documentMinZoomLevel = 0.75;
const documentMaxZoomLevel = 3;
const documentPageBuffer = 1;
const documentZoomRenderDelay = 160;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getPointerDistance(pointerA, pointerB) {
  return Math.hypot(pointerA.x - pointerB.x, pointerA.y - pointerB.y);
}

function safelyReleasePdfDocument(pdfDocument) {
  try {
    pdfDocument?.cleanup?.();
  } catch {
    // PDF.js cleanup is best-effort and should never break the viewer close flow.
  }
}

function safelyDestroyPdfLoadingTask(loadingTask) {
  try {
    loadingTask?.destroy?.();
  } catch {
    // PDF.js may already have torn down the task by the time React cleans up.
  }
}

function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delay, value]);

  return debouncedValue;
}

function useFullscreenState(targetRef) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === targetRef.current);
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [targetRef]);

  async function toggleFullscreen() {
    const target = targetRef.current;

    if (!target) {
      return;
    }

    try {
      if (document.fullscreenElement === target) {
        await document.exitFullscreen?.();
        return;
      }

      await target.requestFullscreen?.();
    } catch {
      // Some browsers reject fullscreen when a document is not focused.
    }
  }

  return { isFullscreen, toggleFullscreen };
}

function FullscreenIcon({ isFullscreen }) {
  if (isFullscreen) {
    return (
      <svg
        aria-hidden="true"
        className="fullscreen-icon"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 4V9H4M15 4V9H20M9 20V15H4M15 20V15H20"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="fullscreen-icon"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 9V4H9M15 4H20V9M4 15V20H9M20 15V20H15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="close-icon"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 7L17 17M17 7L7 17"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

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
  const panelRef = useRef(null);
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
  const gestureStateRef = useRef({
    isPinching: false,
    pinchStartDistance: 0,
    pinchStartZoom: 1,
    pointers: new Map(),
  });
  const suppressClickRef = useRef(false);
  const { isFullscreen, toggleFullscreen } = useFullscreenState(panelRef);

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
      Math.min(imageMaxZoomLevel, Number((current + step).toFixed(2))),
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

    if (zoomLevel >= imageMaxZoomLevel) {
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

      if ((event.key === '+' || event.key === '=') && zoomLevel < imageMaxZoomLevel) {
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
  }, [items.length, onClose, onNext, onPrevious, zoomLevel]);

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
    const gestureState = gestureStateRef.current;
    gestureState.pointers.delete(event.pointerId);

    if (gestureState.pointers.size < 2) {
      gestureState.isPinching = false;
      gestureState.pinchStartDistance = 0;
    }

    const dragState = dragStateRef.current;

    if (event.currentTarget.releasePointerCapture) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!dragState.active || dragState.pointerId !== event.pointerId) {
      return;
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
    const gestureState = gestureStateRef.current;

    gestureState.pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    if (event.pointerType === 'touch' && gestureState.pointers.size >= 2) {
      const pointers = Array.from(gestureState.pointers.values());
      gestureState.isPinching = true;
      gestureState.pinchStartDistance = getPointerDistance(pointers[0], pointers[1]);
      gestureState.pinchStartZoom = zoomLevel;
      suppressClickRef.current = true;
      setIsDragging(false);
      return;
    }

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

    setIsDragging(true);
  }

  function handlePointerMove(event) {
    const gestureState = gestureStateRef.current;

    if (gestureState.pointers.has(event.pointerId)) {
      gestureState.pointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
    }

    if (
      event.pointerType === 'touch' &&
      gestureState.isPinching &&
      gestureState.pointers.size >= 2
    ) {
      event.preventDefault();
      const pointers = Array.from(gestureState.pointers.values());
      const pinchDistance = getPointerDistance(pointers[0], pointers[1]);

      if (gestureState.pinchStartDistance > 0) {
        const nextZoom = clamp(
          Number(
            (
              gestureState.pinchStartZoom *
              (pinchDistance / gestureState.pinchStartDistance)
            ).toFixed(2),
          ),
          1,
          imageMaxZoomLevel,
        );

        setZoomLevel(nextZoom);
        setPanOffset((current) => clampPan(current, nextZoom));
      }

      return;
    }

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
        ref={panelRef}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="project-lightbox__header">
          <div className="project-lightbox__meta">
            <p className="eyebrow">Selected visual</p>
            <h2>{activeItem.caption}</h2>
          </div>

          <div className="project-lightbox__actions">
            <div className="project-lightbox__controls" aria-label="Image zoom controls">
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
                disabled={zoomLevel >= imageMaxZoomLevel}
                onClick={() => increaseZoom()}
                type="button"
              >
                +
              </button>
              <button
                aria-label={isFullscreen ? 'Exit image full screen' : 'Open image full screen'}
                className="project-lightbox__control project-lightbox__control--fullscreen"
                onClick={toggleFullscreen}
                type="button"
              >
                <FullscreenIcon isFullscreen={isFullscreen} />
              </button>
            </div>

            <button
              aria-label="Close enlarged image"
              className="project-lightbox__close"
              onClick={onClose}
              type="button"
            >
              <CloseIcon />
            </button>
          </div>
        </header>

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
                zoomLevel >= imageMaxZoomLevel
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
      </div>
    </div>
  );
}

function ProjectDocumentSection({
  description,
  documents,
  eyebrow = 'Research archive',
  onOpen,
  title = 'Project documents',
}) {
  if (!documents.length) {
    return null;
  }

  return (
    <section className="content-section project-documents" id="research-documents">
      <div className="document-browser__heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="project-gallery__title">{title}</h2>
          {description ? (
            <p className="document-browser__description">{description}</p>
          ) : null}
        </div>
        <p className="document-browser__count">{documents.length} PDFs</p>
      </div>

      <div className="document-grid">
        {documents.map((document, index) => (
          <button
            className={`document-card ${document.featured ? 'document-card--featured' : ''}`}
            key={document.id}
            onClick={() => onOpen(document)}
            type="button"
          >
            <span className="document-card__topline">
              <span className="document-card__index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="document-card__group">{document.group}</span>
            </span>
            <span className="document-card__title">{document.title}</span>
            <span className="document-card__description">{document.description}</span>
            <span className="document-card__action">Open in viewer</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function PdfCanvasViewer({ setZoomLevel, src, zoomLevel }) {
  const [pdfDocument, setPdfDocument] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageMetrics, setPageMetrics] = useState([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [visiblePageNumbers, setVisiblePageNumbers] = useState(() => new Set([1]));
  const [renderedPageKeys, setRenderedPageKeys] = useState(() => new Set());
  const [status, setStatus] = useState('loading');
  const containerRef = useRef(null);
  const canvasRefs = useRef([]);
  const pageShellRefs = useRef([]);
  const suppressClickRef = useRef(false);
  const debouncedZoomLevel = useDebouncedValue(zoomLevel, documentZoomRenderDelay);
  const interactionRef = useRef({
    dragPointerId: null,
    dragScrollLeft: 0,
    dragScrollTop: 0,
    dragStartX: 0,
    dragStartY: 0,
    moved: false,
    pinchStartDistance: 0,
    pinchStartZoom: 1,
    pointers: new Map(),
  });

  const pages = useMemo(
    () => Array.from({ length: pageCount }, (_, index) => index + 1),
    [pageCount],
  );
  const pagesToRender = useMemo(() => {
    const pageNumbers = new Set([1]);

    visiblePageNumbers.forEach((pageNumber) => {
      for (
        let bufferedPageNumber = pageNumber - documentPageBuffer;
        bufferedPageNumber <= pageNumber + documentPageBuffer;
        bufferedPageNumber += 1
      ) {
        if (bufferedPageNumber >= 1 && bufferedPageNumber <= pageCount) {
          pageNumbers.add(bufferedPageNumber);
        }
      }
    });

    return [...pageNumbers].sort((a, b) => a - b);
  }, [pageCount, visiblePageNumbers]);
  const pagesToRenderKey = pagesToRender.join(',');

  function getPageFitScale(pageWidth) {
    if (!containerWidth || !pageWidth) {
      return 1;
    }

    const fitScale = Math.min((containerWidth - 32) / pageWidth, 1.35);
    return Number.isFinite(fitScale) && fitScale > 0 ? fitScale : 1;
  }

  function getRenderKey(pageNumber) {
    return `${src}:${pageNumber}:${Math.round(containerWidth)}:${debouncedZoomLevel}`;
  }

  function getPageDisplayStyle(metric) {
    if (!metric) {
      return undefined;
    }

    const scale = getPageFitScale(metric.width) * debouncedZoomLevel;

    return {
      height: `${Math.round(metric.height * scale)}px`,
      width: `${Math.round(metric.width * scale)}px`,
    };
  }

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    function updateWidth() {
      setContainerWidth(container.clientWidth);
    }

    updateWidth();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth);

      return () => {
        window.removeEventListener('resize', updateWidth);
      };
    }

    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!src) {
      return undefined;
    }

    let isCancelled = false;
    let loadingTask = null;
    let loadedPdfDocument = null;

    setStatus('loading');
    setPdfDocument(null);
    setPageCount(0);
    setPageMetrics([]);
    setVisiblePageNumbers(new Set([1]));
    setRenderedPageKeys(new Set());
    canvasRefs.current = [];
    pageShellRefs.current = [];

    import('pdfjs-dist/legacy/build/pdf.mjs')
      .then((pdfjsLib) => {
        if (isCancelled) {
          return null;
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsLegacyWorkerSrc;
        loadingTask = pdfjsLib.getDocument({
          url: src,
        });
        return loadingTask.promise;
      })
      .then((loadedDocument) => {
        if (!loadedDocument) {
          return;
        }

        loadedPdfDocument = loadedDocument;

        if (isCancelled) {
          safelyReleasePdfDocument(loadedDocument);
          return;
        }

        setPdfDocument(loadedDocument);
        setPageCount(loadedDocument.numPages);
        setStatus('rendering');
      })
      .catch((error) => {
        if (!isCancelled) {
          console.error(`Failed to load PDF: ${src}`, error);
          setStatus('error');
        }
      });

    return () => {
      isCancelled = true;
      safelyDestroyPdfLoadingTask(loadingTask);
      safelyReleasePdfDocument(loadedPdfDocument);
    };
  }, [src]);

  useEffect(() => {
    if (!pdfDocument || !pageCount) {
      return undefined;
    }

    let isCancelled = false;

    async function measurePages() {
      try {
        const firstPage = await pdfDocument.getPage(1);
        const firstViewport = firstPage.getViewport({ scale: 1 });
        const metrics = Array.from({ length: pageCount }, (_, index) => ({
          height: firstViewport.height,
          pageNumber: index + 1,
          width: firstViewport.width,
        }));

        if (isCancelled) {
          return;
        }

        setPageMetrics(metrics);
        setStatus('rendering');

        for (let pageNumber = 2; pageNumber <= pageCount; pageNumber += 1) {
          if (isCancelled) {
            return;
          }

          const page = await pdfDocument.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1 });
          metrics[pageNumber - 1] = {
            height: viewport.height,
            pageNumber,
            width: viewport.width,
          };
        }

        if (!isCancelled) {
          setPageMetrics([...metrics]);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error(`Failed to measure PDF: ${src}`, error);
          setStatus('error');
        }
      }
    }

    measurePages();

    return () => {
      isCancelled = true;
    };
  }, [pageCount, pdfDocument, src]);

  useEffect(() => {
    if (!pdfDocument || !pageMetrics.length || !containerWidth) {
      return undefined;
    }

    const container = containerRef.current;

    if (!container || typeof IntersectionObserver === 'undefined') {
      setVisiblePageNumbers(new Set(pages.slice(0, Math.min(3, pages.length))));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setVisiblePageNumbers((current) => {
          const next = new Set(current);
          let changed = false;

          entries.forEach((entry) => {
            const pageNumber = Number(entry.target.getAttribute('data-page-number'));

            if (!pageNumber) {
              return;
            }

            if (entry.isIntersecting) {
              if (!next.has(pageNumber)) {
                next.add(pageNumber);
                changed = true;
              }

              return;
            }

            if (next.delete(pageNumber)) {
              changed = true;
            }
          });

          if (!next.size) {
            next.add(1);
          }

          return changed ? next : current;
        });
      },
      {
        root: container,
        rootMargin: '900px 0px',
        threshold: 0.01,
      },
    );

    pageShellRefs.current.forEach((element) => {
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [containerWidth, pageMetrics.length, pages, pdfDocument]);

  useEffect(() => {
    if (!pdfDocument || !pageMetrics.length || !containerWidth) {
      return;
    }

    setRenderedPageKeys(new Set());
    setStatus('rendering');
  }, [containerWidth, debouncedZoomLevel, pageMetrics.length, pdfDocument]);

  useEffect(() => {
    if (!pdfDocument || !containerWidth || !pageMetrics.length || !pagesToRender.length) {
      return undefined;
    }

    let isCancelled = false;
    const renderTasks = [];

    async function renderPages() {
      const needsInitialRender = pagesToRender.some(
        (pageNumber) => !renderedPageKeys.has(getRenderKey(pageNumber)),
      );

      if (needsInitialRender && !renderedPageKeys.size) {
        setStatus('rendering');
      }

      try {
        for (const pageNumber of pagesToRender) {
          if (isCancelled) {
            return;
          }

          const metric = pageMetrics[pageNumber - 1];
          const canvas = canvasRefs.current[pageNumber - 1];

          if (!metric || !canvas) {
            continue;
          }

          const renderKey = getRenderKey(pageNumber);

          if (canvas.getAttribute('data-render-key') === renderKey) {
            continue;
          }

          const page = await pdfDocument.getPage(pageNumber);
          const safeFitScale = getPageFitScale(metric.width);
          const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
          const renderViewport = page.getViewport({
            scale: safeFitScale * debouncedZoomLevel * devicePixelRatio,
          });
          const canvasContext = canvas.getContext('2d', { alpha: false });

          canvas.width = Math.ceil(renderViewport.width);
          canvas.height = Math.ceil(renderViewport.height);
          canvas.style.width = '100%';
          canvas.style.height = '100%';

          const renderTask = page.render({
            canvasContext,
            viewport: renderViewport,
          });
          renderTasks.push(renderTask);

          await renderTask.promise;

          if (isCancelled) {
            return;
          }

          canvas.setAttribute('data-render-key', renderKey);
          setRenderedPageKeys((current) => {
            if (current.has(renderKey)) {
              return current;
            }

            const next = new Set(current);
            next.add(renderKey);
            return next;
          });
        }

        if (!isCancelled) {
          setStatus('ready');
        }
      } catch (error) {
        if (!isCancelled && error?.name !== 'RenderingCancelledException') {
          console.error(`Failed to render PDF: ${src}`, error);
          setStatus('error');
        }
      }
    }

    renderPages();

    return () => {
      isCancelled = true;
      renderTasks.forEach((renderTask) => renderTask.cancel?.());
    };
  }, [
    containerWidth,
    debouncedZoomLevel,
    pageMetrics,
    pagesToRenderKey,
    pdfDocument,
    src,
  ]);

  function adjustZoom(step) {
    setZoomLevel((current) =>
      clamp(
        Number((current + step).toFixed(2)),
        documentMinZoomLevel,
        documentMaxZoomLevel,
      ),
    );
  }

  function handleClick() {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    setZoomLevel((current) =>
      current >= documentMaxZoomLevel
        ? 1
        : clamp(Number((current + 0.5).toFixed(2)), 1, documentMaxZoomLevel),
    );
  }

  function handlePointerDown(event) {
    if (event.pointerType !== 'touch') {
      return;
    }

    const interaction = interactionRef.current;
    const container = containerRef.current;

    if (!container) {
      return;
    }

    interaction.pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    if (interaction.pointers.size >= 2) {
      const pointers = Array.from(interaction.pointers.values());
      interaction.pinchStartDistance = getPointerDistance(pointers[0], pointers[1]);
      interaction.pinchStartZoom = zoomLevel;
      interaction.dragPointerId = null;
      interaction.moved = true;
      suppressClickRef.current = true;
      return;
    }

    interaction.dragPointerId = event.pointerId;
    interaction.dragStartX = event.clientX;
    interaction.dragStartY = event.clientY;
    interaction.dragScrollLeft = container.scrollLeft;
    interaction.dragScrollTop = container.scrollTop;
    interaction.moved = false;
  }

  function handlePointerMove(event) {
    if (event.pointerType !== 'touch') {
      return;
    }

    const interaction = interactionRef.current;
    const container = containerRef.current;

    if (!container || !interaction.pointers.has(event.pointerId)) {
      return;
    }

    interaction.pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (interaction.pointers.size >= 2) {
      event.preventDefault();
      const pointers = Array.from(interaction.pointers.values());
      const pinchDistance = getPointerDistance(pointers[0], pointers[1]);

      if (interaction.pinchStartDistance > 0) {
        setZoomLevel(
          clamp(
            Number(
              (
                interaction.pinchStartZoom *
                (pinchDistance / interaction.pinchStartDistance)
              ).toFixed(2),
            ),
            documentMinZoomLevel,
            documentMaxZoomLevel,
          ),
        );
      }

      return;
    }

    if (interaction.dragPointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - interaction.dragStartX;
    const deltaY = event.clientY - interaction.dragStartY;

    if (!interaction.moved && (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4)) {
      interaction.moved = true;
      suppressClickRef.current = true;
    }

    event.preventDefault();
    container.scrollLeft = interaction.dragScrollLeft - deltaX;
    container.scrollTop = interaction.dragScrollTop - deltaY;
  }

  function handlePointerEnd(event) {
    if (event.pointerType !== 'touch') {
      return;
    }

    const interaction = interactionRef.current;

    if (event.currentTarget.releasePointerCapture) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    interaction.pointers.delete(event.pointerId);

    if (interaction.pointers.size < 2) {
      interaction.pinchStartDistance = 0;
    }

    if (interaction.dragPointerId === event.pointerId) {
      interaction.dragPointerId = null;
    }
  }

  function handleWheel(event) {
    if (!event.ctrlKey && !event.metaKey) {
      return;
    }

    event.preventDefault();
    adjustZoom(event.deltaY > 0 ? -0.15 : 0.15);
  }

  return (
    <div
      className={`pdf-canvas-viewer ${zoomLevel > 1 ? 'is-zoomed' : ''}`}
      onClick={handleClick}
      onPointerCancel={handlePointerEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onWheel={handleWheel}
      ref={containerRef}
      role="presentation"
    >
      <div className="pdf-canvas-viewer__pages">
        {pages.map((pageNumber) => {
          const metric = pageMetrics[pageNumber - 1];

          return (
          <div
            className="pdf-canvas-viewer__page-shell"
            data-page-number={pageNumber}
            key={pageNumber}
            ref={(node) => {
              pageShellRefs.current[pageNumber - 1] = node;
            }}
            style={getPageDisplayStyle(metric)}
          >
            <canvas
              aria-label={`PDF page ${pageNumber}`}
              className="pdf-canvas-viewer__page"
              ref={(node) => {
                canvasRefs.current[pageNumber - 1] = node;
              }}
            />
          </div>
          );
        })}
      </div>

      {status !== 'ready' ? (
        <div className="pdf-canvas-viewer__status">
          {status === 'error' ? (
            <p>Could not load this PDF.</p>
          ) : (
            <p>{status === 'loading' ? 'Loading PDF...' : 'Rendering PDF...'}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function ProjectDocumentViewer({ document: activeDocument, onClose }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const panelRef = useRef(null);
  const { isFullscreen, toggleFullscreen } = useFullscreenState(panelRef);

  useEffect(() => {
    if (!activeDocument) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeDocument, onClose]);

  useEffect(() => {
    setZoomLevel(1);
  }, [activeDocument?.src]);

  function adjustZoom(step) {
    setZoomLevel((current) =>
      clamp(
        Number((current + step).toFixed(2)),
        documentMinZoomLevel,
        documentMaxZoomLevel,
      ),
    );
  }

  if (!activeDocument) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="project-document-viewer"
      onClick={onClose}
      onContextMenu={(event) => event.preventDefault()}
      role="dialog"
    >
      <div
        className="project-document-viewer__panel"
        ref={panelRef}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="project-document-viewer__header">
          <div>
            <p className="eyebrow">{activeDocument.group}</p>
            <h2>{activeDocument.title}</h2>
          </div>
          <div className="project-document-viewer__actions">
            <div className="project-document-viewer__zoom-controls" aria-label="PDF zoom controls">
              <button
                className="project-document-viewer__control"
                disabled={zoomLevel <= documentMinZoomLevel}
                onClick={() => adjustZoom(-0.25)}
                type="button"
              >
                -
              </button>
              <button
                className="project-document-viewer__control project-document-viewer__control--label"
                onClick={() => setZoomLevel(1)}
                type="button"
              >
                {`${Math.round(zoomLevel * 100)}%`}
              </button>
              <button
                className="project-document-viewer__control"
                disabled={zoomLevel >= documentMaxZoomLevel}
                onClick={() => adjustZoom(0.25)}
                type="button"
              >
                +
              </button>
              <button
                aria-label={isFullscreen ? 'Exit PDF full screen' : 'Open PDF full screen'}
                className="project-document-viewer__control project-document-viewer__control--fullscreen"
                onClick={toggleFullscreen}
                type="button"
              >
                <FullscreenIcon isFullscreen={isFullscreen} />
              </button>
            </div>
            <button
              aria-label="Close PDF viewer"
              className="project-document-viewer__close"
              onClick={onClose}
              type="button"
            >
              <CloseIcon />
            </button>
          </div>
        </header>

        <div className="project-document-viewer__frame">
          <PdfCanvasViewer
            setZoomLevel={setZoomLevel}
            src={activeDocument.src}
            zoomLevel={zoomLevel}
          />
        </div>
      </div>
    </div>
  );
}

export default function ProjectPage() {
  const { slug } = useParams();
  const project = getProjectBySlug(slug);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);
  const [activeDocument, setActiveDocument] = useState(null);

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
  const documentItems = project.documents ?? [];
  const resolvedHeroIndex = 0;
  const detailSections = (
    project.details?.length
      ? project.details.map((section) => [section.title, section.content])
      : [
          ['Overview', project.overview],
          ['Concept', project.concept],
          ['Functions', project.functions],
          ['Architectural Solution', project.architecturalSolution],
          ['Sustainability / Research Focus', project.sustainabilityFocus],
        ]
  ).filter(([, content]) => content);

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
            ) : documentItems.length ? (
              <a
                className="button button--solid project-sheet__board-link"
                href="#research-documents"
              >
                Browse Research Archive
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

        <ProjectDocumentSection
          description={project.documentSectionDescription}
          documents={documentItems}
          eyebrow={project.documentSectionEyebrow}
          onOpen={setActiveDocument}
          title={project.documentSectionTitle}
        />

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

      {activeDocument ? (
        <ProjectDocumentViewer document={activeDocument} onClose={() => setActiveDocument(null)} />
      ) : null}
    </>
  );
}
