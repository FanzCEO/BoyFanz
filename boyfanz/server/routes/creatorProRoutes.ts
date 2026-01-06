// @ts-nocheck
/**
 * Creator Pro Merit System Routes
 *
 * API endpoints for the merit-based Creator Pro system.
 * No fees - Creator Pro status is earned through performance metrics.
 */

import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { creatorProEligibilityService } from '../services/creatorProEligibilityService';
import { contentScoringService } from '../services/contentScoringService';
import { db } from '../db';
import { eq, desc } from 'drizzle-orm';
import {
  creatorProMetrics,
  creatorAchievements,
  creatorTierHistory,
  creatorStrikes,
  creatorReferrals,
} from '../../shared/schema';

const router = Router();

/**
 * Get current creator's pro status
 * GET /api/creator-pro/status
 */
router.get('/status', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const status = await creatorProEligibilityService.getCreatorProStatus(userId);
    if (!status) {
      return res.status(404).json({ error: 'Creator metrics not found' });
    }

    return res.json(status);
  } catch (error) {
    console.error('Error fetching creator pro status:', error);
    return res.status(500).json({ error: 'Failed to fetch pro status' });
  }
});

/**
 * Get any creator's pro status (public)
 * GET /api/creator-pro/status/:userId
 */
router.get('/status/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const status = await creatorProEligibilityService.getCreatorProStatus(userId);
    if (!status) {
      return res.status(404).json({ error: 'Creator metrics not found' });
    }

    // Return public-facing version (hide sensitive metrics)
    return res.json({
      userId: status.userId,
      currentTier: status.currentTier,
      totalScore: status.totalScore,
      tierProgress: status.tierProgress,
      achievements: status.achievements.filter(a => a.completedAt),
    });
  } catch (error) {
    console.error('Error fetching creator pro status:', error);
    return res.status(500).json({ error: 'Failed to fetch pro status' });
  }
});

/**
 * Recalculate current creator's metrics
 * POST /api/creator-pro/recalculate
 */
router.post('/recalculate', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const status = await creatorProEligibilityService.recalculateMetrics(userId);

    // Also check for new achievements
    await creatorProEligibilityService.checkAchievements(userId);

    return res.json(status);
  } catch (error) {
    console.error('Error recalculating metrics:', error);
    return res.status(500).json({ error: 'Failed to recalculate metrics' });
  }
});

/**
 * Get achievements for current creator
 * GET /api/creator-pro/achievements
 */
router.get('/achievements', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const achievements = await db.query.creatorAchievements?.findMany({
      where: eq(creatorAchievements.creatorId, userId),
      orderBy: desc(creatorAchievements.completedAt),
    }) || [];

    return res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

/**
 * Get tier history for current creator
 * GET /api/creator-pro/tier-history
 */
router.get('/tier-history', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const history = await db.query.creatorTierHistory?.findMany({
      where: eq(creatorTierHistory.creatorId, userId),
      orderBy: desc(creatorTierHistory.createdAt),
      limit: 50,
    }) || [];

    return res.json(history);
  } catch (error) {
    console.error('Error fetching tier history:', error);
    return res.status(500).json({ error: 'Failed to fetch tier history' });
  }
});

/**
 * Get strikes for current creator
 * GET /api/creator-pro/strikes
 */
router.get('/strikes', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const strikes = await db.query.creatorStrikes?.findMany({
      where: eq(creatorStrikes.creatorId, userId),
      orderBy: desc(creatorStrikes.createdAt),
    }) || [];

    return res.json(strikes);
  } catch (error) {
    console.error('Error fetching strikes:', error);
    return res.status(500).json({ error: 'Failed to fetch strikes' });
  }
});

/**
 * Get referrals for current creator
 * GET /api/creator-pro/referrals
 */
