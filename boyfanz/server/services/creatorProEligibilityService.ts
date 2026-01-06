// @ts-nocheck
/**
 * Creator Pro Eligibility Service
 *
 * Merit-based Creator Pro system - no fees, purely earned through performance.
 *
 * Tier Thresholds:
 * - Rising: 0-199 points (default)
 * - Established: 200-449 points
 * - Pro: 450-699 points
 * - Elite: 700-899 points
 * - Legend: 900+ points
 *
 * Scoring Categories (max 1000 points):
 * - Fan Metrics: 250 points max
 * - Content Metrics: 250 points max
 * - Compliance: 200 points max (starts at max, decreases with strikes)
 * - Referrals: 150 points max
 * - Networking: 150 points max
 */

import { db } from '../db';
import { eq, and, gte, desc, sql, count } from 'drizzle-orm';
import {
  users,
  creatorProfiles,
  posts,
  subscriptions,
  likes,
  comments,
  creatorProMetrics,
  creatorStrikes,
  creatorReferrals,
  creatorAchievements,
  creatorTierHistory,
  contentQualityScores,
} from '../../shared/schema';

// Tier thresholds
const TIER_THRESHOLDS = {
  rising: 0,
  established: 200,
  pro: 450,
  elite: 700,
  legend: 900,
} as const;

// Score weights for each metric
const SCORE_WEIGHTS = {
  // Fan metrics (max 250)
  fanCount: {
    perFan: 0.5, // 0.5 points per fan
    max: 100,    // Max 100 points (200 fans = max)
  },
  fanRetention: {
    multiplier: 1.0, // 1 point per % retention
    max: 75,         // Max 75 points
  },
  fanEngagement: {
    multiplier: 0.75, // 0.75 points per % engagement
    max: 75,          // Max 75 points
  },

  // Content metrics (max 250)
  contentQuantity: {
    perContent: 1, // 1 point per approved content
    max: 100,      // Max 100 points
  },
  contentQuality: {
    multiplier: 0.75, // 0.75 points per quality score (0-100)
    max: 75,          // Max 75 points
  },
  consistency: {
    perDay: 0.5,   // 0.5 points per consistent day
    max: 75,       // Max 75 points (150 days = max)
  },

  // Compliance (max 200, starts at max)
  complianceBase: 200,
  strikePenalties: {
    warning: 0,
    minor: 25,
    moderate: 50,
    major: 100,
    severe: 150,
  },
  recoveryPerDay: 0.5, // Recover 0.5 points per day without strike

  // Referrals (max 150)
  referrals: {
    perCreator: 10,   // 10 points per active creator referral
    perFan: 3,        // 3 points per active fan referral
    max: 150,
  },

  // Networking (max 150)
  collaborations: {
    perCollab: 5,     // 5 points per collaboration
    max: 50,
  },
  interactions: {
    per100: 2,        // 2 points per 100 interactions
    max: 50,
  },
  community: {
    perContribution: 1, // 1 point per community contribution
    max: 50,
  },
};

export interface CreatorProStatus {
  userId: string;
  currentTier: string;
  totalScore: number;
  tierProgress: number;
  nextTier: string | null;
  pointsToNextTier: number;
  metrics: {
    fanMetrics: {
      fanCount: number;
      fanCountScore: number;
      retentionRate: number;
      retentionScore: number;
      engagementRate: number;
      engagementScore: number;
      totalScore: number;
    };
    contentMetrics: {
      totalUploads: number;
      quantityScore: number;
      averageQuality: number;
      qualityScore: number;
      consistencyDays: number;
      consistencyScore: number;
      totalScore: number;
    };
    complianceMetrics: {
      totalStrikes: number;
      activeStrikes: number;
      daysWithoutStrike: number;
      complianceScore: number;
    };
    referralMetrics: {
      totalReferrals: number;
      activeReferrals: number;
      referralScore: number;
    };
    networkingMetrics: {
      collaborations: number;
      interactions: number;
      contributions: number;
      networkingScore: number;
    };
  };
  achievements: Array<{
    id: string;
    name: string;
    icon: string;
    tier: string;
    completedAt: Date | null;
  }>;
  tierHistory: Array<{
    tier: string;
    achievedAt: Date;
    reason: string;
  }>;
}

