/**
 * Creator Ad System Routes
 *
 * Endpoints for managing creator ad opt-in, serving ads, tracking impressions/clicks,
 * and managing Wittle Bear Foundation charity donations.
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { creatorAdService } from '../services/creatorAdService';
import { isAuthenticated } from '../middleware/auth';
import { logger } from '../logger';

const router = Router();

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const updateSettingsSchema = z.object({
  enableProfileBanner: z.boolean().optional(),
  enableFeedAds: z.boolean().optional(),
  enableVideoPreroll: z.boolean().optional(),
  enableVideoOverlay: z.boolean().optional(),
  enableSidebar: z.boolean().optional(),
  enableStoryAds: z.boolean().optional(),
  allowedCategories: z.array(z.string()).optional(),
  blockedAdvertisers: z.array(z.string()).optional(),
  donationPercentage: z.number().min(0).max(100).optional(),
  donateToCharity: z.boolean().optional(),
  charityId: z.string().optional(),
});

const impressionSchema = z.object({
  adId: z.string().uuid(),
  creatorId: z.string().uuid(),
  placementType: z.enum(['profile_banner', 'feed_inline', 'video_preroll', 'video_overlay', 'sidebar', 'story_interstitial']),
  sessionId: z.string().optional(),
  viewDuration: z.number().optional(),
});

const clickSchema = z.object({
  adId: z.string().uuid(),
  impressionId: z.string().uuid().optional(),
  creatorId: z.string().uuid(),
});

// ============================================================
// CREATOR AD SETTINGS
// ============================================================

/**
 * Get creator's ad settings
 */
router.get('/settings', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const settings = await creatorAdService.getCreatorAdSettings(userId);
    res.json({ success: true, data: settings });
  } catch (error) {
    logger.error('Error getting ad settings:', error);
    res.status(500).json({ success: false, error: 'Failed to get ad settings' });
  }
});

/**
 * Update creator's ad settings
 */
router.put('/settings', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const validation = updateSettingsSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid settings',
        details: validation.error.errors,
      });
    }

    const settings = await creatorAdService.updateCreatorAdSettings(userId, validation.data);
    res.json({ success: true, data: settings });
  } catch (error) {
    logger.error('Error updating ad settings:', error);
    res.status(500).json({ success: false, error: 'Failed to update ad settings' });
  }
});

/**
 * Get creator's ad revenue stats
 */
router.get('/stats', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const stats = await creatorAdService.getCreatorAdStats(userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Error getting ad stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get ad stats' });
  }
});

// ============================================================
// AD SERVING
// ============================================================

/**
 * Get an ad for a specific placement on a creator's page
 */
router.get('/serve/:creatorId/:placementType', async (req: Request, res: Response) => {
  try {
    const { creatorId, placementType } = req.params;
    const viewerId = (req as any).userId; // May be undefined for non-logged-in users
    const sessionId = req.headers['x-session-id'] as string;

    const ad = await creatorAdService.selectAd({
      creatorId,
      placementType: placementType as any,
      viewerId,
      sessionId,
      country: req.headers['cf-ipcountry'] as string,
    });

    if (!ad) {
      return res.json({ success: true, data: null, message: 'No ads available for this placement' });
    }

    res.json({
      success: true,
      data: {
        id: ad.id,
        headline: ad.headline,
        description: ad.description,
        imageUrl: ad.imageUrl,
        videoUrl: ad.videoUrl,
        clickUrl: ad.clickUrl,
        placementType: ad.placementType,
        category: ad.category,
      },
    });
  } catch (error) {
    logger.error('Error serving ad:', error);
    res.status(500).json({ success: false, error: 'Failed to serve ad' });
  }
});

// ============================================================
// IMPRESSION & CLICK TRACKING
// ============================================================

/**
 * Record an ad impression
 */
router.post('/impression', async (req: Request, res: Response) => {
  try {
    const validation = impressionSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid impression data',
        details: validation.error.errors,
      });
    }

    const viewerId = (req as any).userId;
    const ip = req.ip || req.headers['x-forwarded-for'] as string || '';
    const ipHash = creatorAdService.hashIP(ip);

    const impression = await creatorAdService.recordImpression({
      ...validation.data,
      viewerId,
      ipHash,
      userAgent: req.headers['user-agent'],
      country: req.headers['cf-ipcountry'] as string,
    });

    res.json({ success: true, data: { impressionId: impression.id } });
  } catch (error) {
    logger.error('Error recording impression:', error);
    res.status(500).json({ success: false, error: 'Failed to record impression' });
  }
});

