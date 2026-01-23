/**
 * Video Call Page - Initiate and join video calls
 * For 1-on-1 video calling between users
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VideoCallRoom } from '@/components/livekit';
import { Phone, PhoneOff, Loader2, AlertCircle, ArrowLeft, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoCallData {
  room_name: string;
  caller_token: string;
  callee_token: string;
  livekit_url: string;
}

export default function VideoCallPage() {
  const params = useParams<{ roomName?: string; userId?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [callData, setCallData] = useState<VideoCallData | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [isCaller, setIsCaller] = useState(false);

  const roomName = params.roomName;
  const calleeId = params.userId;

  // If we have a roomName, we're joining an existing call
  // If we have a userId, we're initiating a new call

  // Create video call mutation (for callers)
  const createCallMutation = useMutation({
    mutationFn: async (calleeId: string) => {
      const response = await fetch('/api/livekit/video-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calleeId }),
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create video call');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setCallData(data);
      setIsCaller(true);
      toast({
        title: 'Call Started',
        description: 'Waiting for the other person to join...',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Call Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get token for joining an existing call (for callees)
  const { data: joinData, isLoading: joinLoading } = useQuery({
    queryKey: ['/api/livekit/rooms', roomName],
    queryFn: async () => {
      // For now, we need to get a token to join
      // In a real implementation, you'd have a separate endpoint for callee tokens
      const response = await fetch(`/api/livekit/viewer-token?room_name=${roomName}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join call');
      }
      return response.json();
    },
    enabled: !!roomName && !calleeId,
    retry: 1,
  });

  // Initiate call when we have a userId
  useEffect(() => {
    if (calleeId && !callData) {
      createCallMutation.mutate(calleeId);
    }
  }, [calleeId]);

  const handleJoinCall = () => {
    setIsInCall(true);
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setCallData(null);
    setLocation('/messages');
    toast({ title: 'Call Ended' });
  };

  // Show video call interface
  if (isInCall) {
    const token = isCaller ? callData?.caller_token : joinData?.token;
    const serverUrl = isCaller ? callData?.livekit_url : joinData?.livekit_url;
    const room = isCaller ? callData?.room_name : roomName;

    if (token && serverUrl && room) {
      return (
        <div className="h-screen">
          <VideoCallRoom
            token={token}
            serverUrl={serverUrl}
            roomName={room}
            onLeave={handleEndCall}
          />
        </div>
      );
    }
  }

  return (
    <div className="container max-w-md py-8">
      <Button
        variant="ghost"
        onClick={() => setLocation('/messages')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Messages
      </Button>

      <div className="flex items-center gap-3 mb-8">
        <Video className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Video Call</h1>
          <p className="text-muted-foreground">
            {calleeId ? 'Starting call...' : 'Incoming call'}
          </p>
        </div>
      </div>

      {/* Creating Call */}
      {createCallMutation.isPending && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="ml-3">Starting video call...</span>
          </CardContent>
        </Card>
      )}

      {/* Loading Join Data */}
      {joinLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="ml-3">Connecting to call...</span>
          </CardContent>
        </Card>
      )}

      {/* Call Ready */}
      {(callData || joinData?.success) && !isInCall && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-500 animate-pulse" />
              {isCaller ? 'Call Started' : 'Incoming Call'}
            </CardTitle>
            <CardDescription>
              {isCaller
                ? 'Click to join when ready'
                : 'Someone is calling you'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
              <div className="text-center text-white/70">
                <Phone className="w-16 h-16 mx-auto mb-4 animate-bounce text-green-500" />
                <p className="text-lg font-semibold">Ready to Connect</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleJoinCall}
                size="lg"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Phone className="w-4 h-4 mr-2" />
                Join Call
              </Button>
              <Button
                onClick={handleEndCall}
                size="lg"
                variant="destructive"
                className="flex-1"
              >
                <PhoneOff className="w-4 h-4 mr-2" />
                Decline
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {(createCallMutation.isError || (!joinLoading && !joinData?.success && roomName)) && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            {createCallMutation.error?.message || 'Failed to connect to call'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
