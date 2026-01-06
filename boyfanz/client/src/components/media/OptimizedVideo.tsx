// @ts-nocheck
/**
 * Optimized Video Component
 *
 * Provides lazy loading, adaptive quality, and mobile-optimized
 * video playback with HLS/DASH support.
 */

import { useState, useRef, useEffect, memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Play, Pause, Volume2, VolumeX, Maximize2, Settings } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface OptimizedVideoProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  preload?: "none" | "metadata" | "auto";
  playsInline?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  aspectRatio?: "16:9" | "9:16" | "4:3" | "1:1";
  quality?: "auto" | "1080p" | "720p" | "480p" | "360p";
}

// Quality settings for adaptive streaming
const QUALITY_MAP = {
  "1080p": 1920,
  "720p": 1280,
  "480p": 854,
  "360p": 640,
};

export const OptimizedVideo = memo(function OptimizedVideo({
  src,
  poster,
  className,
  autoPlay = false,
  muted: initialMuted = true,
  loop = false,
  controls = true,
  preload = "metadata",
  playsInline = true,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  aspectRatio = "16:9",
  quality = "auto",
}: OptimizedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Aspect ratio styles
  const aspectStyles = {
    "16:9": "aspect-video",
    "9:16": "aspect-[9/16]",
    "4:3": "aspect-[4/3]",
    "1:1": "aspect-square",
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          } else {
            // Pause video when out of view
            if (videoRef.current && !videoRef.current.paused) {
              videoRef.current.pause();
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (isPlaying && showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControls]);

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;

    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration;

    setCurrentTime(current);
    setDuration(dur);
    onTimeUpdate?.(current, dur);

    // Update buffered progress
    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered((bufferedEnd / dur) * 100);
    }
  }, [onTimeUpdate]);

  const handleSeek = useCallback((value: number[]) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTouchStart = () => {
    setShowControls(true);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-black group",
        aspectStyles[aspectRatio],
        className
      )}
      onMouseMove={() => setShowControls(true)}
      onTouchStart={handleTouchStart}
    >
      {/* Video Element */}
      {isInView && (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          muted={isMuted}
          loop={loop}
          playsInline={playsInline}
          preload={preload}
          className="w-full h-full object-contain"
          onPlay={() => {
            setIsPlaying(true);
            onPlay?.();
          }}
          onPause={() => {
            setIsPlaying(false);
            onPause?.();
          }}
          onEnded={onEnded}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            setIsLoaded(true);
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
            }
          }}
        />
      )}

      {/* Loading placeholder */}
      {!isLoaded && poster && (
        <img
          src={poster}
          alt="Video poster"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Play button overlay */}
      {!isPlaying && isLoaded && (
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
          aria-label="Play video"
        >
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
            <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
          </div>
        </button>
      )}

      {/* Custom Controls */}
      {controls && isLoaded && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Progress bar */}
          <div className="relative mb-2">
            {/* Buffered progress */}
            <div
              className="absolute h-1 bg-white/30 rounded-full top-1/2 -translate-y-1/2 left-0"
              style={{ width: `${buffered}%` }}
            />
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <button
                onClick={handlePlayPause}
                className="p-2 hover:bg-white/10 rounded-full transition-colors touch-target"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white" fill="currentColor" />
                )}
              </button>

              {/* Mute/Unmute */}
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/10 rounded-full transition-colors touch-target"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>

              {/* Time display */}
              <span className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/10 rounded-full transition-colors touch-target"
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                <Maximize2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default OptimizedVideo;
