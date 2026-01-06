// @ts-nocheck
/**
 * Fuck Buddy Routes
 *
 * Social connection system with naughty relationship types:
 * - Send/accept/decline buddy requests
 * - Manage fuck buddies list
 * - Top 8 management (MySpace style!)
 * - Connection scoring
 */

import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db } from "../db";
import {
  fuckBuddyRequests,
  fuckBuddies,
  users,
  socialNotifications as notifications,
} from "@shared/schema";
import { eq, and, desc, or, sql, count, ne } from "drizzle-orm";
import { isAuthenticated } from "../middleware/auth";
import { logger } from "../logger";

const router = Router();

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const sendRequestSchema = z.object({
  receiverId: z.string().uuid(),
  relationshipType: z.enum(["fuckbuddy", "fwb", "crush", "lover", "playmate", "admirer"]).default("fuckbuddy"),
  message: z.string().max(500).optional(),
});

const respondRequestSchema = z.object({
  action: z.enum(["accept", "decline", "block"]),
  relationshipType: z.enum(["fuckbuddy", "fwb", "crush", "lover", "playmate", "admirer"]).optional(),
});

const updateBuddySchema = z.object({
  relationshipType: z.enum(["fuckbuddy", "fwb", "crush", "lover", "playmate", "admirer"]).optional(),
  nickname: z.string().max(50).optional(),
  isTopEight: z.boolean().optional(),
  topEightPosition: z.number().min(1).max(8).optional(),
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const RELATIONSHIP_LABELS: Record<string, { emoji: string; label: string }> = {
  fuckbuddy: { emoji: "🔥", label: "Fuck Buddy" },
  fwb: { emoji: "💕", label: "Friends with Benefits" },
  crush: { emoji: "💜", label: "Crush" },
  lover: { emoji: "❤️", label: "Lover" },
  playmate: { emoji: "🎮", label: "Playmate" },
  admirer: { emoji: "👀", label: "Admirer" },
};

async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  fromUserId: string,
  actionUrl?: string
) {
  try {
    await db.insert(notifications).values({
      userId,
      type: type as any,
      title,
      message,
      fromUserId,
      actionUrl,
    });
  } catch (error) {
    logger.error("Failed to create notification:", error);
  }
}

async function formatBuddy(buddy: any, includeUser = true) {
  if (!includeUser) return buddy;

  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      profileImageUrl: users.profileImageUrl,
      isVerified: users.isVerified,
      isCreator: users.isCreator,
      onlineStatus: users.onlineStatus,
      lastSeenAt: users.lastSeenAt,
    })
    .from(users)
    .where(eq(users.id, buddy.buddyId))
    .limit(1);

  return {
    ...buddy,
    buddy: user,
    relationshipLabel: RELATIONSHIP_LABELS[buddy.relationshipType],
  };
}

// ============================================================
// PUBLIC ROUTES
// ============================================================

/**
 * Get user's fuck buddies (public view)
 * GET /api/fuck-buddies/:userId
 */
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { includeTopEight = "true" } = req.query;

    // Get all buddies
    const buddies = await db
      .select()
      .from(fuckBuddies)
      .where(eq(fuckBuddies.userId, userId))
      .orderBy(desc(fuckBuddies.isTopEight), fuckBuddies.topEightPosition, desc(fuckBuddies.connectionScore));

    // Format with user info
    const formattedBuddies = await Promise.all(buddies.map((b) => formatBuddy(b)));

    // Separate Top 8 if requested
    if (includeTopEight === "true") {
      const topEight = formattedBuddies.filter((b) => b.isTopEight).sort((a, b) => (a.topEightPosition || 99) - (b.topEightPosition || 99));
      const others = formattedBuddies.filter((b) => !b.isTopEight);

      return res.json({
        topEight,
        buddies: others,
        totalCount: formattedBuddies.length,
      });
    }

    res.json({
      buddies: formattedBuddies,
      totalCount: formattedBuddies.length,
    });
  } catch (error: any) {
    logger.error("Failed to fetch fuck buddies:", error);
    res.status(500).json({ error: "Failed to fetch fuck buddies" });
  }
});

/**
 * Get Top 8 for a user
 * GET /api/fuck-buddies/:userId/top-eight
 */
