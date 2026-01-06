/**
 * LazyImage Component
 *
 * Lazy-loads images using Intersection Observer API
 * with progressive loading and blur placeholder
 */

import { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  className = '',
  placeholderSrc,
  threshold = 0.01,
  rootMargin = '50px',
  onLoad,
  onError,
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(placeholderSrc);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!imageRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start loading the actual image
            setImageSrc(src);
            observer.unobserve(imageRef);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(imageRef);

    return () => {
      if (imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, src, threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${
        !isLoaded ? 'blur-sm' : 'blur-0'
      } transition-all duration-300`}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
      decoding="async"
    />
  );
}

/**
 * Responsive Image Component
 *
 * Renders responsive images with srcset for different screen sizes
 */

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  srcSet?: string;
}

export function ResponsiveImage({
  src,
  alt,
  className = '',
  sizes = '100vw',
  srcSet,
}: ResponsiveImageProps) {
  // Generate srcSet if not provided
  const defaultSrcSet = srcSet || generateSrcSet(src);

  return (
    <img
      src={src}
      srcSet={defaultSrcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}

/**
 * Generate srcSet string from base image URL
 * Assumes images are available in multiple sizes (e.g., image-300.webp, image-600.webp)
 */
function generateSrcSet(src: string): string {
  const sizes = [300, 600, 900, 1200, 1920];
  const ext = src.substring(src.lastIndexOf('.'));
  const baseSrc = src.substring(0, src.lastIndexOf('.'));

  return sizes
    .map((size) => `${baseSrc}-${size}${ext} ${size}w`)
    .join(', ');
}
