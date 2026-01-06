/**
 * Category API Routes
 * Provides endpoints for orientation tabs and category filtering
 */

import { Express } from "express";
import { db } from "./db";
import { sql } from "drizzle-orm";

export function registerCategoryRoutes(app: Express) {
  // Get orientation tabs for a platform type
  app.get("/api/categories/orientations", async (req, res) => {
    try {
      const platformType = (req.query.platform as string) || "male";

      const result = await db.execute(sql`
        SELECT id, platform_type, label, icon, sort_order, is_active
        FROM orientation_tabs
        WHERE platform_type = ${platformType} AND is_active = true
        ORDER BY sort_order
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching orientation tabs:", error);
      res.status(500).json({ error: "Failed to fetch orientation tabs" });
    }
  });

  // Get all category groups with categories for a platform
  app.get("/api/categories/groups", async (req, res) => {
    try {
      const platformType = (req.query.platform as string) || "male";

      // Get all groups
      const groupsResult = await db.execute(sql`
        SELECT id, label, icon, sort_order
        FROM category_groups
        ORDER BY sort_order
      `);

      // Get categories filtered by platform
      const categoriesResult = await db.execute(sql`
        SELECT id, group_id, label, description, platforms, content_count, sort_order
        FROM categories
        WHERE 'all' = ANY(platforms) OR ${platformType} = ANY(platforms)
        ORDER BY sort_order
      `);

      // Group categories by group_id
      const categoryMap = new Map<string, any[]>();
      for (const cat of categoriesResult.rows as any[]) {
        const existing = categoryMap.get(cat.group_id) || [];
        existing.push(cat);
        categoryMap.set(cat.group_id, existing);
      }

      // Combine groups with their categories
      const groups = (groupsResult.rows as any[]).map((group) => ({
        ...group,
        categories: categoryMap.get(group.id) || [],
      }));

      res.json(groups);
    } catch (error) {
      console.error("Error fetching category groups:", error);
      res.status(500).json({ error: "Failed to fetch category groups" });
    }
  });

  // Get all categories (flat list)
  app.get("/api/categories", async (req, res) => {
    try {
      const platformType = (req.query.platform as string) || "all";
      const groupId = req.query.group as string;

      let query = sql`
        SELECT c.*, g.label as group_label, g.icon as group_icon
        FROM categories c
        LEFT JOIN category_groups g ON c.group_id = g.id
        WHERE ('all' = ANY(c.platforms) OR ${platformType} = ANY(c.platforms))
      `;

      if (groupId) {
        query = sql`
          SELECT c.*, g.label as group_label, g.icon as group_icon
          FROM categories c
          LEFT JOIN category_groups g ON c.group_id = g.id
          WHERE ('all' = ANY(c.platforms) OR ${platformType} = ANY(c.platforms))
            AND c.group_id = ${groupId}
        `;
      }

      const result = await db.execute(query);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Get single category by ID
  app.get("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const result = await db.execute(sql`
        SELECT c.*, g.label as group_label, g.icon as group_icon
        FROM categories c
        LEFT JOIN category_groups g ON c.group_id = g.id
        WHERE c.id = ${id}
      `);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Category not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  // Get featured/popular categories
  app.get("/api/categories/featured", async (req, res) => {
    try {
      const platformType = (req.query.platform as string) || "all";
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await db.execute(sql`
        SELECT c.*, g.label as group_label
        FROM categories c
        LEFT JOIN category_groups g ON c.group_id = g.id
        WHERE ('all' = ANY(c.platforms) OR ${platformType} = ANY(c.platforms))
          AND (c.is_featured = true OR c.content_count > 0)
        ORDER BY c.is_featured DESC, c.content_count DESC
        LIMIT ${limit}
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching featured categories:", error);
      res.status(500).json({ error: "Failed to fetch featured categories" });
    }
  });

  // Update category content count (called when content is added/removed)
  app.post("/api/categories/:id/update-count", async (req, res) => {
    try {
      const { id } = req.params;

      // Count content with this category
      const countResult = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM content_categories
        WHERE category_id = ${id}
      `);

      const count = parseInt((countResult.rows[0] as any).count) || 0;

      // Update the category
      await db.execute(sql`
        UPDATE categories
        SET content_count = ${count}
        WHERE id = ${id}
      `);

      res.json({ success: true, count });
    } catch (error) {
      console.error("Error updating category count:", error);
      res.status(500).json({ error: "Failed to update category count" });
    }
  });

  // Search categories
  app.get("/api/categories/search", async (req, res) => {
    try {
      const query = (req.query.q as string) || "";
      const platformType = (req.query.platform as string) || "all";

      if (query.length < 2) {
        return res.json([]);
      }

      const searchPattern = `%${query.toLowerCase()}%`;

      const result = await db.execute(sql`
        SELECT c.*, g.label as group_label
        FROM categories c
        LEFT JOIN category_groups g ON c.group_id = g.id
        WHERE ('all' = ANY(c.platforms) OR ${platformType} = ANY(c.platforms))
          AND (LOWER(c.label) LIKE ${searchPattern} OR LOWER(c.description) LIKE ${searchPattern})
        ORDER BY
          CASE WHEN LOWER(c.label) LIKE ${query.toLowerCase() + '%'} THEN 0 ELSE 1 END,
          c.content_count DESC
        LIMIT 20
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Error searching categories:", error);
      res.status(500).json({ error: "Failed to search categories" });
    }
  });

  console.log("✅ Category routes registered");
}
