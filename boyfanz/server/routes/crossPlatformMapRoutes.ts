/**
 * Cross-Platform Map API Routes
 *
 * Endpoints for:
 * - User location management
 * - Nearby creators discovery (local + cross-platform)
 * - Meetup scheduling and management
 * - SMS/Push notification preferences
 * - Membership tier features
 */

import { Router, Request, Response } from "express";
import { isAuthenticated, requireCreator } from "../middleware/auth";
import { createCrossPlatformMapService } from "../services/crossPlatformMapService";
import { createMeetupReminderService } from "../services/meetupReminderService";
import rateLimit from "express-rate-limit";
import { z } from "zod";

const router = Router();

// Current platform identifier
const CURRENT_PLATFORM = process.env.PLATFORM_ID || "boyfanz";

// Initialize services
const mapService = createCrossPlatformMapService(CURRENT_PLATFORM);
const reminderService = createMeetupReminderService("FANZ");

// Rate limiting
const mapRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Too many map requests, please try again later" },
});

const meetupRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Too many meetup requests, please try again later" },
});

// ===== LOCATION ENDPOINTS =====

/**
 * POST /api/map/location
 * Update user's current location
 */
router.post("/location", isAuthenticated, mapRateLimit, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const schema = z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
      accuracy: z.number().optional(),
      source: z.enum(["browser", "manual", "ip_lookup"]).optional(),
      isPublic: z.boolean().optional(),
      showExact: z.boolean().optional(),
      locationRadius: z.number().min(1).max(50).optional(),
      visiblePlatforms: z.array(z.string()).optional(),
    });

    const data = schema.parse(req.body);

    const location = await mapService.updateUserLocation(
      user.id,
      { latitude: data.latitude, longitude: data.longitude },
      {
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
        accuracy: data.accuracy,
        source: data.source,
        isPublic: data.isPublic,
        showExact: data.showExact,
        locationRadius: data.locationRadius,
        visiblePlatforms: data.visiblePlatforms,
      }
    );

    res.json({
      success: true,
      location: {
        city: location.city,
        state: location.state,
        country: location.country,
        isPublic: location.isLocationPublic,
        showExact: location.showExactLocation,
        lastUpdated: location.lastUpdated,
      },
    });
  } catch (error: any) {
    console.error("Location update error:", error);
    res.status(400).json({ error: error.message || "Failed to update location" });
  }
});

// ===== NEARBY CREATORS ENDPOINTS =====

/**
 * GET /api/map/nearby
 * Get nearby creators (local platform only for free users)
 */
router.get("/nearby", isAuthenticated, mapRateLimit, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { lat, lng, radius } = req.query;

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const radiusMiles = parseInt(radius as string) || 25;

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: "Valid latitude and longitude required" });
    }

    const creators = await mapService.getNearbyCreatorsLocal(
      { latitude, longitude },
      radiusMiles,
      user.id
    );

    res.json({
      success: true,
      platform: CURRENT_PLATFORM,
      count: creators.length,
      creators,
    });
  } catch (error: any) {
    console.error("Nearby creators error:", error);
    res.status(500).json({ error: "Failed to fetch nearby creators" });
  }
});

/**
 * GET /api/map/nearby/cross-platform
 * Get nearby creators from ALL FANZ platforms
 * Requires Bronze+ membership tier
 */
router.get("/nearby/cross-platform", isAuthenticated, mapRateLimit, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { lat, lng, radius } = req.query;

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const radiusMiles = parseInt(radius as string) || 25;

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: "Valid latitude and longitude required" });
    }

    // Check tier permissions
    const features = await mapService.getUserTierFeatures(user.id);
    if (!features?.canViewCrossPlatform) {
      return res.status(403).json({
        error: "Cross-platform map requires Bronze tier or higher",
        requiredTier: "bronze",
      });
    }

    const creators = await mapService.getNearbyCreatorsCrossPlatform(
      { latitude, longitude },
      radiusMiles,
      user.id
    );

    // Group by platform for response
    const byPlatform = creators.reduce((acc, c) => {
      acc[c.homePlatform] = acc[c.homePlatform] || [];
      acc[c.homePlatform].push(c);
      return acc;
    }, {} as Record<string, typeof creators>);

    res.json({
      success: true,
      totalCount: creators.length,
      byPlatform,
      creators,
    });
  } catch (error: any) {
    console.error("Cross-platform nearby error:", error);
    res.status(500).json({ error: "Failed to fetch cross-platform creators" });
  }
});

/**
 * POST /api/map/nearby (internal cross-platform endpoint)
 * Called by other FANZ platforms to get local creators
 */
router.post("/nearby", async (req: Request, res: Response) => {
  try {
    const apiKey = req.headers["x-cross-platform-key"];
    const requestingPlatform = req.headers["x-requesting-platform"];

    if (apiKey !== process.env.FANZ_CROSS_PLATFORM_API_KEY) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    const { center, radiusMiles, viewerUserId } = req.body;

    const creators = await mapService.getNearbyCreatorsLocal(
      center,
      radiusMiles,
      viewerUserId
    );

    res.json({
      success: true,
      platform: CURRENT_PLATFORM,
      creators,
    });
  } catch (error: any) {
    console.error("Cross-platform API error:", error);
    res.status(500).json({ error: "Failed to fetch creators" });
  }
});

// ===== MEETUP ENDPOINTS =====

/**
 * POST /api/map/meetups
 * Create a new meetup request
 * Requires Silver+ membership tier
 */
