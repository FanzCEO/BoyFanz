/**
 * Fanz LiveKit Service Client
 * Connects to self-hosted LiveKit microservice for real-time video/audio
 */

interface LivestreamResponse {
  room_name: string;
  creator_token: string;
  livekit_url: string;
  ingress: {
    ingress_id: string;
    stream_key: string;
    url: string;
    input_type: string;
  };
  viewer_url: string;
}

interface VideoCallResponse {
  room_name: string;
  caller_token: string;
  callee_token: string;
  livekit_url: string;
}

interface ViewerTokenResponse {
  token: string;
  livekit_url: string;
  room_name: string;
}

interface TokenResponse {
  token: string;
  url: string;
  room_name: string;
  participant_identity: string;
  expires_in: number;
}

interface Room {
  sid: string;
  name: string;
  empty_timeout: number;
  max_participants: number;
  creation_time: string;
  num_participants: number;
  metadata: string;
}

interface LiveKitClientOptions {
  baseUrl?: string;
  apiKey?: string;
  platformId?: string;
  timeout?: number;
}

class LiveKitService {
  private baseUrl: string;
  private apiKey: string;
  private platformId: string;
  private timeout: number;

  constructor(options: LiveKitClientOptions = {}) {
    this.baseUrl = options.baseUrl || process.env.LIVEKIT_SERVICE_URL || 'http://localhost:8118';
    this.apiKey = options.apiKey || process.env.LIVEKIT_SERVICE_API_KEY || '';
    this.platformId = options.platformId || process.env.PLATFORM_ID || 'boyfanz';
    this.timeout = options.timeout || 30000;
  }

  /**
   * Check if the LiveKit service is healthy
   */
  async health(): Promise<{ status: string; service: string; livekit_url: string }> {
    const response = await fetch(`${this.baseUrl}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    return response.json();
  }

  /**
   * Generate a generic LiveKit access token
   */
  async generateToken(params: {
    roomName: string;
    participantIdentity: string;
    participantName: string;
    roomType?: 'livestream' | 'video_call' | 'group_call' | 'event';
    canPublish?: boolean;
    canSubscribe?: boolean;
    ttl?: number;
  }): Promise<TokenResponse> {
    const response = await fetch(`${this.baseUrl}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({
        room_name: params.roomName,
        participant_identity: params.participantIdentity,
        participant_name: params.participantName,
        room_type: params.roomType || 'livestream',
        can_publish: params.canPublish ?? true,
        can_subscribe: params.canSubscribe ?? true,
        ttl: params.ttl || 3600,
      }),
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Token generation failed' }));
      throw new Error(error.detail || `LiveKit token generation failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Create a new livestream for a creator
   */
  async createLivestream(params: {
    creatorId: string;
    title: string;
    description?: string;
  }): Promise<LivestreamResponse> {
    const queryParams = new URLSearchParams({
      creator_id: params.creatorId,
      title: params.title,
    });
    if (params.description) queryParams.append('description', params.description);

    const response = await fetch(
      `${this.baseUrl}/platforms/${this.platformId}/livestream?${queryParams}`,
      {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
        },
        signal: AbortSignal.timeout(this.timeout),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Livestream creation failed' }));
      throw new Error(error.detail || `Livestream creation failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Create a video call between two users
   */
  async createVideoCall(params: {
    callerId: string;
    calleeId: string;
  }): Promise<VideoCallResponse> {
    const queryParams = new URLSearchParams({
      caller_id: params.callerId,
      callee_id: params.calleeId,
    });

    const response = await fetch(
      `${this.baseUrl}/platforms/${this.platformId}/video-call?${queryParams}`,
      {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
        },
        signal: AbortSignal.timeout(this.timeout),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Video call creation failed' }));
      throw new Error(error.detail || `Video call creation failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get a viewer token for watching a livestream
   */
  async getViewerToken(params: {
    roomName: string;
    viewerId: string;
    viewerName: string;
  }): Promise<ViewerTokenResponse> {
    const queryParams = new URLSearchParams({
      room_name: params.roomName,
      viewer_id: params.viewerId,
      viewer_name: params.viewerName,
    });

    const response = await fetch(
      `${this.baseUrl}/platforms/${this.platformId}/viewer-token?${queryParams}`,
      {
        headers: {
          'X-API-Key': this.apiKey,
        },
        signal: AbortSignal.timeout(this.timeout),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Viewer token failed' }));
      throw new Error(error.detail || `Viewer token generation failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * List all active rooms
   */
  async listRooms(): Promise<{ rooms: Room[] }> {
    const response = await fetch(`${this.baseUrl}/rooms`, {
      headers: {
        'X-API-Key': this.apiKey,
      },
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'List rooms failed' }));
      throw new Error(error.detail || `List rooms failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get details of a specific room
   */
  async getRoom(roomName: string): Promise<{ room: Room }> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomName}`, {
      headers: {
        'X-API-Key': this.apiKey,
      },
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Get room failed' }));
      throw new Error(error.detail || `Get room failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Delete/end a room
   */
  async deleteRoom(roomName: string): Promise<{ success: boolean; room_name: string }> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomName}`, {
      method: 'DELETE',
      headers: {
        'X-API-Key': this.apiKey,
      },
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Delete room failed' }));
      throw new Error(error.detail || `Delete room failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get room participants
   */
  async getRoomParticipants(roomName: string): Promise<{ participants: any[] }> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomName}/participants`, {
      headers: {
        'X-API-Key': this.apiKey,
      },
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Get participants failed' }));
      throw new Error(error.detail || `Get participants failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Remove a participant from a room
   */
  async removeParticipant(roomName: string, participantIdentity: string): Promise<{ success: boolean }> {
    const response = await fetch(
      `${this.baseUrl}/rooms/${roomName}/participants/${participantIdentity}`,
      {
        method: 'DELETE',
        headers: {
          'X-API-Key': this.apiKey,
        },
        signal: AbortSignal.timeout(this.timeout),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Remove participant failed' }));
      throw new Error(error.detail || `Remove participant failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Start recording a room
   */
  async startRecording(roomName: string): Promise<{ egress_id: string; status: string }> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomName}/record`, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
      },
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Start recording failed' }));
      throw new Error(error.detail || `Start recording failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Stop a recording
   */
  async stopRecording(egressId: string): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/egress/${egressId}`, {
      method: 'DELETE',
      headers: {
        'X-API-Key': this.apiKey,
      },
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Stop recording failed' }));
      throw new Error(error.detail || `Stop recording failed: ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const livekitService = new LiveKitService();

// Export class for custom configuration
export { LiveKitService, LivestreamResponse, VideoCallResponse, ViewerTokenResponse, TokenResponse, Room, LiveKitClientOptions };
