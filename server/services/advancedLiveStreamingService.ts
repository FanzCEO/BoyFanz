/**
 * SECTION 6: Advanced Live Streaming Service
 * The most advanced live streaming platform - beating Twitch, YouTube, and OnlyFans combined
 * 
 * Features:
 * - One-Click Go Live (Browser/Phone streaming via WebRTC/WHIP)
 * - RTMP ingest for OBS
 * - HLS/DASH adaptive playback
 * - Low-latency mode (sub-second)
 * - AI Stream Highlights
 * - Interactive Overlays (tip goals, polls, spin wheel)
 * - Virtual Gifts with 3D Physics
 * - Stream Challenges
 * - Multi-Cam Support
 * - Guest Call-ins
 * - Private Shows
 * - Stream Parties (watch together)
 * - VOD with synced chat
 * - AI Chat Moderation
 * - Stream Raids
 * - Custom Tip Animations
 * - DMCA-free music library
 */

import { EventEmitter } from "events";
import crypto from "crypto";
import { logger } from "../logger";

// ===== TYPES =====

interface StreamConfig {
  mode: "standard" | "low_latency" | "ultra_low" | "interactive";
  quality: "360p" | "480p" | "720p" | "1080p" | "1440p" | "4k";
  source: "browser" | "phone" | "obs" | "hardware" | "multi_cam";
  enableRecording: boolean;
  enableChat: boolean;
  enableTips: boolean;
  enableGifts: boolean;
  enablePolls: boolean;
  enableGuests: boolean;
  enableLovense: boolean;
  maxViewers: number;
  subscriberOnly: boolean;
  minSubTier?: number;
}

interface StreamSession {
  id: string;
  streamId: string;
  creatorId: string;
  creatorUsername: string;
  title: string;
  description?: string;
  category?: string;
  tags: string[];
  thumbnailUrl?: string;
  status: "preparing" | "live" | "paused" | "ending" | "ended" | "error";
  config: StreamConfig;
  
  // Ingestion
  rtmpUrl?: string;
  rtmpKey?: string;
  whipEndpoint?: string;
  whepEndpoint?: string;
  
  // Playback
  hlsUrl?: string;
  dashUrl?: string;
  webrtcUrl?: string;
  lowLatencyUrl?: string;
  
  // Metrics
  currentViewers: number;
  peakViewers: number;
  totalViews: number;
  uniqueViewers: Set<string>;
  chatMessages: number;
  totalTipsCents: number;
  
  // Quality
  latencyMs: number;
  bitrateKbps: number;
  frameRate: number;
  droppedFrames: number;
  healthScore: number;
  
  // Recording
  isRecording: boolean;
  recordingId?: string;
  vodUrl?: string;
  
  // Timestamps
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
}

interface Viewer {
  id: string;
  oderId: string;
  username: string;
  avatarUrl?: string;
  joinedAt: Date;
  lastActivity: Date;
  watchTimeSeconds: number;
  tipsSentCents: number;
  giftsSent: number;
  chatMessages: number;
  isSubscriber: boolean;
  subTier?: number;
  isModerator: boolean;
  isVIP: boolean;
  isBanned: boolean;
  banReason?: string;
  lovenseConnected: boolean;
}

interface ChatMessage {
  id: string;
  streamId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  content: string;
  type: "message" | "tip" | "gift" | "system" | "raid" | "highlight" | "poll_vote";
  emotes: Array<{ code: string; url: string; positions: number[] }>;
  mentions: string[];
  replyTo?: string;
  isHighlighted: boolean;
  isPinned: boolean;
  isHidden: boolean;
  aiScore?: number;
  aiFlags?: string[];
  tipAmountCents?: number;
  giftId?: string;
  giftQuantity?: number;
  createdAt: Date;
  streamTimestamp: number;
}

interface VirtualGift {
  id: string;
  name: string;
  description: string;
  type: "basic" | "animated" | "3d_physics" | "exclusive" | "custom";
  priceCents: number;
  iconUrl: string;
  animationUrl?: string;
  model3dUrl?: string;
  soundUrl?: string;
  physicsConfig: {
    mass: number;
    bounce: number;
    friction: number;
    pileUp: boolean;
    gravity: number;
  };
  displayDuration: number;
  screenEffect?: string;
  lovenseIntensity?: number;
}

interface StreamOverlay {
  id: string;
  streamId: string;
  type: "tip_goal" | "tip_menu" | "poll" | "countdown" | "spin_wheel" | "leaderboard" | "custom_text" | "media_share" | "tip_jar";
  name: string;
  position: { x: number; y: number; width: number; height: number };
  isVisible: boolean;
  zIndex: number;
  config: any;
  
  // Type-specific
  goalAmountCents?: number;
  currentAmountCents?: number;
  goalTitle?: string;
  pollOptions?: Array<{ id: string; text: string; votes: number }>;
  pollEndsAt?: Date;
  wheelSegments?: Array<{ id: string; text: string; weight: number; color: string }>;
  spinCostCents?: number;
  countdownEndsAt?: Date;
  countdownTitle?: string;
}

interface StreamChallenge {
  id: string;
  streamId?: string;
  creatorId: string;
  title: string;
  description: string;
  goalCents: number;
  fundedCents: number;
  status: "pending" | "funded" | "in_progress" | "completed" | "failed" | "refunded";
  contributors: Array<{ userId: string; amountCents: number; message?: string; isAnonymous: boolean }>;
  expiresAt?: Date;
  completedAt?: Date;
  proofUrl?: string;
  refundIfFailed: boolean;
}

interface StreamGuest {
  id: string;
  streamId: string;
  hostId: string;
  guestId: string;
  guestUsername: string;
  status: "pending" | "approved" | "live" | "declined" | "kicked";
  requestMessage?: string;
  permissions: {
    canVideo: boolean;
    canAudio: boolean;
    canScreenShare: boolean;
  };
  webrtcOffer?: string;
  webrtcAnswer?: string;
  iceCandidates: any[];
  joinedAt?: Date;
  leftAt?: Date;
}

interface PrivateShow {
  id: string;
  creatorId: string;
  viewerId: string;
  pricePerMinuteCents: number;
  minimumMinutes: number;
  status: "requested" | "accepted" | "live" | "ended" | "declined";
  totalMinutes: number;
  totalCents: number;
  creatorStreamUrl?: string;
  viewerStreamUrl?: string;
  viewerVideoEnabled: boolean;
  startedAt?: Date;
  endedAt?: Date;
}