router.post("/meetups", isAuthenticated, meetupRateLimit, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const schema = z.object({
      requesteeId: z.string(),
      requesteePlatform: z.string(),
      title: z.string().min(3).max(100),
      description: z.string().max(1000).optional(),
      type: z.enum(["content_creation", "collaboration", "casual", "business", "fan_meet"]),
      proposedDateTime: z.string().transform((s) => new Date(s)),
      alternateDateTime1: z.string().transform((s) => new Date(s)).optional(),
      alternateDateTime2: z.string().transform((s) => new Date(s)).optional(),
      duration: z.number().min(15).max(480).optional(),
      locationName: z.string().optional(),
      locationAddress: z.string().optional(),
      locationLatitude: z.number().optional(),
      locationLongitude: z.number().optional(),
      isVirtual: z.boolean().optional(),
      virtualMeetingUrl: z.string().url().optional(),
    });

    const data = schema.parse(req.body);

    const meetup = await mapService.createMeetup(user.id, CURRENT_PLATFORM, {
      requesteeId: data.requesteeId,
      requesteePlatform: data.requesteePlatform,
      title: data.title,
      description: data.description,
      type: data.type,
      proposedDateTime: data.proposedDateTime,
      alternateDateTime1: data.alternateDateTime1,
      alternateDateTime2: data.alternateDateTime2,
      duration: data.duration,
      locationName: data.locationName,
      locationAddress: data.locationAddress,
      locationCoords: data.locationLatitude && data.locationLongitude
        ? { latitude: data.locationLatitude, longitude: data.locationLongitude }
        : undefined,
      isVirtual: data.isVirtual,
      virtualMeetingUrl: data.virtualMeetingUrl,
    });

    res.status(201).json({
      success: true,
      meetup,
    });
  } catch (error: any) {
    console.error("Create meetup error:", error);
    res.status(400).json({ error: error.message || "Failed to create meetup" });
  }
});

/**
 * GET /api/map/meetups
 * Get user's meetups
 */
router.get("/meetups", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status } = req.query;

    const meetups = await mapService.getUserMeetups(user.id, status as string);

    res.json({
      success: true,
      count: meetups.length,
      meetups,
    });
  } catch (error: any) {
    console.error("Get meetups error:", error);
    res.status(500).json({ error: "Failed to fetch meetups" });
  }
});

/**
 * POST /api/map/meetups/:id/accept
 * Accept a meetup request
 */
router.post("/meetups/:id/accept", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { confirmedDateTime } = req.body;

    const meetup = await mapService.acceptMeetup(
      id,
      user.id,
      confirmedDateTime ? new Date(confirmedDateTime) : undefined
    );

    res.json({
      success: true,
      meetup,
    });
  } catch (error: any) {
    console.error("Accept meetup error:", error);
    res.status(400).json({ error: error.message || "Failed to accept meetup" });
  }
});

/**
 * POST /api/map/meetups/:id/decline
 * Decline a meetup request
 */
router.post("/meetups/:id/decline", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const meetup = await mapService.declineMeetup(id, user.id);

    res.json({
      success: true,
      meetup,
    });
  } catch (error: any) {
    console.error("Decline meetup error:", error);
    res.status(400).json({ error: error.message || "Failed to decline meetup" });
  }
});

// ===== NOTIFICATION PREFERENCES =====

/**
 * POST /api/map/notifications/sms/verify
 * Start SMS phone verification
 */
router.post("/notifications/sms/verify", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number required" });
    }

    const result = await reminderService.sendPhoneVerification(phoneNumber);

    if (result.success) {
      res.json({
        success: true,
        message: "Verification code sent",
      });
    } else {
      res.status(400).json({ error: result.error || "Failed to send verification" });
    }
  } catch (error: any) {
    console.error("Phone verification error:", error);
    res.status(500).json({ error: "Failed to send verification" });
  }
});

/**
 * POST /api/map/notifications/sms/confirm
 * Confirm SMS verification code
 */
router.post("/notifications/sms/confirm", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code) {
      return res.status(400).json({ error: "Phone number and code required" });
    }

    const result = await reminderService.checkPhoneVerification(phoneNumber, code);

    if (result.success) {
      await reminderService.updateSMSPreferences(user.id, phoneNumber, true);

      res.json({
        success: true,
        message: "Phone verified successfully",
      });
    } else {
      res.status(400).json({ error: result.error || "Invalid verification code" });
    }
  } catch (error: any) {
    console.error("Verification confirm error:", error);
    res.status(500).json({ error: "Failed to verify code" });
  }
});

// ===== VISIBILITY SETTINGS =====

/**
 * PUT /api/map/visibility
 * Update cross-platform visibility settings
 */
router.put("/visibility", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const schema = z.object({
      visiblePlatforms: z.array(z.string()).optional(),
      allowCrossPlatformMessaging: z.boolean().optional(),
      showOnCrossPlatformMaps: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    const visibility = await mapService.updateVisibilitySettings(user.id, data);

    res.json({
      success: true,
      visibility,
    });
  } catch (error: any) {
    console.error("Update visibility error:", error);
    res.status(400).json({ error: error.message || "Failed to update visibility" });
  }
});

// ===== TIER FEATURES =====

/**
 * GET /api/map/tier-features
 * Get current user's tier features
 */
router.get("/tier-features", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const features = await mapService.getUserTierFeatures(user.id);

    res.json({
      success: true,
      features,
    });
  } catch (error: any) {
    console.error("Get tier features error:", error);
    res.status(500).json({ error: "Failed to get tier features" });
  }
});

export default router;
