/**
 * Profile Banner Ad Component
 *
 * Displays a banner ad at the top of a creator's profile page.
 * Only shown if the creator has opted into profile banner ads.
 */

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProfileBannerAdProps {
  creatorId: string;
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

export function ProfileBannerAd({ creatorId, className }: ProfileBannerAdProps) {
  const [dismissed, setDismissed] = useState(false);
  const [impressionRecorded, setImpressionRecorded] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  const viewStartTime = useRef<number>(0);

  const { data: ad, isLoading } = useQuery<Ad | null>({
    queryKey: ['profileBannerAd', creatorId],
    queryFn: async () => {
      const response = await fetch(`/api/creator-ads/serve/${creatorId}/profile_banner`);
      const result = await response.json();
      return result.data;
    },
    staleTime: 60000, // Cache for 1 minute
    refetchOnWindowFocus: false,
  });

  // Track impression when ad comes into view
  useEffect(() => {
    if (!ad || impressionRecorded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            viewStartTime.current = Date.now();

            // Record impression after 1 second of visibility
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
          placementType: 'profile_banner',
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

    // Open ad URL in new tab
    window.open(ad.clickUrl, '_blank', 'noopener,noreferrer');
  };

  if (isLoading || !ad || dismissed) return null;

  return (
    <div
      ref={adRef}
      className={cn(
        'relative w-full rounded-xl overflow-hidden shadow-lg',
        'bg-gradient-to-r from-gray-900 to-gray-800',
        'border border-gray-700/50',
        className
      )}
    >
      {/* Ad Label */}
      <div className="absolute top-2 left-2 z-10">
        <span className="text-[10px] font-medium text-gray-400 bg-black/50 px-2 py-0.5 rounded">
          Sponsored • Supporting Wittle Bear Foundation
        </span>
      </div>

      {/* Dismiss Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 h-6 w-6 bg-black/50 hover:bg-black/70"
        onClick={() => setDismissed(true)}
      >
        <X className="h-3 w-3" />
      </Button>

      {/* Ad Content */}
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/5 transition-colors"
      >
        {ad.imageUrl && (
          <img
            src={ad.imageUrl}
            alt={ad.headline}
            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-white truncate">{ad.headline}</h3>
          <p className="text-sm text-gray-300 line-clamp-2 mt-1">{ad.description}</p>
          <div className="flex items-center gap-2 mt-2 text-sm text-blue-400">
            <ExternalLink className="h-4 w-4" />
            <span>Learn More</span>
          </div>
        </div>
      </button>
    </div>
  );
}

export default ProfileBannerAd;
