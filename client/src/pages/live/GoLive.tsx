/**
 * Go Live Page - Create and manage livestreams
 * For creators to start streaming
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LivestreamRoom } from '@/components/livekit';
import {
  Radio,
  Video,
  Settings,
  Copy,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LivestreamData {
  room_name: string;
  creator_token: string;
  livekit_url: string;
  ingress: {
    ingress_id: string;
    stream_key: string;
    url: string;
  };
  viewer_url: string;
}

export default function GoLivePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [streamData, setStreamData] = useState<LivestreamData | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Check if LiveKit service is healthy
  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ['/api/livekit/health'],
    retry: 1,
  });

  // Create livestream mutation
  const createStreamMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/livekit/livestream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create livestream');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setStreamData(data);
      toast({
        title: 'Stream Created',
        description: 'Your livestream room is ready!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: `${label} copied to clipboard` });
  };

  const handleStartStream = () => {
    if (!title.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a title for your stream',
        variant: 'destructive',
      });
      return;
    }
    createStreamMutation.mutate();
  };

  const handleGoLive = () => {
    setIsStreaming(true);
  };

  const handleEndStream = () => {
    setIsStreaming(false);
    setStreamData(null);
    setTitle('');
    setDescription('');
    toast({ title: 'Stream Ended', description: 'Your livestream has ended' });
  };

  // Show streaming interface
  if (isStreaming && streamData) {
    return (
      <div className="h-screen">
        <LivestreamRoom
          token={streamData.creator_token}
          serverUrl={streamData.livekit_url}
          roomName={streamData.room_name}
          isCreator={true}
          streamTitle={title}
          onLeave={handleEndStream}
        />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center gap-3 mb-8">
        <Radio className="w-8 h-8 text-red-500" />
        <div>
          <h1 className="text-3xl font-bold">Go Live</h1>
          <p className="text-muted-foreground">Start streaming to your fans</p>
        </div>
      </div>

      {/* Health Status */}
      {healthLoading ? (
        <Alert className="mb-6">
          <Loader2 className="w-4 h-4 animate-spin" />
          <AlertDescription>Checking streaming service...</AlertDescription>
        </Alert>
      ) : healthData?.success ? (
        <Alert className="mb-6 border-green-500/50 bg-green-500/10">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <AlertDescription className="text-green-500">
            Streaming service is online and ready
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Streaming service is currently unavailable. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {!streamData ? (
        // Stream Setup Form
        <Card>
          <CardHeader>
            <CardTitle>Stream Setup</CardTitle>
            <CardDescription>
              Configure your livestream before going live
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Stream Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your stream about?"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers what to expect..."
                rows={3}
                maxLength={500}
              />
            </div>

            <Button
              onClick={handleStartStream}
              disabled={createStreamMutation.isPending || !healthData?.success}
              className="w-full"
              size="lg"
            >
              {createStreamMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Stream...
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 mr-2" />
                  Create Stream Room
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        // Stream Ready - Show options
        <div className="space-y-6">
          <Card className="border-green-500/50 bg-green-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-500">
                <CheckCircle className="w-5 h-5" />
                Stream Room Ready!
              </CardTitle>
              <CardDescription>
                Choose how you want to stream
              </CardDescription>
            </CardHeader>
          </Card>

          <Tabs defaultValue="browser" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browser">Browser (WebRTC)</TabsTrigger>
              <TabsTrigger value="obs">OBS / Streaming Software</TabsTrigger>
            </TabsList>

            <TabsContent value="browser">
              <Card>
                <CardHeader>
                  <CardTitle>Stream from Browser</CardTitle>
                  <CardDescription>
                    Use your webcam and microphone directly in the browser
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleGoLive} size="lg" className="w-full">
                    <Radio className="w-4 h-4 mr-2 animate-pulse" />
                    Go Live Now
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="obs">
              <Card>
                <CardHeader>
                  <CardTitle>Stream with OBS</CardTitle>
                  <CardDescription>
                    Use OBS Studio or other streaming software
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>RTMP Server URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={streamData.ingress.url || 'rtmp://livekit.fanz.website/live'}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(
                          streamData.ingress.url || 'rtmp://livekit.fanz.website/live',
                          'RTMP URL'
                        )}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Stream Key</Label>
                    <div className="flex gap-2">
                      <Input
                        value={streamData.ingress.stream_key}
                        readOnly
                        type="password"
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(streamData.ingress.stream_key, 'Stream Key')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Keep this secret! Don't share your stream key.
                    </p>
                  </div>

                  <Alert>
                    <Settings className="w-4 h-4" />
                    <AlertDescription>
                      In OBS: Go to Settings → Stream → Select "Custom" → Paste the URL and Stream Key
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Viewer Link */}
          <Card>
            <CardHeader>
              <CardTitle>Share Your Stream</CardTitle>
              <CardDescription>
                Send this link to your fans so they can watch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/live/watch/${streamData.room_name}`}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(
                    `${window.location.origin}/live/watch/${streamData.room_name}`,
                    'Viewer Link'
                  )}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(`/live/watch/${streamData.room_name}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cancel Button */}
          <Button
            variant="outline"
            onClick={() => setStreamData(null)}
            className="w-full"
          >
            Cancel and Start Over
          </Button>
        </div>
      )}
    </div>
  );
}