router.get("/:userId/top-eight", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const topEight = await db
      .select()
      .from(fuckBuddies)
      .where(and(eq(fuckBuddies.userId, userId), eq(fuckBuddies.isTopEight, true)))
      .orderBy(fuckBuddies.topEightPosition);

    const formatted = await Promise.all(topEight.map((b) => formatBuddy(b)));

    res.json(formatted);
  } catch (error: any) {
    logger.error("Failed to fetch top 8:", error);
    res.status(500).json({ error: "Failed to fetch top 8" });
  }
});

// ============================================================
// AUTHENTICATED ROUTES
// ============================================================

/**
 * Get pending fuck buddy requests
 * GET /api/fuck-buddies/requests/pending
 */
router.get("/requests/pending", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    // Get received requests
    const received = await db
      .select()
      .from(fuckBuddyRequests)
      .where(and(eq(fuckBuddyRequests.receiverId, userId), eq(fuckBuddyRequests.status, "pending")))
      .orderBy(desc(fuckBuddyRequests.createdAt));

    // Get sent requests
    const sent = await db
      .select()
      .from(fuckBuddyRequests)
      .where(and(eq(fuckBuddyRequests.senderId, userId), eq(fuckBuddyRequests.status, "pending")))
      .orderBy(desc(fuckBuddyRequests.createdAt));

    // Add user info to requests
    const formatRequest = async (request: any, type: "received" | "sent") => {
      const otherUserId = type === "received" ? request.senderId : request.receiverId;
      const [user] = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          profileImageUrl: users.profileImageUrl,
          isVerified: users.isVerified,
        })
        .from(users)
        .where(eq(users.id, otherUserId))
        .limit(1);

      return {
        ...request,
        [type === "received" ? "sender" : "receiver"]: user,
        relationshipLabel: RELATIONSHIP_LABELS[request.relationshipType],
      };
    };

    const formattedReceived = await Promise.all(received.map((r) => formatRequest(r, "received")));
    const formattedSent = await Promise.all(sent.map((r) => formatRequest(r, "sent")));

    res.json({
      received: formattedReceived,
      sent: formattedSent,
    });
  } catch (error: any) {
    logger.error("Failed to fetch pending requests:", error);
    res.status(500).json({ error: "Failed to fetch pending requests" });
  }
});

/**
 * Send a fuck buddy request
 * POST /api/fuck-buddies/request
 */
router.post("/request", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const parsed = sendRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }

    const { receiverId, relationshipType, message } = parsed.data;

    // Can't request yourself
    if (userId === receiverId) {
      return res.status(400).json({ error: "Can't send a request to yourself" });
    }

    // Check if receiver exists
    const [receiver] = await db.select().from(users).where(eq(users.id, receiverId)).limit(1);
    if (!receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check for existing request or connection
    const [existingRequest] = await db
      .select()
      .from(fuckBuddyRequests)
      .where(
        or(
          and(eq(fuckBuddyRequests.senderId, userId), eq(fuckBuddyRequests.receiverId, receiverId)),
          and(eq(fuckBuddyRequests.senderId, receiverId), eq(fuckBuddyRequests.receiverId, userId))
        )
      )
      .limit(1);

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return res.status(400).json({ error: "Request already pending" });
      }
      if (existingRequest.status === "blocked") {
        return res.status(403).json({ error: "Cannot send request" });
      }
    }

    // Check if already buddies
    const [existingBuddy] = await db
      .select()
      .from(fuckBuddies)
      .where(and(eq(fuckBuddies.userId, userId), eq(fuckBuddies.buddyId, receiverId)))
      .limit(1);

    if (existingBuddy) {
      return res.status(400).json({ error: "Already connected" });
    }

    // Create the request
    const [newRequest] = await db
      .insert(fuckBuddyRequests)
      .values({
        senderId: userId,
        receiverId,
        relationshipType,
        message,
      })
      .returning();

    // Create notification for receiver
    const [sender] = await db.select({ username: users.username }).from(users).where(eq(users.id, userId)).limit(1);
    await createNotification(
      receiverId,
      "buddy_request",
      `${RELATIONSHIP_LABELS[relationshipType].emoji} New Fuck Buddy Request!`,
      `${sender?.username || "Someone"} wants to be your ${RELATIONSHIP_LABELS[relationshipType].label}!`,
      userId,
      `/fuck-buddies/requests`
    );

    logger.info(`Fuck buddy request sent from ${userId} to ${receiverId}`);
    res.status(201).json({
      success: true,
      request: newRequest,
    });
  } catch (error: any) {
    logger.error("Failed to send fuck buddy request:", error);
    res.status(500).json({ error: "Failed to send request" });
  }
});

