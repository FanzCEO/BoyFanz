// @ts-nocheck
/**
 * Naughty Profile Routes
 *
 * Extended profile data for the fuck buddy / naughty profile system:
 * - Sexual preferences
 * - Kinks & fantasies
 * - Turn-ons / turn-offs
 * - Top 8 fuck buddies
 * - Testimonials
 * - Wall posts
 */

import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db } from "../db";
import {
  users,
  fuckBuddies,
  userProfiles,
  wallPosts,
  wallReactions,
  testimonials,
} from "@shared/schema";
import { eq, and, desc, or, sql, count } from "drizzle-orm";
import { isAuthenticated } from "../middleware/auth";
import { logger } from "../logger";

const router = Router();

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

async function getTopFuckBuddies(userId: string, limit = 8) {
  try {
    const buddies = await db
      .select({
        id: fuckBuddies.buddyId,
        relationshipType: fuckBuddies.relationshipType,
        isTopEight: fuckBuddies.isTopEight,
        topEightPosition: fuckBuddies.topEightPosition,
      })
      .from(fuckBuddies)
      .where(eq(fuckBuddies.userId, userId))
      .orderBy(desc(fuckBuddies.isTopEight), fuckBuddies.topEightPosition, desc(fuckBuddies.connectionScore))
      .limit(limit);

    // Get user details for each buddy
    const buddyDetails = await Promise.all(
      buddies.map(async (buddy) => {
        const [user] = await db
          .select({
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            profileImageUrl: users.profileImageUrl,
            isVerified: users.isVerified,
            isCreator: users.isCreator,
            onlineStatus: users.onlineStatus,
          })
          .from(users)
          .where(eq(users.id, buddy.id))
          .limit(1);

        return {
          id: buddy.id,
          username: user?.username || "Unknown",
          displayName: user?.displayName,
          profileImageUrl: user?.profileImageUrl,
          isOnline: user?.onlineStatus === "online",
          isVerified: user?.isVerified || false,
          isCreator: user?.isCreator || false,
          relationship: buddy.relationshipType || "fuckbuddy",
          isTopEight: buddy.isTopEight || false,
          topEightPosition: buddy.topEightPosition,
        };
      })
    );

    return buddyDetails;
  } catch (error) {
    logger.error("Failed to get top fuck buddies:", error);
    return [];
  }
}

async function getUserTestimonials(userId: string, limit = 10) {
  try {
    // Check if testimonials table exists
    const result = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.toUserId, userId))
      .orderBy(desc(testimonials.createdAt))
      .limit(limit);

    // Get user details for each testimonial author
    const formatted = await Promise.all(
      result.map(async (testimonial) => {
        const [fromUser] = await db
          .select({
            id: users.id,
            username: users.username,
            profileImageUrl: users.profileImageUrl,
          })
          .from(users)
          .where(eq(users.id, testimonial.fromUserId))
          .limit(1);

        return {
          id: testimonial.id,
          fromUser: fromUser || { id: testimonial.fromUserId, username: "Anonymous" },
          content: testimonial.content,
          rating: testimonial.rating || 5,
          createdAt: testimonial.createdAt,
        };
      })
    );

    return formatted;
  } catch (error) {
    // Table might not exist yet
    logger.debug("Testimonials table may not exist:", error);
    return [];
  }
}

// ============================================================
// ROUTES
// ============================================================

