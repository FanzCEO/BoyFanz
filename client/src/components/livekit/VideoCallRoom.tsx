/**
 * LiveKit Video Call Room Component
 * Provides 1-on-1 video call functionality
 */

import { useState, useCallback } from 'react';
import {
  LiveKitRoom,
  VideoTrack,
  useTracks,
  useParticipants,
  useLocalParticipant,
  RoomAudioRenderer,
  ControlBar,
  TrackToggle,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Settings } from 'lucide-react';

interface VideoCallRoomProps {
  token: string;
  serverUrl: string;
  roomName: string;
  onLeave?: () => void;
  otherParticipantName?: string;
}

function ParticipantVideo({ isLocal = false }: { isLocal?: boolean }) {
  const tracks = useTracks([Track.Source.Camera]);
  const localParticipant = useLocalParticipant();
  const participants = useParticipants();

  // Get the appropriate track
  const participant = isLocal
    ? localParticipant.localParticipant
    : participants.find(p => !p.isLocal);

  const videoTrack = tracks.find(t =>
    t.participant.identity === participant?.identity &&
    t.source === Track.Source.Camera
  );

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${isLocal ? 'w-32 h-24 absolute bottom-4 right-4 z-10' : 'w-full h-full'}`}>
      {videoTrack ? (
        <VideoTrack
          trackRef={videoTrack}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-2xl text-white">
              {participant?.name?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
        </div>
      )}
      {isLocal && (
        <Badge variant="secondary" className="absolute bottom-1 left-1 text-xs">
          You
        </Badge>
      )}
    </div>
  );
}

function CallControls({ onEndCall }: { onEndCall: () => void }) {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
      <Card className="bg-black/80 border-none">
        <CardContent className="p-2 flex items-center gap-2">
          <TrackToggle source={Track.Source.Microphone}>
            {({ enabled, toggle }) => (
              <Button
                variant={enabled ? "secondary" : "destructive"}
                size="icon"
                onClick={toggle}
                className="rounded-full"
              >
                {enabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
            )}
          </TrackToggle>

          <Button
            variant="destructive"
            size="icon"
            onClick={onEndCall}
            className="rounded-full w-14 h-14"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>

          <TrackToggle source={Track.Source.Camera}>
            {({ enabled, toggle }) => (
              <Button
                variant={enabled ? "secondary" : "destructive"}
                size="icon"
                onClick={toggle}
                className="rounded-full"
              >
                {enabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>
            )}
          </TrackToggle>
        </CardContent>
      </Card>
    </div>
  );
}

function WaitingForParticipant({ name }: { name?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-white">
      <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-4">
        <Phone className="w-12 h-12 animate-pulse" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Calling{name ? ` ${name}` : ''}...</h3>
      <p className="text-gray-400">Waiting for them to join</p>
    </div>
  );
}

export function VideoCallRoom({
  token,
  serverUrl,
  roomName,
  onLeave,
  otherParticipantName,
}: VideoCallRoomProps) {
  const [isConnected, setIsConnected] = useState(false);

  const handleConnected = useCallback(() => {
    setIsConnected(true);
  }, []);

  const handleDisconnected = useCallback(() => {
    setIsConnected(false);
    onLeave?.();
  }, [onLeave]);

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      audio={true}
      video={true}
      onConnected={handleConnected}
      onDisconnected={handleDisconnected}
      data-lk-theme="default"
      className="h-full"
    >
      <VideoCallContent
        onLeave={onLeave}
        otherParticipantName={otherParticipantName}
      />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function VideoCallContent({
  onLeave,
  otherParticipantName
}: {
  onLeave?: () => void;
  otherParticipantName?: string;
}) {
  const participants = useParticipants();
  const otherParticipant = participants.find(p => !p.isLocal);

  return (
    <div className="relative h-full bg-gray-900">
      {/* Main Video (other participant) */}
      <div className="absolute inset-0">
        {otherParticipant ? (
          <ParticipantVideo isLocal={false} />
        ) : (
          <WaitingForParticipant name={otherParticipantName} />
        )}
      </div>

      {/* Local Video (picture-in-picture) */}
      <ParticipantVideo isLocal={true} />

      {/* Call Controls */}
      <CallControls onEndCall={() => onLeave?.()} />
    </div>
  );
}

export default VideoCallRoom;