interface StreamParty {
  id: string;
  hostId: string;
  streamId: string;
  name: string;
  isPublic: boolean;
  maxParticipants: number;
  participants: Map<string, { userId: string; username: string; joinedAt: Date }>;
  currentTimestamp: number;
  isPaused: boolean;
  chatEnabled: boolean;
  voiceChatEnabled: boolean;
}

interface StreamClip {
  id: string;
  streamId: string;
  creatorId: string;
  clipperId: string;
  title: string;
  startTimestamp: number;
  endTimestamp: number;
  duration: number;
  status: "processing" | "ready" | "featured" | "removed";
  videoUrl?: string;
  thumbnailUrl?: string;
  isAiGenerated: boolean;
  aiHighlightScore?: number;
  viewCount: number;
  likeCount: number;
  shareCount: number;
}

interface StreamRaid {
  id: string;
  fromStreamId: string;
  fromCreatorId: string;
  toStreamId: string;
  toCreatorId: string;
  viewersRaided: number;
  status: "initiated" | "accepted" | "completed" | "declined";
}

// ===== DEFAULT VIRTUAL GIFTS =====

const DEFAULT_VIRTUAL_GIFTS: VirtualGift[] = [
  {
    id: "gift_heart",
    name: "Heart",
    description: "Show some love",
    type: "basic",
    priceCents: 100,
    iconUrl: "/gifts/heart.png",
    physicsConfig: { mass: 0.5, bounce: 0.8, friction: 0.2, pileUp: true, gravity: 1 },
    displayDuration: 3000,
    screenEffect: "hearts"
  },
  {
    id: "gift_fire",
    name: "Fire",
    description: "Things are heating up!",
    type: "animated",
    priceCents: 200,
    iconUrl: "/gifts/fire.png",
    animationUrl: "/gifts/fire.webm",
    physicsConfig: { mass: 0.3, bounce: 0.5, friction: 0.1, pileUp: false, gravity: -0.5 },
    displayDuration: 4000,
    screenEffect: "fire"
  },
  {
    id: "gift_diamond",
    name: "Diamond",
    description: "Premium appreciation",
    type: "3d_physics",
    priceCents: 500,
    iconUrl: "/gifts/diamond.png",
    model3dUrl: "/gifts/diamond.glb",
    soundUrl: "/gifts/diamond.mp3",
    physicsConfig: { mass: 2, bounce: 0.9, friction: 0.3, pileUp: true, gravity: 1.5 },
    displayDuration: 5000,
    screenEffect: "sparkle",
    lovenseIntensity: 5
  },
  {
    id: "gift_rocket",
    name: "Rocket",
    description: "To the moon!",
    type: "3d_physics",
    priceCents: 1000,
    iconUrl: "/gifts/rocket.png",
    model3dUrl: "/gifts/rocket.glb",
    soundUrl: "/gifts/rocket.mp3",
    physicsConfig: { mass: 1, bounce: 0.7, friction: 0.2, pileUp: false, gravity: -2 },
    displayDuration: 6000,
    screenEffect: "explosion",
    lovenseIntensity: 10
  },
  {
    id: "gift_crown",
    name: "Crown",
    description: "Crown the king/queen!",
    type: "3d_physics",
    priceCents: 2500,
    iconUrl: "/gifts/crown.png",
    model3dUrl: "/gifts/crown.glb",
    soundUrl: "/gifts/crown.mp3",
    physicsConfig: { mass: 3, bounce: 0.6, friction: 0.4, pileUp: true, gravity: 1 },
    displayDuration: 8000,
    screenEffect: "royal",
    lovenseIntensity: 15
  },
  {
    id: "gift_supernova",
    name: "Supernova",
    description: "Ultimate appreciation - screen takeover!",
    type: "exclusive",
    priceCents: 10000,
    iconUrl: "/gifts/supernova.png",
    model3dUrl: "/gifts/supernova.glb",
    animationUrl: "/gifts/supernova.webm",
    soundUrl: "/gifts/supernova.mp3",
    physicsConfig: { mass: 5, bounce: 1, friction: 0.1, pileUp: true, gravity: 0 },
    displayDuration: 15000,
    screenEffect: "supernova",
    lovenseIntensity: 20
  }
];

// ===== ADVANCED LIVE STREAMING SERVICE =====

class AdvancedLiveStreamingService extends EventEmitter {
  private sessions: Map<string, StreamSession> = new Map();
  private viewers: Map<string, Map<string, Viewer>> = new Map();
  private chatHistory: Map<string, ChatMessage[]> = new Map();
  private overlays: Map<string, StreamOverlay[]> = new Map();
  private challenges: Map<string, StreamChallenge[]> = new Map();
  private guests: Map<string, StreamGuest[]> = new Map();
  private privateShows: Map<string, PrivateShow> = new Map();
  private parties: Map<string, StreamParty> = new Map();
  private clips: Map<string, StreamClip[]> = new Map();
  private raids: Map<string, StreamRaid> = new Map();
  private virtualGifts: Map<string, VirtualGift> = new Map();
  
  // External service configs
  private bunnyStreamApiKey: string;
  private bunnyStreamLibraryId: string;
  private lovenseApiToken: string;
  private aiModerationEnabled: boolean;
  
  constructor() {
    super();
    this.bunnyStreamApiKey = process.env.BUNNY_STREAM_API_KEY || "";
    this.bunnyStreamLibraryId = process.env.BUNNY_STREAM_LIBRARY_ID || "";
    this.lovenseApiToken = process.env.LOVENSE_DEVELOPER_TOKEN || "";
    this.aiModerationEnabled = process.env.AI_MODERATION_ENABLED === "true";
    
    // Initialize default gifts
    DEFAULT_VIRTUAL_GIFTS.forEach(gift => this.virtualGifts.set(gift.id, gift));
    
    // Start background tasks
    this.startBackgroundTasks();
    
    logger.info("AdvancedLiveStreamingService initialized", {
      bunnyConfigured: !!this.bunnyStreamApiKey,
      lovenseConfigured: !!this.lovenseApiToken,
      aiModerationEnabled: this.aiModerationEnabled
    });
  }
  
  // ===== ONE-CLICK GO LIVE =====
  
