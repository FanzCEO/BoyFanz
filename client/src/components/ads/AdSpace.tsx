/**
 * AdSpace Component
 *
 * Universal ad container that supports multiple standard ad sizes.
 * Automatically handles impression/click tracking and responsive sizing.
 */

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Standard IAB ad sizes
export type AdSize =
  | 'leaderboard'      // 728x90
  | 'medium-rectangle' // 300x250
  | 'large-rectangle'  // 336x280
  | 'skyscraper'       // 120x600
  | 'wide-skyscraper'  // 160x600
  | 'half-page'        // 300x600
  | 'billboard'        // 970x250
  | 'mobile-banner'    // 320x50
  | 'mobile-large'     // 320x100
  | 'square'           // 250x250
  | 'full-width'       // 100% width, responsive
  | 'native';          // Blends with content

export const AD_DIMENSIONS: Record<AdSize, { width: number | 'full'; height: number }> = {
  'leaderboard': { width: 728, height: 90 },
  'medium-rectangle': { width: 300, height: 250 },
  'large-rectangle': { width: 336, height: 280 },
  'skyscraper': { width: 120, height: 600 },
  'wide-skyscraper': { width: 160, height: 600 },
  'half-page': { width: 300, height: 600 },
  'billboard': { width: 970, height: 250 },
  'mobile-banner': { width: 320, height: 50 },
  'mobile-large': { width: 320, height: 100 },
  'square': { width: 250, height: 250 },
  'full-width': { width: 'full', height: 200 },
  'native': { width: 'full', height: 0 }, // Height determined by content
};

interface AdSpaceProps {
  creatorId?: string;
  size: AdSize;
  placementId?: string;
  className?: string;
  showLabel?: boolean;
  showCharity?: boolean;
  allowDismiss?: boolean;
  fallback?: React.ReactNode;
}

interface Ad {
  id: string;
  headline: string;
  description: string;
  imageUrl: string;
  clickUrl: string;
  category: string;
}

export function AdSpace({
  creatorId,
  size,
  placementId,
  className,
  showLabel = true,
  showCharity = true,
  allowDismiss = true,
  fallback,
}: AdSpaceProps) {
  const [dismissed, setDismissed] = useState(false);
  const [impressionRecorded, setImpressionRecorded] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  const viewStartTime = useRef<number>(0);

  // Map size to placement type for API
  const placementType = (() => {
    switch (size) {
      case 'leaderboard':
      case 'billboard':
      case 'full-width':
        return 'profile_banner';
      case 'medium-rectangle':
      case 'large-rectangle':
      case 'square':
        return 'feed_inline';
      case 'skyscraper':
      case 'wide-skyscraper':
      case 'half-page':
        return 'sidebar';
      case 'mobile-banner':
      case 'mobile-large':
        return 'profile_banner';
      case 'native':
        return 'feed_inline';
      default:
        return 'feed_inline';
    }
  })();

  const { data: ad, isLoading } = useQuery<Ad | null>({
    queryKey: ['adSpace', creatorId || 'global', size, placementId],
    queryFn: async () => {
      const url = creatorId
        ? `/api/creator-ads/serve/${creatorId}/${placementType}`
        : `/api/creator-ads/serve/global/${placementType}`;
      const response = await fetch(url);
      const result = await response.json();
      return result.data;
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Track impression when visible
  useEffect(() => {
    if (!ad || impressionRecorded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            viewStartTime.current = Date.now();
            setTimeout(() => {
              if (adRef.current && !impressionRecorded) {
                recordImpression();
              }
            }, 1000);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, [ad, impressionRecorded]);

  const recordImpression = async () => {
    if (!ad) return;
    try {
      await fetch('/api/creator-ads/impression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adId: ad.id,
          creatorId: creatorId || 'global',
          placementType,
          viewDuration: Date.now() - viewStartTime.current,
        }),
      });
      setImpressionRecorded(true);
    } catch (error) {
      console.error('Failed to record impression:', error);
    }
  };

  const handleClick = async () => {
    if (!ad) return;
    try {
      await fetch('/api/creator-ads/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adId: ad.id,
          creatorId: creatorId || 'global',
        }),
      });
    } catch (error) {
      console.error('Failed to record click:', error);
    }
    window.open(ad.clickUrl, '_blank', 'noopener,noreferrer');
  };

  const dimensions = AD_DIMENSIONS[size];

  if (dismissed) return null;
  if (isLoading) {
    return (
      <div
        className={cn(
          'bg-muted/20 animate-pulse rounded-lg',
          dimensions.width === 'full' ? 'w-full' : `w-[${dimensions.width}px]`,
          `h-[${dimensions.height}px]`,
          className
        )}
      />
    );
  }
  if (!ad) return fallback || null;

  // Native ad styling
  if (size === 'native') {
    return (
      <div
        ref={adRef}
        className={cn(
          'relative bg-card border rounded-lg overflow-hidden',
          className
        )}
      >
        {showLabel && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded">
              Ad
            </span>
            {allowDismiss && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 bg-background/80"
                onClick={() => setDismissed(true)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
        <button onClick={handleClick} className="w-full text-left">
          {ad.imageUrl && (
            <img src={ad.imageUrl} alt={ad.headline} className="w-full aspect-video object-cover" />
          )}
          <div className="p-4">
            <h4 className="font-semibold mb-1">{ad.headline}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{ad.description}</p>
            {showCharity && (
              <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                <Heart className="h-2.5 w-2.5 text-pink-500" />
                Supporting Wittle Bear Foundation
              </p>
            )}
          </div>
        </button>
      </div>
    );
  }

  // Standard display ad
  return (
    <div
      ref={adRef}
      className={cn(
        'relative overflow-hidden rounded-lg bg-gray-900',
        dimensions.width === 'full' ? 'w-full' : '',
        className
      )}
      style={{
        width: dimensions.width === 'full' ? '100%' : dimensions.width,
        height: dimensions.height,
      }}
    >
      {showLabel && (
        <div className="absolute top-1 left-1 z-10 flex items-center gap-1">
          <span className="text-[9px] text-white/60 bg-black/40 px-1 py-0.5 rounded">
            Ad
          </span>
        </div>
      )}

      {allowDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 z-10 h-5 w-5 bg-black/40 hover:bg-black/60 text-white"
          onClick={() => setDismissed(true)}
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      <button
        onClick={handleClick}
        className="w-full h-full flex items-center justify-center hover:opacity-95 transition-opacity"
      >
        {ad.imageUrl ? (
          <img
            src={ad.imageUrl}
            alt={ad.headline}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4 bg-gradient-to-br from-purple-900 to-pink-900 w-full h-full">
            <p className="text-white font-semibold text-sm line-clamp-2">{ad.headline}</p>
            <span className="text-white/70 text-xs mt-1">
              <ExternalLink className="h-3 w-3 inline mr-1" />
              Learn More
            </span>
          </div>
        )}
      </button>

      {showCharity && dimensions.height >= 100 && (
        <div className="absolute bottom-1 right-1 z-10">
          <span className="text-[8px] text-white/60 bg-black/40 px-1 py-0.5 rounded flex items-center gap-0.5">
            <Heart className="h-2 w-2 text-pink-400" />
            Wittle Bear
          </span>
        </div>
      )}
    </div>
  );
}

export default AdSpace;