class CreatorProEligibilityService {
  /**
   * Get or create metrics record for a creator
   */
  async getOrCreateMetrics(userId: string) {
    let metrics = await db.query.creatorProMetrics?.findFirst({
      where: eq(creatorProMetrics.userId, userId),
    });

    if (!metrics) {
      // Create initial metrics record
      const [newMetrics] = await db.insert(creatorProMetrics).values({
        userId,
        currentTier: 'rising',
        totalScore: 0,
        tierProgress: 0,
        complianceScore: 200, // Start with full compliance
      }).returning();
      metrics = newMetrics;
    }

    return metrics;
  }

  /**
   * Calculate fan metrics score
   */
  async calculateFanMetrics(userId: string): Promise<{
    fanCount: number;
    fanCountScore: number;
    retentionRate: number;
    retentionScore: number;
    engagementRate: number;
    engagementScore: number;
    totalScore: number;
  }> {
    // Get subscriber count
    const subscriberResult = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(and(
        eq(subscriptions.creatorId, userId),
        eq(subscriptions.status, 'active')
      ));
    const fanCount = subscriberResult[0]?.count || 0;

    // Calculate fan count score
    const fanCountScore = Math.min(
      fanCount * SCORE_WEIGHTS.fanCount.perFan,
      SCORE_WEIGHTS.fanCount.max
    );

    // Get retention rate (subscribers who stayed > 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const retainedResult = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(and(
        eq(subscriptions.creatorId, userId),
        eq(subscriptions.status, 'active'),
        gte(subscriptions.createdAt, thirtyDaysAgo)
      ));
    const retainedCount = retainedResult[0]?.count || 0;
    const retentionRate = fanCount > 0 ? (retainedCount / fanCount) * 100 : 0;
    const retentionScore = Math.min(
      retentionRate * SCORE_WEIGHTS.fanRetention.multiplier,
      SCORE_WEIGHTS.fanRetention.max
    );

    // Calculate engagement rate (likes + comments per fan)
    const likesResult = await db
      .select({ count: count() })
      .from(likes)
      .innerJoin(posts, eq(likes.postId, posts.id))
      .where(eq(posts.creatorId, userId));
    const totalLikes = likesResult[0]?.count || 0;

    const commentsResult = await db
      .select({ count: count() })
      .from(comments)
      .innerJoin(posts, eq(comments.postId, posts.id))
      .where(eq(posts.creatorId, userId));
    const totalComments = commentsResult[0]?.count || 0;

    const totalEngagement = totalLikes + totalComments;
    const engagementRate = fanCount > 0 ? (totalEngagement / fanCount) * 10 : 0;
    const engagementScore = Math.min(
      engagementRate * SCORE_WEIGHTS.fanEngagement.multiplier,
      SCORE_WEIGHTS.fanEngagement.max
    );

    return {
      fanCount,
      fanCountScore: Math.round(fanCountScore),
      retentionRate: Math.round(retentionRate * 10) / 10,
      retentionScore: Math.round(retentionScore),
      engagementRate: Math.round(engagementRate * 10) / 10,
      engagementScore: Math.round(engagementScore),
      totalScore: Math.round(fanCountScore + retentionScore + engagementScore),
    };
  }

  /**
   * Calculate content metrics score
   */
  async calculateContentMetrics(userId: string): Promise<{
    totalUploads: number;
    quantityScore: number;
    averageQuality: number;
    qualityScore: number;
    consistencyDays: number;
    consistencyScore: number;
    totalScore: number;
  }> {
    // Get total approved content
    const contentResult = await db
      .select({ count: count() })
      .from(posts)
      .where(and(
        eq(posts.creatorId, userId),
        eq(posts.isPublished, true)
      ));
    const totalUploads = contentResult[0]?.count || 0;
    const quantityScore = Math.min(
      totalUploads * SCORE_WEIGHTS.contentQuantity.perContent,
      SCORE_WEIGHTS.contentQuantity.max
    );

    // Get average content quality from AI scores
    const qualityResult = await db
      .select({ avgScore: sql<number>`COALESCE(AVG(${contentQualityScores.overallScore}), 0)` })
      .from(contentQualityScores)
      .where(and(
        eq(contentQualityScores.creatorId, userId),
        eq(contentQualityScores.approvalStatus, 'approved')
      ));
    const averageQuality = qualityResult[0]?.avgScore || 0;
    const qualityScore = Math.min(
      averageQuality * SCORE_WEIGHTS.contentQuality.multiplier,
      SCORE_WEIGHTS.contentQuality.max
    );

    // Calculate consistency (consecutive days with posts)
    const recentPosts = await db
      .select({ createdAt: posts.createdAt })
      .from(posts)
      .where(eq(posts.creatorId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(365);

    let consistencyDays = 0;
    if (recentPosts.length > 0) {
      const dates = new Set<string>();
      recentPosts.forEach(p => {
        if (p.createdAt) {
          dates.add(p.createdAt.toISOString().split('T')[0]);
        }
      });

      // Count consecutive days from today
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        if (dates.has(dateStr)) {
          consistencyDays++;
        } else if (i > 0) {
          break; // Break on first gap
        }
      }
    }
    const consistencyScore = Math.min(
      consistencyDays * SCORE_WEIGHTS.consistency.perDay,
      SCORE_WEIGHTS.consistency.max
    );

    return {
      totalUploads,
      quantityScore: Math.round(quantityScore),
      averageQuality: Math.round(averageQuality * 10) / 10,
      qualityScore: Math.round(qualityScore),
      consistencyDays,
      consistencyScore: Math.round(consistencyScore),
      totalScore: Math.round(quantityScore + qualityScore + consistencyScore),
    };
  }

  /**
   * Calculate compliance score
   */
  async calculateComplianceScore(userId: string): Promise<{
    totalStrikes: number;
    activeStrikes: number;
    daysWithoutStrike: number;
    complianceScore: number;
  }> {
    // Get all strikes
    const strikes = await db.query.creatorStrikes?.findMany({
      where: eq(creatorStrikes.creatorId, userId),
      orderBy: desc(creatorStrikes.createdAt),
    }) || [];

    const totalStrikes = strikes.length;
    const activeStrikes = strikes.filter(s => s.isActive).length;

    // Calculate total deductions from active strikes
    let totalDeductions = 0;
    for (const strike of strikes) {
      if (strike.isActive) {
        const penalty = SCORE_WEIGHTS.strikePenalties[strike.severity as keyof typeof SCORE_WEIGHTS.strikePenalties] || 0;
        totalDeductions += penalty;
      }
    }

    // Calculate days without strike
    const lastStrike = strikes.find(s => s.isActive);
    let daysWithoutStrike = 365; // Default to max
    if (lastStrike && lastStrike.createdAt) {
      const daysSince = Math.floor(
        (Date.now() - lastStrike.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      daysWithoutStrike = daysSince;
    }

    // Calculate recovery points (0.5 per day without strike, max recovery of 50 points)
    const recoveryPoints = Math.min(
      daysWithoutStrike * SCORE_WEIGHTS.recoveryPerDay,
      50
    );

    // Final compliance score
    const complianceScore = Math.max(
      0,
      Math.min(
        SCORE_WEIGHTS.complianceBase - totalDeductions + recoveryPoints,
        SCORE_WEIGHTS.complianceBase
      )
    );

    return {
      totalStrikes,
      activeStrikes,
      daysWithoutStrike,
      complianceScore: Math.round(complianceScore),
    };
  }

  /**
   * Calculate referral score
   */
  async calculateReferralScore(userId: string): Promise<{
    totalReferrals: number;
    activeReferrals: number;
    referralScore: number;
  }> {
    const referrals = await db.query.creatorReferrals?.findMany({
      where: eq(creatorReferrals.referrerId, userId),
    }) || [];

    const totalReferrals = referrals.length;
    const activeCreatorReferrals = referrals.filter(
      r => r.isActive && r.referredType === 'creator'
    ).length;
    const activeFanReferrals = referrals.filter(
      r => r.isActive && r.referredType === 'fan'
    ).length;

    const referralScore = Math.min(
      (activeCreatorReferrals * SCORE_WEIGHTS.referrals.perCreator) +
      (activeFanReferrals * SCORE_WEIGHTS.referrals.perFan),
      SCORE_WEIGHTS.referrals.max
    );

    return {
      totalReferrals,
      activeReferrals: activeCreatorReferrals + activeFanReferrals,
      referralScore: Math.round(referralScore),
    };
  }

  /**
   * Calculate networking score
   */
  async calculateNetworkingScore(userId: string): Promise<{
    collaborations: number;
    interactions: number;
    contributions: number;
    networkingScore: number;
  }> {
    // For now, use metrics from the stored record
    // In production, these would be calculated from actual collaboration/interaction data
    const metrics = await this.getOrCreateMetrics(userId);

    const collaborations = metrics.collaborationsCount || 0;
    const interactions = metrics.creatorInteractions || 0;
    const contributions = metrics.communityContributions || 0;

    const collabScore = Math.min(
      collaborations * SCORE_WEIGHTS.collaborations.perCollab,
      SCORE_WEIGHTS.collaborations.max
    );
    const interactionScore = Math.min(
      (interactions / 100) * SCORE_WEIGHTS.interactions.per100,
      SCORE_WEIGHTS.interactions.max
    );
    const contributionScore = Math.min(
      contributions * SCORE_WEIGHTS.community.perContribution,
      SCORE_WEIGHTS.community.max
    );

    return {
      collaborations,
      interactions,
      contributions,
      networkingScore: Math.round(collabScore + interactionScore + contributionScore),
    };
  }

  /**
   * Calculate the appropriate tier based on total score
   */
  getTierFromScore(score: number): string {
    if (score >= TIER_THRESHOLDS.legend) return 'legend';
    if (score >= TIER_THRESHOLDS.elite) return 'elite';
    if (score >= TIER_THRESHOLDS.pro) return 'pro';
    if (score >= TIER_THRESHOLDS.established) return 'established';
    return 'rising';
  }

  /**
   * Get the next tier and points needed
   */
  getNextTierInfo(currentTier: string, score: number): { nextTier: string | null; pointsNeeded: number } {
    const tiers = ['rising', 'established', 'pro', 'elite', 'legend'];
    const currentIndex = tiers.indexOf(currentTier);

    if (currentIndex >= tiers.length - 1) {
      return { nextTier: null, pointsNeeded: 0 };
    }

    const nextTier = tiers[currentIndex + 1];
    const nextThreshold = TIER_THRESHOLDS[nextTier as keyof typeof TIER_THRESHOLDS];

    return {
      nextTier,
      pointsNeeded: Math.max(0, nextThreshold - score),
    };
  }

  /**
   * Calculate tier progress percentage
   */
  calculateTierProgress(currentTier: string, score: number): number {
    const tiers = ['rising', 'established', 'pro', 'elite', 'legend'];
    const currentIndex = tiers.indexOf(currentTier);

    if (currentIndex >= tiers.length - 1) {
      return 100; // Legend tier - max progress
    }

    const currentThreshold = TIER_THRESHOLDS[currentTier as keyof typeof TIER_THRESHOLDS];
    const nextTier = tiers[currentIndex + 1];
    const nextThreshold = TIER_THRESHOLDS[nextTier as keyof typeof TIER_THRESHOLDS];

    const range = nextThreshold - currentThreshold;
    const progress = score - currentThreshold;

    return Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
  }

  /**
   * Full recalculation of creator metrics and tier
   */
  async recalculateMetrics(userId: string): Promise<CreatorProStatus> {
    // Calculate all metric categories
    const [fanMetrics, contentMetrics, complianceMetrics, referralMetrics, networkingMetrics] =
      await Promise.all([
        this.calculateFanMetrics(userId),
        this.calculateContentMetrics(userId),
        this.calculateComplianceScore(userId),
        this.calculateReferralScore(userId),
        this.calculateNetworkingScore(userId),
      ]);

    // Calculate total score
    const totalScore =
      fanMetrics.totalScore +
      contentMetrics.totalScore +
      complianceMetrics.complianceScore +
      referralMetrics.referralScore +
      networkingMetrics.networkingScore;

    // Determine tier
    const currentTier = this.getTierFromScore(totalScore);
    const tierProgress = this.calculateTierProgress(currentTier, totalScore);
    const { nextTier, pointsNeeded } = this.getNextTierInfo(currentTier, totalScore);

    // Get current metrics to check for tier change
    const existingMetrics = await this.getOrCreateMetrics(userId);
    const tierChanged = existingMetrics.currentTier !== currentTier;

    // Update metrics in database
    await db
      .update(creatorProMetrics)
      .set({
        currentTier: currentTier as any,
        totalScore,
        tierProgress,

        fanCount: fanMetrics.fanCount,
        fanCountScore: fanMetrics.fanCountScore,
        fanRetentionRate: fanMetrics.retentionRate,
        fanRetentionScore: fanMetrics.retentionScore,
        averageFanEngagement: fanMetrics.engagementRate,
        fanEngagementScore: fanMetrics.engagementScore,

        totalContentUploads: contentMetrics.totalUploads,
        contentQuantityScore: contentMetrics.quantityScore,
        averageContentQuality: contentMetrics.averageQuality,
        contentQualityScore: contentMetrics.qualityScore,
        contentConsistencyDays: contentMetrics.consistencyDays,
        consistencyScore: contentMetrics.consistencyScore,

        totalStrikes: complianceMetrics.totalStrikes,
        activeStrikes: complianceMetrics.activeStrikes,
        complianceScore: complianceMetrics.complianceScore,
        daysWithoutStrike: complianceMetrics.daysWithoutStrike,

        totalReferrals: referralMetrics.totalReferrals,
        activeReferrals: referralMetrics.activeReferrals,
        referralScore: referralMetrics.referralScore,

        networkingScore: networkingMetrics.networkingScore,

        lastCalculatedAt: new Date(),
        updatedAt: new Date(),
        ...(tierChanged ? { tierAchievedAt: new Date() } : {}),
      })
      .where(eq(creatorProMetrics.userId, userId));

    // Record tier change if applicable
    if (tierChanged) {
      await db.insert(creatorTierHistory).values({
        creatorId: userId,
        previousTier: existingMetrics.currentTier as any,
        newTier: currentTier as any,
        reason: totalScore > (existingMetrics.totalScore || 0) ? 'promotion' : 'demotion',
        scoreAtChange: totalScore,
        metricsSnapshot: {
          fanMetrics,
          contentMetrics,
          complianceMetrics,
          referralMetrics,
          networkingMetrics,
        },
      });
    }

    // Get achievements
    const achievements = await db.query.creatorAchievements?.findMany({
      where: eq(creatorAchievements.creatorId, userId),
      orderBy: desc(creatorAchievements.completedAt),
    }) || [];

    // Get tier history
    const tierHistory = await db.query.creatorTierHistory?.findMany({
      where: eq(creatorTierHistory.creatorId, userId),
      orderBy: desc(creatorTierHistory.createdAt),
      limit: 10,
    }) || [];

    return {
      userId,
      currentTier,
      totalScore,
      tierProgress,
      nextTier,
      pointsToNextTier: pointsNeeded,
      metrics: {
        fanMetrics,
        contentMetrics,
        complianceMetrics,
        referralMetrics,
        networkingMetrics,
      },
      achievements: achievements.map(a => ({
        id: a.id,
        name: a.achievementName,
        icon: a.badgeIcon || 'award',
        tier: a.tier || 'bronze',
        completedAt: a.completedAt,
      })),
      tierHistory: tierHistory.map(h => ({
        tier: h.newTier,
        achievedAt: h.createdAt!,
        reason: h.reason,
      })),
    };
  }

  /**
   * Get creator's current pro status without recalculating
   */
  async getCreatorProStatus(userId: string): Promise<CreatorProStatus | null> {
    const metrics = await db.query.creatorProMetrics?.findFirst({
      where: eq(creatorProMetrics.userId, userId),
    });

    if (!metrics) {
      // Initialize and return fresh calculation
      return this.recalculateMetrics(userId);
    }

    const { nextTier, pointsNeeded } = this.getNextTierInfo(metrics.currentTier, metrics.totalScore);

    // Get achievements
    const achievements = await db.query.creatorAchievements?.findMany({
      where: eq(creatorAchievements.creatorId, userId),
      orderBy: desc(creatorAchievements.completedAt),
    }) || [];

    // Get tier history
    const tierHistory = await db.query.creatorTierHistory?.findMany({
      where: eq(creatorTierHistory.creatorId, userId),
      orderBy: desc(creatorTierHistory.createdAt),
      limit: 10,
    }) || [];

    return {
      userId,
      currentTier: metrics.currentTier,
      totalScore: metrics.totalScore,
      tierProgress: metrics.tierProgress,
      nextTier,
      pointsToNextTier: pointsNeeded,
      metrics: {
        fanMetrics: {
          fanCount: metrics.fanCount,
          fanCountScore: metrics.fanCountScore,
          retentionRate: metrics.fanRetentionRate,
          retentionScore: metrics.fanRetentionScore,
          engagementRate: metrics.averageFanEngagement,
          engagementScore: metrics.fanEngagementScore,
          totalScore: metrics.fanCountScore + metrics.fanRetentionScore + metrics.fanEngagementScore,
        },
        contentMetrics: {
          totalUploads: metrics.totalContentUploads,
          quantityScore: metrics.contentQuantityScore,
          averageQuality: metrics.averageContentQuality,
          qualityScore: metrics.contentQualityScore,
          consistencyDays: metrics.contentConsistencyDays,
          consistencyScore: metrics.consistencyScore,
          totalScore: metrics.contentQuantityScore + metrics.contentQualityScore + metrics.consistencyScore,
        },
        complianceMetrics: {
          totalStrikes: metrics.totalStrikes,
          activeStrikes: metrics.activeStrikes,
          daysWithoutStrike: metrics.daysWithoutStrike,
          complianceScore: metrics.complianceScore,
        },
        referralMetrics: {
          totalReferrals: metrics.totalReferrals,
          activeReferrals: metrics.activeReferrals,
          referralScore: metrics.referralScore,
        },
        networkingMetrics: {
          collaborations: metrics.collaborationsCount,
          interactions: metrics.creatorInteractions,
          contributions: metrics.communityContributions,
          networkingScore: metrics.networkingScore,
        },
      },
      achievements: achievements.map(a => ({
        id: a.id,
        name: a.achievementName,
        icon: a.badgeIcon || 'award',
        tier: a.tier || 'bronze',
        completedAt: a.completedAt,
      })),
      tierHistory: tierHistory.map(h => ({
        tier: h.newTier,
        achievedAt: h.createdAt!,
        reason: h.reason,
      })),
    };
  }

  /**
   * Check and award achievements
   */
  async checkAchievements(userId: string): Promise<void> {
    const metrics = await this.getOrCreateMetrics(userId);
    const existingAchievements = await db.query.creatorAchievements?.findMany({
      where: eq(creatorAchievements.creatorId, userId),
    }) || [];

    const existingTypes = new Set(existingAchievements.map(a => a.achievementType));

    // Define achievement checks
    const achievementChecks = [
      // Fan milestones
      { type: 'fans_10', check: metrics.fanCount >= 10, name: 'First Followers', desc: 'Gained 10 fans', tier: 'bronze', points: 5 },
      { type: 'fans_100', check: metrics.fanCount >= 100, name: 'Growing Audience', desc: 'Gained 100 fans', tier: 'silver', points: 15 },
      { type: 'fans_1000', check: metrics.fanCount >= 1000, name: 'Fan Favorite', desc: 'Gained 1,000 fans', tier: 'gold', points: 30 },
      { type: 'fans_10000', check: metrics.fanCount >= 10000, name: 'Superstar', desc: 'Gained 10,000 fans', tier: 'platinum', points: 50 },

      // Content milestones
      { type: 'content_10', check: metrics.totalContentUploads >= 10, name: 'Content Creator', desc: 'Uploaded 10 pieces of content', tier: 'bronze', points: 5 },
      { type: 'content_100', check: metrics.totalContentUploads >= 100, name: 'Prolific', desc: 'Uploaded 100 pieces of content', tier: 'silver', points: 15 },
      { type: 'content_500', check: metrics.totalContentUploads >= 500, name: 'Content Machine', desc: 'Uploaded 500 pieces of content', tier: 'gold', points: 30 },

      // Quality milestones
      { type: 'quality_80', check: metrics.averageContentQuality >= 80, name: 'Quality Creator', desc: 'Average content score of 80+', tier: 'silver', points: 20 },
      { type: 'quality_90', check: metrics.averageContentQuality >= 90, name: 'Elite Quality', desc: 'Average content score of 90+', tier: 'gold', points: 35 },

      // Consistency milestones
      { type: 'streak_7', check: metrics.contentConsistencyDays >= 7, name: 'Weekly Warrior', desc: '7-day posting streak', tier: 'bronze', points: 5 },
      { type: 'streak_30', check: metrics.contentConsistencyDays >= 30, name: 'Monthly Master', desc: '30-day posting streak', tier: 'silver', points: 15 },
      { type: 'streak_100', check: metrics.contentConsistencyDays >= 100, name: 'Consistency King', desc: '100-day posting streak', tier: 'gold', points: 30 },

      // Compliance
      { type: 'clean_30', check: metrics.daysWithoutStrike >= 30 && metrics.totalStrikes === 0, name: 'Rule Follower', desc: '30 days without any strikes', tier: 'silver', points: 10 },
      { type: 'clean_180', check: metrics.daysWithoutStrike >= 180 && metrics.totalStrikes === 0, name: 'Model Citizen', desc: '180 days without any strikes', tier: 'gold', points: 25 },

      // Referrals
      { type: 'referral_5', check: metrics.activeReferrals >= 5, name: 'Community Builder', desc: 'Referred 5 active members', tier: 'silver', points: 15 },
      { type: 'referral_20', check: metrics.activeReferrals >= 20, name: 'Ambassador', desc: 'Referred 20 active members', tier: 'gold', points: 30 },

      // Tier achievements
      { type: 'tier_established', check: metrics.currentTier === 'established' || ['pro', 'elite', 'legend'].includes(metrics.currentTier), name: 'Established', desc: 'Reached Established tier', tier: 'silver', points: 0 },
      { type: 'tier_pro', check: ['pro', 'elite', 'legend'].includes(metrics.currentTier), name: 'Pro Creator', desc: 'Reached Pro tier', tier: 'gold', points: 0 },
      { type: 'tier_elite', check: ['elite', 'legend'].includes(metrics.currentTier), name: 'Elite Creator', desc: 'Reached Elite tier', tier: 'platinum', points: 0 },
      { type: 'tier_legend', check: metrics.currentTier === 'legend', name: 'Legend', desc: 'Reached Legend tier', tier: 'diamond', points: 0 },
    ];

    // Award new achievements
    for (const achievement of achievementChecks) {
      if (achievement.check && !existingTypes.has(achievement.type)) {
        await db.insert(creatorAchievements).values({
          creatorId: userId,
          achievementType: achievement.type,
          achievementName: achievement.name,
          achievementDescription: achievement.desc,
          tier: achievement.tier,
          pointsAwarded: achievement.points,
          isCompleted: true,
          completedAt: new Date(),
          currentProgress: 100,
          targetProgress: 100,
        });
      }
    }
  }

  /**
   * Issue a strike to a creator
   */
  async issueStrike(
    creatorId: string,
    strikeType: string,
    severity: string,
    reason: string,
    evidence: any = {},
    issuedBy: string,
    contentId?: string
  ): Promise<void> {
    const penalty = SCORE_WEIGHTS.strikePenalties[severity as keyof typeof SCORE_WEIGHTS.strikePenalties] || 0;

    // Create strike record
    await db.insert(creatorStrikes).values({
      creatorId,
      strikeType: strikeType as any,
      severity: severity as any,
      reason,
      evidence,
      contentId,
      pointsDeducted: penalty,
      issuedBy,
      isActive: true,
    });

    // Recalculate metrics (this will update compliance score)
    await this.recalculateMetrics(creatorId);
  }

  /**
   * Record a referral
   */
  async recordReferral(
    referrerId: string,
    referredId: string,
    referredType: 'creator' | 'fan',
    referralCode: string
  ): Promise<void> {
    await db.insert(creatorReferrals).values({
      referrerId,
      referredId,
      referredType,
      referralCode,
      signupCompleted: true,
      pointsAwarded: referredType === 'creator' ? 10 : 3,
    });

    // Recalculate referrer's metrics
    await this.recalculateMetrics(referrerId);
  }

  /**
   * Update referral activity status
   */
  async updateReferralActivity(referredId: string): Promise<void> {
    const referral = await db.query.creatorReferrals?.findFirst({
      where: eq(creatorReferrals.referredId, referredId),
    });

    if (referral) {
      await db
        .update(creatorReferrals)
        .set({
          lastActivityAt: new Date(),
          isActive: true,
        })
        .where(eq(creatorReferrals.referredId, referredId));
    }
  }
}

export const creatorProEligibilityService = new CreatorProEligibilityService();
export default creatorProEligibilityService;
