// @ts-nocheck
/**
 * Profile Wall Routes
 *
 * Facebook-style wall posts for user profiles:
 * - Anyone can post text to any profile's wall
 * - Only verified creators can post media (photos/videos)
 * - Reactions, comments, and sharing
 * - Pinned posts for profile owners
 */

import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db } from "../db";
import {
  profileWallPosts,
  profileWallComments,
  profileWallReactions,
  users,
} from "@shared/schema";
import { eq, and, desc, asc, sql, or, count } from "drizzle-orm";
import { isAuthenticated } from "../middleware/auth";
import { logger } from "../logger";

const router = Router();

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const createWallPostSchema = z.object({
  profileUserId: z.string().uuid(),
  type: z.enum(["text", "photo", "video", "mood", "check_in", "milestone"]).default("text"),
  content: z.string().min(1).max(5000),
  mediaUrls: z.array(z.string().url()).max(10).optional(),
  mood: z.string().max(100).optional(),
  moodEmoji: z.string().max(10).optional(),
  location: z.string().max(200).optional(),
  visibility: z.enum(["public", "friends_only", "private"]).default("public"),
});

const createCommentSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  parentId: z.string().uuid().optional(),
  mediaUrl: z.string().url().optional(),
});

const reactionSchema = z.object({
  reactionType: z.enum([
    "fire",
    "heart",
    "eggplant",
    "peach",
    "sweat",
    "devil",
    "tongue",
    "eyes",
  ]),
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Check if user is a verified creator
 */
async function isVerifiedCreator(userId: string): Promise<boolean> {
  const [user] = await db
    .select({ isCreator: users.isCreator, isVerified: users.isVerified })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user?.isCreator === true && user?.isVerified === true;
}

/**
 * Format wall post with author info
 */
async function formatWallPost(post: any) {
  const [author] = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      profileImageUrl: users.profileImageUrl,
      isCreator: users.isCreator,
      isVerified: users.isVerified,
    })
    .from(users)
    .where(eq(users.id, post.authorId))
    .limit(1);

  // Get reaction counts by type
  const reactions = await db
    .select({
      type: profileWallReactions.reactionType,
      count: count(),
    })
    .from(profileWallReactions)
    .where(eq(profileWallReactions.postId, post.id))
    .groupBy(profileWallReactions.reactionType);

  return {
    ...post,
    authorUsername: author?.username || "Unknown",
    authorAvatar: author?.profileImageUrl,
    authorIsCreator: author?.isCreator || false,
    authorIsVerified: author?.isVerified || false,
    reactions: reactions.map((r) => ({
      type: r.type,
      count: Number(r.count),
    })),
  };
}

// ============================================================
// PUBLIC ROUTES
// ============================================================

/**
 * Get wall posts for a user profile
 * GET /api/wall-posts/:userId
 */
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = "1", limit = "20" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 50);
    const offset = (pageNum - 1) * limitNum;

    // Get posts, pinned first, then by date
    const posts = await db
      .select()
      .from(profileWallPosts)
      .where(eq(profileWallPosts.profileUserId, userId))
      .orderBy(
        desc(profileWallPosts.isPinned),
        desc(profileWallPosts.createdAt)
      )
      .limit(limitNum)
      .offset(offset);

    // Format posts with author info
    const formattedPosts = await Promise.all(posts.map(formatWallPost));

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(profileWallPosts)
      .where(eq(profileWallPosts.profileUserId, userId));

    res.json({
      posts: formattedPosts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(total),
        hasMore: offset + posts.length < Number(total),
      },
    });
  } catch (error: any) {
    logger.error("Failed to fetch wall posts:", error);
    res.status(500).json({ error: "Failed to fetch wall posts" });
  }
});

/**
 * Get a single wall post
 * GET /api/wall-posts/post/:postId
 */
router.get("/post/:postId", async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const [post] = await db
      .select()
      .from(profileWallPosts)
      .where(eq(profileWallPosts.id, postId))
      .limit(1);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const formattedPost = await formatWallPost(post);
    res.json(formattedPost);
  } catch (error: any) {
    logger.error("Failed to fetch wall post:", error);
    res.status(500).json({ error: "Failed to fetch wall post" });
  }
});

// ============================================================
// AUTHENTICATED ROUTES
// ============================================================

/**
 * Create a wall post
 * POST /api/wall-posts
 */
