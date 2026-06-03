import { useEffect, useMemo, useState } from 'react';

const PLACEHOLDER_IMAGE_PATTERN = /\.(avif|jpe?g|png|webp)$/i;

export function derivePlaceholderSrc(src = '') {
  if (!PLACEHOLDER_IMAGE_PATTERN.test(src)) {
    return '';
  }

  return src.replace(PLACEHOLDER_IMAGE_PATTERN, '-placeholder$&');
}

export default function ProgressiveImage({
  alt,
  className = '',
  decoding = 'async',
  draggable = false,
  fetchPriority,
  loading,
  placeholderSrc,
  sizes,
  src,
  srcSet,
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const resolvedPlaceholderSrc = useMemo(
    () => placeholderSrc ?? derivePlaceholderSrc(src),
    [placeholderSrc, src],
  );

  useEffect(() => {
    setIsLoaded(false);
  }, [src]);

  return (
    <span className={`progressive-image${isLoaded ? ' is-loaded' : ''}`}>
      {resolvedPlaceholderSrc ? (
        <img
          alt=""
          aria-hidden="true"
          className={`progressive-image__placeholder ${className}`.trim()}
          decoding="async"
          draggable={false}
          src={resolvedPlaceholderSrc}
        />
      ) : null}
      <img
        alt={alt}
        className={`progressive-image__full ${className}`.trim()}
        decoding={decoding}
        draggable={draggable}
        fetchPriority={fetchPriority}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        sizes={sizes}
        src={src}
        srcSet={srcSet}
      />
    </span>
  );
}
