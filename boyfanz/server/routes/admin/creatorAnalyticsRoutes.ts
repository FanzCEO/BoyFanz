import { Router, Request, Response } from "express";
import { db } from "../../db";
import { sql } from "drizzle-orm";

const router = Router();

// Creator earnings breakdown
router.get("/earnings", async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const creatorId = req.user.id;
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date(Date.now() - days * 86400000);

    const [totals, trends, bySource] = await Promise.all([
      db.execute(sql`
        SELECT 
          COALESCE(SUM(creator_earnings_cents), 0) as total_earnings,
          COALESCE(SUM(creator_earnings_cents) FILTER (WHERE type = 'subscription'), 0) as subscription_earnings,
          COALESCE(SUM(creator_earnings_cents) FILTER (WHERE type = 'tip'), 0) as tip_earnings,
          COALESCE(SUM(creator_earnings_cents) FILTER (WHERE type = 'ppv'), 0) as ppv_earnings
        FROM purchases
        WHERE creator_profile_id = (SELECT id FROM profiles WHERE account_id = ${creatorId} LIMIT 1)
          AND created_at >= ${startDate}
          AND status = 'completed'
      `),
      db.execute(sql`
        SELECT DATE_TRUNC('day', created_at) as date, SUM(creator_earnings_cents) as earnings
        FROM purchases
        WHERE creator_profile_id = (SELECT id FROM profiles WHERE account_id = ${creatorId} LIMIT 1)
          AND created_at >= ${startDate}
          AND status = 'completed'
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY date ASC
      `),
      db.execute(sql`
        SELECT type, SUM(creator_earnings_cents) as earnings, COUNT(*) as count
        FROM purchases
        WHERE creator_profile_id = (SELECT id FROM profiles WHERE account_id = ${creatorId} LIMIT 1)
          AND created_at >= ${startDate}
          AND status = 'completed'
        GROUP BY type
      `)
    ]);

    res.json({
      totals: totals.rows?.[0] || {},
      trends: trends.rows || [],
      bySource: bySource.rows || []
    });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Subscriber growth trends
router.get("/subscribers", async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const creatorId = req.user.id;
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date(Date.now() - days * 86400000);

    const [totals, growth] = await Promise.all([
      db.execute(sql`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'active') as active_subscribers,
          COUNT(*) FILTER (WHERE created_at >= ${startDate}) as new_subscribers,
          COUNT(*) FILTER (WHERE canceled_at >= ${startDate}) as cancelled
        FROM subscriptions
        WHERE plan_id IN (SELECT id FROM subscription_plans WHERE creator_profile_id = (SELECT id FROM profiles WHERE account_id = ${creatorId} LIMIT 1))
      `),
      db.execute(sql`
        SELECT DATE_TRUNC('day', created_at) as date, COUNT(*) as new_subs
        FROM subscriptions
        WHERE plan_id IN (SELECT id FROM subscription_plans WHERE creator_profile_id = (SELECT id FROM profiles WHERE account_id = ${creatorId} LIMIT 1))
          AND created_at >= ${startDate}
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY date ASC
      `)
    ]);

    res.json({ totals: totals.rows?.[0] || {}, growth: growth.rows || [] });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Content performance rankings
router.get("/content-performance", async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const creatorId = req.user.id;

    const topContent = await db.execute(sql`
      SELECT c.*, 
        COUNT(DISTINCT p.id) as purchase_count,
        COALESCE(SUM(p.creator_earnings_cents), 0) as earnings
      FROM content c
      LEFT JOIN purchases p ON p.content_id = c.id AND p.status = 'completed'
      WHERE c.creator_profile_id = (SELECT id FROM profiles WHERE account_id = ${creatorId} LIMIT 1)
      GROUP BY c.id
      ORDER BY earnings DESC
      LIMIT 20
    `);

    res.json({ topContent: topContent.rows || [] });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Best posting times analysis
router.get("/best-times", async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const creatorId = req.user.id;

    const bestTimes = await db.execute(sql`
      SELECT 
        EXTRACT(DOW FROM c.published_at) as day_of_week,
        EXTRACT(HOUR FROM c.published_at) as hour_of_day,
        COUNT(*) as post_count,
        COALESCE(AVG((c.analytics->>'engagement_rate')::numeric), 0) as avg_engagement
      FROM content c
      WHERE c.creator_profile_id = (SELECT id FROM profiles WHERE account_id = ${creatorId} LIMIT 1)
        AND c.published_at IS NOT NULL
      GROUP BY EXTRACT(DOW FROM c.published_at), EXTRACT(HOUR FROM c.published_at)
      ORDER BY avg_engagement DESC
      LIMIT 10
    `);

    res.json({ bestTimes: bestTimes.rows || [] });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

export default router;