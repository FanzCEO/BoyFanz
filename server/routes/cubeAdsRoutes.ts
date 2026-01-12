/**
 * Cube Ads API Routes
 * 
 * CRUD operations for the floating 3D ad cubes
 */

import { Router, Request, Response } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";

const router = Router();

interface CubeAd {
  id: string;
  title: string;
  description: string | null;
  cta: string;
  link: string;
  gradient: string;
  icon: string | null;
  is_active: boolean;
  priority: number;
  start_date: Date | null;
  end_date: Date | null;
  click_count: number;
  impression_count: number;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

// GET /api/cube-ads - Get all active cube ads (public)
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await db.execute(sql`
      SELECT * FROM cube_ads 
      WHERE is_active = true 
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
      ORDER BY priority DESC, created_at DESC
      LIMIT 18
    `);
    
    res.json({ ads: result.rows });
  } catch (error) {
    console.error("Error fetching cube ads:", error);
    res.status(500).json({ error: "Failed to fetch cube ads" });
  }
});

// GET /api/cube-ads/all - Get all cube ads (admin)
router.get("/all", async (req: Request, res: Response) => {
  try {
    // TODO: Add admin auth check
    const result = await db.execute(sql`
      SELECT * FROM cube_ads 
      ORDER BY priority DESC, created_at DESC
    `);
    
    res.json({ ads: result.rows });
  } catch (error) {
    console.error("Error fetching all cube ads:", error);
    res.status(500).json({ error: "Failed to fetch cube ads" });
  }
});

// POST /api/cube-ads - Create new cube ad (admin)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, description, cta, link, gradient, icon, priority, start_date, end_date, is_active } = req.body;
    
    if (!title || !cta || !link || !gradient) {
      return res.status(400).json({ error: "Missing required fields: title, cta, link, gradient" });
    }

    const result = await db.execute(sql`
      INSERT INTO cube_ads (title, description, cta, link, gradient, icon, priority, start_date, end_date, is_active)
      VALUES (${title}, ${description || null}, ${cta}, ${link}, ${gradient}, ${icon || null}, ${priority || 0}, ${start_date || null}, ${end_date || null}, ${is_active !== false})
      RETURNING *
    `);
    
    res.status(201).json({ ad: result.rows[0] });
  } catch (error) {
    console.error("Error creating cube ad:", error);
    res.status(500).json({ error: "Failed to create cube ad" });
  }
});

// PUT /api/cube-ads/:id - Update cube ad (admin)
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, cta, link, gradient, icon, priority, start_date, end_date, is_active } = req.body;
    
    const result = await db.execute(sql`
      UPDATE cube_ads 
      SET 
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        cta = COALESCE(${cta}, cta),
        link = COALESCE(${link}, link),
        gradient = COALESCE(${gradient}, gradient),
        icon = COALESCE(${icon}, icon),
        priority = COALESCE(${priority}, priority),
        start_date = COALESCE(${start_date}, start_date),
        end_date = COALESCE(${end_date}, end_date),
        is_active = COALESCE(${is_active}, is_active),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cube ad not found" });
    }
    
    res.json({ ad: result.rows[0] });
  } catch (error) {
    console.error("Error updating cube ad:", error);
    res.status(500).json({ error: "Failed to update cube ad" });
  }
});

// DELETE /api/cube-ads/:id - Delete cube ad (admin)
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await db.execute(sql`
      DELETE FROM cube_ads WHERE id = ${id} RETURNING id
    `);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cube ad not found" });
    }
    
    res.json({ success: true, deleted: id });
  } catch (error) {
    console.error("Error deleting cube ad:", error);
    res.status(500).json({ error: "Failed to delete cube ad" });
  }
});

// POST /api/cube-ads/:id/click - Track click (public)
router.post("/:id/click", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await db.execute(sql`
      UPDATE cube_ads SET click_count = click_count + 1 WHERE id = ${id}
    `);
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error tracking click:", error);
    res.status(500).json({ error: "Failed to track click" });
  }
});

// POST /api/cube-ads/:id/impression - Track impression (public)
router.post("/:id/impression", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await db.execute(sql`
      UPDATE cube_ads SET impression_count = impression_count + 1 WHERE id = ${id}
    `);
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error tracking impression:", error);
    res.status(500).json({ error: "Failed to track impression" });
  }
});

// GET /api/cube-ads/stats - Get ad statistics (admin)
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) as total_ads,
        SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_ads,
        SUM(click_count) as total_clicks,
        SUM(impression_count) as total_impressions,
        CASE 
          WHEN SUM(impression_count) > 0 
          THEN ROUND((SUM(click_count)::numeric / SUM(impression_count)::numeric) * 100, 2)
          ELSE 0 
        END as avg_ctr
      FROM cube_ads
    `);
    
    res.json({ stats: result.rows[0] });
  } catch (error) {
    console.error("Error fetching ad stats:", error);
    res.status(500).json({ error: "Failed to fetch ad statistics" });
  }
});

export default router;
