/**
 * Starz Studio API Routes
 * 
 * Endpoints for Starz Studio membership, AI tools access, and FanzCloud integration
 */

import { Router } from "express";
import { starzStudioService } from "../services/starzStudioService";
import { mediaQualityService } from "../services/mediaQualityService";
import { db } from "../db";
import { starzAiTools, starzTierRequirements, starzMemberships } from "../../shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Middleware to get profile ID from session
const getProfileId = (req: any) => {
  return req.user?.profileId || req.session?.profileId;
};

/**
 * GET /api/starz-studio/membership
 * Get current user's Starz membership dashboard
 */
router.get("/membership", async (req, res) => {
  try {
    const profileId = getProfileId(req);
    if (!profileId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const dashboard = await starzStudioService.getMembershipDashboard(profileId);
    res.json(dashboard);
  } catch (error: any) {
    console.error("[StarzStudio] Error getting membership:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/starz-studio/evaluate
 * Trigger tier evaluation for current user
 */
router.post("/evaluate", async (req, res) => {
  try {
    const profileId = getProfileId(req);
    if (!profileId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const result = await starzStudioService.evaluateAndUpdateTier(profileId);
    res.json(result);
  } catch (error: any) {
    console.error("[StarzStudio] Error evaluating tier:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/starz-studio/tiers
 * Get all tier requirements and benefits
 */
router.get("/tiers", async (req, res) => {
  try {
    const tiers = await db.query.starzTierRequirements.findMany({
      orderBy: (t, { asc }) => [asc(t.minFanCount)],
    });
    res.json(tiers);
  } catch (error: any) {
    console.error("[StarzStudio] Error getting tiers:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/starz-studio/tools
 * Get all available AI tools with access status
 */
router.get("/tools", async (req, res) => {
  try {
    const profileId = getProfileId(req);
    const tools = await db.query.starzAiTools.findMany({
      where: eq(starzAiTools.isActive, true),
    });

    if (profileId) {
      const membership = await starzStudioService.getOrCreateMembership(profileId);
      const tierOrder = ["none", "bronze_star", "silver_star", "gold_star", "platinum_star", "diamond_star"];
      const currentTierIndex = tierOrder.indexOf(membership.currentTier);

      const toolsWithAccess = tools.map(tool => ({
        ...tool,
        canAccess: currentTierIndex >= tierOrder.indexOf(tool.minimumTier),
        userTier: membership.currentTier,
      }));

      return res.json(toolsWithAccess);
    }

    // Non-authenticated: show tools as view-only
    res.json(tools.map(t => ({ ...t, canAccess: false, userTier: "none" })));
  } catch (error: any) {
    console.error("[StarzStudio] Error getting tools:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/starz-studio/tools/:slug/access
 * Request access to a specific AI tool
 */
router.post("/tools/:slug/access", async (req, res) => {
  try {
    const profileId = getProfileId(req);
    if (!profileId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { slug } = req.params;
    const accessCheck = await starzStudioService.canAccessTool(profileId, slug);

    // Log the access attempt
    await starzStudioService.logToolAccess({
      profileId,
      toolAccessed: slug,
      accessType: accessCheck.canAccess ? "use" : "denied",
      ssoSessionId: req.session?.id,
      ssoClientId: "boyfanz",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      deviceType: "web",
    });

    res.json(accessCheck);
  } catch (error: any) {
    console.error("[StarzStudio] Error accessing tool:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/starz-studio/quality-analytics
 * Get media quality analytics for current user
 */
router.get("/quality-analytics", async (req, res) => {
  try {
    const profileId = getProfileId(req);
    if (!profileId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const analytics = await mediaQualityService.getQualityAnalytics(profileId);
    res.json(analytics || { message: "No media scored yet" });
  } catch (error: any) {
    console.error("[StarzStudio] Error getting quality analytics:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/starz-studio/fanzcloud/register
 * Register a FanzCloud Mobile app session
 */
router.post("/fanzcloud/register", async (req, res) => {
  try {
    const profileId = getProfileId(req);
    if (!profileId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { deviceId, deviceName, platform, appVersion, osVersion, pushToken } = req.body;

    if (!deviceId || !platform || !appVersion) {
      return res.status(400).json({ error: "Missing required fields: deviceId, platform, appVersion" });
    }

    const result = await starzStudioService.registerFanzcloudSession({
      profileId,
      deviceId,
      deviceName,
      platform,
      appVersion,
      osVersion,
      pushToken,
      ipAddress: req.ip,
    });

    res.json(result);
  } catch (error: any) {
    console.error("[StarzStudio] Error registering FanzCloud session:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/starz-studio/referral-stats
 * Get referral statistics for Starz qualification
 */
router.get("/referral-stats", async (req, res) => {
  try {
    const profileId = getProfileId(req);
    if (!profileId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const membership = await starzStudioService.getOrCreateMembership(profileId);
    
    res.json({
      successfulReferrals: membership.successfulReferrals,
      pendingReferrals: membership.pendingReferrals,
      nextTierRequirement: null, // TODO: Calculate
    });
  } catch (error: any) {
    console.error("[StarzStudio] Error getting referral stats:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/starz-studio/seed-tiers (Admin only)
 * Seed tier requirements
 */
router.post("/seed-tiers", async (req, res) => {
  try {
    // TODO: Add admin check
    await starzStudioService.seedTierRequirements();
    res.json({ success: true, message: "Tier requirements seeded" });
  } catch (error: any) {
    console.error("[StarzStudio] Error seeding tiers:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
