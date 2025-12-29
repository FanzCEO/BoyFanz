import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { users, profiles, creatorLocations } from "@shared/schema";
import { eq, and, sql, desc, asc, gte, lte, isNotNull } from "drizzle-orm";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const nearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(1).max(500).default(50), // miles
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

const updateLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  country: z.string().min(2).max(100).optional(),
  isVisible: z.boolean().default(true),
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Haversine formula to calculate distance between two points in miles
 * Returns SQL expression for distance calculation
 */
function haversineDistanceSQL(lat: number, lng: number): ReturnType<typeof sql> {
  return sql`
    3959 * acos(
      cos(radians(${lat})) * cos(radians(${creatorLocations.lat})) *
      cos(radians(${creatorLocations.lng}) - radians(${lng})) +
      sin(radians(${lat})) * sin(radians(${creatorLocations.lat}))
    )
  `;
}

// ============================================================
// NEARBY CREATOR ROUTES
// ============================================================

/**
 * GET /api/creators/nearby
 * Get creators near a location (CREATORS ONLY - no fans)
 */
router.get("/nearby", isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const query = nearbyQuerySchema.parse(req.query);
    const { lat, lng, radius, limit, offset } = query;

    // Calculate distance using Haversine formula
    const distanceExpr = haversineDistanceSQL(lat, lng);

    // Query creators within radius who are visible
    // Join with users to ensure they're creators (role = 'creator')
    const nearbyCreators = await db
      .select({
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        role: users.role,
        onlineStatus: users.onlineStatus,
        lastSeenAt: users.lastSeenAt,
        // Location data
        lat: creatorLocations.lat,
        lng: creatorLocations.lng,
        city: creatorLocations.city,
        state: creatorLocations.state,
        country: creatorLocations.country,
        lastUpdated: creatorLocations.lastUpdated,
        // Calculated distance
        distance: distanceExpr.as("distance"),
      })
      .from(creatorLocations)
      .innerJoin(users, eq(users.id, creatorLocations.userId))
      .where(
        and(
          eq(creatorLocations.isVisible, true),
          eq(users.role, "creator"), // ONLY CREATORS
          eq(users.status, "active"),
          // Filter by radius using Haversine
          sql`${distanceExpr} <= ${radius}`
        )
      )
      .orderBy(asc(sql`distance`))
      .limit(limit)
      .offset(offset);

    // Transform results to match frontend interface
    const results = nearbyCreators.map((creator) => ({
      id: creator.id,
      username: creator.username || "Anonymous",
      displayName: creator.firstName
        ? `${creator.firstName}${creator.lastName ? ` ${creator.lastName.charAt(0)}.` : ""}`
        : creator.username || "Anonymous",
      profileImageUrl: creator.profileImageUrl,
      isVerified: true, // All returned are verified creators
      distance: Math.round(Number(creator.distance) * 10) / 10, // Round to 1 decimal
      location: {
        city: creator.city || "",
        state: creator.state || "",
        country: creator.country || "US",
        lat: Number(creator.lat),
        lng: Number(creator.lng),
      },
      lastActiveAt: creator.lastSeenAt?.toISOString() || new Date().toISOString(),
      isOnline: creator.onlineStatus || false,
      tags: [], // TODO: Add creator tags/categories from profile
    }));

    res.json({
      success: true,
      data: results,
      pagination: {
        limit,
        offset,
        hasMore: results.length === limit,
      },
      query: {
        lat,
        lng,
        radius,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid query parameters",
        details: error.errors,
      });
    }

    console.error("[Nearby] Error fetching nearby creators:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch nearby creators",
    });
  }
});

/**
 * GET /api/creators/nearby/stats
 * Get stats about nearby creators (count by distance bands)
 */
