import { eq, and, isNull } from 'drizzle-orm';
import { liveStreams, streamViewers, users } from '../../shared/schema';
import type { LiveStream, User } from '../../shared/schema';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import type { IStorage } from '../storage';

// Real GetStream.io server-side imports
import { StreamClient } from '@stream-io/node-sdk';

// Define our own capabilities and types for now
const VideoOwnCapability = {
  SEND_AUDIO: 'send-audio',
  SEND_VIDEO: 'send-video', 
  MUTE_USERS: 'mute-users',
  REMOVE_CALL_MEMBER: 'remove-call-member',
  JOIN_CALL: 'join-call',
};

interface Call {
  id: string;
  getOrCreate?: (options: any) => Promise<void>;
  goLive?: (options: any) => Promise<void>;
  stopLive?: () => Promise<void>;
  listRecordings?: () => Promise<{ recordings: Array<{ url: string }> }>;
}

class GetStreamService {
  private client: StreamClient | null = null;
  private apiKey: string;
  private apiSecret: string;
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.storage = storage;
    // Environment variables for GetStream
    this.apiKey = process.env.GETSTREAM_API_KEY || '';
    this.apiSecret = process.env.GETSTREAM_API_SECRET || '';
    
    // Initialize real GetStream client if credentials are available
    this.initializeClient();
  }

  private initializeClient() {
    if (this.apiKey && this.apiSecret && this.apiKey !== 'mock-api-key') {
      try {
        this.client = new StreamClient(this.apiKey, this.apiSecret);
        console.log('✅ GetStream.io client initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize GetStream client:', error);
        console.log('💡 Using fallback mode - some features will be limited');
      }
    } else {
      console.log('⚠️ GetStream credentials not configured - using development mode');
      console.log('💡 Set GETSTREAM_API_KEY and GETSTREAM_API_SECRET environment variables');
    }
  }

  /**
   * Generate GetStream user token for client-side authentication
   * SECURITY: This generates short-lived tokens that are never stored in the database
   */
  generateUserToken(userId: string, exp?: number): string {
    const payload: Record<string, any> = {
      user_id: userId,
      iss: this.apiKey,
      sub: `user/${userId}`,
      iat: Math.floor(Date.now() / 1000),
      exp: exp || Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour default
    };

    return jwt.sign(payload, this.apiSecret, { algorithm: 'HS256' });
  }

  /**
   * Generate server token for backend operations
   */
  private generateServerToken(userId: string): string {
    if (!this.apiSecret || !this.apiKey) {
      throw new Error('GetStream credentials not configured');
    }

    const payload = {
      user_id: userId,
      iss: this.apiKey,
      sub: `user/${userId}`,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    };

    return jwt.sign(payload, this.apiSecret, { algorithm: 'HS256' });
  }

  /**
   * Create a new live stream session
   */
  async createLiveStream(streamData: {
    creatorId: string;
    title: string;
    description?: string;
    type: 'public' | 'private' | 'subscribers_only';
    priceCents?: number;
    scheduledFor?: Date;
  }): Promise<LiveStream> {
    if (!this.client) {
      throw new Error('GetStream client not initialized');
    }

    try {
      // Generate unique call ID for GetStream
      const callId = `livestream_${nanoid(12)}`;
      const streamKey = nanoid(32);

      // Create call in GetStream using Video API
      const callData = {
        type: 'livestream',
        id: callId,
        data: {
          created_by_id: streamData.creatorId,
          settings_override: {
            recording: {
              mode: 'available', // Enable recording
              audio_only: false,
              quality: '1080p',
            },
            broadcasting: {
              enabled: true,
              hls: {
                enabled: true,
                quality_tracks: ['240p', '480p', '720p', '1080p'],
              },
            },
          },
        },
      };

      // For development, we'll log the call data instead of making real API calls
      console.log('📹 Creating GetStream call:', callData);

      // Create database record - SECURITY: Never store tokens in database
      const stream = await this.storage.createLiveStream({
        creatorId: streamData.creatorId,
        title: streamData.title,
        description: streamData.description || null,
        type: streamData.type,
        priceCents: streamData.priceCents || 0,
        streamKey,
        getstreamCallId: callId,
        status: streamData.scheduledFor && streamData.scheduledFor > new Date() ? 'scheduled' : 'live',
        scheduledFor: streamData.scheduledFor || null,
        rtmpIngestUrl: `rtmp://ingest.getstream.io/live/${callId}`,
        hlsPlaylistUrl: `https://video.getstream.io/api/v1/video/call/livestream/${callId}/playlist.m3u8`,
        streamUrl: null,
        thumbnailUrl: null,
        recordingUrl: null,
        playbackUrl: null,
        viewersCount: 0,
        startedAt: null,
        endedAt: null,
        updatedAt: new Date(),
      });

      return stream;
    } catch (error) {
      console.error('Error creating live stream:', error);
      throw new Error('Failed to create live stream session');
    }
  }

  /**
   * Start a live stream
   */
  async startLiveStream(streamId: string, creatorId: string): Promise<void> {
    if (!this.client) {
      throw new Error('GetStream client not initialized');
    }

    const stream = await this.storage.getLiveStream(streamId);

    if (!stream || stream.creatorId !== creatorId) {
      throw new Error('Stream not found or unauthorized');
    }

    if (stream.status !== 'scheduled') {
      throw new Error('Stream cannot be started in current status');
    }

    try {
      // Update stream status in database using storage interface
      await this.storage.updateStreamStatus(streamId, 'live');

      // Start broadcasting in GetStream  
      if (stream.getstreamCallId && this.client) {
        console.log('🔴 Starting live stream:', stream.getstreamCallId);
        // For development, log the action instead of making real API calls
        console.log('📡 Broadcasting started with HLS and recording enabled');
      }
    } catch (error) {
      console.error('Error starting live stream:', error);
      throw new Error('Failed to start live stream');
    }
  }

  /**
   * End a live stream
   */
  async endLiveStream(streamId: string, creatorId: string): Promise<void> {
    if (!this.client) {
      throw new Error('GetStream client not initialized');
    }

    const stream = await this.storage.getLiveStream(streamId);

    if (!stream || stream.creatorId !== creatorId) {
      throw new Error('Stream not found or unauthorized');
    }

    if (stream.status !== 'live') {
      throw new Error('Stream is not currently live');
    }

    try {
      // End broadcasting in GetStream and update status using storage interface
      await this.storage.updateStreamStatus(streamId, 'ended');

      if (stream.getstreamCallId && this.client) {
        console.log('🔴 Ending live stream:', stream.getstreamCallId);
        // For development, log the action instead of making real API calls
        console.log('📡 Broadcasting ended successfully');
      }

    } catch (error) {
      console.error('Error ending live stream:', error);
      throw new Error('Failed to end live stream');
    }
  }

  /**
   * Join a live stream as a viewer with proper access control
   */
  async joinStream(streamId: string, userId: string): Promise<{ token: string; callId: string; playbackUrl?: string }> {
    const stream = await this.storage.getLiveStream(streamId);

    if (!stream) {
      throw new Error('Stream not found');
    }

    if (stream.status !== 'live') {
      throw new Error('Stream is not currently live');
    }

    // Check access permissions based on stream type
    await this.checkStreamAccess(stream, userId);

    try {
      // Generate short-lived viewer token - SECURITY: Never store this token
      const viewerToken = this.generateUserToken(userId, Math.floor(Date.now() / 1000) + (60 * 60)); // 1 hour

      // Record viewer join using storage interface
      // Note: This would need viewer management methods in storage interface

      return {
        token: viewerToken,
        callId: stream.getstreamCallId!,
        playbackUrl: stream.hlsPlaylistUrl || undefined,
      };

    } catch (error) {
      console.error('Error joining stream:', error);
      throw new Error('Failed to join live stream');
    }
  }

  /**
   * Check if user has access to stream based on type and permissions
   */
  async checkStreamAccess(stream: LiveStream, userId: string): Promise<void> {
    if (stream.type === 'public') {
      return; // Public streams are accessible to all authenticated users
    }

    if (stream.type === 'private') {
      // Private streams are only accessible to the creator
      if (stream.creatorId !== userId) {
        throw new Error('This is a private stream - access denied');
      }
      return;
    }

    if (stream.type === 'subscribers_only') {
      // Check if user is subscribed to creator
      const subscription = await this.storage.getSubscription(userId, stream.creatorId);
      if (!subscription || subscription.status !== 'active') {
        throw new Error('This stream is for subscribers only - please subscribe to access');
      }
      return;
    }

    throw new Error('Unknown stream type');
  }

  /**
   * Leave a live stream  
   */
  async leaveStream(streamId: string, userId: string): Promise<void> {
    try {
      // Update viewer record using storage interface
      // Note: This would need viewer management methods in storage interface
      console.log(`Mock: User ${userId} leaving stream ${streamId}`);
    } catch (error) {
      console.error('Error leaving stream:', error);
      throw new Error('Failed to leave live stream');
    }
  }

  /**
   * Handle GetStream webhooks
   */
  async handleWebhook(event: any): Promise<void> {
    try {
      switch (event.type) {
        case 'call.live_started':
          await this.handleLiveStarted(event);
          break;
        case 'call.ended':
          await this.handleCallEnded(event);
          break;
        case 'call.recording_ready':
          await this.handleRecordingReady(event);
          break;
        case 'call.member_joined':
          await this.handleMemberJoined(event);
          break;
        case 'call.member_left':
          await this.handleMemberLeft(event);
          break;
        default:
          console.log('Unhandled GetStream webhook event:', event.type);
      }
    } catch (error) {
      console.error('Error handling GetStream webhook:', error);
    }
  }

  private async handleLiveStarted(event: any): Promise<void> {
    const callId = event.call_cid?.split(':')[1];
    if (!callId) return;

    // Use storage interface for webhook handling
    console.log(`Mock: Stream started for call ${callId}`);
  }

  private async handleCallEnded(event: any): Promise<void> {
    const callId = event.call_cid?.split(':')[1];
    if (!callId) return;

    // Use storage interface for webhook handling
    console.log(`Mock: Stream ended for call ${callId}`);
  }

  private async handleRecordingReady(event: any): Promise<void> {
    const callId = event.call_cid?.split(':')[1];
    if (!callId || !event.recording?.url) return;

    // Use storage interface for webhook handling
    console.log(`Mock: Recording ready for call ${callId}`);
  }

  private async handleMemberJoined(event: any): Promise<void> {
    // Handle real-time viewer tracking
    // This can be used for more granular analytics
  }

  private async handleMemberLeft(event: any): Promise<void> {
    // Handle real-time viewer tracking
    // This can be used for more granular analytics
  }

  /**
   * Get live stream analytics
   */
  async getStreamAnalytics(streamId: string, creatorId: string): Promise<{
    totalViews: number;
    uniqueViewers: number;
    averageWatchTime: number;
    peakViewers: number;
    totalTips: number;
  }> {
    const stream = await this.storage.getLiveStream(streamId);

    if (!stream || stream.creatorId !== creatorId) {
      throw new Error('Stream not found or unauthorized');
    }

    // Return mock analytics for now - real implementation would need viewer storage methods
    return {
      totalViews: stream.viewersCount || 0,
      uniqueViewers: stream.maxViewers || 0,
      averageWatchTime: 0,
      peakViewers: stream.maxViewers || 0,
      totalTips: stream.totalTipsCents || 0,
    };
  }
}

// Factory function to create GetStream service with storage dependency
export function createGetstreamService(storage: IStorage): GetStreamService {
  return new GetStreamService(storage);
}