router.post("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const parsed = createWallPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }

    const { profileUserId, type, content, mediaUrls, mood, moodEmoji, location, visibility } =
      parsed.data;

    // Check if user is verified creator for media posts
    const hasMedia = mediaUrls && mediaUrls.length > 0;
    if (hasMedia) {
      const isCreator = await isVerifiedCreator(userId);
      if (!isCreator) {
        return res.status(403).json({
          error: "Only verified creators can post media",
          message: "Apply to become a verified creator to post photos and videos",
        });
      }
    }

    // Check if profile exists
    const [profileUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, profileUserId))
      .limit(1);

    if (!profileUser) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Get author creator status
    const authorIsCreator = await isVerifiedCreator(userId);

    // Create the post
    const [newPost] = await db
      .insert(profileWallPosts)
      .values({
        profileUserId,
        authorId: userId,
        type: hasMedia ? (type === "text" ? "photo" : type) : type,
        content,
        mediaUrls: mediaUrls || [],
        mood,
        moodEmoji,
        location,
        visibility,
        authorIsCreator,
      })
      .returning();

    const formattedPost = await formatWallPost(newPost);

    logger.info(`Wall post created by ${userId} on ${profileUserId}'s profile`);
    res.status(201).json(formattedPost);
  } catch (error: any) {
    logger.error("Failed to create wall post:", error);
    res.status(500).json({ error: "Failed to create wall post" });
  }
});

/**
 * Delete a wall post (own post or profile owner)
 * DELETE /api/wall-posts/:postId
 */
router.delete("/:postId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { postId } = req.params;

    // Get the post
    const [post] = await db
      .select()
      .from(profileWallPosts)
      .where(eq(profileWallPosts.id, postId))
      .limit(1);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check authorization (post author or profile owner)
    if (post.authorId !== userId && post.profileUserId !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this post" });
    }

    await db.delete(profileWallPosts).where(eq(profileWallPosts.id, postId));

    logger.info(`Wall post ${postId} deleted by ${userId}`);
    res.json({ success: true });
  } catch (error: any) {
    logger.error("Failed to delete wall post:", error);
    res.status(500).json({ error: "Failed to delete wall post" });
  }
});

/**
 * Pin/unpin a wall post (profile owner only)
 * POST /api/wall-posts/:postId/pin
 */
router.post("/:postId/pin", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { postId } = req.params;

    const [post] = await db
      .select()
      .from(profileWallPosts)
      .where(eq(profileWallPosts.id, postId))
      .limit(1);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Only profile owner can pin
    if (post.profileUserId !== userId) {
      return res.status(403).json({ error: "Only the profile owner can pin posts" });
    }

    // Toggle pin
    const [updatedPost] = await db
      .update(profileWallPosts)
      .set({
        isPinned: !post.isPinned,
        pinnedAt: !post.isPinned ? new Date() : null,
      })
      .where(eq(profileWallPosts.id, postId))
      .returning();

    res.json({
      success: true,
      isPinned: updatedPost.isPinned,
    });
  } catch (error: any) {
    logger.error("Failed to pin wall post:", error);
    res.status(500).json({ error: "Failed to pin wall post" });
  }
});

/**
 * Add reaction to a wall post
 * POST /api/wall-posts/:postId/react
 */
router.post("/:postId/react", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { postId } = req.params;

    const parsed = reactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }

    const { reactionType } = parsed.data;

    // Check if post exists
    const [post] = await db
      .select()
      .from(profileWallPosts)
      .where(eq(profileWallPosts.id, postId))
      .limit(1);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check existing reaction
    const [existingReaction] = await db
      .select()
      .from(profileWallReactions)
      .where(
        and(
          eq(profileWallReactions.postId, postId),
          eq(profileWallReactions.userId, userId)
        )
      )
      .limit(1);

    if (existingReaction) {
      if (existingReaction.reactionType === reactionType) {
        // Remove reaction (toggle off)
        await db
          .delete(profileWallReactions)
          .where(eq(profileWallReactions.id, existingReaction.id));

        // Decrement count
        await db
          .update(profileWallPosts)
          .set({ reactionsCount: sql`${profileWallPosts.reactionsCount} - 1` })
          .where(eq(profileWallPosts.id, postId));

        return res.json({ success: true, action: "removed" });
      } else {
        // Update reaction type
        await db
          .update(profileWallReactions)
          .set({ reactionType })
          .where(eq(profileWallReactions.id, existingReaction.id));

        return res.json({ success: true, action: "changed", reactionType });
      }
    }

    // Create new reaction
    await db.insert(profileWallReactions).values({
      postId,
      userId,
      reactionType,
    });

    // Increment count
    await db
      .update(profileWallPosts)
      .set({ reactionsCount: sql`${profileWallPosts.reactionsCount} + 1` })
      .where(eq(profileWallPosts.id, postId));

    res.json({ success: true, action: "added", reactionType });
  } catch (error: any) {
    logger.error("Failed to add reaction:", error);
    res.status(500).json({ error: "Failed to add reaction" });
  }
});

/**
 * Get comments for a wall post
 * GET /api/wall-posts/:postId/comments
 */
