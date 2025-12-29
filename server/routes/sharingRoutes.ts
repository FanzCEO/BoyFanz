/**
 * Content Sharing Routes - BoyFanz
 *
 * Twitter-style content sharing with creator attribution:
 * - Share posts as embeds (quote tweet style) or links
 * - Tag approval workflow for cross-posting
 * - Cross-platform sharing support
 */

import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db } from "../db";
import {
  sharedPosts,
  wallPosts,
  users,
} from "@shared/schema";
import { eq, and, desc, or, sql, count } from "drizzle-orm";
import { isAuthenticated } from "../middleware/auth";
import { logger } from "../logger";

const router = Router();

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const createShareSchema = z.object({
  originalPostId: z.string(),
  originalCreatorId: z.string(),
  originalPlatform: z.string().default("boyfanz"),
  shareType: z.enum(["embed", "link"]).default("embed"),
  shareCaption: z.string().max(1000).optional(),
  requestTagApproval: z.boolean().default(true),
});

const respondTagSchema = z.object({
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().max(500).optional(),
  showOnMyWall: z.boolean().default(false),
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Fetch original post data and cache it for cross-platform display
 */
async function fetchOriginalPostSnapshot(
  postId: string,
  platform: string
): Promise<any> {
  if (platform === "boyfanz") {
    // Local fetch from wall_posts
    const [post] = await db
      .select({
        content: wallPosts.content,
        mediaUrls: wallPosts.mediaUrls,
        createdAt: wallPosts.createdAt,
      })
      .from(wallPosts)
      .where(eq(wallPosts.id, postId))
      .limit(1);

    if (!post) return null;

    return {
      content: post.content,
      mediaUrls: post.mediaUrls,
      createdAt: post.createdAt?.toISOString(),
    };
  }

  // For cross-platform, fetch from Hub API
  try {
    const response = await fetch(
      `https://hub.fanz.website/api/posts/${platform}/${postId}`
    );
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    logger.error(`Failed to fetch post from ${platform}:`, error);
  }

  return null;
}

/**
 * Format shared post with creator info
 */
async function formatSharedPost(share: any) {
  // Get sharer info
  const [sharer] = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      profileImageUrl: users.profileImageUrl,
      isCreator: users.isCreator,
      isVerified: users.isVerified,
    })
    .from(users)
    .where(eq(users.id, share.sharerId))
    .limit(1);

  // Get original creator info (if on same platform)
  let originalCreator = null;
  if (share.originalPlatform === "boyfanz") {
    const [creator] = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        profileImageUrl: users.profileImageUrl,
        isCreator: users.isCreator,
        isVerified: users.isVerified,
      })
      .from(users)
      .where(eq(users.id, share.originalCreatorId))
      .limit(1);
    originalCreator = creator;
  }

  return {
    ...share,
    sharer: sharer || null,
    originalCreator: originalCreator || {
      id: share.originalCreatorId,
      platform: share.originalPlatform,
      ...share.originalPostSnapshot,
    },
  };
}

// ============================================================
// PUBLIC ROUTES
// ============================================================

/**
 * Get shared posts on a user's wall
 * GET /api/shares/wall/:userId
 */
router.get("/wall/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = "1", limit = "20" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 50);
    const offset = (pageNum - 1) * limitNum;

    // Get shares where:
    // 1. User is the sharer AND showOnSharerWall is true
    // 2. User is the original creator AND showOnOriginalCreatorWall is true AND tag is approved
    const shares = await db
      .select()
      .from(sharedPosts)
      .where(
        or(
          and(
            eq(sharedPosts.sharerId, userId),
            eq(sharedPosts.showOnSharerWall, true)
          ),
          and(
            eq(sharedPosts.originalCreatorId, userId),
            eq(sharedPosts.showOnOriginalCreatorWall, true),
            eq(sharedPosts.tagStatus, "approved")
          )
        )
      )
      .orderBy(desc(sharedPosts.createdAt))
      .limit(limitNum)
      .offset(offset);

    const formattedShares = await Promise.all(shares.map(formatSharedPost));

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(sharedPosts)
      .where(
        or(
          and(
            eq(sharedPosts.sharerId, userId),
            eq(sharedPosts.showOnSharerWall, true)
          ),
          and(
            eq(sharedPosts.originalCreatorId, userId),
            eq(sharedPosts.showOnOriginalCreatorWall, true),
            eq(sharedPosts.tagStatus, "approved")
          )
        )
      );

    res.json({
      shares: formattedShares,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(total),
        hasMore: offset + shares.length < Number(total),
      },
    });
  } catch (error: any) {
    logger.error("Failed to fetch shared posts:", error);
    res.status(500).json({ error: "Failed to fetch shared posts" });
  }
});

