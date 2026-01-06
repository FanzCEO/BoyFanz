/**
 * Public API Routes for External Integrations
 * Provides read-only access to public creator profiles for external websites
 */

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { profiles, profileTenant, tenants, accounts } from "../../shared/schema";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

/**
 * GET /api/public/creators/:handle
 * Get public creator profile by handle
 * No authentication required - only returns public data
 */
router.get("/creators/:handle", async (req: Request, res: Response) => {
  try {
    const { handle } = req.params;

    if (!handle) {
      return res.status(400).json({
        success: false,
        error: "Handle is required"
      });
    }

    // Fetch public profile data
    const [profile] = await db
      .select({
        id: profiles.id,
        handle: profiles.handle,
        displayName: profiles.displayName,
        bio: profiles.bio,
        type: profiles.type,
        avatarUrl: profiles.avatarUrl,
        bannerUrl: profiles.bannerUrl,
        location: profiles.location,
        website: profiles.website,
        socialLinks: profiles.socialLinks,
        stats: profiles.stats,
        verificationLevel: profiles.verificationLevel,
        createdAt: profiles.createdAt,
      })
      .from(profiles)
      .where(
        and(
          eq(profiles.handle, handle.toLowerCase().replace('@', '')),
          eq(profiles.type, 'creator')
        )
      )
      .limit(1);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: "Creator not found"
      });
    }

    // Parse stats JSON safely
    const stats = typeof profile.stats === 'object' ? profile.stats as any : {};

    // Return public profile data
    res.json({
      success: true,
      data: {
        handle: profile.handle,
        displayName: profile.displayName || profile.handle,
        bio: profile.bio || "",
        avatarUrl: profile.avatarUrl || "",
        bannerUrl: profile.bannerUrl || "",
        location: profile.location || "",
        website: profile.website || "",
        socialLinks: profile.socialLinks || {},
        verified: profile.verificationLevel >= 1,
        stats: {
          followers: stats.followers || stats.subscriberCount || 0,
          following: stats.following || 0,
          posts: stats.posts || stats.postCount || 0,
          likes: stats.likes || stats.totalLikes || 0,
          views: stats.views || stats.totalViews || 0,
        },
        memberSince: profile.createdAt,
        platform: "boyfanz.com",
        profileUrl: `https://boyfanz.com/${profile.handle}`,
      }
    });

  } catch (error: any) {
    console.error("Public API error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

/**
 * GET /api/public/creators/:handle/posts
 * Get public posts for a creator (preview only - no full content)
 */
router.get("/creators/:handle/posts", async (req: Request, res: Response) => {
  try {
    const { handle } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const offset = parseInt(req.query.offset as string) || 0;

    // Get profile first
    const [profile] = await db
      .select({ id: profiles.id, handle: profiles.handle })
      .from(profiles)
      .where(eq(profiles.handle, handle.toLowerCase().replace('@', '')))
      .limit(1);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: "Creator not found"
      });
    }

    // Return placeholder - actual posts would come from posts table
    res.json({
      success: true,
      data: {
        creator: profile.handle,
        posts: [],
        pagination: {
          limit,
          offset,
          total: 0
        }
      }
    });

  } catch (error: any) {
    console.error("Public API posts error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

/**
 * GET /api/public/widget/:handle
 * Optimized endpoint for external widget embedding
 */
router.get("/widget/:handle", async (req: Request, res: Response) => {
  try {
    const { handle } = req.params;

    const [profile] = await db
      .select({
        handle: profiles.handle,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        stats: profiles.stats,
        verificationLevel: profiles.verificationLevel,
      })
      .from(profiles)
      .where(eq(profiles.handle, handle.toLowerCase().replace('@', '')))
      .limit(1);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: "Creator not found"
      });
    }

    const stats = typeof profile.stats === 'object' ? profile.stats as any : {};

    // Return minimal widget data with CORS headers
    res.set('Cache-Control', 'public, max-age=300'); // 5 min cache
    res.json({
      success: true,
      data: {
        platform: "BoyFanz",
        profile_url: `https://boyfanz.com/${profile.handle}`,
        username: profile.handle,
        display_name: profile.displayName || profile.handle,
        avatar: profile.avatarUrl || "",
        followers: stats.followers || stats.subscriberCount || 0,
        posts: stats.posts || stats.postCount || 0,
        verified: profile.verificationLevel >= 1,
        synced_at: new Date().toISOString(),
        cta: {
          text: "Follow on BoyFanz",
          url: `https://boyfanz.com/${profile.handle}`
        }
      }
    });

  } catch (error: any) {
    console.error("Widget API error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

export default router;