router.get("/:postId/comments", async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { page = "1", limit = "20" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 50);
    const offset = (pageNum - 1) * limitNum;

    const comments = await db
      .select()
      .from(profileWallComments)
      .where(eq(profileWallComments.postId, postId))
      .orderBy(desc(profileWallComments.createdAt))
      .limit(limitNum)
      .offset(offset);

    // Add author info to comments
    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        const [author] = await db
          .select({
            username: users.username,
            profileImageUrl: users.profileImageUrl,
            isCreator: users.isCreator,
            isVerified: users.isVerified,
          })
          .from(users)
          .where(eq(users.id, comment.authorId))
          .limit(1);

        return {
          ...comment,
          authorUsername: author?.username || "Unknown",
          authorAvatar: author?.profileImageUrl,
          authorIsCreator: author?.isCreator || false,
          authorIsVerified: author?.isVerified || false,
        };
      })
    );

    res.json({ comments: commentsWithAuthors });
  } catch (error: any) {
    logger.error("Failed to fetch comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

/**
 * Add a comment to a wall post
 * POST /api/wall-posts/:postId/comments
 */
router.post("/:postId/comments", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { postId } = req.params;

    const parsed = createCommentSchema.omit({ postId: true }).safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }

    const { content, parentId, mediaUrl } = parsed.data;

    // Check if user is verified creator for media comments
    if (mediaUrl) {
      const isCreator = await isVerifiedCreator(userId);
      if (!isCreator) {
        return res.status(403).json({
          error: "Only verified creators can post media in comments",
        });
      }
    }

    // Check if post exists
    const [post] = await db
      .select()
      .from(profileWallPosts)
      .where(eq(profileWallPosts.id, postId))
      .limit(1);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const authorIsCreator = await isVerifiedCreator(userId);

    // Create comment
    const [newComment] = await db
      .insert(profileWallComments)
      .values({
        postId,
        authorId: userId,
        content,
        parentId,
        mediaUrl,
        authorIsCreator,
      })
      .returning();

    // Increment comment count
    await db
      .update(profileWallPosts)
      .set({ commentsCount: sql`${profileWallPosts.commentsCount} + 1` })
      .where(eq(profileWallPosts.id, postId));

    // If replying, increment reply count
    if (parentId) {
      await db
        .update(profileWallComments)
        .set({ repliesCount: sql`${profileWallComments.repliesCount} + 1` })
        .where(eq(profileWallComments.id, parentId));
    }

    // Get author info
    const [author] = await db
      .select({
        username: users.username,
        profileImageUrl: users.profileImageUrl,
        isCreator: users.isCreator,
        isVerified: users.isVerified,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    res.status(201).json({
      ...newComment,
      authorUsername: author?.username,
      authorAvatar: author?.profileImageUrl,
      authorIsCreator: author?.isCreator,
      authorIsVerified: author?.isVerified,
    });
  } catch (error: any) {
    logger.error("Failed to add comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

/**
 * Delete a comment
 * DELETE /api/wall-posts/comments/:commentId
 */
router.delete("/comments/:commentId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { commentId } = req.params;

    // Get the comment and post
    const [comment] = await db
      .select()
      .from(profileWallComments)
      .where(eq(profileWallComments.id, commentId))
      .limit(1);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Get the post to check profile owner
    const [post] = await db
      .select()
      .from(profileWallPosts)
      .where(eq(profileWallPosts.id, comment.postId))
      .limit(1);

    // Check authorization (comment author, post author, or profile owner)
    if (
      comment.authorId !== userId &&
      post?.authorId !== userId &&
      post?.profileUserId !== userId
    ) {
      return res.status(403).json({ error: "Not authorized to delete this comment" });
    }

    await db.delete(profileWallComments).where(eq(profileWallComments.id, commentId));

    // Decrement comment count
    if (post) {
      await db
        .update(profileWallPosts)
        .set({ commentsCount: sql`${profileWallPosts.commentsCount} - 1` })
        .where(eq(profileWallPosts.id, post.id));
    }

    res.json({ success: true });
  } catch (error: any) {
    logger.error("Failed to delete comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

/**
 * Get user's reaction to a post
 * GET /api/wall-posts/:postId/my-reaction
 */
router.get("/:postId/my-reaction", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { postId } = req.params;

    const [reaction] = await db
      .select()
      .from(profileWallReactions)
      .where(
        and(
          eq(profileWallReactions.postId, postId),
          eq(profileWallReactions.userId, userId)
        )
      )
      .limit(1);

    res.json({
      reactionType: reaction?.reactionType || null,
    });
  } catch (error: any) {
    logger.error("Failed to get user reaction:", error);
    res.status(500).json({ error: "Failed to get user reaction" });
  }
});

export default router;
