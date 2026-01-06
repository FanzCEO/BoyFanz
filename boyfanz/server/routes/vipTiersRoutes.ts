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

// Get all VIP tiers (admin)
router.get("/admin", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { searchQuery, tier, status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const tiers = await db.execute(sql`
      SELECT vt.*,
             u.username as creator_username,
             u.display_name as creator_display_name,
             (SELECT COUNT(*) FROM vip_subscriptions WHERE tier_id = vt.id AND status = 'active') as subscriber_count,
             (SELECT COALESCE(SUM(vs.price_paid), 0) FROM vip_subscriptions vs WHERE vs.tier_id = vt.id) as total_revenue
      FROM creator_vip_tiers vt
      LEFT JOIN users u ON vt.creator_id = u.id
      ${tier && tier !== 'all' ? sql`WHERE vt.tier = ${tier}` : sql``}
      ${status && status !== 'all' ? sql`AND vt.is_active = ${status === 'active'}` : sql``}
      ORDER BY vt.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${offset}
    `);

    const [countResult] = await db.execute(sql`SELECT COUNT(*) as total FROM creator_vip_tiers`);

    res.json({
      tiers: tiers.rows || [],
      total: Number((countResult as any)?.total || 0),
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error: any) {
    console.error("Error fetching VIP tiers:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all subscriptions (admin)
router.get("/admin/subscriptions", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const subscriptions = await db.execute(sql`
      SELECT vs.*,
             u.username as subscriber_username,
             u.display_name as subscriber_display_name,
             vt.name as tier_name,
             vt.tier as tier_level
      FROM vip_subscriptions vs
      LEFT JOIN users u ON vs.subscriber_id = u.id
      LEFT JOIN creator_vip_tiers vt ON vs.tier_id = vt.id
      ${status && status !== 'all' ? sql`WHERE vs.status = ${status}` : sql``}
      ORDER BY vs.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${offset}
    `);

    const [countResult] = await db.execute(sql`SELECT COUNT(*) as total FROM vip_subscriptions`);

    res.json({
      subscriptions: subscriptions.rows || [],
      total: Number((countResult as any)?.total || 0),
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error: any) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get analytics (admin)
router.get("/admin/analytics", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const [tiersCount] = await db.execute(sql`SELECT COUNT(*) as total FROM creator_vip_tiers WHERE is_active = true`);
    const [subsCount] = await db.execute(sql`SELECT COUNT(*) as total FROM vip_subscriptions WHERE status = 'active'`);
    const [revenueResult] = await db.execute(sql`SELECT COALESCE(SUM(price_paid), 0) as total FROM vip_subscriptions`);

    // Calculate MRR (Monthly Recurring Revenue)
    const [mrrResult] = await db.execute(sql`
      SELECT COALESCE(SUM(
        CASE
          WHEN vt.billing_period = 'monthly' THEN vs.price_paid
          WHEN vt.billing_period = 'quarterly' THEN vs.price_paid / 3
          WHEN vt.billing_period = 'yearly' THEN vs.price_paid / 12
          ELSE 0
        END
      ), 0) as mrr
      FROM vip_subscriptions vs
      JOIN creator_vip_tiers vt ON vs.tier_id = vt.id
      WHERE vs.status = 'active'
    `);

    // Top performing tiers
    const topTiers = await db.execute(sql`
      SELECT vt.id, vt.name, vt.tier,
             COUNT(vs.id) as subscribers,
             COALESCE(SUM(vs.price_paid), 0) as revenue
      FROM creator_vip_tiers vt
      LEFT JOIN vip_subscriptions vs ON vt.id = vs.tier_id
      GROUP BY vt.id, vt.name, vt.tier
      ORDER BY revenue DESC
      LIMIT 5
    `);

    // Tier distribution
    const tierDist = await db.execute(sql`
      SELECT vt.tier, COUNT(vs.id) as count
      FROM creator_vip_tiers vt
      LEFT JOIN vip_subscriptions vs ON vt.id = vs.tier_id AND vs.status = 'active'
      GROUP BY vt.tier
    `);

    const totalActive = (tierDist.rows || []).reduce((sum: number, t: any) => sum + Number(t.count || 0), 0);
    const tierDistribution: any = {};
    (tierDist.rows || []).forEach((t: any) => {
      tierDistribution[t.tier] = {
        count: Number(t.count || 0),
        percentage: totalActive > 0 ? Math.round((Number(t.count || 0) / totalActive) * 100) : 0
      };
    });

    res.json({
      totalTiers: Number((tiersCount.rows?.[0] as any)?.total || 0),
      totalSubscribers: Number((subsCount.rows?.[0] as any)?.total || 0),
      totalRevenue: Number((revenueResult.rows?.[0] as any)?.total || 0),
      mrr: Number((mrrResult.rows?.[0] as any)?.mrr || 0),
      topTiers: topTiers.rows || [],
      tierDistribution
    });
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// CREATOR ROUTES
// ============================================================

// Get creator's VIP tiers
router.get("/creator/:creatorId", async (req, res) => {
  try {
    const { creatorId } = req.params;

    const tiers = await db.execute(sql`
      SELECT vt.*,
             (SELECT COUNT(*) FROM vip_subscriptions WHERE tier_id = vt.id AND status = 'active') as subscriber_count
      FROM creator_vip_tiers vt
      WHERE vt.creator_id = ${creatorId} AND vt.is_active = true
      ORDER BY
        CASE vt.tier
          WHEN 'diamond' THEN 1
          WHEN 'gold' THEN 2
          WHEN 'silver' THEN 3
          WHEN 'bronze' THEN 4
        END
    `);

    res.json({ tiers: tiers.rows || [] });
  } catch (error: any) {
    console.error("Error fetching creator tiers:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new VIP tier
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { name, tier, price, billingPeriod, perks, isActive = true } = req.body;
    const creatorId = req.user?.id;

    if (!creatorId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const [newTier] = await db.execute(sql`
      INSERT INTO creator_vip_tiers (id, creator_id, name, tier, price, billing_period, perks, is_active, created_at)
      VALUES (
        gen_random_uuid(),
        ${creatorId},
        ${name},
        ${tier},
        ${price},
        ${billingPeriod},
        ${JSON.stringify(perks)}::jsonb,
        ${isActive},
        NOW()
      )
      RETURNING *
    `);

    res.status(201).json(newTier.rows?.[0] || newTier);
  } catch (error: any) {
    console.error("Error creating VIP tier:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update a VIP tier
router.put("/:tierId", isAuthenticated, async (req, res) => {
  try {
    const { tierId } = req.params;
    const { name, tier, price, billingPeriod, perks, isActive } = req.body;
    const userId = req.user?.id;

    // Verify ownership or admin
    const [existing] = await db.execute(sql`SELECT creator_id FROM creator_vip_tiers WHERE id = ${tierId}`);
    const tierData = (existing.rows?.[0] as any);

    if (!tierData) {
      return res.status(404).json({ error: "Tier not found" });
    }

    if (tierData.creator_id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to update this tier" });
    }

    const [updated] = await db.execute(sql`
      UPDATE creator_vip_tiers
      SET name = COALESCE(${name}, name),
          tier = COALESCE(${tier}, tier),
          price = COALESCE(${price}, price),
          billing_period = COALESCE(${billingPeriod}, billing_period),
          perks = COALESCE(${perks ? JSON.stringify(perks) : null}::jsonb, perks),
          is_active = COALESCE(${isActive}, is_active),
          updated_at = NOW()
      WHERE id = ${tierId}
      RETURNING *
    `);

    res.json(updated.rows?.[0] || updated);
  } catch (error: any) {
    console.error("Error updating VIP tier:", error);
    res.status(500).json({ error: error.message });
  }
});

// Toggle tier active status
router.post("/:tierId/toggle", isAuthenticated, async (req, res) => {
  try {
    const { tierId } = req.params;
    const { isActive } = req.body;

    const [updated] = await db.execute(sql`
      UPDATE creator_vip_tiers
      SET is_active = ${isActive}, updated_at = NOW()
      WHERE id = ${tierId}
      RETURNING *
    `);

    res.json(updated.rows?.[0] || updated);
  } catch (error: any) {
    console.error("Error toggling tier:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// SUBSCRIBER ROUTES
// ============================================================

// Subscribe to a VIP tier
router.post("/:tierId/subscribe", isAuthenticated, async (req, res) => {
  try {
    const { tierId } = req.params;
    const subscriberId = req.user?.id;

    if (!subscriberId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get tier details
    const [tierResult] = await db.execute(sql`SELECT * FROM creator_vip_tiers WHERE id = ${tierId} AND is_active = true`);
    const tier = tierResult.rows?.[0] as any;

    if (!tier) {
      return res.status(404).json({ error: "Tier not found or inactive" });
    }

    // Check if already subscribed
    const [existingSub] = await db.execute(sql`
      SELECT id FROM vip_subscriptions
      WHERE tier_id = ${tierId} AND subscriber_id = ${subscriberId} AND status = 'active'
    `);

    if ((existingSub.rows?.length || 0) > 0) {
      return res.status(400).json({ error: "Already subscribed to this tier" });
    }

    // Calculate end date based on billing period
    let endDate = 'NOW() + INTERVAL \'1 month\'';
    if (tier.billing_period === 'quarterly') {
      endDate = 'NOW() + INTERVAL \'3 months\'';
    } else if (tier.billing_period === 'yearly') {
      endDate = 'NOW() + INTERVAL \'1 year\'';
    }

    const [subscription] = await db.execute(sql`
      INSERT INTO vip_subscriptions (id, tier_id, subscriber_id, status, start_date, end_date, auto_renew, price_paid, created_at)
      VALUES (
        gen_random_uuid(),
        ${tierId},
        ${subscriberId},
        'active',
        NOW(),
        ${sql.raw(endDate)},
        true,
        ${tier.price},
        NOW()
      )
      RETURNING *
    `);

    res.status(201).json(subscription.rows?.[0] || subscription);
  } catch (error: any) {
    console.error("Error subscribing to tier:", error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel subscription
router.post("/subscription/:subscriptionId/cancel", isAuthenticated, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user?.id;

    // Verify ownership
    const [existing] = await db.execute(sql`SELECT subscriber_id FROM vip_subscriptions WHERE id = ${subscriptionId}`);
    const sub = existing.rows?.[0] as any;

    if (!sub || (sub.subscriber_id !== userId && req.user?.role !== 'admin')) {
      return res.status(403).json({ error: "Not authorized to cancel this subscription" });
    }

    const [updated] = await db.execute(sql`
      UPDATE vip_subscriptions
      SET status = 'cancelled', auto_renew = false, updated_at = NOW()
      WHERE id = ${subscriptionId}
      RETURNING *
    `);

    res.json(updated.rows?.[0] || updated);
  } catch (error: any) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's subscriptions
router.get("/my-subscriptions", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;

    const subscriptions = await db.execute(sql`
      SELECT vs.*,
             vt.name as tier_name,
             vt.tier as tier_level,
             vt.perks as tier_perks,
             u.username as creator_username,
             u.display_name as creator_display_name
      FROM vip_subscriptions vs
      JOIN creator_vip_tiers vt ON vs.tier_id = vt.id
      JOIN users u ON vt.creator_id = u.id
      WHERE vs.subscriber_id = ${userId}
      ORDER BY vs.created_at DESC
    `);

    res.json({ subscriptions: subscriptions.rows || [] });
  } catch (error: any) {
    console.error("Error fetching user subscriptions:", error);
    res.status(500).json({ error: error.message });
  }
});

// Check if user has VIP access to creator
router.get("/check-access/:creatorId", isAuthenticated, async (req, res) => {
  try {
    const { creatorId } = req.params;
    const userId = req.user?.id;

    const [access] = await db.execute(sql`
      SELECT vs.*, vt.tier, vt.perks
      FROM vip_subscriptions vs
      JOIN creator_vip_tiers vt ON vs.tier_id = vt.id
      WHERE vs.subscriber_id = ${userId}
        AND vt.creator_id = ${creatorId}
        AND vs.status = 'active'
        AND vs.end_date > NOW()
      ORDER BY
        CASE vt.tier
          WHEN 'diamond' THEN 1
          WHEN 'gold' THEN 2
          WHEN 'silver' THEN 3
          WHEN 'bronze' THEN 4
        END
      LIMIT 1
    `);

    if (access.rows && access.rows.length > 0) {
      res.json({ hasAccess: true, subscription: access.rows[0] });
    } else {
      res.json({ hasAccess: false });
    }
  } catch (error: any) {
    console.error("Error checking VIP access:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