/**
 * Record an ad click
 */
router.post('/click', async (req: Request, res: Response) => {
  try {
    const validation = clickSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid click data',
        details: validation.error.errors,
      });
    }

    const viewerId = (req as any).userId;
    const ip = req.ip || req.headers['x-forwarded-for'] as string || '';
    const ipHash = creatorAdService.hashIP(ip);

    await creatorAdService.recordClick({
      ...validation.data,
      viewerId,
      ipHash,
      referrer: req.headers['referer'] as string,
    });

    res.json({ success: true });
  } catch (error) {
    logger.error('Error recording click:', error);
    res.status(500).json({ success: false, error: 'Failed to record click' });
  }
});

// ============================================================
// CHARITY & BADGES
// ============================================================

/**
 * Get user's charity badges
 */
router.get('/badges', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const badges = await creatorAdService.getUserBadges(userId);
    res.json({ success: true, data: badges });
  } catch (error) {
    logger.error('Error getting badges:', error);
    res.status(500).json({ success: false, error: 'Failed to get badges' });
  }
});

/**
 * Get a user's public badges (for profile display)
 */
router.get('/badges/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const badges = await creatorAdService.getUserBadges(userId);
    res.json({ success: true, data: badges });
  } catch (error) {
    logger.error('Error getting user badges:', error);
    res.status(500).json({ success: false, error: 'Failed to get user badges' });
  }
});

/**
 * Get Wittle Bear Foundation info and leaderboard
 */
router.get('/charity/wittle-bear', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const leaderboard = await creatorAdService.getCharityLeaderboard('wittle-bear-foundation', limit);
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    logger.error('Error getting charity leaderboard:', error);
    res.status(500).json({ success: false, error: 'Failed to get charity leaderboard' });
  }
});

/**
 * Get charity leaderboard
 */
router.get('/charity/:charityId/leaderboard', async (req: Request, res: Response) => {
  try {
    const { charityId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const leaderboard = await creatorAdService.getCharityLeaderboard(charityId, limit);
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    logger.error('Error getting charity leaderboard:', error);
    res.status(500).json({ success: false, error: 'Failed to get charity leaderboard' });
  }
});

/**
 * Initialize Wittle Bear Foundation (admin only, run once)
 */
router.post('/charity/init-wittle-bear', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // In production, add admin check here
    const charity = await creatorAdService.initializeWittleBearFoundation();
    res.json({ success: true, data: charity });
  } catch (error) {
    logger.error('Error initializing charity:', error);
    res.status(500).json({ success: false, error: 'Failed to initialize charity' });
  }
});

// ============================================================
// AD PLACEMENT COMPONENT DATA
// ============================================================

/**
 * Get badge tier info for display
 */
router.get('/badge-tiers', async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      tiers: [
        { name: 'supporter', min: 1, max: 49, color: '#8B5CF6', icon: '🐻', label: 'Supporter' },
        { name: 'bronze', min: 50, max: 199, color: '#CD7F32', icon: '🥉', label: 'Bronze' },
        { name: 'silver', min: 200, max: 499, color: '#C0C0C0', icon: '🥈', label: 'Silver' },
        { name: 'gold', min: 500, max: 999, color: '#FFD700', icon: '🥇', label: 'Gold' },
        { name: 'diamond', min: 1000, max: 4999, color: '#B9F2FF', icon: '💎', label: 'Diamond' },
        { name: 'champion', min: 5000, max: null, color: '#FF6B6B', icon: '👑', label: 'Champion' },
      ],
      causes: [
        { id: 'homeless_youth', name: 'Homeless Youth', icon: '🏠' },
        { id: 'animal_shelters', name: 'Animal Shelters', icon: '🐾' },
      ],
    },
  });
});

/**
 * Get revenue split info
 */
router.get('/revenue-split', async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      creatorContentRevenue: 100, // Creators get 100% of subscriptions, tips, PPV
      adRevenueCreatorShare: 70,  // Creators get 70% of ad revenue
      adRevenueCharityShare: 30,  // 30% goes to Wittle Bear Foundation
      charityName: 'Wittle Bear Foundation',
      charityMission: 'Supporting homeless youth and shelter animals',
    },
  });
});

export default router;
