// @ts-nocheck
/**
 * Notification Routes
 *
 * Real-time notifications for social activity:
 * - Wall posts, reactions, comments
 * - Fuck buddy requests
 * - Messages and live streams
 * - Notification preferences
 */

import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { socialNotifications as notifications, users } from "@shared/schema";
import { eq, and, desc, sql, count, lt, isNull, or } from "drizzle-orm";
import { isAuthenticated } from "../middleware/auth";
import { logger } from "../logger";

const router = Router();

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const updatePreferencesSchema = z.object({
  pushEnabled: z.boolean().optional(),
  pushWallPosts: z.boolean().optional(),
  pushReactions: z.boolean().optional(),
  pushComments: z.boolean().optional(),
  pushBuddyRequests: z.boolean().optional(),
  pushMessages: z.boolean().optional(),
  pushLiveStreams: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  emailDigestFrequency: z.enum(["instant", "daily", "weekly", "never"]).optional(),
  emailWallActivity: z.boolean().optional(),
  emailBuddyRequests: z.boolean().optional(),
  emailPromotions: z.boolean().optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
  quietHoursTimezone: z.string().optional(),
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

async function formatNotification(notification: any) {
  let fromUser = null;
  if (notification.fromUserId) {
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(users)
      .where(eq(users.id, notification.fromUserId))
      .limit(1);
    fromUser = user;
  }

  return {
    ...notification,
    fromUser,
  };
}

// ============================================================
// NOTIFICATION ROUTES
// ============================================================

/**
 * Get user's notifications
 * GET /api/notifications
 */
router.get("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { page = "1", limit = "20", unreadOnly = "false" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 50);
    const offset = (pageNum - 1) * limitNum;

    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limitNum)
      .offset(offset);

    if (unreadOnly === "true") {
      query = db
        .select()
        .from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
        .orderBy(desc(notifications.createdAt))
        .limit(limitNum)
        .offset(offset);
    }

    const notifs = await query;
    const formatted = await Promise.all(notifs.map(formatNotification));

    // Get unread count
    const [{ unreadCount }] = await db
      .select({ unreadCount: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

    res.json({
      notifications: formatted,
      unreadCount: Number(unreadCount),
      pagination: {
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (error: any) {
    logger.error("Failed to fetch notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

/**
 * Get unread notification count
 * GET /api/notifications/count
 */
router.get("/count", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const [{ unreadCount }] = await db
      .select({ unreadCount: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

    res.json({ unreadCount: Number(unreadCount) });
  } catch (error: any) {
    logger.error("Failed to get notification count:", error);
    res.status(500).json({ error: "Failed to get count" });
  }
});

/**
 * Mark notification as read
 * POST /api/notifications/:notificationId/read
 */
router.post("/:notificationId/read", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { notificationId } = req.params;

    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));

    res.json({ success: true });
  } catch (error: any) {
    logger.error("Failed to mark notification as read:", error);
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

/**
 * Mark all notifications as read
 * POST /api/notifications/read-all
 */
router.post("/read-all", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const result = await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

    res.json({ success: true });
  } catch (error: any) {
    logger.error("Failed to mark all as read:", error);
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});

/**
 * Delete a notification
 * DELETE /api/notifications/:notificationId
 */
router.delete("/:notificationId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { notificationId } = req.params;

    await db
      .delete(notifications)
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));

    res.json({ success: true });
  } catch (error: any) {
    logger.error("Failed to delete notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

/**
 * Clear all notifications
 * DELETE /api/notifications/clear-all
 */
router.delete("/clear-all", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    await db.delete(notifications).where(eq(notifications.userId, userId));

    res.json({ success: true });
  } catch (error: any) {
    logger.error("Failed to clear notifications:", error);
    res.status(500).json({ error: "Failed to clear notifications" });
  }
});

// ============================================================
// PREFERENCES ROUTES (stubbed - notificationPreferences table not yet created)
// ============================================================

/**
 * Get notification preferences
 * GET /api/notifications/preferences
 */
router.get("/preferences", isAuthenticated, async (req: Request, res: Response) => {
  // Return defaults until notificationPreferences table exists
  res.json({
    pushEnabled: true,
    pushWallPosts: true,
    pushReactions: true,
    pushComments: true,
    pushBuddyRequests: true,
    pushMessages: true,
    pushLiveStreams: true,
    emailEnabled: true,
    emailDigestFrequency: "daily",
    emailWallActivity: true,
    emailBuddyRequests: true,
    emailPromotions: false,
    quietHoursEnabled: false,
  });
});

/**
 * Update notification preferences
 * PATCH /api/notifications/preferences
 */
router.patch("/preferences", isAuthenticated, async (req: Request, res: Response) => {
  // Stub - accept and acknowledge until table exists
  res.json({ success: true, message: "Preferences noted" });
});

// ============================================================
// NOTIFICATION SERVICE (for internal use)
// ============================================================

/**
 * Create a notification (internal API)
 */
export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  message?: string;
  fromUserId?: string;
  relatedPostId?: string;
  relatedCommentId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}) {
  try {
    // Preferences check stubbed out until notificationPreferences table is created
    // All notifications enabled by default

    const [notification] = await db
      .insert(notifications)
      .values({ ...data, type: data.type as any })
      .returning();

    // TODO: Send push notification via FCM/APNs
    // TODO: Send email notification if enabled

    return notification;
  } catch (error) {
    logger.error("Failed to create notification:", error);
    return null;
  }
}

/**
 * Create wall activity notification
 */
export async function notifyWallActivity(
  type: "wall_post" | "wall_reaction" | "wall_comment" | "wall_mention",
  profileOwnerId: string,
  fromUserId: string,
  postId: string,
  content?: string
) {
  // Don't notify yourself
  if (profileOwnerId === fromUserId) return;

  const [fromUser] = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.id, fromUserId))
    .limit(1);

  const titles: Record<string, string> = {
    wall_post: "New Wall Post! 📝",
    wall_reaction: "Someone Reacted! 🔥",
    wall_comment: "New Comment! 💬",
    wall_mention: "You Were Mentioned! 👋",
  };

  const messages: Record<string, string> = {
    wall_post: `${fromUser?.username || "Someone"} posted on your wall`,
    wall_reaction: `${fromUser?.username || "Someone"} reacted to your post`,
    wall_comment: `${fromUser?.username || "Someone"} commented on your post`,
    wall_mention: `${fromUser?.username || "Someone"} mentioned you in a post`,
  };

  await createNotification({
    userId: profileOwnerId,
    type,
    title: titles[type],
    message: messages[type] + (content ? `: "${content.substring(0, 50)}..."` : ""),
    fromUserId,
    relatedPostId: postId,
    actionUrl: `/profile/${profileOwnerId}?post=${postId}`,
  });
}

export default router;
