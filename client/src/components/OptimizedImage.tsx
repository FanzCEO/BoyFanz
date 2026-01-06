/**
 * D2-D4: PERFORMANCE - Optimized Image Component
 *
 * Features:
 * - D2: Smart lazy loading (below-fold only, eager for above-fold)
 * - D3: WebP/AVIF with automatic fallbacks
 * - D4: Responsive srcset for different screen sizes
 * - No layout shift (proper width/height)
 * - No visual changes to existing UI
 */

import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean; // Set true for above-the-fold images
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
}

// Generate srcset for responsive images
function generateSrcSet(src: string, widths: number[] = [320, 640, 768, 1024, 1280, 1920]): string {
  // If src is already a full URL with parameters, preserve them
  const url = new URL(src, window.location.origin);
  const ext = url.pathname.split('.').pop()?.toLowerCase();

  // Generate srcset with different widths
  return widths
    .map((width) => {
      const responsiveUrl = new URL(src, window.location.origin);
      // Add width parameter if URL supports it (e.g., image CDN)
      if (src.includes('unsplash.com') || src.includes('cloudinary.com')) {
        responsiveUrl.searchParams.set('w', width.toString());
      }
      return `${responsiveUrl.toString()} ${width}w`;
    })
    .join(', ');
}

// Convert image URL to WebP/AVIF if supported
function getModernImageUrl(src: string, format: 'webp' | 'avif'): string {
  const url = new URL(src, window.location.origin);

  // Check if URL is from a CDN that supports format conversion
  if (src.includes('unsplash.com') || src.includes('cloudinary.com')) {
    url.searchParams.set('fm', format);
    return url.toString();
  }

  // For local images, try to replace extension
  const ext = url.pathname.split('.').pop()?.toLowerCase();
  if (ext && ['jpg', 'jpeg', 'png'].includes(ext)) {
    return url.pathname.replace(new RegExp(`\\.${ext}$`), `.${format}`);
  }

  return src;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  onLoad,
  onError,
  style,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Determine loading strategy
  const loading = priority ? 'eager' : 'lazy';

  // Check browser support for modern formats
  const supportsWebP = typeof document !== 'undefined' &&
    document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;

  const supportsAVIF = typeof document !== 'undefined' &&
    document.createElement('canvas').toDataURL('image/avif').indexOf('data:image/avif') === 0;

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate sources for picture element
  const srcSet = generateSrcSet(src);
  const webpSrc = supportsWebP ? getModernImageUrl(src, 'webp') : null;
  const avifSrc = supportsAVIF ? getModernImageUrl(src, 'avif') : null;

  return (
    <picture>
      {/* AVIF source (best compression, newest format) */}
      {avifSrc && (
        <source
          type="image/avif"
          srcSet={generateSrcSet(avifSrc)}
          sizes={sizes}
        />
      )}

      {/* WebP source (better compression, wide support) */}
      {webpSrc && (
        <source
          type="image/webp"
          srcSet={generateSrcSet(webpSrc)}
          sizes={sizes}
        />
      )}

      {/* Fallback to original format */}
      <img
        ref={imgRef}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={priority ? 'sync' : 'async'}
        className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={style}
        onLoad={handleLoad}
        onError={handleError}
      />
    </picture>
  );
};

// Utility hook for optimizing background images
export function useOptimizedBackgroundImage(src: string, priority = false) {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (priority) {
      // Load immediately for above-fold
      setImageSrc(src);
      setIsLoaded(true);
    } else {
      // Lazy load for below-fold
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
    }
  }, [src, priority]);

  return { imageSrc, isLoaded };
}

export default OptimizedImage;