/**
 * Respond to a fuck buddy request
 * POST /api/fuck-buddies/request/:requestId/respond
 */
router.post("/request/:requestId/respond", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { requestId } = req.params;

    const parsed = respondRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }

    const { action, relationshipType } = parsed.data;

    // Get the request
    const [request] = await db
      .select()
      .from(fuckBuddyRequests)
      .where(eq(fuckBuddyRequests.id, requestId))
      .limit(1);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Must be the receiver
    if (request.receiverId !== userId) {
      return res.status(403).json({ error: "Not authorized to respond to this request" });
    }

    // Must be pending
    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request already responded to" });
    }

    // Handle the action
    if (action === "accept") {
      // Update request status
      await db
        .update(fuckBuddyRequests)
        .set({ status: "accepted", respondedAt: new Date() })
        .where(eq(fuckBuddyRequests.id, requestId));

      // Create mutual buddy connections
      const finalRelationship = relationshipType || request.relationshipType;

      await db.insert(fuckBuddies).values([
        {
          userId: request.senderId,
          buddyId: request.receiverId,
          relationshipType: finalRelationship,
        },
        {
          userId: request.receiverId,
          buddyId: request.senderId,
          relationshipType: finalRelationship,
        },
      ]);

      // Notify sender
      const [receiver] = await db.select({ username: users.username }).from(users).where(eq(users.id, userId)).limit(1);
      await createNotification(
        request.senderId,
        "buddy_accepted",
        `🎉 Request Accepted!`,
        `${receiver?.username || "Someone"} accepted your ${RELATIONSHIP_LABELS[finalRelationship].label} request!`,
        userId,
        `/profile/${userId}`
      );

      logger.info(`Fuck buddy request ${requestId} accepted`);
      return res.json({ success: true, status: "accepted" });
    } else if (action === "decline") {
      await db
        .update(fuckBuddyRequests)
        .set({ status: "declined", respondedAt: new Date() })
        .where(eq(fuckBuddyRequests.id, requestId));

      logger.info(`Fuck buddy request ${requestId} declined`);
      return res.json({ success: true, status: "declined" });
    } else if (action === "block") {
      await db
        .update(fuckBuddyRequests)
        .set({ status: "blocked", respondedAt: new Date() })
        .where(eq(fuckBuddyRequests.id, requestId));

      logger.info(`Fuck buddy request ${requestId} blocked`);
      return res.json({ success: true, status: "blocked" });
    }
  } catch (error: any) {
    logger.error("Failed to respond to request:", error);
    res.status(500).json({ error: "Failed to respond to request" });
  }
});

/**
 * Update a fuck buddy relationship
 * PATCH /api/fuck-buddies/:buddyId
 */
router.patch("/:buddyId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { buddyId } = req.params;

    const parsed = updateBuddySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }

    const updates = parsed.data;

    // Get the buddy connection
    const [buddy] = await db
      .select()
      .from(fuckBuddies)
      .where(and(eq(fuckBuddies.userId, userId), eq(fuckBuddies.buddyId, buddyId)))
      .limit(1);

    if (!buddy) {
      return res.status(404).json({ error: "Buddy connection not found" });
    }

    // If setting Top 8 position, validate and shift others
    if (updates.isTopEight && updates.topEightPosition) {
      // Get current Top 8
      const currentTopEight = await db
        .select()
        .from(fuckBuddies)
        .where(and(eq(fuckBuddies.userId, userId), eq(fuckBuddies.isTopEight, true), ne(fuckBuddies.buddyId, buddyId)));

      if (currentTopEight.length >= 8 && !buddy.isTopEight) {
        return res.status(400).json({ error: "Top 8 is full. Remove someone first." });
      }

      // Notify buddy they were added to Top 8
      const [user] = await db.select({ username: users.username }).from(users).where(eq(users.id, userId)).limit(1);
      await createNotification(
        buddyId,
        "buddy_top_eight",
        `⭐ You're in their Top 8!`,
        `${user?.username || "Someone"} added you to their Top 8 Fuck Buddies!`,
        userId,
        `/profile/${userId}`
      );
    }

    // Update the buddy
    const [updatedBuddy] = await db
      .update(fuckBuddies)
      .set({
        ...updates,
        lastInteractionAt: new Date(),
      })
      .where(and(eq(fuckBuddies.userId, userId), eq(fuckBuddies.buddyId, buddyId)))
      .returning();

    res.json(await formatBuddy(updatedBuddy));
  } catch (error: any) {
    logger.error("Failed to update buddy:", error);
    res.status(500).json({ error: "Failed to update buddy" });
  }
});

