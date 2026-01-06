/**
 * Live Streaming Service
 * Comprehensive WebRTC/HLS live streaming with real-time features,
 * tip integration, recording, and interactive toy control via Lovense
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';
import { logger } from '../logger';

interface StreamConfig {
  maxBitrate: number;           // Max video bitrate in kbps
  minBitrate: number;           // Min video bitrate in kbps
  maxResolution: '4k' | '1080p' | '720p' | '480p';
  enableRecording: boolean;
  recordingQuality: 'high' | 'medium' | 'low';
  maxViewers: number;
  enableChat: boolean;
  enableTips: boolean;
  enableLovense: boolean;
  lowLatencyMode: boolean;
  adaptiveBitrate: boolean;
}

interface StreamSession {
  streamId: string;
  creatorId: string;
  creatorUsername: string;
  title: string;
  description?: string;
  category?: string;
  tags: string[];
  thumbnailUrl?: string;
  status: 'preparing' | 'live' | 'paused' | 'ended' | 'error';
  startedAt?: Date;
  endedAt?: Date;
  viewerCount: number;
  peakViewerCount: number;
  totalViews: number;
  totalTips: number;
  totalTipAmount: number;
  isPrivate: boolean;
  isPPV: boolean;
  ppvPrice?: number;
  recordingUrl?: string;
  lovenseEnabled: boolean;
  lovenseConnected: boolean;
  rtmpUrl?: string;
  hlsUrl?: string;
  webrtcOffer?: string;
  chatEnabled: boolean;
  tipsEnabled: boolean;
  config: StreamConfig;
}

interface Viewer {
  oderId: string;
  username: string;
  joinedAt: Date;
  lastActivity: Date;
  tipsSent: number;
  tipAmountSent: number;
  isSubscriber: boolean;
  isVIP: boolean;
  isModerator: boolean;
  isBanned: boolean;
  lovenseConnected: boolean;
  lovenseToyId?: string;
}

interface TipEvent {
  tipId: string;
  streamId: string;
  senderId: string;
  senderUsername: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
  lovenseAction?: {
    intensity: number;
    duration: number;
    pattern?: string;
  };
  timestamp: Date;
}

interface ChatMessage {
  messageId: string;
  streamId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  type: 'text' | 'tip' | 'system' | 'lovense';
  isHighlighted: boolean;
  isPinned: boolean;
  timestamp: Date;
}

interface StreamAnalytics {
  streamId: string;
  duration: number;
  avgViewers: number;
  peakViewers: number;
  totalTips: number;
  totalRevenue: number;
  chatMessages: number;
  lovenseInteractions: number;
  qualityMetrics: {
    avgBitrate: number;
    bufferingEvents: number;
    avgLatency: number;
  };
}

const DEFAULT_CONFIG: StreamConfig = {
  maxBitrate: 6000,
  minBitrate: 500,
  maxResolution: '1080p',
  enableRecording: true,
  recordingQuality: 'high',
  maxViewers: 10000,
  enableChat: true,
  enableTips: true,
  enableLovense: true,
  lowLatencyMode: true,
  adaptiveBitrate: true
};

class LiveStreamingService extends EventEmitter {
  private streams: Map<string, StreamSession> = new Map();
  private viewers: Map<string, Map<string, Viewer>> = new Map();
  private chatHistory: Map<string, ChatMessage[]> = new Map();
  private tipHistory: Map<string, TipEvent[]> = new Map();
  private bunnyStreamApiKey: string;
  private bunnyStreamLibraryId: string;
  private lovenseApiToken: string;
  private lovenseCallbackUrl: string;

  constructor() {
    super();
    this.bunnyStreamApiKey = process.env.BUNNY_STREAM_API_KEY || '';
    this.bunnyStreamLibraryId = process.env.BUNNY_STREAM_LIBRARY_ID || '';
    this.lovenseApiToken = process.env.LOVENSE_DEVELOPER_TOKEN || '';
    this.lovenseCallbackUrl = process.env.LOVENSE_CALLBACK_URL || '';

    // Cleanup ended streams periodically
    setInterval(() => this.cleanupEndedStreams(), 60 * 60 * 1000);

    logger.info('LiveStreamingService initialized', {
      bunnyConfigured: !!this.bunnyStreamApiKey,
      lovenseConfigured: !!this.lovenseApiToken
    });
  }

  /**
   * Create a new live stream
   */
  async createStream(params: {
    creatorId: string;
    creatorUsername: string;
    title: string;
    description?: string;
    category?: string;
    tags?: string[];
    isPrivate?: boolean;
    isPPV?: boolean;
    ppvPrice?: number;
    enableLovense?: boolean;
    config?: Partial<StreamConfig>;
  }): Promise<{
    streamId: string;
    rtmpUrl: string;
    streamKey: string;
    playbackUrl: string;
    webrtcUrl: string;
  }> {
    const streamId = this.generateStreamId();
    const streamKey = this.generateStreamKey();

    const session: StreamSession = {
      streamId,
      creatorId: params.creatorId,
      creatorUsername: params.creatorUsername,
      title: params.title,
      description: params.description,
      category: params.category,
      tags: params.tags || [],
      status: 'preparing',
      viewerCount: 0,
      peakViewerCount: 0,
      totalViews: 0,
      totalTips: 0,
      totalTipAmount: 0,
      isPrivate: params.isPrivate || false,
      isPPV: params.isPPV || false,
      ppvPrice: params.ppvPrice,
      lovenseEnabled: params.enableLovense ?? true,
      lovenseConnected: false,
      chatEnabled: true,
      tipsEnabled: true,
      config: { ...DEFAULT_CONFIG, ...params.config }
    };

    // Create stream on Bunny Stream (if configured)
    let rtmpUrl = `rtmp://live.bunny.net/live/${streamKey}`;
    let hlsUrl = '';
    let webrtcUrl = '';

    if (this.bunnyStreamApiKey && this.bunnyStreamLibraryId) {
      try {
        const bunnyStream = await this.createBunnyStream(streamId, params.title);
        rtmpUrl = bunnyStream.rtmpUrl;
        hlsUrl = bunnyStream.hlsUrl;
        session.rtmpUrl = rtmpUrl;
        session.hlsUrl = hlsUrl;
      } catch (error) {
        logger.error('Failed to create Bunny stream:', error);
      }
    }

    // Generate WebRTC signaling URL
    webrtcUrl = `/api/stream/${streamId}/webrtc`;

    this.streams.set(streamId, session);
    this.viewers.set(streamId, new Map());
    this.chatHistory.set(streamId, []);
    this.tipHistory.set(streamId, []);

    this.emit('stream:created', { streamId, creatorId: params.creatorId });

    logger.info(`Stream created: ${streamId}`, {
      creator: params.creatorUsername,
      title: params.title
    });

    return {
      streamId,
      rtmpUrl,
      streamKey,
      playbackUrl: hlsUrl || `/api/stream/${streamId}/playlist.m3u8`,
      webrtcUrl
    };
  }

  /**
   * Start the stream (go live)
   */
  async startStream(streamId: string): Promise<boolean> {
    const stream = this.streams.get(streamId);
    if (!stream) throw new Error('Stream not found');

    stream.status = 'live';
    stream.startedAt = new Date();

    this.emit('stream:started', { streamId, startedAt: stream.startedAt });

    // Send system chat message
    await this.sendChatMessage(streamId, {
      senderId: 'system',
      senderUsername: 'System',
      content: `${stream.creatorUsername} is now live!`,
      type: 'system'
    });

    logger.info(`Stream started: ${streamId}`);
    return true;
  }

  /**
   * End the stream
   */
  async endStream(streamId: string): Promise<StreamAnalytics> {
    const stream = this.streams.get(streamId);
    if (!stream) throw new Error('Stream not found');

    stream.status = 'ended';
    stream.endedAt = new Date();

    const analytics = this.calculateAnalytics(streamId);

    this.emit('stream:ended', { streamId, analytics });

    // Send system chat message
    await this.sendChatMessage(streamId, {
      senderId: 'system',
      senderUsername: 'System',
      content: 'Stream has ended. Thank you for watching!',
      type: 'system'
    });

    logger.info(`Stream ended: ${streamId}`, { analytics });
    return analytics;
  }

  /**
   * Join stream as viewer
   */
  async joinStream(streamId: string, viewerData: {
    oderId: string;
    username: string;
    isSubscriber?: boolean;
    isVIP?: boolean;
    isModerator?: boolean;
  }): Promise<{
    success: boolean;
    playbackUrl: string;
    chatHistory: ChatMessage[];
    viewerCount: number;
  }> {
    const stream = this.streams.get(streamId);
    if (!stream) throw new Error('Stream not found');
    if (stream.status !== 'live') throw new Error('Stream is not live');

    const viewers = this.viewers.get(streamId)!;

    // Check if already viewing
    if (!viewers.has(viewerData.oderId)) {
      stream.totalViews++;
    }

    const viewer: Viewer = {
      oderId: viewerData.oderId,
      username: viewerData.username,
      joinedAt: new Date(),
      lastActivity: new Date(),
      tipsSent: 0,
      tipAmountSent: 0,
      isSubscriber: viewerData.isSubscriber || false,
      isVIP: viewerData.isVIP || false,
      isModerator: viewerData.isModerator || false,
      isBanned: false,
      lovenseConnected: false
    };

    viewers.set(viewerData.oderId, viewer);
    stream.viewerCount = viewers.size;
    stream.peakViewerCount = Math.max(stream.peakViewerCount, stream.viewerCount);

    this.emit('viewer:joined', { streamId, viewer });

    // Get recent chat history
    const chatHistory = (this.chatHistory.get(streamId) || []).slice(-100);

    return {
      success: true,
      playbackUrl: stream.hlsUrl || `/api/stream/${streamId}/playlist.m3u8`,
      chatHistory,
      viewerCount: stream.viewerCount
    };
  }

  /**
   * Leave stream
   */
  async leaveStream(streamId: string, oderId: string): Promise<void> {
    const stream = this.streams.get(streamId);
    const viewers = this.viewers.get(streamId);

    if (stream && viewers) {
      viewers.delete(oderId);
      stream.viewerCount = viewers.size;
      this.emit('viewer:left', { streamId, oderId });
    }
  }

  /**
   * Send a tip
   */
  async sendTip(streamId: string, tipData: {
    senderId: string;
    senderUsername: string;
    amount: number;
    message?: string;
    isAnonymous?: boolean;
    lovenseIntensity?: number;
    lovenseDuration?: number;
    lovensePattern?: string;
  }): Promise<TipEvent> {
    const stream = this.streams.get(streamId);
    if (!stream) throw new Error('Stream not found');
    if (!stream.tipsEnabled) throw new Error('Tips are disabled for this stream');

    const tipId = `tip_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const tip: TipEvent = {
      tipId,
      streamId,
      senderId: tipData.senderId,
      senderUsername: tipData.senderUsername,
      amount: tipData.amount,
      message: tipData.message,
      isAnonymous: tipData.isAnonymous || false,
      timestamp: new Date()
    };

    // Add Lovense action if enabled and specified
    if (stream.lovenseEnabled && stream.lovenseConnected && tipData.lovenseIntensity) {
      tip.lovenseAction = {
        intensity: Math.min(20, Math.max(0, tipData.lovenseIntensity)),
        duration: tipData.lovenseDuration || this.calculateDurationFromAmount(tipData.amount),
        pattern: tipData.lovensePattern
      };

      // Trigger Lovense
      await this.triggerLovense(stream.creatorId, tip.lovenseAction);
    }

    // Update stats
    stream.totalTips++;
    stream.totalTipAmount += tipData.amount;

    const tipHistory = this.tipHistory.get(streamId)!;
    tipHistory.push(tip);

    // Update viewer stats
    const viewers = this.viewers.get(streamId);
    const viewer = viewers?.get(tipData.senderId);
    if (viewer) {
      viewer.tipsSent++;
      viewer.tipAmountSent += tipData.amount;
    }

    // Send tip notification to chat
    await this.sendChatMessage(streamId, {
      senderId: tipData.senderId,
      senderUsername: tipData.isAnonymous ? 'Anonymous' : tipData.senderUsername,
      content: `sent a $${tipData.amount.toFixed(2)} tip!${tipData.message ? ` "${tipData.message}"` : ''}`,
      type: 'tip',
      isHighlighted: tipData.amount >= 10
    });

    this.emit('tip:received', { streamId, tip });

    logger.info(`Tip received: ${tipId}`, {
      amount: tipData.amount,
      hasLovense: !!tip.lovenseAction
    });

    return tip;
  }

  /**
   * Send chat message
   */
  async sendChatMessage(streamId: string, messageData: {
    senderId: string;
    senderUsername: string;
    content: string;
    type?: 'text' | 'tip' | 'system' | 'lovense';
    isHighlighted?: boolean;
  }): Promise<ChatMessage> {
    const stream = this.streams.get(streamId);
    if (!stream) throw new Error('Stream not found');
    if (!stream.chatEnabled && messageData.type !== 'system') {
      throw new Error('Chat is disabled for this stream');
    }

    // Check if user is banned
    const viewers = this.viewers.get(streamId);
    const viewer = viewers?.get(messageData.senderId);
    if (viewer?.isBanned) {
      throw new Error('You are banned from this chat');
    }

    const message: ChatMessage = {
      messageId: `msg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      streamId,
      senderId: messageData.senderId,
      senderUsername: messageData.senderUsername,
      content: this.sanitizeChatMessage(messageData.content),
      type: messageData.type || 'text',
      isHighlighted: messageData.isHighlighted || false,
      isPinned: false,
      timestamp: new Date()
    };

    const chatHistory = this.chatHistory.get(streamId)!;
    chatHistory.push(message);

    // Keep only last 1000 messages in memory
    if (chatHistory.length > 1000) {
      chatHistory.shift();
    }

    this.emit('chat:message', { streamId, message });

    return message;
  }

  /**
   * Connect Lovense for creator
   */
  async connectLovense(creatorId: string): Promise<{
    qrCodeUrl: string;
    pairingCode: string;
  }> {
    if (!this.lovenseApiToken) {
      throw new Error('Lovense not configured');
    }

    const userToken = crypto.createHash('sha256')
      .update(`${creatorId}_${Date.now()}`)
      .digest('hex');

    try {
      const response = await fetch('https://api.lovense.com/api/lan/getQrCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: this.lovenseApiToken,
          uid: creatorId,
          uname: creatorId,
          utoken: userToken
        })
      });

      const data = await response.json();

      if (data.code !== 0) {
        throw new Error(data.message || 'Failed to get Lovense QR code');
      }

      return {
        qrCodeUrl: data.data.qr,
        pairingCode: data.data.code
      };

    } catch (error) {
      logger.error('Failed to connect Lovense:', error);
      throw error;
    }
  }

  /**
   * Handle Lovense callback (toy connected)
   */
  async handleLovenseCallback(data: {
    uid: string;
    domain: string;
    httpPort: number;
    httpsPort: number;
    toys: Array<{ id: string; name: string; type: string; status: number }>;
  }): Promise<void> {
    // Find active stream for this user
    for (const [streamId, stream] of this.streams) {
      if (stream.creatorId === data.uid && stream.status === 'live') {
        stream.lovenseConnected = true;

        this.emit('lovense:connected', {
          streamId,
          creatorId: data.uid,
          toys: data.toys
        });

        // Send system message
        await this.sendChatMessage(streamId, {
          senderId: 'system',
          senderUsername: 'System',
          content: '💕 Interactive toy connected! Tips will trigger vibrations.',
          type: 'lovense'
        });

        logger.info(`Lovense connected for stream ${streamId}`, { toys: data.toys.length });
        break;
      }
    }
  }

  /**
   * Trigger Lovense vibration/action
   */
  async triggerLovense(creatorId: string, action: {
    intensity: number;
    duration: number;
    pattern?: string;
  }): Promise<boolean> {
    if (!this.lovenseApiToken) return false;

    try {
      const command: any = {
        token: this.lovenseApiToken,
        uid: creatorId,
        command: action.pattern ? 'Pattern' : 'Function',
        apiVer: 1
      };

      if (action.pattern) {
        // Preset pattern
        command.name = action.pattern;
        command.timeSec = action.duration;
      } else {
        // Direct vibration
        command.action = `Vibrate:${action.intensity}`;
        command.timeSec = action.duration;
      }

      const response = await fetch('https://api.lovense.com/api/lan/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command)
      });

      const data = await response.json();

      if (data.code !== 200) {
        logger.warn('Lovense command failed:', data);
        return false;
      }

      this.emit('lovense:triggered', { creatorId, action });
      return true;

    } catch (error) {
      logger.error('Failed to trigger Lovense:', error);
      return false;
    }
  }

  /**
   * Get stream info
   */
  getStream(streamId: string): StreamSession | null {
    return this.streams.get(streamId) || null;
  }

  /**
   * Get live streams
   */
  getLiveStreams(options?: {
    category?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'viewers' | 'tips' | 'recent';
  }): StreamSession[] {
    let streams = Array.from(this.streams.values())
      .filter(s => s.status === 'live' && !s.isPrivate);

    if (options?.category) {
      streams = streams.filter(s => s.category === options.category);
    }

    // Sort
    switch (options?.sortBy) {
      case 'viewers':
        streams.sort((a, b) => b.viewerCount - a.viewerCount);
        break;
      case 'tips':
        streams.sort((a, b) => b.totalTipAmount - a.totalTipAmount);
        break;
      case 'recent':
      default:
        streams.sort((a, b) => (b.startedAt?.getTime() || 0) - (a.startedAt?.getTime() || 0));
    }

    const offset = options?.offset || 0;
    const limit = options?.limit || 20;

    return streams.slice(offset, offset + limit);
  }

  /**
   * Create stream on Bunny.net
   */
  private async createBunnyStream(streamId: string, title: string): Promise<{
    rtmpUrl: string;
    hlsUrl: string;
    videoId: string;
  }> {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${this.bunnyStreamLibraryId}/videos`,
      {
        method: 'POST',
        headers: {
          'AccessKey': this.bunnyStreamApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          collectionId: 'live-streams'
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create Bunny stream: ${response.status}`);
    }

    const data = await response.json();

    return {
      rtmpUrl: `rtmp://live.bunny.net/live/${data.guid}`,
      hlsUrl: `https://video.bunnycdn.com/play/${this.bunnyStreamLibraryId}/${data.guid}`,
      videoId: data.guid
    };
  }

  /**
   * Calculate Lovense duration from tip amount
   */
  private calculateDurationFromAmount(amount: number): number {
    // $1 = 3 seconds, $5 = 10 seconds, $10 = 20 seconds, etc.
    if (amount < 1) return 1;
    if (amount < 5) return Math.round(amount * 3);
    if (amount < 10) return Math.round(amount * 2);
    return Math.min(60, Math.round(amount * 1.5)); // Max 60 seconds
  }

  /**
   * Sanitize chat message
   */
  private sanitizeChatMessage(content: string): string {
    return content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/https?:\/\/\S+/gi, '[link]') // Replace URLs
      .substring(0, 500); // Limit length
  }

  /**
   * Calculate stream analytics
   */
  private calculateAnalytics(streamId: string): StreamAnalytics {
    const stream = this.streams.get(streamId)!;
    const tips = this.tipHistory.get(streamId) || [];
    const chat = this.chatHistory.get(streamId) || [];

    const duration = stream.endedAt && stream.startedAt
      ? (stream.endedAt.getTime() - stream.startedAt.getTime()) / 1000
      : 0;

    const lovenseInteractions = tips.filter(t => t.lovenseAction).length;

    return {
      streamId,
      duration,
      avgViewers: Math.round(stream.totalViews / Math.max(1, duration / 60)),
      peakViewers: stream.peakViewerCount,
      totalTips: stream.totalTips,
      totalRevenue: stream.totalTipAmount,
      chatMessages: chat.length,
      lovenseInteractions,
      qualityMetrics: {
        avgBitrate: 0,
        bufferingEvents: 0,
        avgLatency: 0
      }
    };
  }

  /**
   * Generate stream ID
   */
  private generateStreamId(): string {
    return `stream_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
  }

  /**
   * Generate stream key
   */
  private generateStreamKey(): string {
    return `sk_${crypto.randomBytes(16).toString('hex')}`;
  }

  /**
   * Cleanup ended streams (keep for 24 hours)
   */
  private cleanupEndedStreams(): void {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    let cleaned = 0;

    for (const [streamId, stream] of this.streams) {
      if (stream.status === 'ended' && stream.endedAt && stream.endedAt.getTime() < cutoff) {
        this.streams.delete(streamId);
        this.viewers.delete(streamId);
        this.chatHistory.delete(streamId);
        this.tipHistory.delete(streamId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`Cleaned up ${cleaned} old streams`);
    }
  }
}

// Export singleton
export const liveStreamingService = new LiveStreamingService();
export { LiveStreamingService, StreamSession, TipEvent, ChatMessage, StreamAnalytics };