/**
 * Get a single shared post
 * GET /api/shares/:shareId
 */
router.get("/:shareId", async (req: Request, res: Response) => {
  try {
    const { shareId } = req.params;

    const [share] = await db
      .select()
      .from(sharedPosts)
      .where(eq(sharedPosts.id, shareId))
      .limit(1);

    if (!share) {
      return res.status(404).json({ error: "Share not found" });
    }

    const formattedShare = await formatSharedPost(share);
    res.json(formattedShare);
  } catch (error: any) {
    logger.error("Failed to fetch share:", error);
    res.status(500).json({ error: "Failed to fetch share" });
  }
});

// ============================================================
// AUTHENTICATED ROUTES
// ============================================================

/**
 * Create a new share (Twitter-style repost)
 * POST /api/shares
 */
router.post("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const parsed = createShareSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }

    const {
      originalPostId,
      originalCreatorId,
      originalPlatform,
      shareType,
      shareCaption,
      requestTagApproval,
    } = parsed.data;

    // Check if already shared this post
    const [existing] = await db
      .select()
      .from(sharedPosts)
      .where(
        and(
          eq(sharedPosts.sharerId, userId),
          eq(sharedPosts.originalPostId, originalPostId)
        )
      )
      .limit(1);

    if (existing) {
      return res.status(400).json({ error: "You have already shared this post" });
    }

    // Fetch and cache original post data
    const snapshot = await fetchOriginalPostSnapshot(originalPostId, originalPlatform);

    // Get original creator info for snapshot
    let creatorName = null;
    let creatorAvatar = null;
    if (originalPlatform === "boyfanz") {
      const [creator] = await db
        .select({
          displayName: users.displayName,
          profileImageUrl: users.profileImageUrl,
        })
        .from(users)
        .where(eq(users.id, originalCreatorId))
        .limit(1);
      creatorName = creator?.displayName;
      creatorAvatar = creator?.profileImageUrl;
    }

    // Create the share
    const [newShare] = await db
      .insert(sharedPosts)
      .values({
        sharerId: userId,
        sharerPlatform: "boyfanz",
        originalPostId,
        originalCreatorId,
        originalPlatform,
        shareType,
        shareCaption,
        tagStatus: requestTagApproval ? "pending" : "approved",
        showOnSharerWall: true,
        showOnOriginalCreatorWall: false,
        originalPostSnapshot: {
          ...snapshot,
          creatorName,
          creatorAvatar,
        },
      })
      .returning();

    // Increment reshare count on original (if same platform)
    if (originalPlatform === "boyfanz") {
      await db
        .update(wallPosts)
        .set({
          // Note: Would need to add reshareCount to wallPosts schema
          updatedAt: new Date(),
        })
        .where(eq(wallPosts.id, originalPostId));
    }

    // TODO: Send notification to original creator about the tag request

    const formattedShare = await formatSharedPost(newShare);
    logger.info(`Share created by ${userId} for post ${originalPostId}`);

    res.status(201).json(formattedShare);
  } catch (error: any) {
    logger.error("Failed to create share:", error);
    res.status(500).json({ error: "Failed to create share" });
  }
});

/**
 * Get pending tag requests for current user
 * GET /api/shares/tags/pending
 */
router.get("/tags/pending", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const pending = await db
      .select()
      .from(sharedPosts)
      .where(
        and(
          eq(sharedPosts.originalCreatorId, userId),
          eq(sharedPosts.tagStatus, "pending")
        )
      )
      .orderBy(desc(sharedPosts.tagRequestedAt));

    const formattedPending = await Promise.all(pending.map(formatSharedPost));

    res.json({
      pending: formattedPending,
      count: formattedPending.length,
    });
  } catch (error: any) {
    logger.error("Failed to fetch pending tags:", error);
    res.status(500).json({ error: "Failed to fetch pending tags" });
  }
});

/**
 * Respond to a tag request (approve or reject)
 * POST /api/shares/:shareId/tag-response
 */
