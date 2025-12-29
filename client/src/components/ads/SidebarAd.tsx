/**
 * Sidebar Ad Component
 *
 * Displays an ad in the sidebar on desktop layouts.
 * Sticky positioning keeps ad visible while scrolling.
 */

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SidebarAdProps {
  creatorId: string;
  variant?: 'compact' | 'expanded';
  className?: string;
}

interface Ad {
  id: string;
  headline: string;
  description: string;
  imageUrl: string;
  clickUrl: string;
  category: string;
}

export function SidebarAd({ creatorId, variant = 'expanded', className }: SidebarAdProps) {
  const [dismissed, setDismissed] = useState(false);
  const [impressionRecorded, setImpressionRecorded] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);

  const { data: ad, isLoading } = useQuery<Ad | null>({
    queryKey: ['sidebarAd', creatorId],
    queryFn: async () => {
      const response = await fetch(`/api/creator-ads/serve/${creatorId}/sidebar`);
      const result = await response.json();
      return result.data;
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Track impression
  useEffect(() => {
    if (!ad || impressionRecorded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
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
          creatorId,
          placementType: 'sidebar',
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
          creatorId,
        }),
      });
    } catch (error) {
      console.error('Failed to record click:', error);
    }

    window.open(ad.clickUrl, '_blank', 'noopener,noreferrer');
  };

  if (isLoading || !ad || dismissed) return null;

  if (variant === 'compact') {
    return (
      <div
        ref={adRef}
        className={cn(
          'relative rounded-lg overflow-hidden bg-muted/50 border',
          className
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 z-10 h-5 w-5 bg-background/80"
          onClick={() => setDismissed(true)}
        >
          <X className="h-3 w-3" />
        </Button>

        <button
          onClick={handleClick}
          className="w-full text-left hover:bg-muted/80 transition-colors"
        >
          {ad.imageUrl && (
            <img
              src={ad.imageUrl}
              alt={ad.headline}
              className="w-full aspect-video object-cover"
            />
          )}
          <div className="p-2">
            <p className="text-xs font-medium truncate">{ad.headline}</p>
            <p className="text-[10px] text-muted-foreground">Sponsored</p>
          </div>
        </button>
      </div>
    );
  }

  return (
    <Card
      ref={adRef}
      className={cn(
        'relative overflow-hidden',
        className
      )}
    >
      {/* Dismiss Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 h-6 w-6 bg-background/80"
        onClick={() => setDismissed(true)}
      >
        <X className="h-3 w-3" />
      </Button>

      <CardContent className="p-0">
        {/* Ad Image */}
        {ad.imageUrl && (
          <button
            onClick={handleClick}
            className="w-full aspect-[4/3] overflow-hidden group"
          >
            <img
              src={ad.imageUrl}
              alt={ad.headline}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          </button>
        )}

        <div className="p-3 space-y-2">
          {/* Sponsored Label */}
          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
            Sponsored
          </span>

          {/* Ad Content */}
          <h4 className="font-semibold text-sm line-clamp-2">{ad.headline}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2">{ad.description}</p>

          {/* CTA Button */}
          <Button
            onClick={handleClick}
            size="sm"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Learn More
          </Button>

          {/* Charity Note */}
          <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
            <Heart className="h-2.5 w-2.5 text-pink-500" />
            Supporting Wittle Bear Foundation
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default SidebarAd;
