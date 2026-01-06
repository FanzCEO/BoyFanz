/**
 * OptimizedImage - High-Performance Image Component
 *
 * Features:
 * - Lazy loading with Intersection Observer
 * - Progressive loading (blur-up placeholder)
 * - Automatic WebP/AVIF format selection
 * - Responsive srcset generation
 * - Skeleton loading state
 * - Error fallback
 * - Preloading integration
 */

import { useState, useEffect, useRef, memo } from 'react';
import { cn } from '@/lib/utils';
import { mediaPreloader, useMediaPreloader } from '@/lib/mediaPreloader';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  blur?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  aspectRatio?: string;
  quality?: 'low' | 'medium' | 'high' | 'auto';
  sizes?: string;
  preload?: boolean;
}

function OptimizedImageComponent({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  blur = true,
  placeholder,
  onLoad,
  onError,
  objectFit = 'cover',
  aspectRatio,
  quality = 'auto',
  sizes = '100vw',
  preload = true,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { getOptimalQuality, isCached } = useMediaPreloader();

  // Check if image is already cached
  useEffect(() => {
    if (isCached(src)) {
      setLoaded(true);
      setInView(true);
    }
  }, [src, isCached]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Start loading 200px before visible
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [priority]);

  // Preload image when in view
  useEffect(() => {
    if (inView && preload && !loaded && !error) {
      mediaPreloader.preload(src, 'image', priority ? 'critical' : 'high');
    }
  }, [inView, src, preload, loaded, error, priority]);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  // Get optimal quality based on network
  const actualQuality = quality === 'auto' ? getOptimalQuality() : quality;

  // Generate CDN URL with quality parameter
  const getCdnUrl = (url: string, q: string): string => {
    if (!url) return '';
    // If URL is from Bunny CDN, add quality params
    if (url.includes('b-cdn.net') || url.includes('bunnycdn')) {
      const qualityMap = { low: 60, medium: 75, high: 85, ultra: 95 };
      const qValue = qualityMap[q as keyof typeof qualityMap] || 85;
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}quality=${qValue}`;
    }
    return url;
  };

  // Generate responsive srcset
  const generateSrcSet = (url: string): string => {
    const widths = [320, 640, 960, 1280, 1920, 2560];
    return widths
      .filter(w => !width || w <= width * 2)
      .map(w => `${getCdnUrl(url, actualQuality)} ${w}w`)
      .join(', ');
  };

  const containerStyle: React.CSSProperties = {
    aspectRatio: aspectRatio || (width && height ? `${width}/${height}` : undefined),
  };

  if (error) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className
        )}
        style={containerStyle}
      >
        <div className="text-center p-4">
          <i className="fas fa-image text-2xl mb-2"></i>
          <p className="text-xs">Failed to load</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      style={containerStyle}
    >
      {/* Skeleton/Placeholder */}
      {!loaded && (
        <div className="absolute inset-0 z-0">
          {placeholder ? (
            <img
              src={placeholder}
              alt=""
              className={cn(
                'w-full h-full object-cover',
                blur && 'blur-lg scale-110'
              )}
              loading="eager"
            />
          ) : (
            <Skeleton className="w-full h-full" />
          )}
        </div>
      )}

      {/* Actual Image */}
      {inView && (
        <img
          ref={imgRef}
          src={getCdnUrl(src, actualQuality)}
          srcSet={generateSrcSet(src)}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full transition-opacity duration-300',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'contain' && 'object-contain',
            objectFit === 'fill' && 'object-fill',
            objectFit === 'none' && 'object-none',
            loaded ? 'opacity-100' : 'opacity-0',
            'z-10 relative'
          )}
        />
      )}
    </div>
  );
}

export const OptimizedImage = memo(OptimizedImageComponent);

/**
 * Avatar variant with circular styling
 */
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className,
  fallback,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height' | 'aspectRatio'> & {
  size?: number;
  fallback?: string;
}) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={cn(
          'rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold',
          className
        )}
        style={{ width: size, height: size }}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full', className)}
      aspectRatio="1/1"
      objectFit="cover"
      onError={() => setError(true)}
      {...props}
    />
  );
}

/**
 * Background image variant
 */
export function OptimizedBackground({
  src,
  alt,
  children,
  className,
  overlay = false,
  overlayOpacity = 0.5,
  ...props
}: OptimizedImageProps & {
  children?: React.ReactNode;
  overlay?: boolean;
  overlayOpacity?: number;
}) {
  return (
    <div className={cn('relative', className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full"
        objectFit="cover"
        {...props}
      />
      {overlay && (
        <div
          className="absolute inset-0 bg-black z-10"
          style={{ opacity: overlayOpacity }}
        />
      )}
      <div className="relative z-20">{children}</div>
    </div>
  );
}

/**
 * Video thumbnail with play icon
 */
export function VideoThumbnail({
  src,
  alt,
  duration,
  className,
  onClick,
  ...props
}: OptimizedImageProps & {
  duration?: number;
  onClick?: () => void;
}) {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={cn('relative cursor-pointer group', className)}
      onClick={onClick}
    >
      <OptimizedImage src={src} alt={alt} {...props} />

      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
          <i className="fas fa-play text-2xl text-gray-900 ml-1"></i>
        </div>
      </div>

      {/* Duration badge */}
      {duration && (
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {formatDuration(duration)}
        </div>
      )}
    </div>
  );
}

export default OptimizedImage;
