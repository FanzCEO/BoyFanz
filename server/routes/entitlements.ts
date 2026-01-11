console.log("[DEBUG] Entitlements module loaded");
/**
 * Entitlements API Routes
 * Returns user membership tier, feature flags, and zone access
 */

import { Router, Request, Response } from "express";
import { storage } from "../storage";

const router = Router();

// Tier hierarchy for comparison
const TIER_HIERARCHY: Record<string, number> = {
  free: 0,
  basic: 1,
  premium: 2,
  vip: 3,
  creator: 4,
};

// Zone access requirements (can be moved to database later)
const ZONE_REQUIREMENTS: Record<string, { minTier?: string; features?: string[]; requiresStepUp?: boolean }> = {
  fanztube: { minTier: "free" },
  fanzfiliate: { minTier: "basic" },
  fanzmeet: { minTier: "premium" },
  fanzvarsity: { minTier: "basic" },
  fanzswipe: { minTier: "premium" },
  fanzworld: { minTier: "vip" },
  starzcardz: { minTier: "creator", requiresStepUp: true },
  wickedcrm: { minTier: "creator", requiresStepUp: true },
  fanzdefend: { minTier: "creator" },
  fanzforge: { minTier: "creator" },
  empire: { minTier: "free", requiresStepUp: true },
};

// Feature flags per tier
const TIER_FEATURES: Record<string, string[]> = {
  free: ["basic_viewing", "public_content"],
  basic: ["basic_viewing", "public_content", "messaging", "favorites"],
  premium: ["basic_viewing", "public_content", "messaging", "favorites", "video_calls", "priority_support"],
  vip: ["basic_viewing", "public_content", "messaging", "favorites", "video_calls", "priority_support", "exclusive_content", "early_access"],
  creator: ["basic_viewing", "public_content", "messaging", "favorites", "video_calls", "priority_support", "exclusive_content", "early_access", "analytics", "monetization", "custom_branding"],
};

/**
 * GET /api/entitlements
 * Returns current user's entitlements
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.isAuthenticated?.() || !req.user) {
      return res.json({
        success: true,
        entitlements: {
          tier: "free",
          isActive: false,
          expiresAt: null,
          features: arrayToObject(TIER_FEATURES.free),
          zoneAccess: calculateZoneAccess("free", false, []),
          stepUpVerified: false,
          stepUpExpiresAt: null,
        },
      });
    }

    const userId = (req.user as any).id;

    // Get user's membership/subscription
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // Determine tier from user role/subscription
    let tier = "free";
    let isActive = true;
    let expiresAt: string | null = null;

    // Check if user has a subscription
    const subscription = await storage.getUserSubscription?.(userId);
    if (subscription) {
      tier = subscription.tier || "free";
      isActive = subscription.status === "active";
      expiresAt = subscription.expiresAt?.toISOString() || null;
    }

    // Creator role gets creator tier
    if (user.role === "creator" || user.role === "admin" || user.role === "super_admin" || user.role === "ceo") {
      tier = "creator";
      isActive = true;
    }

    // Build feature flags
    const tierFeatures = TIER_FEATURES[tier] || TIER_FEATURES.free;
    const features = arrayToObject(tierFeatures);

    // Check step-up status from session
    const stepUpVerified = !!(req.session as any)?.stepUpVerified;
    const stepUpExpiresAt = (req.session as any)?.stepUpExpiresAt || null;

    // Calculate zone access
    const zoneAccess = calculateZoneAccess(tier, isActive, tierFeatures, stepUpVerified);

    return res.json({
      success: true,
      entitlements: {
        tier,
        isActive,
        expiresAt,
        features,
        zoneAccess,
        stepUpVerified,
        stepUpExpiresAt,
      },
    });
  } catch (error) {
    console.error("[Entitlements] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch entitlements" });
  }
});

/**
 * POST /api/entitlements/step-up
 * Verify password for step-up authentication
 */
router.post("/step-up", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated?.() || !req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: "Password required" });
    }

    const userId = (req.user as any).id;
    const user = await storage.getUserById(userId);

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // Verify password
    const bcrypt = await import("bcrypt");
    const isValid = await bcrypt.compare(password, user.password || "");

    if (!isValid) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    // Set step-up in session (expires in 30 minutes)
    const expiresAt = Date.now() + 30 * 60 * 1000;
    (req.session as any).stepUpVerified = true;
    (req.session as any).stepUpExpiresAt = expiresAt;

    return res.json({
      success: true,
      expiresAt,
    });
  } catch (error) {
    console.error("[StepUp] Error:", error);
    return res.status(500).json({ success: false, message: "Step-up verification failed" });
  }
});

/**
 * Convert feature array to object with true values
 */
function arrayToObject(features: string[]): Record<string, boolean> {
  const obj: Record<string, boolean> = {};
  features.forEach((f) => (obj[f] = true));
  return obj;
}

/**
 * Calculate zone access levels based on tier and features
 */
function calculateZoneAccess(
  tier: string,
  isActive: boolean,
  features: string[],
  stepUpVerified = false
): Record<string, "denied" | "readonly" | "full"> {
  const access: Record<string, "denied" | "readonly" | "full"> = {};
  const userTierLevel = TIER_HIERARCHY[tier] || 0;

  for (const [zoneId, requirements] of Object.entries(ZONE_REQUIREMENTS)) {
    // Check tier requirement
    const requiredTierLevel = TIER_HIERARCHY[requirements.minTier || "free"] || 0;

    if (!isActive && requiredTierLevel > 0) {
      access[zoneId] = "denied";
      continue;
    }

    if (userTierLevel < requiredTierLevel) {
      access[zoneId] = "denied";
      continue;
    }

    // Check feature requirements
    if (requirements.features?.length) {
      const hasAllFeatures = requirements.features.every((f) => features.includes(f));
      if (!hasAllFeatures) {
        access[zoneId] = "denied";
        continue;
      }
    }

    // Check step-up requirement
    if (requirements.requiresStepUp && !stepUpVerified) {
      // User has tier access but needs step-up - mark as readonly until verified
      access[zoneId] = "readonly";
      continue;
    }

    access[zoneId] = "full";
  }

  return access;
}

export default router;
