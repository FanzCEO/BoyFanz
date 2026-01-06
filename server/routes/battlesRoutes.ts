import { Router } from "express";
import { db } from "../db";
import { eq, desc, and, sql, count } from "drizzle-orm";

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

// Get all battles (admin)
router.get("/admin", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { searchQuery, status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereConditions: any[] = [];
    if (status && status !== 'all') {
      whereConditions.push(sql`b.status = ${status}`);
    }
    if (searchQuery) {
      whereConditions.push(sql`(b.title ILIKE ${`%${searchQuery}%`} OR u1.username ILIKE ${`%${searchQuery}%`} OR u2.username ILIKE ${`%${searchQuery}%`})`);
    }

    const whereClause = whereConditions.length > 0
      ? sql`WHERE ${sql.join(whereConditions, sql` AND `)}`
      : sql``;

    const battles = await db.execute(sql`
      SELECT b.*,
             u1.username as creator_1_username,
             u1.display_name as creator_1_display_name,
             u1.profile_image_url as creator_1_avatar,
             u2.username as creator_2_username,
             u2.display_name as creator_2_display_name,
             u2.profile_image_url as creator_2_avatar
      FROM creator_battles b
      LEFT JOIN users u1 ON b.creator_1_id = u1.id
      LEFT JOIN users u2 ON b.creator_2_id = u2.id
      ${whereClause}
      ORDER BY
        CASE b.status
          WHEN 'active' THEN 1
          WHEN 'upcoming' THEN 2
          WHEN 'voting' THEN 3
          ELSE 4
        END,
        b.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${offset}
    `);

    const [countResult] = await db.execute(sql`SELECT COUNT(*) as total FROM creator_battles`);

    res.json({
      battles: battles.rows || [],
      total: Number((countResult.rows?.[0] as any)?.total || 0),
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error: any) {
    console.error("Error fetching battles:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get battle analytics (admin)
router.get("/admin/analytics", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    // Total stats
    const [stats] = await db.execute(sql`
      SELECT
        COUNT(*) as total_battles,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_battles,
        COALESCE(SUM(prize_pool), 0) as total_prize_pool
      FROM creator_battles
    `);

    const statsData = stats.rows?.[0] as any;

    // Count unique participants
    const [participants] = await db.execute(sql`
      SELECT COUNT(DISTINCT creator_id) as total
      FROM (
        SELECT creator_1_id as creator_id FROM creator_battles
        UNION
        SELECT creator_2_id as creator_id FROM creator_battles
      ) p
    `);

    // Average votes per battle
    const [avgVotes] = await db.execute(sql`
      SELECT AVG(vote_count) as avg_votes
      FROM (
        SELECT COUNT(*) as vote_count
        FROM battle_votes
        GROUP BY battle_id
      ) v
    `);

    // Top creators by wins
    const topCreators = await db.execute(sql`
      SELECT winner_id as creator_id, u.username,
             COUNT(*) as wins,
             COALESCE(SUM(prize_pool), 0) as total_earnings
      FROM creator_battles b
      JOIN users u ON b.winner_id = u.id
      WHERE b.status = 'completed' AND b.winner_id IS NOT NULL
      GROUP BY winner_id, u.username
      ORDER BY wins DESC, total_earnings DESC
      LIMIT 10
    `);

    // Battles by type
    const battlesByType = await db.execute(sql`
      SELECT battle_type, COUNT(*) as count
      FROM creator_battles
      GROUP BY battle_type
    `);

    const typeMap: Record<string, number> = {};
    (battlesByType.rows || []).forEach((row: any) => {
      typeMap[row.battle_type] = Number(row.count);
    });

    res.json({
      totalBattles: Number(statsData?.total_battles || 0),
      activeBattles: Number(statsData?.active_battles || 0),
      totalPrizePool: Number(statsData?.total_prize_pool || 0),
      totalParticipants: Number((participants.rows?.[0] as any)?.total || 0),
      avgVotesPerBattle: Number((avgVotes.rows?.[0] as any)?.avg_votes || 0),
      topCreators: topCreators.rows || [],
      battlesByType: typeMap
    });
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create battle (admin)
router.post("/admin", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { title, description, battleType, creator1Id, creator2Id, prizePool, startsAt, endsAt } = req.body;

    if (!title || !creator1Id || !creator2Id) {
      return res.status(400).json({ error: "Title and both creator IDs are required" });
    }

    const [battle] = await db.execute(sql`
      INSERT INTO creator_battles (
        id, title, description, battle_type,
        creator_1_id, creator_2_id,
        creator_1_score, creator_2_score,
        prize_pool, status, starts_at, ends_at, created_at
      )
      VALUES (
        gen_random_uuid(),
        ${title},
        ${description || null},
        ${battleType || 'tips'},
        ${creator1Id},
        ${creator2Id},
        0,
        0,
        ${prizePool || 0},
        'upcoming',
        ${startsAt ? new Date(startsAt) : sql`NOW() + INTERVAL '1 day'`},
        ${endsAt ? new Date(endsAt) : sql`NOW() + INTERVAL '8 days'`},
        NOW()
      )
      RETURNING *
    `);

    res.status(201).json(battle.rows?.[0] || battle);
  } catch (error: any) {
    console.error("Error creating battle:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update battle status (admin)
router.put("/admin/:battleId/status", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { battleId } = req.params;
    const { status } = req.body;

    if (!['upcoming', 'active', 'voting', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const [updated] = await db.execute(sql`
      UPDATE creator_battles
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${battleId}
      RETURNING *
    `);

    if (!updated.rows || updated.rows.length === 0) {
      return res.status(404).json({ error: "Battle not found" });
    }

    res.json(updated.rows[0]);
  } catch (error: any) {
    console.error("Error updating battle status:", error);
    res.status(500).json({ error: error.message });
  }
});

// End battle and declare winner (admin)
router.post("/admin/:battleId/end", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { battleId } = req.params;

    // Get battle and determine winner
    const [battleResult] = await db.execute(sql`
      SELECT * FROM creator_battles WHERE id = ${battleId}
    `);

    const battle = battleResult.rows?.[0] as any;
    if (!battle) {
      return res.status(404).json({ error: "Battle not found" });
    }

    // Determine winner based on scores
    let winnerId = null;
    if (battle.creator_1_score > battle.creator_2_score) {
      winnerId = battle.creator_1_id;
    } else if (battle.creator_2_score > battle.creator_1_score) {
      winnerId = battle.creator_2_id;
    }
    // If tied, could implement tiebreaker logic or leave as null

    const [updated] = await db.execute(sql`
      UPDATE creator_battles
      SET status = 'completed',
          winner_id = ${winnerId},
          ended_at = NOW(),
          updated_at = NOW()
      WHERE id = ${battleId}
      RETURNING *
    `);

    // Award prize to winner if there is one
    if (winnerId && battle.prize_pool > 0) {
      // Add to winner's balance
      await db.execute(sql`
        UPDATE users
        SET balance = COALESCE(balance, 0) + ${battle.prize_pool}
        WHERE id = ${winnerId}
      `);

      // Log the transaction
      await db.execute(sql`
        INSERT INTO transactions (id, user_id, type, amount, description, status, created_at)
        VALUES (
          gen_random_uuid(),
          ${winnerId},
          'battle_win',
          ${battle.prize_pool},
          ${'Won battle: ' + battle.title},
          'completed',
          NOW()
        )
      `);
    }

    res.json(updated.rows?.[0] || updated);
  } catch (error: any) {
    console.error("Error ending battle:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete battle (admin)
router.delete("/admin/:battleId", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { battleId } = req.params;

    await db.execute(sql`DELETE FROM battle_votes WHERE battle_id = ${battleId}`);
    await db.execute(sql`DELETE FROM creator_battles WHERE id = ${battleId}`);

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting battle:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PUBLIC ROUTES
// ============================================================

// Get active battles
router.get("/active", async (req, res) => {
  try {
    const battles = await db.execute(sql`
      SELECT b.*,
             u1.username as creator_1_username,
             u1.display_name as creator_1_display_name,
             u1.profile_image_url as creator_1_avatar,
             u2.username as creator_2_username,
             u2.display_name as creator_2_display_name,
             u2.profile_image_url as creator_2_avatar
      FROM creator_battles b
      LEFT JOIN users u1 ON b.creator_1_id = u1.id
      LEFT JOIN users u2 ON b.creator_2_id = u2.id
      WHERE b.status = 'active'
      ORDER BY b.ends_at ASC
    `);

    res.json({ battles: battles.rows || [] });
  } catch (error: any) {
    console.error("Error fetching active battles:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get single battle
router.get("/:battleId", async (req, res) => {
  try {
    const { battleId } = req.params;

    const [battle] = await db.execute(sql`
      SELECT b.*,
             u1.username as creator_1_username,
             u1.display_name as creator_1_display_name,
             u1.profile_image_url as creator_1_avatar,
             u2.username as creator_2_username,
             u2.display_name as creator_2_display_name,
             u2.profile_image_url as creator_2_avatar
      FROM creator_battles b
      LEFT JOIN users u1 ON b.creator_1_id = u1.id
      LEFT JOIN users u2 ON b.creator_2_id = u2.id
      WHERE b.id = ${battleId}
    `);

    if (!battle.rows || battle.rows.length === 0) {
      return res.status(404).json({ error: "Battle not found" });
    }

    res.json(battle.rows[0]);
  } catch (error: any) {
    console.error("Error fetching battle:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vote in battle
router.post("/:battleId/vote", isAuthenticated, async (req, res) => {
  try {
    const { battleId } = req.params;
    const { creatorId } = req.body;
    const voterId = req.user?.id;

    if (!creatorId) {
      return res.status(400).json({ error: "Creator ID is required" });
    }

    // Check if battle is active or in voting phase
    const [battleResult] = await db.execute(sql`
      SELECT * FROM creator_battles WHERE id = ${battleId}
    `);

    const battle = battleResult.rows?.[0] as any;
    if (!battle || !['active', 'voting'].includes(battle.status)) {
      return res.status(400).json({ error: "Battle is not accepting votes" });
    }

    // Check if already voted
    const [existingVote] = await db.execute(sql`
      SELECT id FROM battle_votes WHERE battle_id = ${battleId} AND voter_id = ${voterId}
    `);

    if (existingVote.rows && existingVote.rows.length > 0) {
      return res.status(400).json({ error: "You have already voted in this battle" });
    }

    // Record vote
    await db.execute(sql`
      INSERT INTO battle_votes (id, battle_id, voter_id, voted_for_id, created_at)
      VALUES (gen_random_uuid(), ${battleId}, ${voterId}, ${creatorId}, NOW())
    `);

    // Update score
    const scoreColumn = creatorId === battle.creator_1_id ? 'creator_1_score' : 'creator_2_score';
    await db.execute(sql`
      UPDATE creator_battles
      SET ${sql.raw(scoreColumn)} = ${sql.raw(scoreColumn)} + 1
      WHERE id = ${battleId}
    `);

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error voting:", error);
    res.status(500).json({ error: error.message });
  }
});

// Tip in battle (for tip battles)
router.post("/:battleId/tip", isAuthenticated, async (req, res) => {
  try {
    const { battleId } = req.params;
    const { creatorId, amount } = req.body;
    const tipperId = req.user?.id;

    if (!creatorId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Creator ID and valid amount are required" });
    }

    // Check if battle is active
    const [battleResult] = await db.execute(sql`
      SELECT * FROM creator_battles WHERE id = ${battleId} AND battle_type = 'tips'
    `);

    const battle = battleResult.rows?.[0] as any;
    if (!battle || battle.status !== 'active') {
      return res.status(400).json({ error: "Battle is not accepting tips" });
    }

    // Check tipper balance
    const [userResult] = await db.execute(sql`SELECT balance FROM users WHERE id = ${tipperId}`);
    const user = userResult.rows?.[0] as any;

    if (!user || user.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Deduct from tipper
    await db.execute(sql`
      UPDATE users SET balance = balance - ${amount} WHERE id = ${tipperId}
    `);

    // Update battle score
    const scoreColumn = creatorId === battle.creator_1_id ? 'creator_1_score' : 'creator_2_score';
    await db.execute(sql`
      UPDATE creator_battles
      SET ${sql.raw(scoreColumn)} = ${sql.raw(scoreColumn)} + ${amount}
      WHERE id = ${battleId}
    `);

    // Record tip
    await db.execute(sql`
      INSERT INTO tips (id, sender_id, recipient_id, amount, battle_id, message, created_at)
      VALUES (gen_random_uuid(), ${tipperId}, ${creatorId}, ${amount}, ${battleId}, 'Battle tip', NOW())
    `);

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error tipping in battle:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get battle history for a creator
router.get("/creator/:creatorId/history", async (req, res) => {
  try {
    const { creatorId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const battles = await db.execute(sql`
      SELECT b.*,
             u1.username as creator_1_username,
             u1.display_name as creator_1_display_name,
             u2.username as creator_2_username,
             u2.display_name as creator_2_display_name
      FROM creator_battles b
      LEFT JOIN users u1 ON b.creator_1_id = u1.id
      LEFT JOIN users u2 ON b.creator_2_id = u2.id
      WHERE b.creator_1_id = ${creatorId} OR b.creator_2_id = ${creatorId}
      ORDER BY b.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${offset}
    `);

    // Get stats
    const [stats] = await db.execute(sql`
      SELECT
        COUNT(*) as total_battles,
        SUM(CASE WHEN winner_id = ${creatorId} THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN winner_id = ${creatorId} THEN prize_pool ELSE 0 END) as total_earnings
      FROM creator_battles
      WHERE (creator_1_id = ${creatorId} OR creator_2_id = ${creatorId})
        AND status = 'completed'
    `);

    res.json({
      battles: battles.rows || [],
      stats: stats.rows?.[0] || { total_battles: 0, wins: 0, total_earnings: 0 }
    });
  } catch (error: any) {
    console.error("Error fetching creator battle history:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