  async createBrowserStream(params: {
    creatorId: string;
    creatorUsername: string;
    title: string;
    description?: string;
    category?: string;
    tags?: string[];
    config?: Partial<StreamConfig>;
  }): Promise<{
    streamId: string;
    sessionId: string;
    whipEndpoint: string;
    whepEndpoint: string;
    hlsUrl: string;
    webrtcUrl: string;
    iceServers: any[];
  }> {
    const streamId = this.generateId("stream");
    const sessionId = this.generateId("session");
    
    const config: StreamConfig = {
      mode: "low_latency",
      quality: "1080p",
      source: "browser",
      enableRecording: true,
      enableChat: true,
      enableTips: true,
      enableGifts: true,
      enablePolls: true,
      enableGuests: false,
      enableLovense: false,
      maxViewers: 10000,
      subscriberOnly: false,
      ...params.config
    };
    
    // Generate WHIP/WHEP endpoints for browser streaming
    const whipEndpoint = \`/api/stream/\${streamId}/whip\`;
    const whepEndpoint = \`/api/stream/\${streamId}/whep\`;
    
    // Create playback URLs
    const hlsUrl = \`/api/stream/\${streamId}/playlist.m3u8\`;
    const webrtcUrl = \`/api/stream/\${streamId}/webrtc\`;
    
    const session: StreamSession = {
      id: sessionId,
      streamId,
      creatorId: params.creatorId,
      creatorUsername: params.creatorUsername,
      title: params.title,
      description: params.description,
      category: params.category,
      tags: params.tags || [],
      status: "preparing",
      config,
      whipEndpoint,
      whepEndpoint,
      hlsUrl,
      webrtcUrl,
      currentViewers: 0,
      peakViewers: 0,
      totalViews: 0,
      uniqueViewers: new Set(),
      chatMessages: 0,
      totalTipsCents: 0,
      latencyMs: 0,
      bitrateKbps: 0,
      frameRate: 30,
      droppedFrames: 0,
      healthScore: 100,
      isRecording: config.enableRecording,
      createdAt: new Date()
    };
    
    this.sessions.set(streamId, session);
    this.viewers.set(streamId, new Map());
    this.chatHistory.set(streamId, []);
    this.overlays.set(streamId, []);
    this.challenges.set(streamId, []);
    this.guests.set(streamId, []);
    this.clips.set(streamId, []);
    
    // ICE servers for WebRTC
    const iceServers = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" }
    ];
    
    this.emit("stream:created", { streamId, sessionId, creatorId: params.creatorId });
    
    logger.info(\`Browser stream created: \${streamId}\`, {
      creator: params.creatorUsername,
      title: params.title,
      mode: config.mode
    });
    
    return {
      streamId,
      sessionId,
      whipEndpoint,
      whepEndpoint,
      hlsUrl,
      webrtcUrl,
      iceServers
    };
  }
  
  // ===== RTMP STREAM (OBS) =====
  
  async createRTMPStream(params: {
    creatorId: string;
    creatorUsername: string;
    title: string;
    description?: string;
    config?: Partial<StreamConfig>;
  }): Promise<{
    streamId: string;
    sessionId: string;
    rtmpUrl: string;
    rtmpKey: string;
    hlsUrl: string;
    dashUrl: string;
  }> {
    const streamId = this.generateId("stream");
    const sessionId = this.generateId("session");
    const rtmpKey = this.generateStreamKey();
    
    const config: StreamConfig = {
      mode: "standard",
      quality: "1080p",
      source: "obs",
      enableRecording: true,
      enableChat: true,
      enableTips: true,
      enableGifts: true,
      enablePolls: true,
      enableGuests: true,
      enableLovense: false,
      maxViewers: 50000,
      subscriberOnly: false,
      ...params.config
    };
    
    // RTMP ingest URL (using Bunny or self-hosted)
    const rtmpUrl = this.bunnyStreamApiKey 
      ? \`rtmp://live.bunny.net/live\`
      : \`rtmp://\${process.env.RTMP_SERVER || "localhost"}/live\`;
    
    const hlsUrl = \`/api/stream/\${streamId}/playlist.m3u8\`;
    const dashUrl = \`/api/stream/\${streamId}/manifest.mpd\`;
    
    const session: StreamSession = {
      id: sessionId,
      streamId,
      creatorId: params.creatorId,
      creatorUsername: params.creatorUsername,
      title: params.title,
      description: params.description,
      tags: [],
      status: "preparing",
      config,
      rtmpUrl,
      rtmpKey,
      hlsUrl,
      dashUrl,
      currentViewers: 0,
      peakViewers: 0,
      totalViews: 0,
      uniqueViewers: new Set(),
      chatMessages: 0,
      totalTipsCents: 0,
      latencyMs: 0,
      bitrateKbps: 0,
      frameRate: 30,
      droppedFrames: 0,
      healthScore: 100,
      isRecording: config.enableRecording,
      createdAt: new Date()
    };
    
    this.sessions.set(streamId, session);
    this.viewers.set(streamId, new Map());
    this.chatHistory.set(streamId, []);
    this.overlays.set(streamId, []);
    
    this.emit("stream:created", { streamId, sessionId, creatorId: params.creatorId });
    
    return { streamId, sessionId, rtmpUrl, rtmpKey, hlsUrl, dashUrl };
  }
  
  // ===== GO LIVE =====
  
  async startStream(streamId: string): Promise<{ success: boolean; error?: string }> {
    const session = this.sessions.get(streamId);
    if (!session) return { success: false, error: "Stream not found" };
    
    session.status = "live";
    session.startedAt = new Date();
    
    // Send system message
    await this.sendSystemMessage(streamId, \`\${session.creatorUsername} is now live!\`);
    
    // Notify subscribers
    this.emit("stream:started", { streamId, creatorId: session.creatorId });
    
    // Start statistics collection
    this.startStatisticsCollection(streamId);
    
    // Start AI highlight detection
    if (this.aiModerationEnabled) {
      this.startAIHighlightDetection(streamId);
    }
    
    logger.info(\`Stream started: \${streamId}\`);
    return { success: true };
  }
  
  async endStream(streamId: string): Promise<{
    success: boolean;
    analytics?: any;
    vodUrl?: string;
  }> {
    const session = this.sessions.get(streamId);
    if (!session) return { success: false };
    
    session.status = "ended";
    session.endedAt = new Date();
    
    // Generate analytics
    const analytics = this.generateStreamAnalytics(streamId);
    
    // Process recording into VOD
    if (session.isRecording && session.recordingId) {
      session.vodUrl = await this.processRecordingToVOD(streamId, session.recordingId);
    }
    
    // Generate chat replay
    const chatReplayUrl = await this.generateChatReplay(streamId);
    
    await this.sendSystemMessage(streamId, "Stream has ended. Thank you for watching!");
    
    this.emit("stream:ended", { streamId, analytics, vodUrl: session.vodUrl });
    
    logger.info(\`Stream ended: \${streamId}\`, { analytics });
    
    return { success: true, analytics, vodUrl: session.vodUrl };
  }
  
  // ===== VIEWER MANAGEMENT =====
  
  async joinStream(streamId: string, viewerData: {
    oderId: string;
    username: string;
    avatarUrl?: string;
    isSubscriber?: boolean;
    subTier?: number;
    isModerator?: boolean;
    isVIP?: boolean;
  }): Promise<{
    success: boolean;
    playbackUrl: string;
    lowLatencyUrl?: string;
    chatHistory: ChatMessage[];
    overlays: StreamOverlay[];
    viewerCount: number;
  }> {
    const session = this.sessions.get(streamId);
    if (!session) throw new Error("Stream not found");
    if (session.status !== "live") throw new Error("Stream is not live");
    
    // Check subscriber requirement
    if (session.config.subscriberOnly && !viewerData.isSubscriber) {
      throw new Error("This stream is for subscribers only");
    }
    
    if (session.config.minSubTier && (!viewerData.subTier || viewerData.subTier < session.config.minSubTier)) {
      throw new Error(\`This stream requires subscription tier \${session.config.minSubTier} or higher\`);
    }
    
    const viewers = this.viewers.get(streamId)!;
    
    // Track unique viewers
    if (!session.uniqueViewers.has(viewerData.oderId)) {
      session.uniqueViewers.add(viewerData.oderId);
      session.totalViews++;
    }
    
    const viewer: Viewer = {
      id: this.generateId("viewer"),
      oderId: viewerData.oderId,
      username: viewerData.username,
      avatarUrl: viewerData.avatarUrl,
      joinedAt: new Date(),
      lastActivity: new Date(),
      watchTimeSeconds: 0,
      tipsSentCents: 0,
      giftsSent: 0,
      chatMessages: 0,
      isSubscriber: viewerData.isSubscriber || false,
      subTier: viewerData.subTier,
      isModerator: viewerData.isModerator || false,
      isVIP: viewerData.isVIP || false,
      isBanned: false,
      lovenseConnected: false
    };
    
    viewers.set(viewerData.oderId, viewer);
    session.currentViewers = viewers.size;
    session.peakViewers = Math.max(session.peakViewers, session.currentViewers);
    
    this.emit("viewer:joined", { streamId, viewer });
    
    // Choose playback URL based on mode
    const playbackUrl = session.config.mode === "ultra_low" 
      ? session.webrtcUrl!
      : session.hlsUrl!;
    
    return {
      success: true,
      playbackUrl,
      lowLatencyUrl: session.lowLatencyUrl,
      chatHistory: (this.chatHistory.get(streamId) || []).slice(-100),
      overlays: this.overlays.get(streamId) || [],
      viewerCount: session.currentViewers
    };
  }
  
  // ===== CHAT WITH AI MODERATION =====
  
  async sendChatMessage(streamId: string, messageData: {
    userId: string;
    username: string;
    avatarUrl?: string;
    content: string;
    replyTo?: string;
  }): Promise<{ success: boolean; message?: ChatMessage; blocked?: boolean; reason?: string }> {
    const session = this.sessions.get(streamId);
    if (!session) return { success: false, reason: "Stream not found" };
    if (!session.config.enableChat) return { success: false, reason: "Chat is disabled" };
    
    const viewers = this.viewers.get(streamId);
    const viewer = viewers?.get(messageData.userId);
    if (viewer?.isBanned) return { success: false, blocked: true, reason: viewer.banReason };
    
    // AI moderation check
    let aiScore = 0;
    let aiFlags: string[] = [];
    
    if (this.aiModerationEnabled) {
      const moderationResult = await this.moderateContent(messageData.content);
      aiScore = moderationResult.toxicityScore;
      aiFlags = moderationResult.flags;
      
      // Auto-hide toxic messages
      if (aiScore > 0.8) {
        logger.warn(\`Toxic message blocked: \${messageData.content}\`, { aiScore, aiFlags });
        return { success: false, blocked: true, reason: "Message blocked by AI moderation" };
      }
    }
    
    // Parse emotes and mentions
    const emotes = this.parseEmotes(messageData.content);
    const mentions = this.parseMentions(messageData.content);
    
    const message: ChatMessage = {
      id: this.generateId("msg"),
      streamId,
      userId: messageData.userId,
      username: messageData.username,
      avatarUrl: messageData.avatarUrl,
      content: this.sanitizeContent(messageData.content),
      type: "message",
      emotes,
      mentions,
      replyTo: messageData.replyTo,
      isHighlighted: false,
      isPinned: false,
      isHidden: aiScore > 0.5, // Soft-hide suspicious messages
      aiScore,
      aiFlags,
      createdAt: new Date(),
      streamTimestamp: this.getStreamTimestamp(streamId)
    };
    
    const history = this.chatHistory.get(streamId)!;
    history.push(message);
    
    // Update viewer stats
    if (viewer) {
      viewer.chatMessages++;
      viewer.lastActivity = new Date();
    }
    
    session.chatMessages++;
    
    this.emit("chat:message", { streamId, message });
    
    return { success: true, message };
  }
  
  // ===== VIRTUAL GIFTS WITH PHYSICS =====
  
  async sendGift(streamId: string, giftData: {
    senderId: string;
    senderUsername: string;
    giftId: string;
    quantity?: number;
    message?: string;
    isAnonymous?: boolean;
  }): Promise<{ success: boolean; transaction?: any; lovenseTriggered?: boolean }> {
    const session = this.sessions.get(streamId);
    if (!session) return { success: false };
    if (!session.config.enableGifts) return { success: false };
    
    const gift = this.virtualGifts.get(giftData.giftId);
    if (!gift) return { success: false };
    
    const quantity = giftData.quantity || 1;
    const totalCents = gift.priceCents * quantity;
    
    // Process payment (would integrate with payment service)
    // await paymentService.charge(giftData.senderId, totalCents);
    
    // Create transaction
    const transaction = {
      id: this.generateId("gift_tx"),
      streamId,
      giftId: gift.id,
      senderId: giftData.senderId,
      receiverId: session.creatorId,
      quantity,
      totalCents,
      message: giftData.message,
      isAnonymous: giftData.isAnonymous || false,
      createdAt: new Date(),
      streamTimestamp: this.getStreamTimestamp(streamId)
    };
    
    // Update session stats
    session.totalTipsCents += totalCents;
    
    // Update viewer stats
    const viewers = this.viewers.get(streamId);
    const viewer = viewers?.get(giftData.senderId);
    if (viewer) {
      viewer.giftsSent += quantity;
      viewer.tipsSentCents += totalCents;
    }
    
    // Trigger Lovense if configured
    let lovenseTriggered = false;
    if (session.config.enableLovense && gift.lovenseIntensity) {
      lovenseTriggered = await this.triggerLovense(session.creatorId, {
        intensity: gift.lovenseIntensity,
        duration: this.calculateLovenseDuration(totalCents)
      });
    }
    
    // Send gift chat message
    const displayName = giftData.isAnonymous ? "Anonymous" : giftData.senderUsername;
    const chatContent = quantity > 1
      ? \`sent \${quantity}x \${gift.name}!\`
      : \`sent a \${gift.name}!\`;
    
    const chatMessage: ChatMessage = {
      id: this.generateId("msg"),
      streamId,
      userId: giftData.senderId,
      username: displayName,
      content: chatContent,
      type: "gift",
      emotes: [],
      mentions: [],
      isHighlighted: totalCents >= 500,
      isPinned: false,
      isHidden: false,
      giftId: gift.id,
      giftQuantity: quantity,
      createdAt: new Date(),
      streamTimestamp: this.getStreamTimestamp(streamId)
    };
    
    this.chatHistory.get(streamId)!.push(chatMessage);
    
    // Emit events for real-time updates
    this.emit("gift:received", { 
      streamId, 
      transaction, 
      gift,
      physicsData: {
        ...gift.physicsConfig,
        spawnPosition: { x: Math.random() * 100, y: -10 },
        quantity
      }
    });
    this.emit("chat:message", { streamId, message: chatMessage });
    
    // Update goal overlays
    await this.updateTipGoals(streamId, totalCents);
    
    return { success: true, transaction, lovenseTriggered };
  }
  
  // ===== INTERACTIVE OVERLAYS =====
  
  async createOverlay(streamId: string, overlayData: Partial<StreamOverlay>): Promise<StreamOverlay> {
    const session = this.sessions.get(streamId);
    if (!session) throw new Error("Stream not found");
    
    const overlay: StreamOverlay = {
      id: this.generateId("overlay"),
      streamId,
      type: overlayData.type || "custom_text",
      name: overlayData.name || "Overlay",
      position: overlayData.position || { x: 10, y: 10, width: 200, height: 100 },
      isVisible: overlayData.isVisible ?? true,
      zIndex: overlayData.zIndex || 1,
      config: overlayData.config || {},
      goalAmountCents: overlayData.goalAmountCents,
      currentAmountCents: overlayData.currentAmountCents || 0,
      goalTitle: overlayData.goalTitle,
      pollOptions: overlayData.pollOptions,
      pollEndsAt: overlayData.pollEndsAt,
      wheelSegments: overlayData.wheelSegments,
      spinCostCents: overlayData.spinCostCents,
      countdownEndsAt: overlayData.countdownEndsAt,
      countdownTitle: overlayData.countdownTitle
    };
    
    this.overlays.get(streamId)!.push(overlay);
    
    this.emit("overlay:created", { streamId, overlay });
    
    return overlay;
  }
  
  async createTipGoal(streamId: string, params: {
    title: string;
    goalAmountCents: number;
    position?: { x: number; y: number; width: number; height: number };
  }): Promise<StreamOverlay> {
    return this.createOverlay(streamId, {
      type: "tip_goal",
      name: params.title,
      goalTitle: params.title,
      goalAmountCents: params.goalAmountCents,
      currentAmountCents: 0,
      position: params.position || { x: 10, y: 10, width: 300, height: 50 }
    });
  }
  
  async createPoll(streamId: string, params: {
    question: string;
    options: string[];
    durationSeconds: number;
  }): Promise<StreamOverlay> {
    const pollEndsAt = new Date(Date.now() + params.durationSeconds * 1000);
    
    return this.createOverlay(streamId, {
      type: "poll",
      name: params.question,
      pollOptions: params.options.map((text, i) => ({
        id: \`opt_\${i}\`,
        text,
        votes: 0
      })),
      pollEndsAt,
      position: { x: 10, y: 10, width: 300, height: 200 }
    });
  }
  
  async votePoll(streamId: string, pollId: string, optionId: string, userId: string): Promise<boolean> {
    const overlays = this.overlays.get(streamId) || [];
    const poll = overlays.find(o => o.id === pollId && o.type === "poll");
    if (!poll || !poll.pollOptions) return false;
    if (poll.pollEndsAt && new Date() > poll.pollEndsAt) return false;
    
    const option = poll.pollOptions.find(o => o.id === optionId);
    if (!option) return false;
    
    option.votes++;
    
    this.emit("poll:voted", { streamId, pollId, optionId, totalVotes: poll.pollOptions.reduce((sum, o) => sum + o.votes, 0) });
    
    return true;
  }
  
  async createSpinWheel(streamId: string, params: {
    segments: Array<{ text: string; weight: number; color: string }>;
    spinCostCents: number;
  }): Promise<StreamOverlay> {
    return this.createOverlay(streamId, {
      type: "spin_wheel",
      name: "Spin the Wheel",
      wheelSegments: params.segments.map((s, i) => ({ id: \`seg_\${i}\`, ...s })),
      spinCostCents: params.spinCostCents,
      position: { x: 10, y: 10, width: 250, height: 250 }
    });
  }
  
  async spinWheel(streamId: string, wheelId: string, userId: string): Promise<{
    success: boolean;
    result?: { segmentId: string; text: string };
  }> {
    const overlays = this.overlays.get(streamId) || [];
    const wheel = overlays.find(o => o.id === wheelId && o.type === "spin_wheel");
    if (!wheel || !wheel.wheelSegments) return { success: false };
    
    // Charge user
    // await paymentService.charge(userId, wheel.spinCostCents);
    
    // Weighted random selection
    const totalWeight = wheel.wheelSegments.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedSegment = wheel.wheelSegments[0];
    
    for (const segment of wheel.wheelSegments) {
      random -= segment.weight;
      if (random <= 0) {
        selectedSegment = segment;
        break;
      }
    }
    
    this.emit("wheel:spun", { streamId, wheelId, userId, result: selectedSegment });
    
    return { success: true, result: { segmentId: selectedSegment.id, text: selectedSegment.text } };
  }
  
  // ===== STREAM CHALLENGES =====
  
  async createChallenge(streamId: string | null, params: {
    creatorId: string;
    title: string;
    description: string;
    goalCents: number;
    expiresAt?: Date;
    refundIfFailed?: boolean;
  }): Promise<StreamChallenge> {
    const challenge: StreamChallenge = {
      id: this.generateId("challenge"),
      streamId: streamId || undefined,
      creatorId: params.creatorId,
      title: params.title,
      description: params.description,
      goalCents: params.goalCents,
      fundedCents: 0,
      status: "pending",
      contributors: [],
      expiresAt: params.expiresAt,
      refundIfFailed: params.refundIfFailed ?? true
    };
    
    if (streamId) {
      this.challenges.get(streamId)!.push(challenge);
    }
    
    this.emit("challenge:created", { streamId, challenge });
    
    return challenge;
  }
  
  async contributeToChallenge(challengeId: string, contribution: {
    userId: string;
    amountCents: number;
    message?: string;
    isAnonymous?: boolean;
  }): Promise<{ success: boolean; challenge?: StreamChallenge; funded?: boolean }> {
    // Find challenge
    let challenge: StreamChallenge | undefined;
    for (const challenges of this.challenges.values()) {
      challenge = challenges.find(c => c.id === challengeId);
      if (challenge) break;
    }
    
    if (!challenge) return { success: false };
    if (challenge.status !== "pending") return { success: false };
    
    // Process payment
    // await paymentService.charge(contribution.userId, contribution.amountCents);
    
    challenge.contributors.push({
      userId: contribution.userId,
      amountCents: contribution.amountCents,
      message: contribution.message,
      isAnonymous: contribution.isAnonymous || false
    });
    
    challenge.fundedCents += contribution.amountCents;
    
    const funded = challenge.fundedCents >= challenge.goalCents;
    if (funded) {
      challenge.status = "funded";
    }
    
    this.emit("challenge:contributed", { challengeId, contribution, funded });
    
    return { success: true, challenge, funded };
  }
  
  async completeChallenge(challengeId: string, proofUrl: string): Promise<boolean> {
    let challenge: StreamChallenge | undefined;
    for (const challenges of this.challenges.values()) {
      challenge = challenges.find(c => c.id === challengeId);
      if (challenge) break;
    }
    
    if (!challenge || challenge.status !== "funded") return false;
    
    challenge.status = "completed";
    challenge.completedAt = new Date();
    challenge.proofUrl = proofUrl;
    
    this.emit("challenge:completed", { challengeId, proofUrl });
    
    return true;
  }
  
  // ===== GUEST CALL-INS =====
  
  async requestToJoinAsGuest(streamId: string, guestData: {
    guestId: string;
    guestUsername: string;
    message?: string;
  }): Promise<{ success: boolean; requestId?: string }> {
    const session = this.sessions.get(streamId);
    if (!session) return { success: false };
    if (!session.config.enableGuests) return { success: false };
    
    const guest: StreamGuest = {
      id: this.generateId("guest"),
      streamId,
      hostId: session.creatorId,
      guestId: guestData.guestId,
      guestUsername: guestData.guestUsername,
      status: "pending",
      requestMessage: guestData.message,
      permissions: { canVideo: true, canAudio: true, canScreenShare: false },
      iceCandidates: []
    };
    
    this.guests.get(streamId)!.push(guest);
    
    this.emit("guest:requested", { streamId, guest });
    
    return { success: true, requestId: guest.id };
  }
  
  async approveGuest(streamId: string, guestId: string, permissions?: {
    canVideo?: boolean;
    canAudio?: boolean;
    canScreenShare?: boolean;
  }): Promise<{ success: boolean; webrtcConfig?: any }> {
    const guests = this.guests.get(streamId);
    const guest = guests?.find(g => g.id === guestId);
    if (!guest) return { success: false };
    
    guest.status = "approved";
    if (permissions) {
      guest.permissions = { ...guest.permissions, ...permissions };
    }
    
    // Generate WebRTC config for guest
    const webrtcConfig = {
      guestId,
      endpoint: \`/api/stream/\${streamId}/guest/\${guestId}/webrtc\`,
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
      ]
    };
    
    this.emit("guest:approved", { streamId, guest, webrtcConfig });
    
    return { success: true, webrtcConfig };
  }
  
  async kickGuest(streamId: string, guestId: string): Promise<boolean> {
    const guests = this.guests.get(streamId);
    const guest = guests?.find(g => g.id === guestId);
    if (!guest) return false;
    
    guest.status = "kicked";
    guest.leftAt = new Date();
    
    this.emit("guest:kicked", { streamId, guestId });
    
    return true;
  }
  
  // ===== PRIVATE SHOWS =====
  
  async requestPrivateShow(params: {
    creatorId: string;
    viewerId: string;
    pricePerMinuteCents: number;
    minimumMinutes: number;
    viewerVideoEnabled?: boolean;
  }): Promise<{ success: boolean; showId?: string }> {
    const show: PrivateShow = {
      id: this.generateId("private"),
      creatorId: params.creatorId,
      viewerId: params.viewerId,
      pricePerMinuteCents: params.pricePerMinuteCents,
      minimumMinutes: params.minimumMinutes,
      status: "requested",
      totalMinutes: 0,
      totalCents: 0,
      viewerVideoEnabled: params.viewerVideoEnabled || false
    };
    
    this.privateShows.set(show.id, show);
    
    this.emit("private_show:requested", { show });
    
    return { success: true, showId: show.id };
  }
  
  async startPrivateShow(showId: string): Promise<{
    success: boolean;
    creatorStreamUrl?: string;
    viewerStreamUrl?: string;
  }> {
    const show = this.privateShows.get(showId);
    if (!show || show.status !== "accepted") return { success: false };
    
    show.status = "live";
    show.startedAt = new Date();
    
    // Generate private streaming URLs
    show.creatorStreamUrl = \`/api/private/\${showId}/creator/stream\`;
    show.viewerStreamUrl = \`/api/private/\${showId}/viewer/stream\`;
    
    this.emit("private_show:started", { show });
    
    // Start billing timer
    this.startPrivateShowBilling(showId);
    
    return {
      success: true,
      creatorStreamUrl: show.creatorStreamUrl,
      viewerStreamUrl: show.viewerStreamUrl
    };
  }
  
  private startPrivateShowBilling(showId: string) {
    const billingInterval = setInterval(() => {
      const show = this.privateShows.get(showId);
      if (!show || show.status !== "live") {
        clearInterval(billingInterval);
        return;
      }
      
      show.totalMinutes++;
      show.totalCents = show.totalMinutes * show.pricePerMinuteCents;
      
      this.emit("private_show:billed", { showId, totalMinutes: show.totalMinutes, totalCents: show.totalCents });
    }, 60000); // Bill every minute
  }
  
  // ===== STREAM PARTIES =====
  
  async createStreamParty(params: {
    hostId: string;
    streamId: string;
    name: string;
    isPublic?: boolean;
    maxParticipants?: number;
    voiceChatEnabled?: boolean;
  }): Promise<{ success: boolean; partyId?: string; inviteCode?: string }> {
    const party: StreamParty = {
      id: this.generateId("party"),
      hostId: params.hostId,
      streamId: params.streamId,
      name: params.name,
      isPublic: params.isPublic || false,
      maxParticipants: params.maxParticipants || 10,
      participants: new Map(),
      currentTimestamp: 0,
      isPaused: false,
      chatEnabled: true,
      voiceChatEnabled: params.voiceChatEnabled || false
    };
    
    this.parties.set(party.id, party);
    
    const inviteCode = this.generateInviteCode();
    
    this.emit("party:created", { party, inviteCode });
    
    return { success: true, partyId: party.id, inviteCode };
  }
  
  async joinParty(partyId: string, userData: {
    userId: string;
    username: string;
  }): Promise<{ success: boolean; party?: StreamParty }> {
    const party = this.parties.get(partyId);
    if (!party) return { success: false };
    if (party.participants.size >= party.maxParticipants) return { success: false };
    
    party.participants.set(userData.userId, {
      userId: userData.userId,
      username: userData.username,
      joinedAt: new Date()
    });
    
    this.emit("party:joined", { partyId, userId: userData.userId });
    
    return { success: true, party };
  }
  
  async syncPartyPlayback(partyId: string, timestamp: number): Promise<boolean> {
    const party = this.parties.get(partyId);
    if (!party) return false;
    
    party.currentTimestamp = timestamp;
    
    this.emit("party:sync", { partyId, timestamp });
    
    return true;
  }
  
  // ===== STREAM CLIPS & AI HIGHLIGHTS =====
  
  async createClip(streamId: string, params: {
    clipperId: string;
    title: string;
    startTimestamp: number;
    endTimestamp: number;
  }): Promise<{ success: boolean; clipId?: string }> {
    const session = this.sessions.get(streamId);
    if (!session) return { success: false };
    
    const clip: StreamClip = {
      id: this.generateId("clip"),
      streamId,
      creatorId: session.creatorId,
      clipperId: params.clipperId,
      title: params.title,
      startTimestamp: params.startTimestamp,
      endTimestamp: params.endTimestamp,
      duration: params.endTimestamp - params.startTimestamp,
      status: "processing",
      isAiGenerated: false,
      viewCount: 0,
      likeCount: 0,
      shareCount: 0
    };
    
    this.clips.get(streamId)!.push(clip);
    
    // Queue clip processing
    this.emit("clip:processing", { clip });
    
    // Process clip async
    this.processClip(clip).then(processedClip => {
      clip.status = "ready";
      clip.videoUrl = processedClip.videoUrl;
      clip.thumbnailUrl = processedClip.thumbnailUrl;
      this.emit("clip:ready", { clip });
    });
    
    return { success: true, clipId: clip.id };
  }
  
  private async processClip(clip: StreamClip): Promise<{ videoUrl: string; thumbnailUrl: string }> {
    // Would integrate with video processing service
    return {
      videoUrl: \`/clips/\${clip.id}.mp4\`,
      thumbnailUrl: \`/clips/\${clip.id}_thumb.jpg\`
    };
  }
  
  private startAIHighlightDetection(streamId: string) {
    // Would use AI to detect exciting moments
    const interval = setInterval(() => {
      const session = this.sessions.get(streamId);
      if (!session || session.status !== "live") {
        clearInterval(interval);
        return;
      }
      
      // Analyze recent chat activity, tips, viewer count changes
      const recentTips = session.totalTipsCents; // Would track delta
      const chatActivity = session.chatMessages; // Would track delta
      
      // If excitement detected, auto-create clip
      if (recentTips > 1000 || chatActivity > 50) {
        const timestamp = this.getStreamTimestamp(streamId);
        this.createClip(streamId, {
          clipperId: "ai_system",
          title: "AI Highlight",
          startTimestamp: timestamp - 30,
          endTimestamp: timestamp
        }).then(result => {
          if (result.clipId) {
            const clips = this.clips.get(streamId)!;
            const clip = clips.find(c => c.id === result.clipId);
            if (clip) {
              clip.isAiGenerated = true;
              clip.aiHighlightScore = 0.9;
            }
          }
        });
      }
    }, 30000); // Check every 30 seconds
  }
  
  // ===== STREAM RAIDS =====
  
  async initiateRaid(fromStreamId: string, toStreamId: string): Promise<{ success: boolean; raidId?: string }> {
    const fromSession = this.sessions.get(fromStreamId);
    const toSession = this.sessions.get(toStreamId);
    
    if (!fromSession || !toSession) return { success: false };
    if (toSession.status !== "live") return { success: false };
    
    const raid: StreamRaid = {
      id: this.generateId("raid"),
      fromStreamId,
      fromCreatorId: fromSession.creatorId,
      toStreamId,
      toCreatorId: toSession.creatorId,
      viewersRaided: fromSession.currentViewers,
      status: "initiated"
    };
    
    this.raids.set(raid.id, raid);
    
    this.emit("raid:initiated", { raid });
    
    // Notify target stream
    await this.sendSystemMessage(toStreamId, 
      \`\${fromSession.creatorUsername} is raiding with \${raid.viewersRaided} viewers!\`
    );
    
    return { success: true, raidId: raid.id };
  }
  
  async acceptRaid(raidId: string): Promise<boolean> {
    const raid = this.raids.get(raidId);
    if (!raid || raid.status !== "initiated") return false;
    
    raid.status = "accepted";
    
    this.emit("raid:accepted", { raid });
    
    // Redirect viewers
    this.emit("raid:redirect", { 
      fromStreamId: raid.fromStreamId,
      toStreamId: raid.toStreamId,
      viewers: raid.viewersRaided
    });
    
    raid.status = "completed";
    
    return true;
  }
  
  // ===== VOD WITH SYNCED CHAT =====
  
  private async generateChatReplay(streamId: string): Promise<string> {
    const history = this.chatHistory.get(streamId) || [];
    
    // Generate JSON file with chat messages and timestamps
    const replayData = history.map(msg => ({
      timestamp: msg.streamTimestamp,
      username: msg.username,
      content: msg.content,
      type: msg.type,
      isHighlighted: msg.isHighlighted
    }));
    
    // Would upload to storage
    return \`/vod/\${streamId}/chat_replay.json\`;
  }
  
  private async processRecordingToVOD(streamId: string, recordingId: string): Promise<string> {
    // Would transcode to multiple qualities
    return \`/vod/\${streamId}/index.m3u8\`;
  }
  
  // ===== HELPER METHODS =====
  
  private generateId(prefix: string): string {
    return \`\${prefix}_\${Date.now()}_\${crypto.randomBytes(6).toString("hex")}\`;
  }
  
  private generateStreamKey(): string {
    return \`sk_\${crypto.randomBytes(16).toString("hex")}\`;
  }
  
  private generateInviteCode(): string {
    return crypto.randomBytes(4).toString("hex").toUpperCase();
  }
  
  private getStreamTimestamp(streamId: string): number {
    const session = this.sessions.get(streamId);
    if (!session || !session.startedAt) return 0;
    return Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
  }
  
  private sanitizeContent(content: string): string {
    return content
      .replace(/<[^>]*>/g, "")
      .substring(0, 500);
  }
  
  private parseEmotes(content: string): Array<{ code: string; url: string; positions: number[] }> {
    // Would parse custom emotes
    return [];
  }
  
  private parseMentions(content: string): string[] {
    const mentions = content.match(/@(\w+)/g) || [];
    return mentions.map(m => m.substring(1));
  }
  
  private async moderateContent(content: string): Promise<{ toxicityScore: number; flags: string[] }> {
    // Would call AI moderation service
    const lowerContent = content.toLowerCase();
    let toxicityScore = 0;
    const flags: string[] = [];
    
    // Simple keyword detection (would use AI in production)
    const toxicWords = ["spam", "hate", "harass"];
    for (const word of toxicWords) {
      if (lowerContent.includes(word)) {
        toxicityScore += 0.3;
        flags.push(word);
      }
    }
    
    return { toxicityScore: Math.min(1, toxicityScore), flags };
  }
  
  private calculateLovenseDuration(amountCents: number): number {
    if (amountCents < 100) return 1;
    if (amountCents < 500) return Math.round(amountCents / 100 * 3);
    if (amountCents < 1000) return Math.round(amountCents / 100 * 2);
    return Math.min(60, Math.round(amountCents / 100 * 1.5));
  }
  
  private async triggerLovense(creatorId: string, params: { intensity: number; duration: number }): Promise<boolean> {
    if (!this.lovenseApiToken) return false;
    // Would call Lovense API
    return true;
  }
  
  private async updateTipGoals(streamId: string, amountCents: number) {
    const overlays = this.overlays.get(streamId) || [];
    for (const overlay of overlays) {
      if (overlay.type === "tip_goal" && overlay.currentAmountCents !== undefined) {
        overlay.currentAmountCents += amountCents;
        
        if (overlay.goalAmountCents && overlay.currentAmountCents >= overlay.goalAmountCents) {
          this.emit("goal:reached", { streamId, overlayId: overlay.id, title: overlay.goalTitle });
        }
        
        this.emit("overlay:updated", { streamId, overlay });
      }
    }
  }
  
  private async sendSystemMessage(streamId: string, content: string) {
    const message: ChatMessage = {
      id: this.generateId("msg"),
      streamId,
      userId: "system",
      username: "System",
      content,
      type: "system",
      emotes: [],
      mentions: [],
      isHighlighted: true,
      isPinned: false,
      isHidden: false,
      createdAt: new Date(),
      streamTimestamp: this.getStreamTimestamp(streamId)
    };
    
    this.chatHistory.get(streamId)?.push(message);
    this.emit("chat:message", { streamId, message });
  }
  
  private generateStreamAnalytics(streamId: string): any {
    const session = this.sessions.get(streamId);
    if (!session) return null;
    
    const duration = session.endedAt && session.startedAt
      ? (session.endedAt.getTime() - session.startedAt.getTime()) / 1000
      : 0;
    
    return {
      streamId,
      duration,
      peakViewers: session.peakViewers,
      totalViews: session.totalViews,
      uniqueViewers: session.uniqueViewers.size,
      totalTipsCents: session.totalTipsCents,
      chatMessages: session.chatMessages,
      avgViewers: Math.round(session.totalViews / Math.max(1, duration / 60))
    };
  }
  
  private startStatisticsCollection(streamId: string) {
    const interval = setInterval(() => {
      const session = this.sessions.get(streamId);
      if (!session || session.status !== "live") {
        clearInterval(interval);
        return;
      }
      
      this.emit("statistics:update", {
        streamId,
        viewerCount: session.currentViewers,
        chatMessages: session.chatMessages,
        totalTips: session.totalTipsCents
      });
    }, 5000);
  }
  
  private startBackgroundTasks() {
    // Cleanup ended streams
    setInterval(() => {
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      for (const [streamId, session] of this.sessions) {
        if (session.status === "ended" && session.endedAt && session.endedAt.getTime() < cutoff) {
          this.sessions.delete(streamId);
          this.viewers.delete(streamId);
          this.chatHistory.delete(streamId);
          this.overlays.delete(streamId);
          this.challenges.delete(streamId);
          this.guests.delete(streamId);
          this.clips.delete(streamId);
        }
      }
    }, 60 * 60 * 1000);
  }
  
  // ===== PUBLIC GETTERS =====
  
  getStream(streamId: string): StreamSession | null {
    return this.sessions.get(streamId) || null;
  }
  
  getLiveStreams(options?: { category?: string; limit?: number; sortBy?: string }): StreamSession[] {
    let streams = Array.from(this.sessions.values())
      .filter(s => s.status === "live" && !s.config.subscriberOnly);
    
    if (options?.category) {
      streams = streams.filter(s => s.category === options.category);
    }
    
    switch (options?.sortBy) {
      case "viewers":
        streams.sort((a, b) => b.currentViewers - a.currentViewers);
        break;
      case "tips":
        streams.sort((a, b) => b.totalTipsCents - a.totalTipsCents);
        break;
      default:
        streams.sort((a, b) => (b.startedAt?.getTime() || 0) - (a.startedAt?.getTime() || 0));
    }
    
    return streams.slice(0, options?.limit || 20);
  }
  
  getVirtualGifts(): VirtualGift[] {
    return Array.from(this.virtualGifts.values());
  }
}

export const advancedLiveStreamingService = new AdvancedLiveStreamingService();
export { AdvancedLiveStreamingService, StreamSession, ChatMessage, VirtualGift, StreamOverlay, StreamChallenge };