router.post("/:shareId/tag-response", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { shareId } = req.params;

    const parsed = respondTagSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }

    const { action, rejectionReason, showOnMyWall } = parsed.data;

    // Get the share
    const [share] = await db
      .select()
      .from(sharedPosts)
      .where(
        and(
          eq(sharedPosts.id, shareId),
          eq(sharedPosts.originalCreatorId, userId),
          eq(sharedPosts.tagStatus, "pending")
        )
      )
      .limit(1);

    if (!share) {
      return res.status(404).json({ error: "Tag request not found or already responded" });
    }

    // Update the share
    const [updated] = await db
      .update(sharedPosts)
      .set({
        tagStatus: action === "approve" ? "approved" : "rejected",
        tagRespondedAt: new Date(),
        tagRejectionReason: action === "reject" ? rejectionReason : null,
        showOnOriginalCreatorWall: action === "approve" ? showOnMyWall : false,
        updatedAt: new Date(),
      })
      .where(eq(sharedPosts.id, shareId))
      .returning();

    // TODO: Notify sharer of response

    const formattedShare = await formatSharedPost(updated);
    logger.info(`Tag ${action}d by ${userId} for share ${shareId}`);

    res.json({
      success: true,
      action,
      share: formattedShare,
    });
  } catch (error: any) {
    logger.error("Failed to respond to tag:", error);
    res.status(500).json({ error: "Failed to respond to tag" });
  }
});

/**
 * Delete a share
 * DELETE /api/shares/:shareId
 */
router.delete("/:shareId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { shareId } = req.params;

    const [share] = await db
      .select()
      .from(sharedPosts)
      .where(eq(sharedPosts.id, shareId))
      .limit(1);

    if (!share) {
      return res.status(404).json({ error: "Share not found" });
    }

    // Only sharer can delete
    if (share.sharerId !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this share" });
    }

    await db.delete(sharedPosts).where(eq(sharedPosts.id, shareId));

    logger.info(`Share ${shareId} deleted by ${userId}`);
    res.json({ success: true });
  } catch (error: any) {
    logger.error("Failed to delete share:", error);
    res.status(500).json({ error: "Failed to delete share" });
  }
});

/**
 * Track click-through to original post
 * POST /api/shares/:shareId/click
 */
router.post("/:shareId/click", async (req: Request, res: Response) => {
  try {
    const { shareId } = req.params;

    await db
      .update(sharedPosts)
      .set({
        clickThroughCount: sql`${sharedPosts.clickThroughCount} + 1`,
      })
      .where(eq(sharedPosts.id, shareId));

    res.json({ success: true });
  } catch (error: any) {
    logger.error("Failed to track click:", error);
    res.status(500).json({ error: "Failed to track click" });
  }
});

/**
 * Get share stats for original creator
 * GET /api/shares/stats/creator
 */
router.get("/stats/creator", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    // Get total shares of my content
    const [{ totalShares }] = await db
      .select({ totalShares: count() })
      .from(sharedPosts)
      .where(eq(sharedPosts.originalCreatorId, userId));

    // Get approved shares
    const [{ approvedShares }] = await db
      .select({ approvedShares: count() })
      .from(sharedPosts)
      .where(
        and(
          eq(sharedPosts.originalCreatorId, userId),
          eq(sharedPosts.tagStatus, "approved")
        )
      );

    // Get pending shares
    const [{ pendingShares }] = await db
      .select({ pendingShares: count() })
      .from(sharedPosts)
      .where(
        and(
          eq(sharedPosts.originalCreatorId, userId),
          eq(sharedPosts.tagStatus, "pending")
        )
      );

    // Get total click-throughs
    const [clickResult] = await db
      .select({
        totalClicks: sql`COALESCE(SUM(${sharedPosts.clickThroughCount}), 0)`,
      })
      .from(sharedPosts)
      .where(eq(sharedPosts.originalCreatorId, userId));

    res.json({
      totalShares: Number(totalShares),
      approvedShares: Number(approvedShares),
      pendingShares: Number(pendingShares),
      totalClickThroughs: Number(clickResult?.totalClicks || 0),
    });
  } catch (error: any) {
    logger.error("Failed to fetch share stats:", error);
    res.status(500).json({ error: "Failed to fetch share stats" });
  }
});

export default router;
