/**
 * Landing Page Ad Components
 *
 * Premium ad placements for the homepage and landing pages.
 * Includes hero ads, featured creator promotions, and interstitials.
 */

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Heart, ChevronRight, Sparkles, Crown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Ad {
  id: string;
  headline: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  clickUrl: string;
  category: string;
}

// ============================================================
// HERO AD - Full-width premium placement at top of landing page
// ============================================================

interface HeroAdProps {
  className?: string;
}

export function HeroAd({ className }: HeroAdProps) {
  const [dismissed, setDismissed] = useState(false);
  const [impressionRecorded, setImpressionRecorded] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);

  const { data: ad, isLoading } = useQuery<Ad | null>({
    queryKey: ['heroAd'],
    queryFn: async () => {
      const response = await fetch('/api/creator-ads/serve/global/profile_banner');
      const result = await response.json();
      return result.data;
    },
    staleTime: 120000,
  });

  useEffect(() => {
    if (!ad || impressionRecorded) return;
    const timeout = setTimeout(() => {
      recordImpression();
    }, 1500);
    return () => clearTimeout(timeout);
  }, [ad, impressionRecorded]);

  const recordImpression = async () => {
    if (!ad) return;
    try {
      await fetch('/api/creator-ads/impression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adId: ad.id,
          creatorId: 'global',
          placementType: 'profile_banner',
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
        body: JSON.stringify({ adId: ad.id, creatorId: 'global' }),
      });
    } catch (error) {
      console.error('Failed to record click:', error);
    }
    window.open(ad.clickUrl, '_blank', 'noopener,noreferrer');
  };

  if (isLoading || !ad || dismissed) return null;

  return (
    <div
      ref={adRef}
      className={cn(
        'relative w-full overflow-hidden rounded-2xl',
        'bg-gradient-to-r from-purple-900 via-pink-900 to-purple-900',
        className
      )}
    >
      {/* Dismiss */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-20 h-8 w-8 bg-black/30 hover:bg-black/50 text-white"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>

      <button
        onClick={handleClick}
        className="w-full flex flex-col md:flex-row items-center gap-6 p-6 md:p-8 text-left"
      >
        {/* Background Image */}
        {ad.imageUrl && (
          <div className="absolute inset-0 opacity-30">
            <img src={ad.imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 flex-1 space-y-4">
          <Badge className="bg-white/20 text-white border-none">
            <Sparkles className="h-3 w-3 mr-1" />
            Featured
          </Badge>
          <h2 className="text-2xl md:text-4xl font-bold text-white">
            {ad.headline}
          </h2>
          <p className="text-lg text-white/80 max-w-xl">
            {ad.description}
          </p>
          <Button
            size="lg"
            className="bg-white text-purple-900 hover:bg-white/90"
          >
            Learn More
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        </div>

        {/* Side Image */}
        {ad.imageUrl && (
          <div className="relative z-10 w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden shadow-2xl flex-shrink-0">
            <img src={ad.imageUrl} alt={ad.headline} className="w-full h-full object-cover" />
          </div>
        )}
      </button>

      {/* Charity Note */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
        <span className="text-[10px] text-white/60 flex items-center gap-1">
          <Heart className="h-2.5 w-2.5 text-pink-400" />
          Supporting Wittle Bear Foundation
        </span>
      </div>
    </div>
  );
}

// ============================================================
// CREATOR SHOUTOUT - Promoted creator card for discovery
// ============================================================

interface CreatorShoutoutProps {
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  creatorBio?: string;
  subscriberCount?: number;
  isVerified?: boolean;
  previewImages?: string[];
  className?: string;
}

export function CreatorShoutout({
  creatorId,
  creatorName,
  creatorAvatar,
  creatorBio,
  subscriberCount = 0,
  isVerified = false,
  previewImages = [],
  className,
}: CreatorShoutoutProps) {
  const [impressionRecorded, setImpressionRecorded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (impressionRecorded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            recordImpression();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [impressionRecorded]);

  const recordImpression = async () => {
    try {
      await fetch('/api/creator-ads/impression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adId: `shoutout-${creatorId}`,
          creatorId,
          placementType: 'feed_inline',
        }),
      });
      setImpressionRecorded(true);
    } catch (error) {
      console.error('Failed to record impression:', error);
    }
  };

  return (
    <Card
      ref={cardRef}
      className={cn(
        'overflow-hidden border-2 border-transparent',
        'hover:border-primary/50 transition-all duration-300',
        'bg-gradient-to-b from-card to-card/80',
        className
      )}
    >
      {/* Preview Images Grid */}
      {previewImages.length > 0 && (
        <div className="grid grid-cols-3 gap-0.5 h-32">
          {previewImages.slice(0, 3).map((img, i) => (
            <div key={i} className="overflow-hidden">
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover hover:scale-110 transition-transform"
              />
            </div>
          ))}
        </div>
      )}

      <CardContent className="p-4">
        {/* Promoted Label */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="text-[10px] gap-1">
            <Crown className="h-2.5 w-2.5 text-amber-500" />
            Featured Creator
          </Badge>
          <Heart className="h-3 w-3 text-pink-500" />
        </div>

        {/* Creator Info */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-12 w-12 ring-2 ring-primary/30">
            <AvatarImage src={creatorAvatar} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              {creatorName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold truncate">{creatorName}</h4>
              {isVerified && (
                <Badge className="h-4 px-1 bg-blue-500">
                  <Star className="h-2.5 w-2.5" />
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscriberCount.toLocaleString()} subscribers
            </p>
          </div>
        </div>

        {/* Bio */}
        {creatorBio && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {creatorBio}
          </p>
        )}

        {/* CTA */}
        <Button
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
          asChild
        >
          <a href={`/creator/${creatorId}`}>
            View Profile
            <ChevronRight className="h-4 w-4 ml-1" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================
// CREATOR SHOUTOUT ROW - Horizontal scrolling creator promotions
// ============================================================

interface FeaturedCreator {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  subscriberCount?: number;
  isVerified?: boolean;
  previewImages?: string[];
}

interface CreatorShoutoutRowProps {
  creators: FeaturedCreator[];
  title?: string;
  className?: string;
}

export function CreatorShoutoutRow({
  creators,
  title = "Featured Creators",
  className,
}: CreatorShoutoutRowProps) {
  if (creators.length === 0) return null;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between px-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          {title}
        </h3>
        <Badge variant="outline" className="text-[10px]">
          <Heart className="h-2.5 w-2.5 text-pink-500 mr-1" />
          Supporting Wittle Bear
        </Badge>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide">
        {creators.map((creator) => (
          <CreatorShoutout
            key={creator.id}
            creatorId={creator.id}
            creatorName={creator.name}
            creatorAvatar={creator.avatar}
            creatorBio={creator.bio}
            subscriberCount={creator.subscriberCount}
            isVerified={creator.isVerified}
            previewImages={creator.previewImages}
            className="w-72 flex-shrink-0"
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// BETWEEN CONTENT AD - Ad placed between content sections
// ============================================================

interface BetweenContentAdProps {
  creatorId?: string;
  className?: string;
}

export function BetweenContentAd({ creatorId, className }: BetweenContentAdProps) {
  const [dismissed, setDismissed] = useState(false);
  const [impressionRecorded, setImpressionRecorded] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);

  const { data: ad, isLoading } = useQuery<Ad | null>({
    queryKey: ['betweenContentAd', creatorId || 'global'],
    queryFn: async () => {
      const url = creatorId
        ? `/api/creator-ads/serve/${creatorId}/feed_inline`
        : '/api/creator-ads/serve/global/feed_inline';
      const response = await fetch(url);
      const result = await response.json();
      return result.data;
    },
    staleTime: 60000,
  });

  useEffect(() => {
    if (!ad || impressionRecorded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              recordImpression();
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
          placementType: 'feed_inline',
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
        body: JSON.stringify({ adId: ad.id, creatorId: creatorId || 'global' }),
      });
    } catch (error) {
      console.error('Failed to record click:', error);
    }
    window.open(ad.clickUrl, '_blank', 'noopener,noreferrer');
  };

  if (isLoading || !ad || dismissed) return null;

  return (
    <div
      ref={adRef}
      className={cn(
        'relative w-full py-6 px-4',
        'bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50',
        'border-y border-border/50',
        className
      )}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-muted-foreground">Sponsored</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={() => setDismissed(true)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        <button
          onClick={handleClick}
          className="w-full flex items-center gap-4 text-left hover:opacity-90 transition-opacity"
        >
          {ad.imageUrl && (
            <img
              src={ad.imageUrl}
              alt={ad.headline}
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-lg">{ad.headline}</h4>
            <p className="text-sm text-muted-foreground line-clamp-1">{ad.description}</p>
          </div>
          <Button size="sm" className="flex-shrink-0">
            Learn More
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </button>

        <div className="flex items-center justify-center mt-2">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Heart className="h-2.5 w-2.5 text-pink-500" />
            30% supports Wittle Bear Foundation
          </span>
        </div>
      </div>
    </div>
  );
}

export default HeroAd;
