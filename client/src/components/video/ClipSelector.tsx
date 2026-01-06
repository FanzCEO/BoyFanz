/**
 * Video Clip Selector Component
 *
 * Features:
 * - Visual timeline scrubbing
 * - Start/end time selection
 * - Live preview
 * - Multiple clip creation
 * - Social media preset formats (1:1, 9:16, 16:9)
 */

import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play, Pause, Scissors, Plus, Trash2, Download, Share2,
  Instagram, Twitter, Video, CheckCircle, Loader2, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ClipRange {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: 'draft' | 'processing' | 'ready' | 'failed';
  clipUrl?: string;
}

interface ClipSelectorProps {
  videoUrl: string;
  mediaId: string;
  originalDuration: number;
  onClipsCreated?: (clips: ClipRange[]) => void;
}

const SOCIAL_PRESETS = {
  instagram_square: { name: 'Instagram Square', ratio: '1:1', maxDuration: 60, icon: Instagram },
  instagram_story: { name: 'Instagram Story', ratio: '9:16', maxDuration: 60, icon: Instagram },
  tiktok: { name: 'TikTok', ratio: '9:16', maxDuration: 60, icon: Video },
  twitter: { name: 'Twitter', ratio: '16:9', maxDuration: 140, icon: Twitter },
  youtube_short: { name: 'YouTube Short', ratio: '9:16', maxDuration: 60, icon: Video },
};