router.get("/nearby/stats", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { lat, lng } = nearbyQuerySchema.pick({ lat: true, lng: true }).parse(req.query);

    const distanceExpr = haversineDistanceSQL(lat, lng);

    // Count creators in different radius bands
    const stats = await db
      .select({
        total: sql<number>`count(*)`.as("total"),
        within5: sql<number>`count(*) filter (where ${distanceExpr} <= 5)`.as("within5"),
        within25: sql<number>`count(*) filter (where ${distanceExpr} <= 25)`.as("within25"),
        within50: sql<number>`count(*) filter (where ${distanceExpr} <= 50)`.as("within50"),
        within100: sql<number>`count(*) filter (where ${distanceExpr} <= 100)`.as("within100"),
      })
      .from(creatorLocations)
      .innerJoin(users, eq(users.id, creatorLocations.userId))
      .where(
        and(
          eq(creatorLocations.isVisible, true),
          eq(users.role, "creator"),
          eq(users.status, "active")
        )
      );

    res.json({
      success: true,
      data: {
        within5Miles: Number(stats[0]?.within5 || 0),
        within25Miles: Number(stats[0]?.within25 || 0),
        within50Miles: Number(stats[0]?.within50 || 0),
        within100Miles: Number(stats[0]?.within100 || 0),
        total: Number(stats[0]?.total || 0),
      },
    });
  } catch (error: any) {
    console.error("[Nearby] Error fetching stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch nearby stats",
    });
  }
});

/**
 * POST /api/creators/location
 * Update or create current user's location (creators only)
 */
router.post("/location", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    // Verify user is a creator
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || user.role !== "creator") {
      return res.status(403).json({
        success: false,
        error: "Only creators can set their location for the nearby feature",
      });
    }

    // Validate location data
    const locationData = updateLocationSchema.parse(req.body);

    // Upsert location
    const [result] = await db
      .insert(creatorLocations)
      .values({
        userId,
        lat: locationData.lat.toString(),
        lng: locationData.lng.toString(),
        city: locationData.city,
        state: locationData.state,
        country: locationData.country || "US",
        isVisible: locationData.isVisible,
        lastUpdated: new Date(),
      })
      .onConflictDoUpdate({
        target: creatorLocations.userId,
        set: {
          lat: locationData.lat.toString(),
          lng: locationData.lng.toString(),
          city: locationData.city,
          state: locationData.state,
          country: locationData.country || "US",
          isVisible: locationData.isVisible,
          lastUpdated: new Date(),
        },
      })
      .returning();

    res.json({
      success: true,
      message: "Location updated successfully",
      data: result,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid location data",
        details: error.errors,
      });
    }

    console.error("[Nearby] Error updating location:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update location",
    });
  }
});

/**
 * GET /api/creators/location
 * Get current user's location settings
 */
router.get("/location", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const [location] = await db
      .select()
      .from(creatorLocations)
      .where(eq(creatorLocations.userId, userId))
      .limit(1);

    res.json({
      success: true,
      data: location || null,
    });
  } catch (error: any) {
    console.error("[Nearby] Error fetching location:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch location",
    });
  }
});

/**
 * DELETE /api/creators/location
 * Remove current user's location (stop appearing in nearby)
 */
router.delete("/location", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    await db
      .delete(creatorLocations)
      .where(eq(creatorLocations.userId, userId));

    res.json({
      success: true,
      message: "Location removed successfully",
    });
  } catch (error: any) {
    console.error("[Nearby] Error removing location:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove location",
    });
  }
});

/**
 * PATCH /api/creators/location/visibility
 * Toggle visibility without removing location
 */
router.patch("/location/visibility", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const { isVisible } = z.object({ isVisible: z.boolean() }).parse(req.body);

    const [result] = await db
      .update(creatorLocations)
      .set({ isVisible, lastUpdated: new Date() })
      .where(eq(creatorLocations.userId, userId))
      .returning();

    if (!result) {
      return res.status(404).json({
        success: false,
        error: "No location found. Please set your location first.",
      });
    }

    res.json({
      success: true,
      message: `Location visibility ${isVisible ? "enabled" : "disabled"}`,
      data: result,
    });
  } catch (error: any) {
    console.error("[Nearby] Error updating visibility:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update visibility",
    });
  }
});

export default router;
