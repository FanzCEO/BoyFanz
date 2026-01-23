/**
 * Live Streams Page - Browse active livestreams
 * Shows all currently live creators
 */

import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Radio, Users, Clock, Video, RefreshCw } from 'lucide-react';

interface ActiveStream {
  roomName: string;
  title: string;
  creatorId: string;
  viewerCount: number;
  startedAt: string;
  platform: string;
}

function StreamCard({ stream }: { stream: ActiveStream }) {
  const [, setLocation] = useLocation();

  const startTime = new Date(stream.startedAt);
  const duration = Math.floor((Date.now() - startTime.getTime()) / 60000); // minutes

  return (
    <Card
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={() => setLocation(`/live/watch/${stream.roomName}`)}
    >
      <CardContent className="p-0">
        {/* Thumbnail Placeholder */}
        <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <Video className="w-12 h-12 text-white/30" />
          </div>

          {/* Live Badge */}
          <Badge
            variant="destructive"
            className="absolute top-2 left-2 flex items-center gap-1"
          >
            <Radio className="w-3 h-3 animate-pulse" />
            LIVE
          </Badge>

          {/* Viewer Count */}
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 flex items-center gap-1"
          >
            <Users className="w-3 h-3" />
            {stream.viewerCount}
          </Badge>

          {/* Duration */}
          <Badge
            variant="secondary"
            className="absolute bottom-2 right-2 flex items-center gap-1"
          >
            <Clock className="w-3 h-3" />
            {duration}m
          </Badge>
        </div>

        {/* Stream Info */}
        <div className="p-4">
          <h3 className="font-semibold line-clamp-1">{stream.title}</h3>
          <p className="text-sm text-muted-foreground">
            Creator #{stream.creatorId}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function StreamSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <Skeleton className="aspect-video" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function LiveStreamsPage() {
  const [, setLocation] = useLocation();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/livekit/active-streams'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const streams: ActiveStream[] = data?.streams || [];

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Radio className="w-8 h-8 text-red-500" />
          <div>
            <h1 className="text-3xl font-bold">Live Now</h1>
            <p className="text-muted-foreground">
              {streams.length} creator{streams.length !== 1 ? 's' : ''} streaming
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => setLocation('/live/go-live')}>
            <Radio className="w-4 h-4 mr-2" />
            Go Live
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <StreamSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Failed to load live streams
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && streams.length === 0 && (
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <Radio className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Live Streams</h3>
            <p className="text-muted-foreground mb-4">
              No creators are streaming right now. Check back later!
            </p>
            <Button onClick={() => setLocation('/live/go-live')}>
              Be the First to Go Live
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Streams Grid */}
      {!isLoading && !error && streams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {streams.map((stream) => (
            <StreamCard key={stream.roomName} stream={stream} />
          ))}
        </div>
      )}
    </div>
  );
}
