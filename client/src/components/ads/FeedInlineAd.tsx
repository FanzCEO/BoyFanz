/**
 * Feed Inline Ad Component
 *
 * Displays an ad card inline within the content feed.
 * Styled to blend naturally with other feed content.
 */

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { X, Heart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface FeedInlineAdProps {
  creatorId: string;
  position?: number;
  className?: string;
}

interface Ad {
  id: string;
  headline: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  clickUrl: string;
  category: string;
}

export function FeedInlineAd({ creatorId, position = 0, className }: FeedInlineAdProps) {
  const [dismissed, setDismissed] = useState(false);
  const [impressionRecorded, setImpressionRecorded] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  const viewStartTime = useRef<number>(0);

  const { data: ad, isLoading } = useQuery<Ad | null>({
    queryKey: ['feedInlineAd', creatorId, position],
    queryFn: async () => {
      const response = await fetch(`/api/creator-ads/serve/${creatorId}/feed_inline`);
      const result = await response.json();
      return result.data;
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Track impression when ad is visible
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
          creatorId,
          placementType: 'feed_inline',
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
          creatorId,
        }),
      });
    } catch (error) {
      console.error('Failed to record click:', error);
    }

    window.open(ad.clickUrl, '_blank', 'noopener,noreferrer');
  };

  if (isLoading || !ad || dismissed) return null;

  return (
    <Card
      ref={adRef}
      className={cn(
        'relative overflow-hidden bg-card border-muted',
        'hover:border-primary/30 transition-colors',
        className
      )}
    >
      {/* Sponsored Label */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <span className="text-[10px] font-medium text-muted-foreground bg-background/80 px-2 py-0.5 rounded">
          Sponsored
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 bg-background/80 hover:bg-background"
          onClick={() => setDismissed(true)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      <CardContent className="p-4">
        {/* Advertiser Info */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={ad.imageUrl} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
              AD
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-sm">{ad.headline}</h4>
            <p className="text-xs text-muted-foreground">Promoted</p>
          </div>
        </div>

        {/* Ad Image */}
        {ad.imageUrl && (
          <button
            onClick={handleClick}
            className="w-full aspect-video rounded-lg overflow-hidden mb-3 group"
          >
            <img
              src={ad.imageUrl}
              alt={ad.headline}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          </button>
        )}

        {/* Ad Description */}
        <p className="text-sm text-foreground mb-3 line-clamp-3">{ad.description}</p>

        {/* Action Button */}
        <Button
          onClick={handleClick}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Learn More
        </Button>

        {/* Charity Note */}
        <p className="text-[10px] text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
          <Heart className="h-3 w-3 text-pink-500" />
          30% of ad revenue supports Wittle Bear Foundation
        </p>
      </CardContent>
    </Card>
  );
}

export default FeedInlineAd;