export default function ClipSelector({ videoUrl, mediaId, originalDuration, onClipsCreated }: ClipSelectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [clipRange, setClipRange] = useState<[number, number]>([0, Math.min(30, originalDuration)]);
  const [clips, setClips] = useState<ClipRange[]>([]);
  const [clipName, setClipName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof SOCIAL_PRESETS>('instagram_square');
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'scrubber' | null>(null);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Update current time from video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Play/pause video
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Seek to specific time
  const seekTo = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(time, originalDuration));
    setCurrentTime(video.currentTime);
  };

  // Handle clip range change
  const handleRangeChange = (value: number[]) => {
    const [start, end] = value;
    setClipRange([start, end]);

    // Seek to start of range
    seekTo(start);
  };

  // Handle timeline click
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * originalDuration;

    seekTo(time);
  };

  // Play clip preview
  const playClipPreview = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = clipRange[0];
    video.play();
    setIsPlaying(true);

    // Stop at clip end
    const checkEnd = setInterval(() => {
      if (video.currentTime >= clipRange[1]) {
        video.pause();
        setIsPlaying(false);
        clearInterval(checkEnd);
      }
    }, 100);
  };

  // Create clip mutation
  const createClipMutation = useMutation({
    mutationFn: async (clipData: { name: string; startTime: number; endTime: number }) => {
      const response = await fetch('/api/video-clips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalMediaId: mediaId,
          clipName: clipData.name,
          startTime: clipData.startTime,
          endTime: clipData.endTime,
          duration: clipData.endTime - clipData.startTime,
          sourceUrl: videoUrl,
        }),
      });

      if (!response.ok) throw new Error('Failed to create clip');
      return response.json();
    },
    onSuccess: (data) => {
      const newClip: ClipRange = {
        id: data.id,
        name: clipName || `Clip ${clips.length + 1}`,
        startTime: clipRange[0],
        endTime: clipRange[1],
        duration: clipRange[1] - clipRange[0],
        status: 'processing',
      };

      setClips([...clips, newClip]);
      setClipName('');

      toast({
        title: 'Clip Created',
        description: `"${newClip.name}" is being processed`,
      });

      // Poll for clip status
      pollClipStatus(data.id);
    },
    onError: (error) => {
      toast({
        title: 'Failed to Create Clip',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Poll clip processing status
  const pollClipStatus = async (clipId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/video-clips/${clipId}`);
        const data = await response.json();

        if (data.status === 'ready' || data.status === 'failed') {
          clearInterval(interval);

          setClips(prev => prev.map(clip =>
            clip.id === clipId
              ? { ...clip, status: data.status, clipUrl: data.clipUrl }
              : clip
          ));

          if (data.status === 'ready') {
            toast({
              title: 'Clip Ready',
              description: 'Your clip has been processed successfully',
            });
          }
        }
      } catch (error) {
        clearInterval(interval);
      }
    }, 2000);
  };

  // Add clip to list
  const handleAddClip = () => {
    const duration = clipRange[1] - clipRange[0];
    const preset = SOCIAL_PRESETS[selectedPreset];

    if (duration > preset.maxDuration) {
      toast({
        title: 'Clip Too Long',
        description: `${preset.name} clips must be ${preset.maxDuration}s or less`,
        variant: 'destructive',
      });
      return;
    }

    if (duration < 1) {
      toast({
        title: 'Clip Too Short',
        description: 'Clips must be at least 1 second',
        variant: 'destructive',
      });
      return;
    }

    createClipMutation.mutate({
      name: clipName || `Clip ${clips.length + 1}`,
      startTime: clipRange[0],
      endTime: clipRange[1],
    });
  };

  // Remove clip
  const handleRemoveClip = async (clipId: string) => {
    try {
      await fetch(`/api/video-clips/${clipId}`, { method: 'DELETE' });
      setClips(clips.filter(c => c.id !== clipId));
      toast({
        title: 'Clip Removed',
        description: 'Clip has been deleted',
      });
    } catch (error) {
      toast({
        title: 'Failed to Remove Clip',
        description: 'Could not delete clip',
        variant: 'destructive',
      });
    }
  };

  const clipDuration = clipRange[1] - clipRange[0];
  const currentPreset = SOCIAL_PRESETS[selectedPreset];

  return (
    <Card className="w-full bg-card/50 border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-accent" />
          Video Clip Selector
        </CardTitle>
        <CardDescription>
          Create clips for social media from your video
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Video Preview */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            playsInline
          />

          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <span className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(originalDuration)}
              </span>

              <Button
                size="sm"
                variant="outline"
                onClick={playClipPreview}
                className="ml-auto"
              >
                <Play className="w-4 h-4 mr-2" />
                Preview Clip
              </Button>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <Label>Timeline</Label>
          <div
            ref={timelineRef}
            className="relative h-16 bg-muted rounded-lg cursor-pointer overflow-hidden"
            onClick={handleTimelineClick}
          >
            {/* Selected range highlight */}
            <div
              className="absolute top-0 bottom-0 bg-accent/30 border-x-2 border-accent"
              style={{
                left: `${(clipRange[0] / originalDuration) * 100}%`,
                width: `${((clipRange[1] - clipRange[0]) / originalDuration) * 100}%`,
              }}
            />

            {/* Current time indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
              style={{ left: `${(currentTime / originalDuration) * 100}%` }}
            />

            {/* Time markers */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 py-1 text-xs text-muted-foreground">
              <span>0:00</span>
              <span>{formatTime(originalDuration / 2)}</span>
              <span>{formatTime(originalDuration)}</span>
            </div>
          </div>

          {/* Range Slider */}
          <div className="px-2">
            <Slider
              min={0}
              max={originalDuration}
              step={0.1}
              value={clipRange}
              onValueChange={handleRangeChange}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Clip Duration:</span>
                <Badge variant={clipDuration > currentPreset.maxDuration ? 'destructive' : 'default'}>
                  {formatTime(clipDuration)}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground ml-6">
                {formatTime(clipRange[0])} → {formatTime(clipRange[1])}
              </div>
            </div>

            {clipDuration > currentPreset.maxDuration && (
              <Badge variant="destructive">
                Exceeds {currentPreset.name} limit ({currentPreset.maxDuration}s)
              </Badge>
            )}
          </div>
        </div>

        {/* Social Media Presets */}
        <div className="space-y-3">
          <Label>Social Media Format</Label>
          <Tabs value={selectedPreset} onValueChange={(v) => setSelectedPreset(v as any)}>
            <TabsList className="grid grid-cols-3 lg:grid-cols-5">
              {Object.entries(SOCIAL_PRESETS).map(([key, preset]) => {
                const Icon = preset.icon;
                return (
                  <TabsTrigger key={key} value={key} className="text-xs">
                    <Icon className="w-3 h-3 mr-1" />
                    {preset.ratio}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
          <div className="text-sm text-muted-foreground">
            {currentPreset.name} • {currentPreset.ratio} • Max {currentPreset.maxDuration}s
          </div>
        </div>

        {/* Clip Name */}
        <div className="space-y-2">
          <Label htmlFor="clip-name">Clip Name (Optional)</Label>
          <Input
            id="clip-name"
            placeholder={`Clip ${clips.length + 1}`}
            value={clipName}
            onChange={(e) => setClipName(e.target.value)}
          />
        </div>

        {/* Add Clip Button */}
        <Button
          onClick={handleAddClip}
          disabled={createClipMutation.isPending || clipDuration > currentPreset.maxDuration}
          className="w-full"
        >
          {createClipMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Clip...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Clip to Queue
            </>
          )}
        </Button>

        {/* Clips List */}
        {clips.length > 0 && (
          <div className="space-y-3">
            <Label>Created Clips ({clips.length})</Label>
            <div className="space-y-2">
              {clips.map((clip) => (
                <div
                  key={clip.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {clip.status === 'processing' && (
                      <Loader2 className="w-4 h-4 text-accent animate-spin" />
                    )}
                    {clip.status === 'ready' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {clip.status === 'failed' && (
                      <Trash2 className="w-4 h-4 text-destructive" />
                    )}

                    <div>
                      <div className="font-medium">{clip.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(clip.startTime)} - {formatTime(clip.endTime)} ({formatTime(clip.duration)})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {clip.status === 'ready' && clip.clipUrl && (
                      <>
                        <Button size="sm" variant="outline" asChild>
                          <a href={clip.clipUrl} download>
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveClip(clip.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
