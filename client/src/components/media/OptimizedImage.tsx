// @ts-nocheck
/**
 * Optimized Image Component
 *
 * Provides lazy loading, blur placeholders, responsive srcset,
 * and progressive loading for optimal mobile performance.
 */

import { useState, useRef, useEffect, memo } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean; // Skip lazy loading for above-fold images
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  objectFit?: "cover" | "contain" | "fill" | "none";
  quality?: number;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

// Generate responsive srcset for different screen sizes
function generateSrcSet(src: string, quality: number = 80): string {
  // If it's a CDN URL, we can request different sizes
  if (src.includes('cdn.fanz') || src.includes('bunny') || src.includes('imagekit')) {
    const widths = [320, 480, 640, 768, 1024, 1280, 1536];
    return widths
      .map(w => {
        const url = src.includes('?')
          ? `${src}&w=${w}&q=${quality}`
          : `${src}?w=${w}&q=${quality}`;
        return `${url} ${w}w`;
      })
      .join(", ");
  }
  return "";
}

// Generate a tiny placeholder blur
function generateBlurPlaceholder(): string {
  return "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWExYTFhIi8+PC9zdmc+";
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  placeholder = "blur",
  blurDataURL,
  objectFit = "cover",
  quality = 80,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  onLoad,
  onError,
  fallbackSrc = "/placeholder-image.png",
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "100px", // Start loading 100px before visible
        threshold: 0,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const placeholderUrl = blurDataURL || generateBlurPlaceholder();
  const srcSet = generateSrcSet(src, quality);
  const actualSrc = hasError ? fallbackSrc : src;

  return (
    <div
      ref={imgRef}
      className={cn(
        "relative overflow-hidden bg-muted",
        className
      )}
      style={{
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
      }}
    >
      {/* Blur placeholder */}
      {placeholder === "blur" && !isLoaded && (
        <img
          src={placeholderUrl}
          alt=""
          className={cn(
            "absolute inset-0 w-full h-full scale-110 blur-xl",
            `object-${objectFit}`
          )}
          aria-hidden="true"
        />
      )}

      {/* Actual image */}
      {(isInView || priority) && (
        <img
          src={actualSrc}
          srcSet={srcSet || undefined}
          sizes={srcSet ? sizes : undefined}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full transition-opacity duration-300",
            `object-${objectFit}`,
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* Loading skeleton */}
      {!isLoaded && placeholder === "empty" && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}
    </div>
  );
});

export default OptimizedImage;
