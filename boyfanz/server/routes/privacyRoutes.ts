// @ts-nocheck
/**
 * Privacy Settings Routes
 *
 * Control who can see and interact with your profile:
 * - Profile visibility
 * - Wall permissions
 * - Messaging settings
 * - Block management
 */

import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { profilePrivacySettings, userBlocks, users, fuckBuddies } from "@shared/schema";
import { eq, and, or, sql, count, inArray } from "drizzle-orm";
import { isAuthenticated } from "../middleware/auth";
import { logger } from "../logger";

const router = Router();

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const privacyLevels = ["public", "buddies_only", "mutual_only", "nobody"] as const;

const updatePrivacySchema = z.object({
  // Profile visibility
  profileVisibility: z.enum(privacyLevels).optional(),
  showOnlineStatus: z.boolean().optional(),
  showLastSeen: z.boolean().optional(),
  showLocation: z.boolean().optional(),
  showAge: z.boolean().optional(),
  // Wall settings
  whoCanPostOnWall: z.enum(privacyLevels).optional(),
  whoCanSeeWall: z.enum(privacyLevels).optional(),
  whoCanComment: z.enum(privacyLevels).optional(),
  // Messaging settings
  whoCanMessage: z.enum(privacyLevels).optional(),
  allowAnonymousMessages: z.boolean().optional(),
  // Fuck buddy settings
  whoCanSendBuddyRequests: z.enum(privacyLevels).optional(),
  showFuckBuddyCount: z.boolean().optional(),
  showTopEight: z.boolean().optional(),
  // Content visibility
  whoCanSeePhotos: z.enum(privacyLevels).optional(),
  whoCanSeeVideos: z.enum(privacyLevels).optional(),
  // Search & discovery
  showInSearch: z.boolean().optional(),
  showInNearby: z.boolean().optional(),
  showInSuggestions: z.boolean().optional(),
});

const blockUserSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Check if a user can perform an action based on privacy settings
 */
export async function checkPrivacyPermission(
  targetUserId: string,
  viewerUserId: string | null,
  setting: keyof typeof profilePrivacySettings.$inferSelect
): Promise<boolean> {
  // No viewer = check if public
  if (!viewerUserId) {
    const [privacy] = await db
      .select()
      .from(profilePrivacySettings)
      .where(eq(profilePrivacySettings.userId, targetUserId))
      .limit(1);

    if (!privacy) return true; // Default to public
    const value = privacy[setting as keyof typeof privacy];
    return value === "public";
  }

  // Same user = always allowed
  if (targetUserId === viewerUserId) return true;

  // Check if blocked
  const [block] = await db
    .select()
    .from(userBlocks)
    .where(
      or(
        and(eq(userBlocks.blockerId, targetUserId), eq(userBlocks.blockedId, viewerUserId)),
        and(eq(userBlocks.blockerId, viewerUserId), eq(userBlocks.blockedId, targetUserId))
      )
    )
    .limit(1);

  if (block) return false;

  // Get privacy settings
  const [privacy] = await db
    .select()
    .from(profilePrivacySettings)
    .where(eq(profilePrivacySettings.userId, targetUserId))
    .limit(1);

  if (!privacy) return true; // Default to public

  const value = privacy[setting as keyof typeof privacy] as string;

  switch (value) {
    case "public":
      return true;

    case "buddies_only":
      // Check if they are fuck buddies
      const [buddy] = await db
        .select()
        .from(fuckBuddies)
        .where(and(eq(fuckBuddies.userId, targetUserId), eq(fuckBuddies.buddyId, viewerUserId)))
        .limit(1);
      return !!buddy;

    case "mutual_only":
      // Check for mutual connection
      const [mutual1] = await db
        .select()
        .from(fuckBuddies)
        .where(and(eq(fuckBuddies.userId, targetUserId), eq(fuckBuddies.buddyId, viewerUserId)))
        .limit(1);
      const [mutual2] = await db
        .select()
        .from(fuckBuddies)
        .where(and(eq(fuckBuddies.userId, viewerUserId), eq(fuckBuddies.buddyId, targetUserId)))
        .limit(1);
      return !!(mutual1 && mutual2);

    case "nobody":
      return false;

    default:
      return true;
  }
}

// ============================================================
// PRIVACY SETTINGS ROUTES
// ============================================================

/**
 * Get privacy settings
 * GET /api/privacy
 */
router.get("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    let [privacy] = await db
      .select()
      .from(profilePrivacySettings)
      .where(eq(profilePrivacySettings.userId, userId))
      .limit(1);

    // Create default settings if none exist
    if (!privacy) {
      [privacy] = await db
        .insert(profilePrivacySettings)
        .values({ userId })
        .returning();
    }

    res.json(privacy);
  } catch (error: any) {
    logger.error("Failed to get privacy settings:", error);
    res.status(500).json({ error: "Failed to get privacy settings" });
  }
});

/**
 * Update privacy settings
 * PATCH /api/privacy
 */
router.patch("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const parsed = updatePrivacySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }

    const updates = parsed.data;

    // Upsert privacy settings
    let [privacy] = await db
      .select()
      .from(profilePrivacySettings)
      .where(eq(profilePrivacySettings.userId, userId))
      .limit(1);

    if (privacy) {
      [privacy] = await db
        .update(profilePrivacySettings)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(profilePrivacySettings.userId, userId))
        .returning();
    } else {
      [privacy] = await db
        .insert(profilePrivacySettings)
        .values({ userId, ...updates })
        .returning();
    }

    logger.info(`Privacy settings updated for user ${userId}`);
    res.json(privacy);
  } catch (error: any) {
    logger.error("Failed to update privacy settings:", error);
    res.status(500).json({ error: "Failed to update privacy settings" });
  }
});