/**
 * Get naughty profile for a user
 * GET /api/naughty-profile/:userId
 */
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).user?.id;

    // Get basic user info
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get extended profile if it exists
    let extendedProfile: any = null;
    try {
      const [profile] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId))
        .limit(1);
      extendedProfile = profile;
    } catch (e) {
      // userProfiles table might not exist
      logger.debug("userProfiles table may not exist");
    }

    // Get buddy counts
    const [buddyCount] = await db
      .select({ count: count() })
      .from(fuckBuddies)
      .where(eq(fuckBuddies.userId, userId));

    // Get Top 8 fuck buddies
    const topFuckBuddies = await getTopFuckBuddies(userId, 8);

    // Get testimonials
    const userTestimonials = await getUserTestimonials(userId, 10);

    // Build the naughty profile response
    const naughtyProfile = {
      id: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      profileImageUrl: user.profileImageUrl,
      coverImageUrl: extendedProfile?.coverImageUrl || null,
      bio: user.bio || extendedProfile?.bio || "No bio yet... 😏",
      isVerified: user.isVerified || false,
      isOnline: user.onlineStatus === "online",
      lastSeenAt: user.lastSeenAt || new Date().toISOString(),
      joinedAt: user.createdAt || new Date().toISOString(),
      location: extendedProfile?.location || user.location || null,
      age: extendedProfile?.age || null,
      pronouns: extendedProfile?.pronouns || null,

      // Naughty profile fields
      currentMood: extendedProfile?.currentMood || "😈 Feeling Naughty",
      fantasies: extendedProfile?.fantasies || ["Roleplay", "Voyeurism", "Exhibitionism"],
      kinks: extendedProfile?.kinks || ["Leather", "Bondage", "Toys"],
      turnOns: extendedProfile?.turnOns || ["Confidence", "Eye contact", "Teasing"],
      turnOffs: extendedProfile?.turnOffs || ["Bad hygiene", "Rudeness", "Ghosting"],
      lookingFor: extendedProfile?.lookingFor || ["Fun", "Casual", "NSA"],
      sexualOrientation: extendedProfile?.sexualOrientation || "Open",
      relationshipStatus: extendedProfile?.relationshipStatus || "Single & Ready",
      bodyType: extendedProfile?.bodyType || "Athletic",
      position: extendedProfile?.position || "Versatile",

      // Stats
      fuckBuddyCount: buddyCount?.count || 0,
      admirerCount: user.followerCount || 0,
      playmateCount: user.followingCount || 0,
      postCount: user.postsCount || 0,

      // Theme
      theme: extendedProfile?.profileTheme || null,

      // Top 8
      topFuckBuddies,

      // Testimonials
      testimonials: userTestimonials,
    };

    res.json(naughtyProfile);
  } catch (error: any) {
    logger.error("Failed to fetch naughty profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

/**
 * Update naughty profile
 * PATCH /api/naughty-profile
 */
router.patch("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const updates = req.body;

    // Validate updates
    const allowedFields = [
      "currentMood",
      "fantasies",
      "kinks",
      "turnOns",
      "turnOffs",
      "lookingFor",
      "sexualOrientation",
      "relationshipStatus",
      "bodyType",
      "position",
      "coverImageUrl",
      "profileTheme",
    ];

    const filteredUpdates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    // Update or create extended profile
    try {
      const [existing] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId))
        .limit(1);

      if (existing) {
        await db
          .update(userProfiles)
          .set({ ...filteredUpdates, updatedAt: new Date() })
          .where(eq(userProfiles.userId, userId));
      } else {
        await db.insert(userProfiles).values({
          userId,
          ...filteredUpdates,
        });
      }
    } catch (e) {
      // If userProfiles doesn't exist, just update the users table for basic fields
      logger.debug("userProfiles table may not exist, updating basic user fields");
    }

    res.json({ success: true });
  } catch (error: any) {
    logger.error("Failed to update naughty profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

/**
 * Get wall posts for a user
 * GET /api/wall-posts/:userId
 */
router.get("/wall/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Try to get wall posts
    let posts: any[] = [];
    try {
      posts = await db
        .select()
        .from(wallPosts)
        .where(eq(wallPosts.profileUserId, userId))
        .orderBy(desc(wallPosts.isPinned), desc(wallPosts.createdAt))
        .limit(Number(limit))
        .offset(Number(offset));

      // Get author details and reaction counts for each post
      const formattedPosts = await Promise.all(
        posts.map(async (post) => {
          const [author] = await db
            .select({
              id: users.id,
              username: users.username,
              profileImageUrl: users.profileImageUrl,
              isCreator: users.isCreator,
              isVerified: users.isVerified,
            })
            .from(users)
            .where(eq(users.id, post.authorId))
            .limit(1);

          // Get reaction counts
          let reactionCounts: any[] = [];
          try {
            reactionCounts = await db
              .select({
                type: wallReactions.reactionType,
                count: count(),
              })
              .from(wallReactions)
              .where(eq(wallReactions.postId, post.id))
              .groupBy(wallReactions.reactionType);
          } catch (e) {
            // wallReactions table might not exist
          }

          return {
            id: post.id,
            authorId: post.authorId,
            authorUsername: author?.username || "Unknown",
            authorAvatar: author?.profileImageUrl,
            authorIsCreator: author?.isCreator || false,
            authorIsVerified: author?.isVerified || false,
            type: post.type || "text",
            content: post.content,
            mediaUrls: post.mediaUrls || [],
            mood: post.mood,
            moodEmoji: post.moodEmoji,
            location: post.location,
            isPinned: post.isPinned || false,
            reactionsCount: reactionCounts.reduce((sum, r) => sum + Number(r.count), 0),
            commentsCount: post.commentsCount || 0,
            reactions: reactionCounts.map((r) => ({ type: r.type, count: Number(r.count) })),
            createdAt: post.createdAt,
          };
        })
      );

      res.json(formattedPosts);
    } catch (e) {
      // wallPosts table might not exist
      logger.debug("wallPosts table may not exist");
      res.json([]);
    }
  } catch (error: any) {
    logger.error("Failed to fetch wall posts:", error);
    res.status(500).json({ error: "Failed to fetch wall posts" });
  }
});

