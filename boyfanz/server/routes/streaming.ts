/**
 * SECTION 6: Live Streaming API Routes
 * Complete API for the most advanced live streaming platform
 */

import { Router, Request, Response } from "express";
import { advancedLiveStreamingService } from "../services/advancedLiveStreamingService";
import { streamSchedulingService } from "../services/streamSchedulingService";
import { logger } from "../logger";

const router = Router();

// ===== STREAM CREATION =====

// Create browser-based stream (One-Click Go Live)
router.post("/browser", async (req: Request, res: Response) => {
  try {
    const { title, description, category, tags, config } = req.body;
    const userId = (req as any).user?.id;
    const username = (req as any).user?.username;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const result = await advancedLiveStreamingService.createBrowserStream({
      creatorId: userId,
      creatorUsername: username || "Creator",
      title,
      description,
      category,
      tags,
      config
    });
    
    res.json({ success: true, ...result });
  } catch (error: any) {
    logger.error("Failed to create browser stream", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Create RTMP stream (for OBS)
router.post("/rtmp", async (req: Request, res: Response) => {
  try {
    const { title, description, config } = req.body;
    const userId = (req as any).user?.id;
    const username = (req as any).user?.username;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const result = await advancedLiveStreamingService.createRTMPStream({
      creatorId: userId,
      creatorUsername: username || "Creator",
      title,
      description,
      config
    });
    
    res.json({ success: true, ...result });
  } catch (error: any) {
    logger.error("Failed to create RTMP stream", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// ===== STREAM CONTROL =====

// Start stream (go live)
router.post("/:streamId/start", async (req: Request, res: Response) => {
  try {
    const { streamId } = req.params;
    const result = await advancedLiveStreamingService.startStream(streamId);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// End stream
router.post("/:streamId/end", async (req: Request, res: Response) => {
  try {
    const { streamId } = req.params;
    const result = await advancedLiveStreamingService.endStream(streamId);
    
    res.json({ 
      success: result.success, 
      analytics: result.analytics,
      vodUrl: result.vodUrl
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get stream info
router.get("/:streamId", async (req: Request, res: Response) => {
  try {
    const { streamId } = req.params;
    const stream = advancedLiveStreamingService.getStream(streamId);
    
    if (!stream) {
      return res.status(404).json({ error: "Stream not found" });
    }
    
    res.json({ success: true, stream });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get live streams
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, limit, sortBy } = req.query;
    
    const streams = advancedLiveStreamingService.getLiveStreams({
      category: category as string,
      limit: limit ? parseInt(limit as string) : undefined,
      sortBy: sortBy as string
    });
    
    res.json({ success: true, streams });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== VIEWER MANAGEMENT =====

// Join stream
router.post("/:streamId/join", async (req: Request, res: Response) => {
  try {
    const { streamId } = req.params;
    const userId = (req as any).user?.id;
    const username = (req as any).user?.username;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const result = await advancedLiveStreamingService.joinStream(streamId, {
      oderId: oderId,
      username: username || "Viewer",
      isSubscriber: (req as any).user?.isSubscriber,
      subTier: (req as any).user?.subTier,
      isModerator: (req as any).user?.isModerator,
      isVIP: (req as any).user?.isVIP
    });
    
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== CHAT =====

// Send chat message
router.post("/:streamId/chat", async (req: Request, res: Response) => {
  try {
    const { streamId } = req.params;
    const { content, replyTo } = req.body;
    const userId = (req as any).user?.id;
    const username = (req as any).user?.username;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const result = await advancedLiveStreamingService.sendChatMessage(streamId, {
      userId,
      username: username || "User",
      content,
      replyTo
    });
    
    if (!result.success) {
      return res.status(400).json({ 
        error: result.reason,
        blocked: result.blocked
      });
    }
    
    res.json({ success: true, message: result.message });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== VIRTUAL GIFTS =====

// Get available gifts
router.get("/gifts/available", async (req: Request, res: Response) => {
  try {
    const gifts = advancedLiveStreamingService.getVirtualGifts();
    res.json({ success: true, gifts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send gift
router.post("/:streamId/gift", async (req: Request, res: Response) => {
  try {
    const { streamId } = req.params;
    const { giftId, quantity, message, isAnonymous } = req.body;
    const userId = (req as any).user?.id;
    const username = (req as any).user?.username;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const result = await advancedLiveStreamingService.sendGift(streamId, {
      senderId: userId,
      senderUsername: username || "User",
      giftId,
      quantity,
      message,
      isAnonymous
    });
    
    res.json({ success: result.success, transaction: result.transaction });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== OVERLAYS =====

// Create tip goal
router.post("/:streamId/overlays/tip-goal", async (req: Request, res: Response) => {
  try {
    const { streamId } = req.params;
    const { title, goalAmountCents, position } = req.body;
    
    const overlay = await advancedLiveStreamingService.createTipGoal(streamId, {
      title,
      goalAmountCents,
      position
    });
    
    res.json({ success: true, overlay });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create poll
router.post("/:streamId/overlays/poll", async (req: Request, res: Response) => {
  try {
    const { streamId } = req.params;
    const { question, options, durationSeconds } = req.body;
    
    const overlay = await advancedLiveStreamingService.createPoll(streamId, {
      question,
      options,
      durationSeconds: durationSeconds || 60
    });
    
    res.json({ success: true, overlay });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vote on poll
router.post("/:streamId/overlays/:pollId/vote", async (req: Request, res: Response) => {
  try {
    const { streamId, pollId } = req.params;
    const { optionId } = req.body;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const success = await advancedLiveStreamingService.votePoll(streamId, pollId, optionId, userId);
    
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create spin wheel
router.post("/:streamId/overlays/wheel", async (req: Request, res: Response) => {
  try {
    const { streamId } = req.params;
    const { segments, spinCostCents } = req.body;
    
    const overlay = await advancedLiveStreamingService.createSpinWheel(streamId, {
      segments,
      spinCostCents
    });
    
    res.json({ success: true, overlay });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Spin the wheel
router.post("/:streamId/overlays/:wheelId/spin", async (req: Request, res: Response) => {
  try {
    const { streamId, wheelId } = req.params;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const result = await advancedLiveStreamingService.spinWheel(streamId, wheelId, userId);
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== CHALLENGES =====

// Create challenge
router.post("/:streamId/challenges", async (req: Request, res: Response) => {
  try {
    const { streamId } = req.params;
    const { title, description, goalCents, expiresAt, refundIfFailed } = req.body;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const challenge = await advancedLiveStreamingService.createChallenge(streamId, {
      creatorId: userId,
      title,
      description,
      goalCents,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      refundIfFailed
    });
    
    res.json({ success: true, challenge });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Contribute to challenge
router.post("/challenges/:challengeId/contribute", async (req: Request, res: Response) => {
  try {
    const { challengeId } = req.params;
    const { amountCents, message, isAnonymous } = req.body;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const result = await advancedLiveStreamingService.contributeToChallenge(challengeId, {
      userId,
      amountCents,
      message,
      isAnonymous
    });
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Complete challenge
router.post("/challenges/:challengeId/complete", async (req: Request, res: Response) => {
  try {
    const { challengeId } = req.params;
    const { proofUrl } = req.body;
    
    const success = await advancedLiveStreamingService.completeChallenge(challengeId, proofUrl);
    
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== GUEST CALL-INS =====

// Request to join as guest
router.post("/:streamId/guests/request", async (req: Request, res: Response) => {
  try {
    const { streamId } = req.params;
    const { message } = req.body;
    const userId = (req as any).user?.id;
    const username = (req as any).user?.username;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const result = await advancedLiveStreamingService.requestToJoinAsGuest(streamId, {
      guestId: userId,
      guestUsername: username || "Guest",
      message
    });
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Approve guest
router.post("/:streamId/guests/:guestId/approve", async (req: Request, res: Response) => {
  try {
    const { streamId, guestId } = req.params;
    const { permissions } = req.body;
    
    const result = await advancedLiveStreamingService.approveGuest(streamId, guestId, permissions);
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Kick guest
router.post("/:streamId/guests/:guestId/kick", async (req: Request, res: Response) => {
  try {
    const { streamId, guestId } = req.params;
    
    const success = await advancedLiveStreamingService.kickGuest(streamId, guestId);
    
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== PRIVATE SHOWS =====

// Request private show
router.post("/private/request", async (req: Request, res: Response) => {
  try {
    const { creatorId, pricePerMinuteCents, minimumMinutes, viewerVideoEnabled } = req.body;
    const viewerId = (req as any).user?.id;
    
    if (!viewerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const result = await advancedLiveStreamingService.requestPrivateShow({
      creatorId,
      viewerId,
      pricePerMinuteCents,
      minimumMinutes,
      viewerVideoEnabled
    });
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start private show
router.post("/private/:showId/start", async (req: Request, res: Response) => {
  try {
    const { showId } = req.params;
    
    const result = await advancedLiveStreamingService.startPrivateShow(showId);
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== STREAM PARTIES =====

// Create watch party
router.post("/:streamId/party", async (req: Request, res: Response) => {
  try {
    const { streamId } = req.params;
    const { name, isPublic, maxParticipants, voiceChatEnabled } = req.body;
    const hostId = (req as any).user?.id;
    
    if (!hostId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const result = await advancedLiveStreamingService.createStreamParty({
      hostId,
      streamId,
      name,
      isPublic,
      maxParticipants,
      voiceChatEnabled
    });
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Join party
router.post("/party/:partyId/join", async (req: Request, res: Response) => {
  try {
    const { partyId } = req.params;
    const userId = (req as any).user?.id;
    const username = (req as any).user?.username;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const result = await advancedLiveStreamingService.joinParty(partyId, {
      userId,
      username: username || "User"
    });
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Sync party playback
router.post("/party/:partyId/sync", async (req: Request, res: Response) => {
  try {
    const { partyId } = req.params;
    const { timestamp } = req.body;
    
    const success = await advancedLiveStreamingService.syncPartyPlayback(partyId, timestamp);
    
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== CLIPS =====

// Create clip
router.post("/:streamId/clips", async (req: Request, res: Response) => {
  try {
    const { streamId } = req.params;
    const { title, startTimestamp, endTimestamp } = req.body;
    const clipperId = (req as any).user?.id;
    
    if (!clipperId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const result = await advancedLiveStreamingService.createClip(streamId, {
      clipperId,
      title,
      startTimestamp,
      endTimestamp
    });
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== RAIDS =====

// Initiate raid
router.post("/:streamId/raid", async (req: Request, res: Response) => {
  try {
    const { streamId } = req.params;
    const { toStreamId } = req.body;
    
    const result = await advancedLiveStreamingService.initiateRaid(streamId, toStreamId);
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Accept raid
router.post("/raids/:raidId/accept", async (req: Request, res: Response) => {
  try {
    const { raidId } = req.params;
    
    const success = await advancedLiveStreamingService.acceptRaid(raidId);
    
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== SCHEDULING =====

// Schedule stream
router.post("/schedule", async (req: Request, res: Response) => {
  try {
    const { title, description, thumbnailUrl, scheduledFor, estimatedDuration, notifySubscribers, isRecurring, recurringPattern } = req.body;
    const creatorId = (req as any).user?.id;
    const creatorUsername = (req as any).user?.username;
    
    if (!creatorId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const result = await streamSchedulingService.scheduleStream({
      creatorId,
      creatorUsername: creatorUsername || "Creator",
      title,
      description,
      thumbnailUrl,
      scheduledFor: new Date(scheduledFor),
      estimatedDuration,
      notifySubscribers,
      isRecurring,
      recurringPattern
    });
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get scheduled streams
router.get("/schedule/upcoming", async (req: Request, res: Response) => {
  try {
    const { creatorId, limit } = req.query;
    
    const streams = creatorId 
      ? streamSchedulingService.getScheduledStreams(creatorId as string)
      : streamSchedulingService.getUpcomingStreams(limit ? parseInt(limit as string) : 20);
    
    res.json({ success: true, streams });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel scheduled stream
router.delete("/schedule/:scheduleId", async (req: Request, res: Response) => {
  try {
    const { scheduleId } = req.params;
    
    const success = await streamSchedulingService.cancelScheduledStream(scheduleId);
    
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mark interested
router.post("/schedule/:scheduleId/interested", async (req: Request, res: Response) => {
  try {
    const { scheduleId } = req.params;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const success = await streamSchedulingService.markInterested(scheduleId, userId);
    
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