/**
 * Remove a fuck buddy
 * DELETE /api/fuck-buddies/:buddyId
 */
router.delete("/:buddyId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { buddyId } = req.params;

    // Delete both sides of the connection
    await db.delete(fuckBuddies).where(
      or(
        and(eq(fuckBuddies.userId, userId), eq(fuckBuddies.buddyId, buddyId)),
        and(eq(fuckBuddies.userId, buddyId), eq(fuckBuddies.buddyId, userId))
      )
    );

    // Also remove any pending requests
    await db.delete(fuckBuddyRequests).where(
      or(
        and(eq(fuckBuddyRequests.senderId, userId), eq(fuckBuddyRequests.receiverId, buddyId)),
        and(eq(fuckBuddyRequests.senderId, buddyId), eq(fuckBuddyRequests.receiverId, userId))
      )
    );

    logger.info(`Fuck buddy connection removed between ${userId} and ${buddyId}`);
    res.json({ success: true });
  } catch (error: any) {
    logger.error("Failed to remove buddy:", error);
    res.status(500).json({ error: "Failed to remove buddy" });
  }
});

/**
 * Reorder Top 8
 * POST /api/fuck-buddies/top-eight/reorder
 */
router.post("/top-eight/reorder", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { order } = req.body; // Array of buddy IDs in new order

    if (!Array.isArray(order) || order.length > 8) {
      return res.status(400).json({ error: "Invalid order array" });
    }

    // Update positions
    for (let i = 0; i < order.length; i++) {
      await db
        .update(fuckBuddies)
        .set({ topEightPosition: i + 1, isTopEight: true })
        .where(and(eq(fuckBuddies.userId, userId), eq(fuckBuddies.buddyId, order[i])));
    }

    res.json({ success: true });
  } catch (error: any) {
    logger.error("Failed to reorder top 8:", error);
    res.status(500).json({ error: "Failed to reorder top 8" });
  }
});

/**
 * Check buddy status with another user
 * GET /api/fuck-buddies/status/:otherUserId
 */
router.get("/status/:otherUserId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { otherUserId } = req.params;

    // Check if buddies
    const [buddy] = await db
      .select()
      .from(fuckBuddies)
      .where(and(eq(fuckBuddies.userId, userId), eq(fuckBuddies.buddyId, otherUserId)))
      .limit(1);

    if (buddy) {
      return res.json({
        status: "connected",
        relationship: buddy.relationshipType,
        relationshipLabel: RELATIONSHIP_LABELS[buddy.relationshipType],
        isTopEight: buddy.isTopEight,
      });
    }

    // Check for pending request
    const [request] = await db
      .select()
      .from(fuckBuddyRequests)
      .where(
        and(
          or(
            and(eq(fuckBuddyRequests.senderId, userId), eq(fuckBuddyRequests.receiverId, otherUserId)),
            and(eq(fuckBuddyRequests.senderId, otherUserId), eq(fuckBuddyRequests.receiverId, userId))
          ),
          eq(fuckBuddyRequests.status, "pending")
        )
      )
      .limit(1);

    if (request) {
      return res.json({
        status: "pending",
        direction: request.senderId === userId ? "sent" : "received",
        requestId: request.id,
      });
    }

    res.json({ status: "none" });
  } catch (error: any) {
    logger.error("Failed to check buddy status:", error);
    res.status(500).json({ error: "Failed to check status" });
  }
});

export default router;
