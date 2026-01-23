/**
 * LiveKit Livestream Room Component
 * Provides a full-featured livestream room for creators and viewers
 */

import { useState, useEffect } from 'react';
import {
  LiveKitRoom,
  VideoTrack,
  AudioTrack,
  useTracks,
  useParticipants,
  useRoomInfo,
  RoomAudioRenderer,
  ControlBar,
  Chat,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Radio, Settings, MessageSquare, X } from 'lucide-react';

interface LivestreamRoomProps {
  token: string;
  serverUrl: string;
  roomName: string;
  isCreator: boolean;
  onLeave?: () => void;
  streamTitle?: string;
  creatorName?: string;
}

function LivestreamStage() {
  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone, Track.Source.ScreenShare]);
  const videoTrack = tracks.find(t => t.source === Track.Source.Camera || t.source === Track.Source.ScreenShare);

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      {videoTrack ? (
        <VideoTrack trackRef={videoTrack} className="w-full h-full object-contain" />
      ) : (
        <div className="flex items-center justify-center h-full text-white/50">
          <div className="text-center">
            <Radio className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <p>Waiting for stream...</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ViewerCount() {
  const participants = useParticipants();
  const viewerCount = Math.max(0, participants.length - 1); // Exclude streamer

  return (
    <Badge variant="secondary" className="flex items-center gap-1">
      <Users className="w-3 h-3" />
      {viewerCount} watching
    </Badge>
  );
}

function StreamInfo({ title, creatorName }: { title?: string; creatorName?: string }) {
  const room = useRoomInfo();

  return (
    <div className="flex items-center gap-4">
      <Badge variant="destructive" className="flex items-center gap-1">
        <Radio className="w-3 h-3 animate-pulse" />
        LIVE
      </Badge>
      <div>
        <h2 className="font-semibold">{title || room.name}</h2>
        {creatorName && <p className="text-sm text-muted-foreground">@{creatorName}</p>}
      </div>
    </div>
  );
}

export function LivestreamRoom({
  token,
  serverUrl,
  roomName,
  isCreator,
  onLeave,
  streamTitle,
  creatorName,
}: LivestreamRoomProps) {
  const [showChat, setShowChat] = useState(true);

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      audio={isCreator}
      video={isCreator}
      onDisconnected={onLeave}
      data-lk-theme="default"
      className="h-full"
    >
      <div className="flex flex-col lg:flex-row h-full gap-4">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Stream Header */}
          <div className="flex items-center justify-between">
            <StreamInfo title={streamTitle} creatorName={creatorName} />
            <div className="flex items-center gap-2">
              <ViewerCount />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowChat(!showChat)}
                className="lg:hidden"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onLeave}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Video Stage */}
          <div className="flex-1">
            <LivestreamStage />
          </div>

          {/* Creator Controls */}
          {isCreator && (
            <Card>
              <CardContent className="p-4">
                <ControlBar
                  variation="minimal"
                  controls={{
                    camera: true,
                    microphone: true,
                    screenShare: true,
                    leave: true,
                    settings: true,
                  }}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <Card className="w-full lg:w-80 flex flex-col">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Live Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <Chat className="h-full" />
            </CardContent>
          </Card>
        )}
      </div>

      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

export default LivestreamRoom;