router.get('/referrals', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const referrals = await db.query.creatorReferrals?.findMany({
      where: eq(creatorReferrals.referrerId, userId),
      orderBy: desc(creatorReferrals.createdAt),
    }) || [];

    return res.json(referrals);
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

/**
 * Generate referral code
 * POST /api/creator-pro/referral-code
 */
router.post('/referral-code', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate a unique referral code
    const code = `${userId.slice(0, 8)}-${Date.now().toString(36)}`.toUpperCase();

    return res.json({
      code,
      url: `${process.env.BASE_URL || 'https://boy.fanz.website'}/ref/${code}`,
    });
  } catch (error) {
    console.error('Error generating referral code:', error);
    return res.status(500).json({ error: 'Failed to generate referral code' });
  }
});

/**
 * Appeal a strike
 * POST /api/creator-pro/strikes/:strikeId/appeal
 */
router.post('/strikes/:strikeId/appeal', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { strikeId } = req.params;
    const { reason } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!reason || reason.length < 10) {
      return res.status(400).json({ error: 'Appeal reason must be at least 10 characters' });
    }

    // Verify the strike belongs to the user
    const strike = await db.query.creatorStrikes?.findFirst({
      where: eq(creatorStrikes.id, strikeId),
    });

    if (!strike || strike.creatorId !== userId) {
      return res.status(404).json({ error: 'Strike not found' });
    }

    if (strike.appealStatus) {
      return res.status(400).json({ error: 'Strike has already been appealed' });
    }

    // Update strike with appeal
    await db
      .update(creatorStrikes)
      .set({
        appealedAt: new Date(),
        appealStatus: 'pending',
        appealNotes: reason,
        updatedAt: new Date(),
      })
      .where(eq(creatorStrikes.id, strikeId));

    return res.json({ success: true, message: 'Appeal submitted successfully' });
  } catch (error) {
    console.error('Error submitting appeal:', error);
    return res.status(500).json({ error: 'Failed to submit appeal' });
  }
});

/**
 * Get tier requirements and benefits
 * GET /api/creator-pro/tiers
 */
router.get('/tiers', async (req: Request, res: Response) => {
  try {
    const tiers = [
      {
        id: 'rising',
        name: 'Rising',
        minScore: 0,
        maxScore: 199,
        color: '#6B7280', // Gray
        icon: 'TrendingUp',
        benefits: [
          'Basic analytics dashboard',
          'Standard content upload limits',
          'Community access',
        ],
      },
      {
        id: 'established',
        name: 'Established',
        minScore: 200,
        maxScore: 449,
        color: '#10B981', // Green
        icon: 'CheckCircle',
        benefits: [
          'Extended analytics',
          'Priority content processing',
          'Verified badge',
          'Early access to new features',
        ],
      },
      {
        id: 'pro',
        name: 'Pro',
        minScore: 450,
        maxScore: 699,
        color: '#3B82F6', // Blue
        icon: 'Star',
        benefits: [
          'Advanced analytics suite',
          'Unlimited content uploads',
          'Pro badge',
          'Priority support',
          'Promotional tools access',
          'Custom profile themes',
        ],
      },
      {
        id: 'elite',
        name: 'Elite',
        minScore: 700,
        maxScore: 899,
        color: '#8B5CF6', // Purple
        icon: 'Crown',
        benefits: [
          'Elite analytics & insights',
          'Direct account manager',
          'Elite badge',
          'Featured placement opportunities',
          'Advanced promotional tools',
          'Revenue optimization consulting',
        ],
      },
      {
        id: 'legend',
        name: 'Legend',
        minScore: 900,
        maxScore: 1000,
        color: '#F59E0B', // Gold
        icon: 'Trophy',
        benefits: [
          'Full platform analytics',
          'Dedicated success manager',
          'Legend badge (animated)',
          'Homepage featuring',
          'Exclusive events access',
          'Co-marketing opportunities',
          'Custom feature requests',
        ],
      },
    ];

    return res.json(tiers);
  } catch (error) {
    console.error('Error fetching tiers:', error);
    return res.status(500).json({ error: 'Failed to fetch tiers' });
  }
});

/**
 * Get scoring breakdown explanation
 * GET /api/creator-pro/scoring
 */