// ============================================================
// BLOCK MANAGEMENT ROUTES
// ============================================================

/**
 * Get blocked users
 * GET /api/privacy/blocked
 */
router.get("/blocked", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const blocks = await db
      .select()
      .from(userBlocks)
      .where(eq(userBlocks.blockerId, userId));

    // Get user details for blocked users
    const blockedWithDetails = await Promise.all(
      blocks.map(async (block) => {
        const [user] = await db
          .select({
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            profileImageUrl: users.profileImageUrl,
          })
          .from(users)
          .where(eq(users.id, block.blockedId))
          .limit(1);

        return {
          ...block,
          blockedUser: user,
        };
      })
    );

    res.json(blockedWithDetails);
  } catch (error: any) {
    logger.error("Failed to get blocked users:", error);
    res.status(500).json({ error: "Failed to get blocked users" });
  }
});

/**
 * Block a user
 * POST /api/privacy/block
 */
router.post("/block", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const blockerId = (req as any).user?.id;

    const parsed = blockUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }

    const { userId: blockedId, reason } = parsed.data;

    // Can't block yourself
    if (blockerId === blockedId) {
      return res.status(400).json({ error: "Cannot block yourself" });
    }

    // Check if user exists
    const [blockedUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, blockedId))
      .limit(1);

    if (!blockedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already blocked
    const [existingBlock] = await db
      .select()
      .from(userBlocks)
      .where(and(eq(userBlocks.blockerId, blockerId), eq(userBlocks.blockedId, blockedId)))
      .limit(1);

    if (existingBlock) {
      return res.status(400).json({ error: "User already blocked" });
    }

    // Create block
    const [block] = await db
      .insert(userBlocks)
      .values({ blockerId, blockedId, reason })
      .returning();

    // Remove any fuck buddy connections
    await db.delete(fuckBuddies).where(
      or(
        and(eq(fuckBuddies.userId, blockerId), eq(fuckBuddies.buddyId, blockedId)),
        and(eq(fuckBuddies.userId, blockedId), eq(fuckBuddies.buddyId, blockerId))
      )
    );

    // Update blocked user IDs array in privacy settings
    await db
      .update(profilePrivacySettings)
      .set({
        blockedUserIds: sql`array_append(${profilePrivacySettings.blockedUserIds}, ${blockedId})`,
        updatedAt: new Date(),
      })
      .where(eq(profilePrivacySettings.userId, blockerId));

    logger.info(`User ${blockerId} blocked ${blockedId}`);
    res.status(201).json({ success: true, block });
  } catch (error: any) {
    logger.error("Failed to block user:", error);
    res.status(500).json({ error: "Failed to block user" });
  }
});

/**
 * Unblock a user
 * DELETE /api/privacy/block/:blockedId
 */
router.delete("/block/:blockedId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const blockerId = (req as any).user?.id;
    const { blockedId } = req.params;

    // Delete the block
    await db
      .delete(userBlocks)
      .where(and(eq(userBlocks.blockerId, blockerId), eq(userBlocks.blockedId, blockedId)));

    // Remove from blocked user IDs array
    await db
      .update(profilePrivacySettings)
      .set({
        blockedUserIds: sql`array_remove(${profilePrivacySettings.blockedUserIds}, ${blockedId})`,
        updatedAt: new Date(),
      })
      .where(eq(profilePrivacySettings.userId, blockerId));

    logger.info(`User ${blockerId} unblocked ${blockedId}`);
    res.json({ success: true });
  } catch (error: any) {
    logger.error("Failed to unblock user:", error);
    res.status(500).json({ error: "Failed to unblock user" });
  }
});

/**
 * Check if a user is blocked
 * GET /api/privacy/blocked/:userId
 */
router.get("/blocked/:userId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user?.id;
    const { userId } = req.params;

    // Check if I blocked them
    const [iBlocked] = await db
      .select()
      .from(userBlocks)
      .where(and(eq(userBlocks.blockerId, currentUserId), eq(userBlocks.blockedId, userId)))
      .limit(1);

    // Check if they blocked me
    const [theyBlocked] = await db
      .select()
      .from(userBlocks)
      .where(and(eq(userBlocks.blockerId, userId), eq(userBlocks.blockedId, currentUserId)))
      .limit(1);

    res.json({
      iBlockedThem: !!iBlocked,
      theyBlockedMe: !!theyBlocked,
      isBlocked: !!(iBlocked || theyBlocked),
    });
  } catch (error: any) {
    logger.error("Failed to check block status:", error);
    res.status(500).json({ error: "Failed to check block status" });
  }
});

/**
 * Check privacy permissions for viewing a profile
 * GET /api/privacy/can-view/:targetUserId
 */
router.get("/can-view/:targetUserId", async (req: Request, res: Response) => {
  try {
    const viewerId = (req as any).user?.id;
    const { targetUserId } = req.params;

    const canView = await checkPrivacyPermission(targetUserId, viewerId, "profileVisibility");
    const canSeeWall = await checkPrivacyPermission(targetUserId, viewerId, "whoCanSeeWall");
    const canPostOnWall = await checkPrivacyPermission(targetUserId, viewerId, "whoCanPostOnWall");
    const canMessage = await checkPrivacyPermission(targetUserId, viewerId, "whoCanMessage");
    const canSendBuddyRequest = await checkPrivacyPermission(targetUserId, viewerId, "whoCanSendBuddyRequests");

    res.json({
      canViewProfile: canView,
      canSeeWall,
      canPostOnWall,
      canMessage,
      canSendBuddyRequest,
    });
  } catch (error: any) {
    logger.error("Failed to check privacy permissions:", error);
    res.status(500).json({ error: "Failed to check permissions" });
  }
});

export default router;
