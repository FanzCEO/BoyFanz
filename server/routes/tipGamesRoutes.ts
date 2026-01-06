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

// Get all tip games (admin)
router.get("/admin", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { searchQuery, status, type, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // For now, return mock data - will use real DB once schema is pushed
    const games = await db.execute(sql`
      SELECT tg.*,
             u.username as creator_username,
             u.display_name as creator_display_name,
             (SELECT COUNT(*) FROM wheel_spins WHERE game_id = tg.id) as total_spins,
             (SELECT COALESCE(SUM(tip_amount), 0) FROM wheel_spins WHERE game_id = tg.id) as total_revenue
      FROM tip_games tg
      LEFT JOIN users u ON tg.creator_id = u.id
      ${status && status !== 'all' ? sql`WHERE tg.is_active = ${status === 'active'}` : sql``}
      ORDER BY tg.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${offset}
    `);

    const [countResult] = await db.execute(sql`SELECT COUNT(*) as total FROM tip_games`);

    res.json({
      games: games.rows || [],
      total: Number((countResult as any)?.total || 0),
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error: any) {
    console.error("Error fetching tip games:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all spins (admin)
router.get("/admin/spins", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const spins = await db.execute(sql`
      SELECT ws.*,
             u.username as spinner_username,
             tg.name as game_name
      FROM wheel_spins ws
      LEFT JOIN users u ON ws.spinner_id = u.id
      LEFT JOIN tip_games tg ON ws.game_id = tg.id
      ORDER BY ws.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${offset}
    `);

    const [countResult] = await db.execute(sql`SELECT COUNT(*) as total FROM wheel_spins`);

    res.json({
      spins: spins.rows || [],
      total: Number((countResult as any)?.total || 0),
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error: any) {
    console.error("Error fetching spins:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get analytics (admin)
router.get("/admin/analytics", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const [gamesCount] = await db.execute(sql`SELECT COUNT(*) as total FROM tip_games WHERE is_active = true`);
    const [spinsTotal] = await db.execute(sql`SELECT COUNT(*) as total, COALESCE(SUM(tip_amount), 0) as revenue FROM wheel_spins`);

    // Top games by revenue
    const topGames = await db.execute(sql`
      SELECT tg.id, tg.name, COALESCE(SUM(ws.tip_amount), 0) as revenue
      FROM tip_games tg
      LEFT JOIN wheel_spins ws ON tg.id = ws.game_id
      GROUP BY tg.id, tg.name
      ORDER BY revenue DESC
      LIMIT 5
    `);

    // Top prizes won
    const topPrizes = await db.execute(sql`
      SELECT prize_won as name, COUNT(*) as count
      FROM wheel_spins
      WHERE prize_won IS NOT NULL
      GROUP BY prize_won
      ORDER BY count DESC
      LIMIT 5
    `);

    const spinsData = spinsTotal.rows?.[0] as any || { total: 0, revenue: 0 };

    res.json({
      totalGames: Number((gamesCount.rows?.[0] as any)?.total || 0),
      totalSpins: Number(spinsData.total || 0),
      totalRevenue: Number(spinsData.revenue || 0),
      avgTip: spinsData.total > 0 ? Number(spinsData.revenue) / Number(spinsData.total) : 0,
      topGames: topGames.rows || [],
      topPrizes: topPrizes.rows || []
    });
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// CREATOR ROUTES
// ============================================================

// Get creator's tip games
router.get("/creator/:creatorId", isAuthenticated, async (req, res) => {
  try {
    const { creatorId } = req.params;

    const games = await db.execute(sql`
      SELECT tg.*,
             (SELECT COUNT(*) FROM wheel_spins WHERE game_id = tg.id) as total_spins,
             (SELECT COALESCE(SUM(tip_amount), 0) FROM wheel_spins WHERE game_id = tg.id) as total_revenue
      FROM tip_games tg
      WHERE tg.creator_id = ${creatorId} AND tg.is_active = true
      ORDER BY tg.created_at DESC
    `);

    res.json({ games: games.rows || [] });
  } catch (error: any) {
    console.error("Error fetching creator games:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new tip game
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { name, gameType, minTip, prizes, isActive = true } = req.body;
    const creatorId = req.user?.id;

    if (!creatorId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const [game] = await db.execute(sql`
      INSERT INTO tip_games (id, creator_id, name, game_type, min_tip, prizes, is_active, created_at)
      VALUES (
        gen_random_uuid(),
        ${creatorId},
        ${name},
        ${gameType},
        ${minTip},
        ${JSON.stringify(prizes)}::jsonb,
        ${isActive},
        NOW()
      )
      RETURNING *
    `);

    res.status(201).json(game.rows?.[0] || game);
  } catch (error: any) {
    console.error("Error creating tip game:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update a tip game
router.put("/:gameId", isAuthenticated, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { name, gameType, minTip, prizes, isActive } = req.body;
    const userId = req.user?.id;

    // Verify ownership or admin
    const [existing] = await db.execute(sql`SELECT creator_id FROM tip_games WHERE id = ${gameId}`);
    const game = (existing.rows?.[0] as any);

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    if (game.creator_id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to update this game" });
    }

    const [updated] = await db.execute(sql`
      UPDATE tip_games
      SET name = COALESCE(${name}, name),
          game_type = COALESCE(${gameType}, game_type),
          min_tip = COALESCE(${minTip}, min_tip),
          prizes = COALESCE(${prizes ? JSON.stringify(prizes) : null}::jsonb, prizes),
          is_active = COALESCE(${isActive}, is_active),
          updated_at = NOW()
      WHERE id = ${gameId}
      RETURNING *
    `);

    res.json(updated.rows?.[0] || updated);
  } catch (error: any) {
    console.error("Error updating tip game:", error);
    res.status(500).json({ error: error.message });
  }
});

// Toggle game active status
router.post("/:gameId/toggle", isAuthenticated, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { isActive } = req.body;

    const [updated] = await db.execute(sql`
      UPDATE tip_games
      SET is_active = ${isActive}, updated_at = NOW()
      WHERE id = ${gameId}
      RETURNING *
    `);

    res.json(updated.rows?.[0] || updated);
  } catch (error: any) {
    console.error("Error toggling game:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PLAYER ROUTES
// ============================================================

// Spin the wheel / play the game
router.post("/:gameId/spin", isAuthenticated, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { tipAmount } = req.body;
    const spinnerId = req.user?.id;

    if (!spinnerId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get game details
    const [gameResult] = await db.execute(sql`SELECT * FROM tip_games WHERE id = ${gameId} AND is_active = true`);
    const game = gameResult.rows?.[0] as any;

    if (!game) {
      return res.status(404).json({ error: "Game not found or inactive" });
    }

    if (tipAmount < game.min_tip) {
      return res.status(400).json({ error: `Minimum tip is $${game.min_tip}` });
    }

    // Parse prizes and select one based on probability
    const prizes = typeof game.prizes === 'string' ? JSON.parse(game.prizes) : game.prizes;
    if (!prizes || prizes.length === 0) {
      return res.status(400).json({ error: "No prizes configured for this game" });
    }

    // Weighted random selection
    const totalProbability = prizes.reduce((sum: number, p: any) => sum + (p.probability || 0), 0);
    let random = Math.random() * totalProbability;
    let selectedPrize = prizes[0];

    for (const prize of prizes) {
      random -= (prize.probability || 0);
      if (random <= 0) {
        selectedPrize = prize;
        break;
      }
    }

    // Record the spin
    const [spin] = await db.execute(sql`
      INSERT INTO wheel_spins (id, game_id, spinner_id, tip_amount, prize_won, prize_data, created_at)
      VALUES (
        gen_random_uuid(),
        ${gameId},
        ${spinnerId},
        ${tipAmount},
        ${selectedPrize.name},
        ${JSON.stringify(selectedPrize)}::jsonb,
        NOW()
      )
      RETURNING *
    `);

    res.json({
      spin: spin.rows?.[0] || spin,
      prize: selectedPrize
    });
  } catch (error: any) {
    console.error("Error spinning wheel:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's spin history
router.get("/:gameId/history", isAuthenticated, async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user?.id;

    const spins = await db.execute(sql`
      SELECT * FROM wheel_spins
      WHERE game_id = ${gameId} AND spinner_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `);

    res.json({ spins: spins.rows || [] });
  } catch (error: any) {
    console.error("Error fetching spin history:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get game stats
router.get("/:gameId/stats", async (req, res) => {
  try {
    const { gameId } = req.params;

    const [stats] = await db.execute(sql`
      SELECT
        COUNT(*) as total_spins,
        COALESCE(SUM(tip_amount), 0) as total_revenue,
        COALESCE(AVG(tip_amount), 0) as avg_tip
      FROM wheel_spins
      WHERE game_id = ${gameId}
    `);

    const topWinners = await db.execute(sql`
      SELECT u.username, u.display_name, COUNT(*) as wins, SUM(ws.tip_amount) as total_spent
      FROM wheel_spins ws
      LEFT JOIN users u ON ws.spinner_id = u.id
      WHERE ws.game_id = ${gameId}
      GROUP BY u.id, u.username, u.display_name
      ORDER BY wins DESC
      LIMIT 10
    `);

    res.json({
      stats: stats.rows?.[0] || { total_spins: 0, total_revenue: 0, avg_tip: 0 },
      topWinners: topWinners.rows || []
    });
  } catch (error: any) {
    console.error("Error fetching game stats:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
