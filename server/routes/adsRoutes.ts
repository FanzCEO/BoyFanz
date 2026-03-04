/**
 * Ad Insertion System - Server Routes
 *
 * Provides ad configuration and ad unit data for the feed ad insertion system.
 * Serves house ads (internal promotions) by default, with support for
 * external ad network integration in the future.
 *
 * Endpoints:
 *   GET /api/ads/config  - Returns ad configuration (frequency, placements, settings)
 *   GET /api/ads/units   - Returns available ad units filtered by placement
 *   POST /api/ads/impression - Track an ad impression
 *   POST /api/ads/click      - Track an ad click
 */

import { Router, Request, Response } from "express";
import { readFileSync } from "fs";
import { join } from "path";

const router = Router();

// Ad unit type definitions
interface AdUnit {
  id: string;
  type: "banner" | "native" | "interstitial";
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  cta: string;
  sponsored: boolean;
  placement: string[];
  priority: number;
  gradient: string;
}

interface AdConfig {
  frequency: number;
  enabled: boolean;
  placements: string[];
  maxAdsPerPage: number;
  refreshIntervalMs: number;
}

interface AdsData {
  config: AdConfig;
  units: AdUnit[];
}

// In-memory tracking (replace with DB-backed tracking in production)
const impressionCounts: Record<string, number> = {};
const clickCounts: Record<string, number> = {};

// Load ad data from JSON file
function loadAdsData(): AdsData {
  try {
    const dataPath = join(__dirname, "..", "data", "ads.json");
    const raw = readFileSync(dataPath, "utf-8");
    return JSON.parse(raw) as AdsData;
  } catch (error) {
    console.error("Failed to load ads data:", error);
    return {
      config: {
        frequency: 5,
        enabled: false,
        placements: [],
        maxAdsPerPage: 0,
        refreshIntervalMs: 300000,
      },
      units: [],
    };
  }
}

/**
 * GET /api/ads/config
 * Returns the ad insertion configuration.
 * Used by the client to determine ad frequency and placement rules.
 */
router.get("/config", (req: Request, res: Response) => {
  try {
    const data = loadAdsData();
    res.json({
      success: true,
      config: data.config,
    });
  } catch (error) {
    console.error("Error fetching ad config:", error);
    res.status(500).json({ success: false, error: "Failed to fetch ad configuration" });
  }
});

/**
 * GET /api/ads/units
 * Returns available ad units, optionally filtered by placement.
 * Query params:
 *   - placement: Filter by placement type (feed, sidebar, profile)
 *   - limit: Maximum number of units to return
 *   - type: Filter by ad type (banner, native, interstitial)
 */
router.get("/units", (req: Request, res: Response) => {
  try {
    const data = loadAdsData();
    const { placement, limit, type } = req.query;

    let units = data.units;

    // Filter by placement if specified
    if (placement && typeof placement === "string") {
      units = units.filter((unit) => unit.placement.includes(placement));
    }

    // Filter by type if specified
    if (type && typeof type === "string") {
      units = units.filter((unit) => unit.type === type);
    }

    // Sort by priority (highest first)
    units.sort((a, b) => b.priority - a.priority);

    // Apply limit
    if (limit && typeof limit === "string") {
      const parsedLimit = parseInt(limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        units = units.slice(0, parsedLimit);
      }
    }

    // Attach tracking counts
    const unitsWithTracking = units.map((unit) => ({
      ...unit,
      impressions: impressionCounts[unit.id] || 0,
      clicks: clickCounts[unit.id] || 0,
    }));

    res.json({
      success: true,
      units: unitsWithTracking,
      total: unitsWithTracking.length,
    });
  } catch (error) {
    console.error("Error fetching ad units:", error);
    res.status(500).json({ success: false, error: "Failed to fetch ad units" });
  }
});

/**
 * POST /api/ads/impression
 * Track an ad impression.
 * Body: { adId: string }
 */
router.post("/impression", (req: Request, res: Response) => {
  try {
    const { adId } = req.body;

    if (!adId || typeof adId !== "string") {
      return res.status(400).json({ success: false, error: "adId is required" });
    }

    impressionCounts[adId] = (impressionCounts[adId] || 0) + 1;

    res.json({
      success: true,
      adId,
      totalImpressions: impressionCounts[adId],
    });
  } catch (error) {
    console.error("Error tracking impression:", error);
    res.status(500).json({ success: false, error: "Failed to track impression" });
  }
});

/**
 * POST /api/ads/click
 * Track an ad click.
 * Body: { adId: string }
 */
router.post("/click", (req: Request, res: Response) => {
  try {
    const { adId } = req.body;

    if (!adId || typeof adId !== "string") {
      return res.status(400).json({ success: false, error: "adId is required" });
    }

    clickCounts[adId] = (clickCounts[adId] || 0) + 1;

    res.json({
      success: true,
      adId,
      totalClicks: clickCounts[adId],
    });
  } catch (error) {
    console.error("Error tracking click:", error);
    res.status(500).json({ success: false, error: "Failed to track click" });
  }
});

/**
 * GET /api/ads/stats
 * Returns aggregate ad statistics. Admin use.
 */
router.get("/stats", (req: Request, res: Response) => {
  try {
    const data = loadAdsData();

    const stats = data.units.map((unit) => {
      const impressions = impressionCounts[unit.id] || 0;
      const clicks = clickCounts[unit.id] || 0;
      const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : "0.00";

      return {
        id: unit.id,
        title: unit.title,
        type: unit.type,
        impressions,
        clicks,
        ctr: `${ctr}%`,
      };
    });

    const totalImpressions = Object.values(impressionCounts).reduce((sum, v) => sum + v, 0);
    const totalClicks = Object.values(clickCounts).reduce((sum, v) => sum + v, 0);
    const overallCtr = totalImpressions > 0
      ? ((totalClicks / totalImpressions) * 100).toFixed(2)
      : "0.00";

    res.json({
      success: true,
      stats: {
        units: stats,
        totals: {
          impressions: totalImpressions,
          clicks: totalClicks,
          ctr: `${overallCtr}%`,
          activeUnits: data.units.length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching ad stats:", error);
    res.status(500).json({ success: false, error: "Failed to fetch ad statistics" });
  }
});

export default router;