router.get('/scoring', async (req: Request, res: Response) => {
  try {
    const scoring = {
      maxScore: 1000,
      categories: [
        {
          name: 'Fan Metrics',
          maxPoints: 250,
          metrics: [
            { name: 'Fan Count', maxPoints: 100, description: '0.5 points per subscriber (max 200 subscribers for full points)' },
            { name: 'Fan Retention', maxPoints: 75, description: '1 point per % retention rate' },
            { name: 'Fan Engagement', maxPoints: 75, description: '0.75 points per % engagement rate' },
          ],
        },
        {
          name: 'Content Metrics',
          maxPoints: 250,
          metrics: [
            { name: 'Content Quantity', maxPoints: 100, description: '1 point per approved content upload' },
            { name: 'Content Quality', maxPoints: 75, description: 'AI-scored quality average (0.75 points per score point)' },
            { name: 'Posting Consistency', maxPoints: 75, description: '0.5 points per consecutive day posting' },
          ],
        },
        {
          name: 'Compliance',
          maxPoints: 200,
          description: 'Starts at 200, decreases with policy violations',
          metrics: [
            { name: 'Strike Penalties', description: 'Warning: 0, Minor: -25, Moderate: -50, Major: -100, Severe: -150' },
            { name: 'Recovery', description: '0.5 points recovered per day without violations (max 50 recovery)' },
          ],
        },
        {
          name: 'Referrals',
          maxPoints: 150,
          metrics: [
            { name: 'Creator Referrals', maxPoints: 100, description: '10 points per active creator referral' },
            { name: 'Fan Referrals', maxPoints: 50, description: '3 points per active fan referral' },
          ],
        },
        {
          name: 'Networking',
          maxPoints: 150,
          metrics: [
            { name: 'Collaborations', maxPoints: 50, description: '5 points per collaboration' },
            { name: 'Creator Interactions', maxPoints: 50, description: '2 points per 100 interactions' },
            { name: 'Community Contributions', maxPoints: 50, description: '1 point per contribution' },
          ],
        },
      ],
    };

    return res.json(scoring);
  } catch (error) {
    console.error('Error fetching scoring info:', error);
    return res.status(500).json({ error: 'Failed to fetch scoring info' });
  }
});

/**
 * Admin: Issue a strike
 * POST /api/creator-pro/admin/strike
 */
router.post('/admin/strike', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.id;
    const isAdmin = (req as any).user?.role === 'admin' || (req as any).user?.role === 'moderator';

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { creatorId, strikeType, severity, reason, evidence, contentId } = req.body;

    if (!creatorId || !strikeType || !severity || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await creatorProEligibilityService.issueStrike(
      creatorId,
      strikeType,
      severity,
      reason,
      evidence || {},
      adminId,
      contentId
    );

    return res.json({ success: true, message: 'Strike issued successfully' });
  } catch (error) {
    console.error('Error issuing strike:', error);
    return res.status(500).json({ error: 'Failed to issue strike' });
  }
});

/**
 * Admin: Resolve strike appeal
 * POST /api/creator-pro/admin/strike/:strikeId/resolve
 */
router.post('/admin/strike/:strikeId/resolve', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.id;
    const isAdmin = (req as any).user?.role === 'admin' || (req as any).user?.role === 'moderator';

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { strikeId } = req.params;
    const { approved, notes } = req.body;

    const strike = await db.query.creatorStrikes?.findFirst({
      where: eq(creatorStrikes.id, strikeId),
    });

    if (!strike) {
      return res.status(404).json({ error: 'Strike not found' });
    }

    await db
      .update(creatorStrikes)
      .set({
        appealStatus: approved ? 'approved' : 'denied',
        isActive: approved ? false : strike.isActive,
        reviewedBy: adminId,
        appealNotes: notes || strike.appealNotes,
        updatedAt: new Date(),
      })
      .where(eq(creatorStrikes.id, strikeId));

    // Recalculate metrics if strike was removed
    if (approved) {
      await creatorProEligibilityService.recalculateMetrics(strike.creatorId);
    }

    return res.json({ success: true, message: `Appeal ${approved ? 'approved' : 'denied'}` });
  } catch (error) {
    console.error('Error resolving appeal:', error);
    return res.status(500).json({ error: 'Failed to resolve appeal' });
  }
});

export default router;
