/**
 * Watch Stream Page - View a livestream
 * For viewers to watch creator streams
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LivestreamRoom } from '@/components/livekit';
import { Radio, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function WatchStreamPage() {
  const params = useParams<{ roomName: string }>();
  const [, setLocation] = useLocation();
  const [isWatching, setIsWatching] = useState(false);

  const roomName = params.roomName;

  // Get viewer token
  const { data: tokenData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/livekit/viewer-token', roomName],
    queryFn: async () => {
      const response = await fetch(`/api/livekit/viewer-token?room_name=${roomName}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get viewer token');
      }
      return response.json();
    },
    enabled: !!roomName,
    retry: 1,
  });

  // Get room info
  const { data: roomData } = useQuery({
    queryKey: ['/api/livekit/rooms', roomName],
    queryFn: async () => {
      const response = await fetch(`/api/livekit/rooms/${roomName}`, {
        credentials: 'include',
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!roomName,
  });

  const handleJoinStream = () => {
    setIsWatching(true);
  };

  const handleLeaveStream = () => {
    setIsWatching(false);
    setLocation('/explore');
  };

  // Parse room metadata for stream info
  const streamInfo = roomData?.room?.metadata
    ? JSON.parse(roomData.room.metadata)
    : null;

  // Show streaming interface
  if (isWatching && tokenData?.success) {
    return (
      <div className="h-screen">
        <LivestreamRoom
          token={tokenData.token}
          serverUrl={tokenData.livekit_url}
          roomName={tokenData.room_name}
          isCreator={false}
          streamTitle={streamInfo?.title}
          creatorName={streamInfo?.creator_id}
          onLeave={handleLeaveStream}
        />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <Button
        variant="ghost"
        onClick={() => setLocation('/explore')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Explore
      </Button>

      <div className="flex items-center gap-3 mb-8">
        <Radio className="w-8 h-8 text-red-500" />
        <div>
          <h1 className="text-3xl font-bold">
            {streamInfo?.title || 'Live Stream'}
          </h1>
          <p className="text-muted-foreground">
            {roomName}
          </p>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="ml-3">Connecting to stream...</span>
          </CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to connect to stream'}
          </AlertDescription>
        </Alert>
      ) : tokenData?.success ? (
        <Card>
          <CardHeader>
            <CardTitle>Ready to Watch</CardTitle>
            <CardDescription>
              {streamInfo?.title || 'Live stream is ready'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stream Preview */}
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              <div className="text-center text-white/70">
                <Radio className="w-16 h-16 mx-auto mb-4 animate-pulse text-red-500" />
                <p className="text-lg font-semibold">Stream is Live</p>
                <p className="text-sm">Click below to start watching</p>
              </div>
            </div>

            {/* Stream Info */}
            {roomData?.room && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Viewers:</span>
                  <span className="ml-2 font-medium">
                    {Math.max(0, roomData.room.num_participants - 1)}
                  </span>
                </div>
                {streamInfo?.started_at && (
                  <div>
                    <span className="text-muted-foreground">Started:</span>
                    <span className="ml-2 font-medium">
                      {new Date(streamInfo.started_at).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            <Button onClick={handleJoinStream} size="lg" className="w-full">
              <Radio className="w-4 h-4 mr-2" />
              Join Stream
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            This stream may have ended or is not available.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
