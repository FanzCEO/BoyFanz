/**
 * Video Ad Overlay Component
 *
 * Displays preroll/overlay ads on video content.
 * Includes skip countdown and mute controls.
 */

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Volume2, VolumeX, ExternalLink, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface VideoAdOverlayProps {
  creatorId: string;
  placementType: 'video_preroll' | 'video_overlay';
  onAdComplete?: () => void;
  onSkip?: () => void;
  skipAfterSeconds?: number;
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

export function VideoAdOverlay({
  creatorId,
  placementType,
  onAdComplete,
  onSkip,
  skipAfterSeconds = 5,
  className,
}: VideoAdOverlayProps) {
  const [dismissed, setDismissed] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const [skipCountdown, setSkipCountdown] = useState(skipAfterSeconds);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [impressionRecorded, setImpressionRecorded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startTime = useRef<number>(Date.now());

  const { data: ad, isLoading } = useQuery<Ad | null>({
    queryKey: ['videoAd', creatorId, placementType],
    queryFn: async () => {
      const response = await fetch(`/api/creator-ads/serve/${creatorId}/${placementType}`);
      const result = await response.json();
      return result.data;
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Skip countdown timer
  useEffect(() => {
    if (!ad || canSkip) return;

    const timer = setInterval(() => {
      setSkipCountdown((prev) => {
        if (prev <= 1) {
          setCanSkip(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [ad, canSkip]);

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
          placementType,
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

  const handleSkip = useCallback(() => {
    if (!canSkip) return;
    setDismissed(true);
    onSkip?.();
  }, [canSkip, onSkip]);

  const handleVideoEnd = useCallback(() => {
    setDismissed(true);
    onAdComplete?.();
  }, [onAdComplete]);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(percent);
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (isLoading || !ad || dismissed) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 bg-black z-50 flex flex-col',
        className
      )}
    >
      {/* Ad Label */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="text-xs font-medium text-white/80 bg-black/60 px-2 py-1 rounded">
          Ad • {placementType === 'video_preroll' ? 'Preroll' : 'Overlay'}
        </span>
      </div>

      {/* Top Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-black/60 hover:bg-black/80 text-white"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Video or Image Content */}
      <div className="flex-1 relative cursor-pointer" onClick={handleClick}>
        {ad.videoUrl ? (
          <video
            ref={videoRef}
            src={ad.videoUrl}
            className="w-full h-full object-contain"
            autoPlay
            muted={isMuted}
            playsInline
            onEnded={handleVideoEnd}
            onTimeUpdate={handleTimeUpdate}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={ad.imageUrl}
              alt={ad.headline}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}

        {/* Click Overlay */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
          <Button
            onClick={handleClick}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Visit Site
          </Button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        {/* Progress Bar */}
        {ad.videoUrl && (
          <Progress value={progress} className="h-1 mb-3" />
        )}

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-white text-sm truncate">{ad.headline}</h4>
            <p className="text-xs text-white/70">Supporting Wittle Bear Foundation</p>
          </div>

          {/* Skip Button */}
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'ml-4 transition-all',
              canSkip
                ? 'bg-white/20 hover:bg-white/30 text-white border-white/30'
                : 'bg-transparent text-white/50 border-white/20 cursor-not-allowed'
            )}
            onClick={handleSkip}
            disabled={!canSkip}
          >
            {canSkip ? (
              <>
                <SkipForward className="h-4 w-4 mr-1" />
                Skip Ad
              </>
            ) : (
              `Skip in ${skipCountdown}s`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple overlay ad that appears at the bottom of videos
 */
interface VideoBottomAdProps {
  creatorId: string;
  className?: string;
}

export function VideoBottomAd({ creatorId, className }: VideoBottomAdProps) {
  const [dismissed, setDismissed] = useState(false);
  const [impressionRecorded, setImpressionRecorded] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);

  const { data: ad, isLoading } = useQuery<Ad | null>({
    queryKey: ['videoBottomAd', creatorId],
    queryFn: async () => {
      const response = await fetch(`/api/creator-ads/serve/${creatorId}/video_overlay`);
      const result = await response.json();
      return result.data;
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

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
          placementType: 'video_overlay',
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
    <div
      ref={adRef}
      className={cn(
        'absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm',
        'flex items-center gap-3 p-2',
        className
      )}
    >
      {ad.imageUrl && (
        <img
          src={ad.imageUrl}
          alt={ad.headline}
          className="w-12 h-12 object-cover rounded"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{ad.headline}</p>
        <p className="text-white/60 text-xs truncate">{ad.description}</p>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleClick}
        className="flex-shrink-0"
      >
        Visit
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-white/60 hover:text-white flex-shrink-0"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default VideoAdOverlay;