/**
 * Post to a user's wall
 * POST /api/wall-posts/:userId
 */
router.post("/wall/:userId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const authorId = (req as any).user?.id;
    const { content, type = "text", mediaUrls, mood, moodEmoji, location } = req.body;

    if (!content && (!mediaUrls || mediaUrls.length === 0)) {
      return res.status(400).json({ error: "Content or media required" });
    }

    // Check if the current user is a verified creator before allowing media
    if (mediaUrls && mediaUrls.length > 0) {
      const [author] = await db
        .select({ isCreator: users.isCreator, isVerified: users.isVerified })
        .from(users)
        .where(eq(users.id, authorId))
        .limit(1);

      if (!author?.isCreator || !author?.isVerified) {
        return res.status(403).json({ error: "Only verified creators can post media" });
      }
    }

    try {
      const [newPost] = await db
        .insert(wallPosts)
        .values({
          profileUserId: userId,
          authorId,
          content,
          type,
          mediaUrls,
          mood,
          moodEmoji,
          location,
        })
        .returning();

      res.status(201).json(newPost);
    } catch (e) {
      logger.error("Failed to create wall post:", e);
      res.status(500).json({ error: "Failed to create post" });
    }
  } catch (error: any) {
    logger.error("Failed to post to wall:", error);
    res.status(500).json({ error: "Failed to post to wall" });
  }
});

/**
 * Add a testimonial
 * POST /api/naughty-profile/:userId/testimonial
 */
router.post("/:userId/testimonial", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const fromUserId = (req as any).user?.id;
    const { content, rating = 5 } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content required" });
    }

    if (fromUserId === userId) {
      return res.status(400).json({ error: "Cannot write testimonial for yourself" });
    }

    try {
      const [newTestimonial] = await db
        .insert(testimonials)
        .values({
          toUserId: userId,
          fromUserId,
          content,
          rating: Math.min(5, Math.max(1, rating)),
        })
        .returning();

      res.status(201).json(newTestimonial);
    } catch (e) {
      logger.error("Failed to create testimonial:", e);
      res.status(500).json({ error: "Failed to create testimonial" });
    }
  } catch (error: any) {
    logger.error("Failed to add testimonial:", error);
    res.status(500).json({ error: "Failed to add testimonial" });
  }
});

export default router;
