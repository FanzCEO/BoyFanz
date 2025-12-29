import { Router } from "express";
import { db } from "../db";
import { eq, desc, and, sql, count, gte, lte } from "drizzle-orm";

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
// XP & LEVELS - ADMIN ROUTES
// ============================================================

// Get XP leaderboard (admin)
router.get("/admin/xp-leaderboard", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const leaderboard = await db.execute(sql`
      SELECT uxp.*,
             u.username,
             u.display_name,
             u.profile_image_url,
             u.role
      FROM user_xp uxp
      JOIN users u ON uxp.user_id = u.id
      ORDER BY uxp.total_xp DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `);

    const [countResult] = await db.execute(sql`SELECT COUNT(*) as total FROM user_xp`);

    res.json({
      leaderboard: leaderboard.rows || [],
      total: Number((countResult.rows?.[0] as any)?.total || 0)
    });
  } catch (error: any) {
    console.error("Error fetching XP leaderboard:", error);
    res.status(500).json({ error: error.message });
  }
});

// Award XP to user (admin)
router.post("/admin/award-xp", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;
    const adminId = req.user?.id;

    if (!userId || !amount) {
      return res.status(400).json({ error: "userId and amount are required" });
    }

    // Get current XP or create new record
    const [existingXp] = await db.execute(sql`
      SELECT * FROM user_xp WHERE user_id = ${userId}
    `);

    let newXp, newLevel;
    if (existingXp.rows && existingXp.rows.length > 0) {
      const current = existingXp.rows[0] as any;
      newXp = Number(current.total_xp) + Number(amount);
      newLevel = Math.floor(newXp / 1000) + 1; // 1000 XP per level

      await db.execute(sql`
        UPDATE user_xp
        SET total_xp = ${newXp},
            current_level = ${newLevel},
            weekly_xp = weekly_xp + ${Number(amount)},
            monthly_xp = monthly_xp + ${Number(amount)},
            updated_at = NOW()
        WHERE user_id = ${userId}
      `);
    } else {
      newXp = Number(amount);
      newLevel = Math.floor(newXp / 1000) + 1;

      await db.execute(sql`
        INSERT INTO user_xp (id, user_id, total_xp, current_level, weekly_xp, monthly_xp, created_at, updated_at)
        VALUES (gen_random_uuid(), ${userId}, ${newXp}, ${newLevel}, ${newXp}, ${newXp}, NOW(), NOW())
      `);
    }

    // Log XP transaction
    await db.execute(sql`
      INSERT INTO xp_transactions (id, user_id, amount, source, source_id, description, created_at)
      VALUES (gen_random_uuid(), ${userId}, ${amount}, 'admin_grant', ${adminId}, ${reason || 'Admin XP award'}, NOW())
    `);

    res.json({ success: true, newXp, newLevel });
  } catch (error: any) {
    console.error("Error awarding XP:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get XP transactions (admin)
router.get("/admin/xp-transactions", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, userId } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = sql``;
    if (userId) {
      whereClause = sql`WHERE xt.user_id = ${userId}`;
    }

    const transactions = await db.execute(sql`
      SELECT xt.*,
             u.username,
             u.display_name
      FROM xp_transactions xt
      LEFT JOIN users u ON xt.user_id = u.id
      ${whereClause}
      ORDER BY xt.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${offset}
    `);

    res.json({ transactions: transactions.rows || [] });
  } catch (error: any) {
    console.error("Error fetching XP transactions:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// BADGES - ADMIN ROUTES
// ============================================================

// Get all badges (admin)
router.get("/admin/badges", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, category, rarity } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereConditions: any[] = [];
    if (category && category !== 'all') {
      whereConditions.push(sql`category = ${category}`);
    }
    if (rarity && rarity !== 'all') {
      whereConditions.push(sql`rarity = ${rarity}`);
    }

    const whereClause = whereConditions.length > 0
      ? sql`WHERE ${sql.join(whereConditions, sql` AND `)}`
      : sql``;

    const badges = await db.execute(sql`
      SELECT b.*,
             (SELECT COUNT(*) FROM user_badges ub WHERE ub.badge_id = b.id) as awarded_count
      FROM badges b
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${offset}
    `);

    const [countResult] = await db.execute(sql`SELECT COUNT(*) as total FROM badges`);

    res.json({
      badges: badges.rows || [],
      total: Number((countResult.rows?.[0] as any)?.total || 0),
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error: any) {
    console.error("Error fetching badges:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create new badge (admin)
router.post("/admin/badges", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { name, description, iconUrl, category, rarity, xpReward, requirements, isActive = true } = req.body;

    if (!name || !category || !rarity) {
      return res.status(400).json({ error: "name, category, and rarity are required" });
    }

    const [badge] = await db.execute(sql`
      INSERT INTO badges (id, name, description, icon_url, category, rarity, xp_reward, requirements, is_active, created_at)
      VALUES (
        gen_random_uuid(),
        ${name},
        ${description || null},
        ${iconUrl || null},
        ${category},
        ${rarity},
        ${xpReward || 0},
        ${requirements ? JSON.stringify(requirements) : null}::jsonb,
        ${isActive},
        NOW()
      )
      RETURNING *
    `);

    res.status(201).json(badge.rows?.[0] || badge);
  } catch (error: any) {
    console.error("Error creating badge:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update badge (admin)
router.put("/admin/badges/:badgeId", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { badgeId } = req.params;
    const { name, description, iconUrl, category, rarity, xpReward, requirements, isActive } = req.body;

    const [updated] = await db.execute(sql`
      UPDATE badges
      SET name = COALESCE(${name}, name),
          description = COALESCE(${description}, description),
          icon_url = COALESCE(${iconUrl}, icon_url),
          category = COALESCE(${category}, category),
          rarity = COALESCE(${rarity}, rarity),
          xp_reward = COALESCE(${xpReward}, xp_reward),
          requirements = COALESCE(${requirements ? JSON.stringify(requirements) : null}::jsonb, requirements),
          is_active = COALESCE(${isActive}, is_active),
          updated_at = NOW()
      WHERE id = ${badgeId}
      RETURNING *
    `);

    if (!updated.rows || updated.rows.length === 0) {
      return res.status(404).json({ error: "Badge not found" });
    }

    res.json(updated.rows[0]);
  } catch (error: any) {
    console.error("Error updating badge:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete badge (admin)
router.delete("/admin/badges/:badgeId", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { badgeId } = req.params;

    await db.execute(sql`DELETE FROM badges WHERE id = ${badgeId}`);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting badge:", error);
    res.status(500).json({ error: error.message });
  }
});

// Award badge to user (admin)
router.post("/admin/badges/:badgeId/award", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { badgeId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Check if already awarded
    const [existing] = await db.execute(sql`
      SELECT id FROM user_badges WHERE user_id = ${userId} AND badge_id = ${badgeId}
    `);

    if (existing.rows && existing.rows.length > 0) {
      return res.status(400).json({ error: "Badge already awarded to this user" });
    }

    // Get badge details for XP reward
    const [badgeResult] = await db.execute(sql`SELECT xp_reward FROM badges WHERE id = ${badgeId}`);
    const badge = badgeResult.rows?.[0] as any;

    // Award badge
    const [awarded] = await db.execute(sql`
      INSERT INTO user_badges (id, user_id, badge_id, awarded_at, source)
      VALUES (gen_random_uuid(), ${userId}, ${badgeId}, NOW(), 'admin_grant')
      RETURNING *
    `);

    // Award XP if badge has XP reward
    if (badge?.xp_reward && badge.xp_reward > 0) {
      await db.execute(sql`
        INSERT INTO user_xp (id, user_id, total_xp, current_level, created_at, updated_at)
        VALUES (gen_random_uuid(), ${userId}, ${badge.xp_reward}, 1, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE
        SET total_xp = user_xp.total_xp + ${badge.xp_reward},
            current_level = GREATEST(1, FLOOR((user_xp.total_xp + ${badge.xp_reward}) / 1000) + 1),
            updated_at = NOW()
      `);
    }

    res.status(201).json(awarded.rows?.[0] || awarded);
  } catch (error: any) {
    console.error("Error awarding badge:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// LEADERBOARDS - ADMIN ROUTES
// ============================================================

// Get leaderboard by type (admin)
router.get("/admin/leaderboards/:type", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    const { period = 'all_time', limit = 50, offset = 0 } = req.query;

    let dateFilter = sql``;
    if (period === 'daily') {
      dateFilter = sql`AND le.period_start >= CURRENT_DATE`;
    } else if (period === 'weekly') {
      dateFilter = sql`AND le.period_start >= CURRENT_DATE - INTERVAL '7 days'`;
    } else if (period === 'monthly') {
      dateFilter = sql`AND le.period_start >= CURRENT_DATE - INTERVAL '30 days'`;
    }

    const leaderboard = await db.execute(sql`
      SELECT le.*,
             u.username,
             u.display_name,
             u.profile_image_url
      FROM leaderboard_entries le
      JOIN users u ON le.user_id = u.id
      WHERE le.leaderboard_type = ${type}
      ${dateFilter}
      ORDER BY le.score DESC, le.rank ASC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `);

    res.json({ leaderboard: leaderboard.rows || [] });
  } catch (error: any) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: error.message });
  }
});

// Refresh leaderboard rankings (admin)
router.post("/admin/leaderboards/:type/refresh", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { type } = req.params;

    // Different calculation based on type
    let scoreQuery;
    switch (type) {
      case 'tips_given':
        scoreQuery = sql`
          SELECT sender_id as user_id, COALESCE(SUM(amount), 0)::integer as score
          FROM tips
          WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY sender_id
        `;
        break;
      case 'tips_received':
        scoreQuery = sql`
          SELECT recipient_id as user_id, COALESCE(SUM(amount), 0)::integer as score
          FROM tips
          WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY recipient_id
        `;
        break;
      case 'content_views':
        scoreQuery = sql`
          SELECT p.user_id, COALESCE(SUM(p.view_count), 0)::integer as score
          FROM posts p
          WHERE p.created_at >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY p.user_id
        `;
        break;
      case 'subscribers':
        scoreQuery = sql`
          SELECT creator_id as user_id, COUNT(*)::integer as score
          FROM subscriptions
          WHERE status = 'active'
          GROUP BY creator_id
        `;
        break;
      case 'xp':
        scoreQuery = sql`
          SELECT user_id, total_xp::integer as score
          FROM user_xp
        `;
        break;
      default:
        return res.status(400).json({ error: "Invalid leaderboard type" });
    }

    // Clear old entries for this type
    await db.execute(sql`
      DELETE FROM leaderboard_entries
      WHERE leaderboard_type = ${type}
        AND period_start < CURRENT_DATE - INTERVAL '30 days'
    `);

    // Insert new rankings
    const scores = await db.execute(scoreQuery);

    let rank = 1;
    for (const row of (scores.rows || []) as any[]) {
      await db.execute(sql`
        INSERT INTO leaderboard_entries (id, leaderboard_type, user_id, score, rank, period_start, period_end, created_at)
        VALUES (
          gen_random_uuid(),
          ${type},
          ${row.user_id},
          ${row.score},
          ${rank},
          CURRENT_DATE,
          CURRENT_DATE + INTERVAL '1 day',
          NOW()
        )
        ON CONFLICT (leaderboard_type, user_id, period_start) DO UPDATE
        SET score = ${row.score}, rank = ${rank}, updated_at = NOW()
      `);
      rank++;
    }

    res.json({ success: true, entriesUpdated: rank - 1 });
  } catch (error: any) {
    console.error("Error refreshing leaderboard:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// USER ROUTES
// ============================================================

// Get user's XP and level
router.get("/my-xp", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;

    const [xpResult] = await db.execute(sql`
      SELECT * FROM user_xp WHERE user_id = ${userId}
    `);

    if (!xpResult.rows || xpResult.rows.length === 0) {
      return res.json({
        totalXp: 0,
        currentLevel: 1,
        weeklyXp: 0,
        monthlyXp: 0,
        xpToNextLevel: 1000
      });
    }

    const xp = xpResult.rows[0] as any;
    const xpToNextLevel = ((xp.current_level) * 1000) - xp.total_xp;

    res.json({
      totalXp: xp.total_xp,
      currentLevel: xp.current_level,
      weeklyXp: xp.weekly_xp,
      monthlyXp: xp.monthly_xp,
      xpToNextLevel: Math.max(0, xpToNextLevel)
    });
  } catch (error: any) {
    console.error("Error fetching user XP:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's badges
router.get("/my-badges", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;

    const badges = await db.execute(sql`
      SELECT b.*, ub.awarded_at, ub.source
      FROM user_badges ub
      JOIN badges b ON ub.badge_id = b.id
      WHERE ub.user_id = ${userId}
      ORDER BY ub.awarded_at DESC
    `);

    res.json({ badges: badges.rows || [] });
  } catch (error: any) {
    console.error("Error fetching user badges:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's leaderboard positions
router.get("/my-rankings", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;

    const rankings = await db.execute(sql`
      SELECT le.*
      FROM leaderboard_entries le
      WHERE le.user_id = ${userId}
        AND le.period_start = CURRENT_DATE
      ORDER BY le.rank ASC
    `);

    res.json({ rankings: rankings.rows || [] });
  } catch (error: any) {
    console.error("Error fetching user rankings:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get public leaderboard
router.get("/leaderboard/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const { period = 'all_time', limit = 20 } = req.query;

    let dateFilter = sql``;
    if (period === 'daily') {
      dateFilter = sql`AND le.period_start >= CURRENT_DATE`;
    } else if (period === 'weekly') {
      dateFilter = sql`AND le.period_start >= CURRENT_DATE - INTERVAL '7 days'`;
    } else if (period === 'monthly') {
      dateFilter = sql`AND le.period_start >= CURRENT_DATE - INTERVAL '30 days'`;
    }

    const leaderboard = await db.execute(sql`
      SELECT le.rank, le.score, le.user_id,
             u.username,
             u.display_name,
             u.profile_image_url
      FROM leaderboard_entries le
      JOIN users u ON le.user_id = u.id
      WHERE le.leaderboard_type = ${type}
      ${dateFilter}
      ORDER BY le.score DESC, le.rank ASC
      LIMIT ${Number(limit)}
    `);

    res.json({ leaderboard: leaderboard.rows || [] });
  } catch (error: any) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get available badges
router.get("/badges", async (req, res) => {
  try {
    const { category } = req.query;

    let whereClause = sql`WHERE is_active = true`;
    if (category && category !== 'all') {
      whereClause = sql`WHERE is_active = true AND category = ${category}`;
    }

    const badges = await db.execute(sql`
      SELECT id, name, description, icon_url, category, rarity, xp_reward
      FROM badges
      ${whereClause}
      ORDER BY
        CASE rarity
          WHEN 'legendary' THEN 1
          WHEN 'epic' THEN 2
          WHEN 'rare' THEN 3
          WHEN 'common' THEN 4
        END,
        name ASC
    `);

    res.json({ badges: badges.rows || [] });
  } catch (error: any) {
    console.error("Error fetching badges:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
