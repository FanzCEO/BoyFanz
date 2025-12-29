/**
 * Story Ad Component
 *
 * Full-screen story ad displayed between user stories.
 * Includes swipe-up action and progress timer.
 */

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronUp, ExternalLink, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface StoryAdProps {
  creatorId: string;
  duration?: number; // Duration in seconds
  onComplete?: () => void;
  onSkip?: () => void;
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

export function StoryAd({
  creatorId,
  duration = 10,
  onComplete,
  onSkip,
  className,
}: StoryAdProps) {
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [impressionRecorded, setImpressionRecorded] = useState(false);
  const startTime = useRef<number>(Date.now());
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const { data: ad, isLoading } = useQuery<Ad | null>({
    queryKey: ['storyAd', creatorId],
    queryFn: async () => {
      const response = await fetch(`/api/creator-ads/serve/${creatorId}/story_interstitial`);
      const result = await response.json();
      return result.data;
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Progress timer
  useEffect(() => {
    if (!ad || paused) return;

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / duration / 10);
        if (newProgress >= 100) {
          clearInterval(progressInterval.current!);
          onComplete?.();
          return 100;
        }
        return newProgress;
      });
    }, 100);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [ad, paused, duration, onComplete]);

  // Record impression after 2 seconds
  useEffect(() => {
    if (!ad || impressionRecorded) return;

    const timeout = setTimeout(() => {
      recordImpression();
    }, 2000);

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
          creatorId,
          placementType: 'story_interstitial',
          viewDuration: Date.now() - startTime.current,
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

  const handleTouchStart = useCallback(() => {
    setPaused(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setPaused(false);
  }, []);

  if (isLoading || !ad) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 bg-black z-50 flex flex-col',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-3">
        <Progress value={progress} className="h-0.5" />
      </div>

      {/* Top Bar */}
      <div className="absolute top-6 left-0 right-0 z-10 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white/80 bg-black/40 px-2 py-1 rounded-full">
            Sponsored
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/20"
          onClick={onSkip}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        {ad.videoUrl ? (
          <video
            src={ad.videoUrl}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            loop
          />
        ) : ad.imageUrl ? (
          <img
            src={ad.imageUrl}
            alt={ad.headline}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-purple-900 to-pink-900 flex items-center justify-center p-8">
            <h2 className="text-3xl font-bold text-white text-center">{ad.headline}</h2>
          </div>
        )}
      </div>

      {/* Bottom Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pt-20">
        {/* Ad Content */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white mb-2">{ad.headline}</h3>
          <p className="text-sm text-white/80">{ad.description}</p>
        </div>

        {/* Swipe Up CTA */}
        <button
          onClick={handleClick}
          className="w-full flex flex-col items-center gap-1 text-white animate-bounce"
        >
          <ChevronUp className="h-6 w-6" />
          <span className="text-sm font-medium">Swipe Up</span>
        </button>

        {/* Action Button */}
        <Button
          onClick={handleClick}
          className="w-full mt-4 bg-white text-black hover:bg-white/90"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Learn More
        </Button>

        {/* Charity Note */}
        <p className="text-[10px] text-white/60 text-center mt-4 flex items-center justify-center gap-1">
          <Heart className="h-3 w-3 text-pink-400" />
          Supporting Wittle Bear Foundation
        </p>
      </div>
    </div>
  );
}

export default StoryAd;
