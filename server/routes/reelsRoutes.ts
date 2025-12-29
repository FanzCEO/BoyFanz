import { Router } from "express";
import { db } from "../db";
import { eq, desc, and, sql, count, ilike, or } from "drizzle-orm";

const router = Router();

// Middleware to check authentication
const isAuthenticated = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// Middleware to check admin role
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'moderator')) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// ============================================================
// ADMIN ROUTES
// ============================================================

// Get all reels (admin)
router.get("/admin", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { searchQuery, status, creatorId, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereConditions: any[] = [];
    if (status && status !== 'all') {
      whereConditions.push(sql`r.status = ${status}`);
    }
    if (creatorId) {
      whereConditions.push(sql`r.creator_id = ${creatorId}`);
    }
    if (searchQuery) {
      whereConditions.push(sql`(r.caption ILIKE ${`%${searchQuery}%`} OR u.username ILIKE ${`%${searchQuery}%`})`);
    }

    const whereClause = whereConditions.length > 0
      ? sql`WHERE ${sql.join(whereConditions, sql` AND `)}`
      : sql``;

    const reels = await db.execute(sql`
      SELECT r.*,
             u.username as creator_username,
             u.display_name as creator_display_name,
             u.profile_image_url as creator_avatar,
             s.name as sound_name,
             s.artist as sound_artist
      FROM reels r
      LEFT JOIN users u ON r.creator_id = u.id
      LEFT JOIN reel_sounds s ON r.sound_id = s.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${offset}
    `);

    const [countResult] = await db.execute(sql`SELECT COUNT(*) as total FROM reels`);

    res.json({
      reels: reels.rows || [],
      total: Number((countResult.rows?.[0] as any)?.total || 0),
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error: any) {
    console.error("Error fetching reels:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get reel analytics (admin)
router.get("/admin/analytics", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    // Total counts
    const [reelStats] = await db.execute(sql`
      SELECT
        COUNT(*) as total_reels,
        COALESCE(SUM(view_count), 0) as total_views,
        COALESCE(SUM(like_count), 0) as total_likes,
        COALESCE(SUM(comment_count), 0) as total_comments,
        COALESCE(SUM(share_count), 0) as total_shares
      FROM reels
      WHERE status = 'approved'
    `);

    const stats = reelStats.rows?.[0] as any;
    const totalInteractions = Number(stats?.total_likes || 0) + Number(stats?.total_comments || 0) + Number(stats?.total_shares || 0);
    const avgEngagementRate = Number(stats?.total_views || 0) > 0
      ? (totalInteractions / Number(stats.total_views)) * 100
      : 0;

    // Trending sounds
    const trendingSounds = await db.execute(sql`
      SELECT s.id as sound_id, s.name as sound_name, COUNT(r.id) as usage_count
      FROM reel_sounds s
      LEFT JOIN reels r ON r.sound_id = s.id
      WHERE r.created_at >= NOW() - INTERVAL '7 days'
      GROUP BY s.id, s.name
      ORDER BY usage_count DESC
      LIMIT 10
    `);

    // Top hashtags
    const topHashtags = await db.execute(sql`
      SELECT hashtag, COUNT(*) as usage_count
      FROM reel_hashtags
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY hashtag
      ORDER BY usage_count DESC
      LIMIT 20
    `);

    // Top creators
    const topCreators = await db.execute(sql`
      SELECT r.creator_id, u.username,
             COUNT(r.id) as reel_count,
             COALESCE(SUM(r.view_count), 0) as total_views
      FROM reels r
      JOIN users u ON r.creator_id = u.id
      WHERE r.status = 'approved' AND r.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY r.creator_id, u.username
      ORDER BY total_views DESC
      LIMIT 10
    `);

    res.json({
      totalReels: Number(stats?.total_reels || 0),
      totalViews: Number(stats?.total_views || 0),
      totalLikes: Number(stats?.total_likes || 0),
      totalComments: Number(stats?.total_comments || 0),
      totalShares: Number(stats?.total_shares || 0),
      avgEngagementRate,
      trendingSounds: trendingSounds.rows || [],
      topHashtags: topHashtags.rows || [],
      topCreators: topCreators.rows || []
    });
  } catch (error: any) {
    console.error("Error fetching reel analytics:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get sounds library (admin)
router.get("/admin/sounds", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const sounds = await db.execute(sql`
      SELECT s.*,
             (SELECT COUNT(*) FROM reels WHERE sound_id = s.id) as usage_count
      FROM reel_sounds s
      ORDER BY usage_count DESC, s.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${offset}
    `);

    res.json({ sounds: sounds.rows || [] });
  } catch (error: any) {
    console.error("Error fetching sounds:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update reel status (admin)
router.put("/admin/:reelId/status", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { reelId } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected', 'flagged'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const [updated] = await db.execute(sql`
      UPDATE reels
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${reelId}
      RETURNING *
    `);

    if (!updated.rows || updated.rows.length === 0) {
      return res.status(404).json({ error: "Reel not found" });
    }

    res.json(updated.rows[0]);
  } catch (error: any) {
    console.error("Error updating reel status:", error);
    res.status(500).json({ error: error.message });
  }
});

// Toggle featured status (admin)
router.put("/admin/:reelId/feature", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { reelId } = req.params;
    const { isFeatured } = req.body;

    const [updated] = await db.execute(sql`
      UPDATE reels
      SET is_featured = ${isFeatured}, updated_at = NOW()
      WHERE id = ${reelId}
      RETURNING *
    `);

    if (!updated.rows || updated.rows.length === 0) {
      return res.status(404).json({ error: "Reel not found" });
    }

    res.json(updated.rows[0]);
  } catch (error: any) {
    console.error("Error updating featured status:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete reel (admin)
router.delete("/admin/:reelId", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { reelId } = req.params;

    await db.execute(sql`DELETE FROM reel_hashtags WHERE reel_id = ${reelId}`);
    await db.execute(sql`DELETE FROM reel_likes WHERE reel_id = ${reelId}`);
    await db.execute(sql`DELETE FROM reel_comments WHERE reel_id = ${reelId}`);
    await db.execute(sql`DELETE FROM reels WHERE id = ${reelId}`);

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting reel:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// CREATOR ROUTES
// ============================================================

// Get creator's reels
router.get("/creator/:creatorId", async (req, res) => {
  try {
    const { creatorId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const reels = await db.execute(sql`
      SELECT r.*,
             u.username as creator_username,
             u.display_name as creator_display_name,
             u.profile_image_url as creator_avatar,
             s.name as sound_name
      FROM reels r
      LEFT JOIN users u ON r.creator_id = u.id
      LEFT JOIN reel_sounds s ON r.sound_id = s.id
      WHERE r.creator_id = ${creatorId} AND r.status = 'approved'
      ORDER BY r.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${offset}
    `);

    res.json({ reels: reels.rows || [] });
  } catch (error: any) {
    console.error("Error fetching creator reels:", error);
    res.status(500).json({ error: error.message });
  }
});

// Upload new reel
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { videoUrl, thumbnailUrl, caption, duration, soundId, hashtags } = req.body;
    const creatorId = req.user?.id;

    if (!creatorId || !videoUrl) {
      return res.status(400).json({ error: "Video URL is required" });
    }

    const [reel] = await db.execute(sql`
      INSERT INTO reels (id, creator_id, video_url, thumbnail_url, caption, duration, sound_id, status, created_at)
      VALUES (
        gen_random_uuid(),
        ${creatorId},
        ${videoUrl},
        ${thumbnailUrl || null},
        ${caption || null},
        ${duration || 0},
        ${soundId || null},
        'pending',
        NOW()
      )
      RETURNING *
    `);

    const newReel = reel.rows?.[0] as any;

    // Insert hashtags
    if (hashtags && Array.isArray(hashtags) && hashtags.length > 0) {
      for (const tag of hashtags) {
        await db.execute(sql`
          INSERT INTO reel_hashtags (id, reel_id, hashtag, created_at)
          VALUES (gen_random_uuid(), ${newReel.id}, ${tag.toLowerCase()}, NOW())
        `);
      }
    }

    res.status(201).json(newReel);
  } catch (error: any) {
    console.error("Error creating reel:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update reel
router.put("/:reelId", isAuthenticated, async (req, res) => {
  try {
    const { reelId } = req.params;
    const { caption, hashtags } = req.body;
    const userId = req.user?.id;

    // Verify ownership
    const [existing] = await db.execute(sql`SELECT creator_id FROM reels WHERE id = ${reelId}`);
    const reel = existing.rows?.[0] as any;

    if (!reel || (reel.creator_id !== userId && req.user?.role !== 'admin')) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const [updated] = await db.execute(sql`
      UPDATE reels
      SET caption = COALESCE(${caption}, caption),
          updated_at = NOW()
      WHERE id = ${reelId}
      RETURNING *
    `);

    // Update hashtags
    if (hashtags && Array.isArray(hashtags)) {
      await db.execute(sql`DELETE FROM reel_hashtags WHERE reel_id = ${reelId}`);
      for (const tag of hashtags) {
        await db.execute(sql`
          INSERT INTO reel_hashtags (id, reel_id, hashtag, created_at)
          VALUES (gen_random_uuid(), ${reelId}, ${tag.toLowerCase()}, NOW())
        `);
      }
    }

    res.json(updated.rows?.[0] || updated);
  } catch (error: any) {
    console.error("Error updating reel:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete own reel
router.delete("/:reelId", isAuthenticated, async (req, res) => {
  try {
    const { reelId } = req.params;
    const userId = req.user?.id;

    // Verify ownership
    const [existing] = await db.execute(sql`SELECT creator_id FROM reels WHERE id = ${reelId}`);
    const reel = existing.rows?.[0] as any;

    if (!reel || (reel.creator_id !== userId && req.user?.role !== 'admin')) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await db.execute(sql`DELETE FROM reel_hashtags WHERE reel_id = ${reelId}`);
    await db.execute(sql`DELETE FROM reel_likes WHERE reel_id = ${reelId}`);
    await db.execute(sql`DELETE FROM reel_comments WHERE reel_id = ${reelId}`);
    await db.execute(sql`DELETE FROM reels WHERE id = ${reelId}`);

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting reel:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PUBLIC/USER ROUTES
// ============================================================

// Get feed (For You page)
router.get("/feed", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Mix of featured, trending, and recent reels
    const reels = await db.execute(sql`
      SELECT r.*,
             u.username as creator_username,
             u.display_name as creator_display_name,
             u.profile_image_url as creator_avatar,
             s.name as sound_name
      FROM reels r
      LEFT JOIN users u ON r.creator_id = u.id
      LEFT JOIN reel_sounds s ON r.sound_id = s.id
      WHERE r.status = 'approved'
      ORDER BY
        CASE WHEN r.is_featured THEN 0 ELSE 1 END,
        (r.view_count + r.like_count * 5 + r.comment_count * 10) DESC,
        r.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${offset}
    `);

    res.json({ reels: reels.rows || [] });
  } catch (error: any) {
    console.error("Error fetching reel feed:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get single reel
router.get("/:reelId", async (req, res) => {
  try {
    const { reelId } = req.params;

    const [reel] = await db.execute(sql`
      SELECT r.*,
             u.username as creator_username,
             u.display_name as creator_display_name,
             u.profile_image_url as creator_avatar,
             s.name as sound_name
      FROM reels r
      LEFT JOIN users u ON r.creator_id = u.id
      LEFT JOIN reel_sounds s ON r.sound_id = s.id
      WHERE r.id = ${reelId}
    `);

    if (!reel.rows || reel.rows.length === 0) {
      return res.status(404).json({ error: "Reel not found" });
    }

    res.json(reel.rows[0]);
  } catch (error: any) {
    console.error("Error fetching reel:", error);
    res.status(500).json({ error: error.message });
  }
});

// View reel (increment view count)
router.post("/:reelId/view", async (req, res) => {
  try {
    const { reelId } = req.params;

    await db.execute(sql`
      UPDATE reels SET view_count = view_count + 1 WHERE id = ${reelId}
    `);

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error recording view:", error);
    res.status(500).json({ error: error.message });
  }
});

// Like reel
router.post("/:reelId/like", isAuthenticated, async (req, res) => {
  try {
    const { reelId } = req.params;
    const userId = req.user?.id;

    // Check if already liked
    const [existing] = await db.execute(sql`
      SELECT id FROM reel_likes WHERE reel_id = ${reelId} AND user_id = ${userId}
    `);

    if (existing.rows && existing.rows.length > 0) {
      // Unlike
      await db.execute(sql`DELETE FROM reel_likes WHERE reel_id = ${reelId} AND user_id = ${userId}`);
      await db.execute(sql`UPDATE reels SET like_count = GREATEST(0, like_count - 1) WHERE id = ${reelId}`);
      res.json({ liked: false });
    } else {
      // Like
      await db.execute(sql`
        INSERT INTO reel_likes (id, reel_id, user_id, created_at)
        VALUES (gen_random_uuid(), ${reelId}, ${userId}, NOW())
      `);
      await db.execute(sql`UPDATE reels SET like_count = like_count + 1 WHERE id = ${reelId}`);
      res.json({ liked: true });
    }
  } catch (error: any) {
    console.error("Error toggling like:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get reel comments
router.get("/:reelId/comments", async (req, res) => {
  try {
    const { reelId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const comments = await db.execute(sql`
      SELECT rc.*,
             u.username,
             u.display_name,
             u.profile_image_url
      FROM reel_comments rc
      LEFT JOIN users u ON rc.user_id = u.id
      WHERE rc.reel_id = ${reelId}
      ORDER BY rc.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${offset}
    `);

    res.json({ comments: comments.rows || [] });
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: error.message });
  }
});

// Add comment to reel
router.post("/:reelId/comments", isAuthenticated, async (req, res) => {
  try {
    const { reelId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    const [comment] = await db.execute(sql`
      INSERT INTO reel_comments (id, reel_id, user_id, content, created_at)
      VALUES (gen_random_uuid(), ${reelId}, ${userId}, ${content.trim()}, NOW())
      RETURNING *
    `);

    await db.execute(sql`UPDATE reels SET comment_count = comment_count + 1 WHERE id = ${reelId}`);

    res.status(201).json(comment.rows?.[0] || comment);
  } catch (error: any) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: error.message });
  }
});

// Share reel (increment share count)
router.post("/:reelId/share", async (req, res) => {
  try {
    const { reelId } = req.params;

    await db.execute(sql`
      UPDATE reels SET share_count = share_count + 1 WHERE id = ${reelId}
    `);

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error recording share:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get reels by hashtag
router.get("/hashtag/:hashtag", async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const reels = await db.execute(sql`
      SELECT DISTINCT r.*,
             u.username as creator_username,
             u.display_name as creator_display_name,
             u.profile_image_url as creator_avatar
      FROM reels r
      JOIN reel_hashtags rh ON r.id = rh.reel_id
      LEFT JOIN users u ON r.creator_id = u.id
      WHERE rh.hashtag = ${hashtag.toLowerCase()} AND r.status = 'approved'
      ORDER BY r.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${offset}
    `);

    res.json({ reels: reels.rows || [] });
  } catch (error: any) {
    console.error("Error fetching reels by hashtag:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get reels by sound
router.get("/sound/:soundId", async (req, res) => {
  try {
    const { soundId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const reels = await db.execute(sql`
      SELECT r.*,
             u.username as creator_username,
             u.display_name as creator_display_name,
             u.profile_image_url as creator_avatar,
             s.name as sound_name
      FROM reels r
      LEFT JOIN users u ON r.creator_id = u.id
      LEFT JOIN reel_sounds s ON r.sound_id = s.id
      WHERE r.sound_id = ${soundId} AND r.status = 'approved'
      ORDER BY r.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${offset}
    `);

    res.json({ reels: reels.rows || [] });
  } catch (error: any) {
    console.error("Error fetching reels by sound:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
