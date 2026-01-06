import { Router, Request, Response } from "express";
import { db } from "../../db";
import { sql } from "drizzle-orm";

const router = Router();

const requireAdmin = (req: Request, res: Response, next: any) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

router.use(requireAdmin);

// Get all creator health scores
router.get("/scores", async (req: Request, res: Response) => {
  try {
    const { limit = "50", offset = "0", sortBy = "overall_score", order = "desc" } = req.query;
    const scores = await db.execute(sql`
      SELECT chs.*, u.username, u.email, cp.monthly_price_cents, cp.total_subscribers
      FROM creator_health_scores chs
      JOIN users u ON chs.creator_id = u.id
      LEFT JOIN creator_profiles cp ON u.id = cp.user_id
      ORDER BY chs.overall_score DESC
      LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}
    `);
    res.json({ scores: scores.rows || [] });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Get at-risk creators (low scores)
router.get("/at-risk", async (req: Request, res: Response) => {
  try {
    const atRisk = await db.execute(sql`
      SELECT chs.*, u.username, u.email
      FROM creator_health_scores chs
      JOIN users u ON chs.creator_id = u.id
      WHERE chs.overall_score < 50 OR chs.trend_direction = 'down'
      ORDER BY chs.overall_score ASC
      LIMIT 50
    `);
    res.json({ atRiskCreators: atRisk.rows || [] });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Get top performers
router.get("/top-performers", async (req: Request, res: Response) => {
  try {
    const top = await db.execute(sql`
      SELECT chs.*, u.username
      FROM creator_health_scores chs
      JOIN users u ON chs.creator_id = u.id
      WHERE chs.overall_score >= 80
      ORDER BY chs.overall_score DESC
      LIMIT 20
    `);
    res.json({ topPerformers: top.rows || [] });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

export default router;