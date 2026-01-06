/**
 * OPTIMIZED VIDEO PLAYER
 *
 * Features:
 * - Adaptive quality switching
 * - Preloading and buffering optimization
 * - Lazy loading (below-fold)
 * - Thumbnail preview
 * - Resume from last position
 * - Bandwidth-aware quality selection
 */

import React, { useRef, useEffect, useState } from 'react';

interface OptimizedVideoPlayerProps {
  videoId: string;
  poster?: string; // Thumbnail URL
  autoplay?: boolean;
  priority?: boolean; // Set true for above-the-fold videos
  onProgress?: (progress: number) => void;
  onQualityChange?: (quality: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

type VideoQuality = '360p' | '480p' | '720p' | '1080p' | 'auto';

export const OptimizedVideoPlayer: React.FC<OptimizedVideoPlayerProps> = ({
  videoId,
  poster,
  autoplay = false,
  priority = false,
  onProgress,
  onQualityChange,
  className = '',
  style,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [quality, setQuality] = useState<VideoQuality>('auto');
  const [availableQualities, setAvailableQualities] = useState<VideoQuality[]>([
    '360p',
    '480p',
    '720p',
    '1080p',
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Detect connection speed and auto-select quality
  useEffect(() => {
    if (quality === 'auto') {
      const connection = (navigator as any).connection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        let selectedQuality: VideoQuality = '720p';

        switch (effectiveType) {
          case 'slow-2g':
          case '2g':
            selectedQuality = '360p';
            break;
          case '3g':
            selectedQuality = '480p';
            break;
          case '4g':
          default:
            selectedQuality = '720p';
            break;
        }

        setQuality(selectedQuality);
      } else {
        setQuality('720p'); // Default fallback
      }
    }
  }, [quality]);

  // Get video source URL based on selected quality
  const getVideoSource = (q: VideoQuality): string => {
    if (q === 'auto') return '';
    return `/api/videos/${videoId}/stream?quality=${q}`;
  };

  // Handle quality change
  const handleQualityChange = (newQuality: VideoQuality) => {
    if (!videoRef.current) return;

    const currentTime = videoRef.current.currentTime;
    const wasPlaying = !videoRef.current.paused;

    setIsLoading(true);
    setQuality(newQuality);

    // Wait for new source to load
    videoRef.current.addEventListener(
      'loadedmetadata',
      () => {
        if (videoRef.current) {
          videoRef.current.currentTime = currentTime;
          if (wasPlaying) {
            videoRef.current.play();
          }
          setIsLoading(false);
        }
      },
      { once: true }
    );

    onQualityChange?.(newQuality);
  };

  // Track progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onProgress?.(video.currentTime);

      // Save position to localStorage for resume
      localStorage.setItem(`video-${videoId}-position`, video.currentTime.toString());
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);

      // Resume from last position
      const savedPosition = localStorage.getItem(`video-${videoId}-position`);
      if (savedPosition && parseFloat(savedPosition) > 0) {
        video.currentTime = parseFloat(savedPosition);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoId, onProgress]);

  // Lazy loading for below-fold videos
  const preload = priority ? 'metadata' : 'none';

  return (
    <div className={`relative ${className}`} style={style}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="text-white">Loading...</div>
        </div>
      )}

      <video
        ref={videoRef}
        src={quality !== 'auto' ? getVideoSource(quality) : ''}
        poster={poster}
        controls
        preload={preload}
        autoPlay={autoplay}
        className="w-full h-full"
        playsInline
      />

      {/* Quality selector (optional UI) */}
      <div className="absolute bottom-16 right-4 z-20">
        <select
          value={quality}
          onChange={(e) => handleQualityChange(e.target.value as VideoQuality)}
          className="bg-black/70 text-white px-2 py-1 rounded text-sm"
        >
          <option value="auto">Auto</option>
          {availableQualities.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default OptimizedVideoPlayer;
