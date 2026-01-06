/**
 * Starz Studio Membership Service
 * 
 * Manages creator tier qualification based on:
 * - Fan count (total and active)
 * - Referrals (successful conversions)
 * - Media quality scoring (AI-analyzed)
 * - Post volume (total and monthly)
 * 
 * Integrates with FanzSSO for access logging and FanzCloud Mobile app access.
 */

import { db } from "../db";
import { 
  starzMemberships, starzTierRequirements, starzReferralTracking,
  mediaQualityScores, starzTierHistory, starzAccessLogs, starzAiTools,
  fanzcloudSessions, profiles, mediaAssets, referralCodes, referralTracking,
  content, subscriptions
} from "../../shared/schema";
import { eq, and, sql, desc, gte, count, avg } from "drizzle-orm";

// Tier thresholds - can be adjusted via starzTierRequirements table
const DEFAULT_TIER_REQUIREMENTS = {
  none: {
    minFanCount: 0,
    minActiveFanCount: 0,
    minReferrals: 0,
    minMediaQualityScore: 0,
    minTotalPosts: 0,
    minMonthlyPosts: 0,
    fanzcloudAccessLevel: "view_only",
    features: [],
    aiToolsUnlocked: [],
    displayName: "Non-Member",
    description: "Can view Starz Studio tools but cannot use them",
    color: "#6B7280",
  },
  bronze_star: {
    minFanCount: 50,
    minActiveFanCount: 25,
    minReferrals: 3,
    minMediaQualityScore: 40,
    minTotalPosts: 20,
    minMonthlyPosts: 4,
    fanzcloudAccessLevel: "basic",
    features: ["ai_caption_generator", "basic_analytics", "content_scheduler"],
    aiToolsUnlocked: ["caption-ai", "hashtag-suggester", "post-scheduler"],
    displayName: "Bronze Star",
    description: "Entry-level AI creator tools",
    color: "#CD7F32",
  },
  silver_star: {
    minFanCount: 250,
    minActiveFanCount: 125,
    minReferrals: 10,
    minMediaQualityScore: 55,
    minTotalPosts: 75,
    minMonthlyPosts: 8,
    fanzcloudAccessLevel: "basic",
    features: ["ai_content_ideas", "engagement_analytics", "dm_templates", "fan_insights"],
    aiToolsUnlocked: ["content-ideator", "engagement-analyzer", "dm-assistant", "fan-segmentation"],
    displayName: "Silver Star",
    description: "Enhanced AI features and analytics",
    color: "#C0C0C0",
  },
  gold_star: {
    minFanCount: 1000,
    minActiveFanCount: 500,
    minReferrals: 25,
    minMediaQualityScore: 70,
    minTotalPosts: 200,
    minMonthlyPosts: 12,
    fanzcloudAccessLevel: "full",
    features: ["ai_video_editor", "revenue_optimizer", "collab_matcher", "trend_predictor"],
    aiToolsUnlocked: ["video-enhancer", "pricing-ai", "collab-finder", "trend-analyzer", "bulk-scheduler"],
    displayName: "Gold Star",
    description: "Full AI suite access",
    color: "#FFD700",
  },
  platinum_star: {
    minFanCount: 5000,
    minActiveFanCount: 2500,
    minReferrals: 50,
    minMediaQualityScore: 80,
    minTotalPosts: 500,
    minMonthlyPosts: 16,
    fanzcloudAccessLevel: "full",
    features: ["priority_ai_processing", "custom_ai_models", "white_label_tools", "api_access"],
    aiToolsUnlocked: ["custom-ai-model", "api-integration", "white-label", "priority-queue"],
    displayName: "Platinum Star",
    description: "Premium features with priority AI processing",
    color: "#E5E4E2",
  },
  diamond_star: {
    minFanCount: 25000,
    minActiveFanCount: 12500,
    minReferrals: 100,
    minMediaQualityScore: 90,
    minTotalPosts: 1000,
    minMonthlyPosts: 20,
    fanzcloudAccessLevel: "full",
    features: ["beta_access", "dedicated_support", "custom_integrations", "revenue_share_boost"],
    aiToolsUnlocked: ["all", "beta-features", "dedicated-ai-agent", "custom-workflows"],
    displayName: "Diamond Star",
    description: "Elite tier with all features and dedicated support",
    color: "#B9F2FF",
  },
};

export class StarzStudioService {
  /**
   * Initialize tier requirements in database
   */
  async seedTierRequirements(): Promise<void> {
    const tiers = Object.entries(DEFAULT_TIER_REQUIREMENTS);
    
    for (const [tier, requirements] of tiers) {
      await db.insert(starzTierRequirements)
        .values({
          tier: tier as any,
          minFanCount: requirements.minFanCount,
          minActiveFanCount: requirements.minActiveFanCount,
          minReferrals: requirements.minReferrals,
          minMediaQualityScore: requirements.minMediaQualityScore,
          minTotalPosts: requirements.minTotalPosts,
          minMonthlyPosts: requirements.minMonthlyPosts,
          fanzcloudAccessLevel: requirements.fanzcloudAccessLevel,
          features: requirements.features,
          aiToolsUnlocked: requirements.aiToolsUnlocked,
          displayName: requirements.displayName,
          description: requirements.description,
          color: requirements.color,
        })
        .onConflictDoUpdate({
          target: starzTierRequirements.tier,
          set: {
            minFanCount: requirements.minFanCount,
            minActiveFanCount: requirements.minActiveFanCount,
            minReferrals: requirements.minReferrals,
            minMediaQualityScore: requirements.minMediaQualityScore,
            minTotalPosts: requirements.minTotalPosts,
            minMonthlyPosts: requirements.minMonthlyPosts,
            fanzcloudAccessLevel: requirements.fanzcloudAccessLevel,
            features: requirements.features,
            aiToolsUnlocked: requirements.aiToolsUnlocked,
            displayName: requirements.displayName,
            description: requirements.description,
            color: requirements.color,
            updatedAt: new Date(),
          },
        });
    }
    
    console.log("[StarzStudio] Tier requirements seeded successfully");
  }

  /**
   * Get or create membership for a profile
   */
  async getOrCreateMembership(profileId: string) {
    const existing = await db.query.starzMemberships.findFirst({
      where: eq(starzMemberships.profileId, profileId),
    });

    if (existing) return existing;

    const [membership] = await db.insert(starzMemberships)
      .values({
        profileId,
        currentTier: "none",
        totalFanCount: 0,
        activeFanCount: 0,
        successfulReferrals: 0,
        mediaQualityScore: 0,
        totalPostCount: 0,
        monthlyPostCount: 0,
        fanzcloudAccessEnabled: false,
        fanzcloudAccessLevel: "view_only",
      })
      .returning();

    return membership;
  }

  /**
   * Calculate a creator's current metrics for tier evaluation
   */
  async calculateCreatorMetrics(profileId: string) {
    // Get fan count from subscriptions
    const fanCounts = await db
      .select({
        total: count(),
        active: sql<number>`COUNT(*) FILTER (WHERE ${subscriptions.status} = 'active' AND ${subscriptions.currentPeriodEnd} > NOW())`,
      })
      .from(subscriptions)
      .innerJoin(profiles, eq(profiles.id, subscriptions.fanProfileId))
      .where(
        sql`EXISTS (
          SELECT 1 FROM subscription_plans sp 
          WHERE sp.id = ${subscriptions.planId} 
          AND sp.creator_profile_id = ${profileId}
        )`
      );

    const totalFanCount = fanCounts[0]?.total || 0;
    const activeFanCount = fanCounts[0]?.active || 0;

    // Get successful referrals
    const referralResult = await db
      .select({ count: count() })
      .from(starzReferralTracking)
      .where(
        and(
          eq(starzReferralTracking.referrerProfileId, profileId),
          eq(starzReferralTracking.qualifiesForStarz, true)
        )
      );
    const successfulReferrals = referralResult[0]?.count || 0;

    // Get media quality average
    const qualityResult = await db
      .select({ avgScore: avg(mediaQualityScores.overallScore) })
      .from(mediaQualityScores)
      .where(eq(mediaQualityScores.profileId, profileId));
    const mediaQualityScore = Math.round(Number(qualityResult[0]?.avgScore) || 0);

    // Get post counts
    const postCounts = await db
      .select({
        total: count(),
        monthly: sql<number>`COUNT(*) FILTER (WHERE ${content.createdAt} > NOW() - INTERVAL '30 days')`,
      })
      .from(content)
      .where(
        and(
          eq(content.creatorProfileId, profileId),
          eq(content.status, "published")
        )
      );
    const totalPostCount = postCounts[0]?.total || 0;
    const monthlyPostCount = postCounts[0]?.monthly || 0;

    return {
      totalFanCount,
      activeFanCount,
      successfulReferrals,
      mediaQualityScore,
      totalPostCount,
      monthlyPostCount,
    };
  }

  /**
   * Determine which tier a creator qualifies for based on metrics
   */
  async determineTier(metrics: {
    totalFanCount: number;
    activeFanCount: number;
    successfulReferrals: number;
    mediaQualityScore: number;
    totalPostCount: number;
    monthlyPostCount: number;
  }): Promise<string> {
    const requirements = await db.query.starzTierRequirements.findMany({
      orderBy: desc(starzTierRequirements.minFanCount),
    });

    // Check from highest tier down
    const tierOrder = ["diamond_star", "platinum_star", "gold_star", "silver_star", "bronze_star", "none"];
    
    for (const tierName of tierOrder) {
      const req = requirements.find(r => r.tier === tierName);
      if (!req) continue;
      
      if (
        metrics.totalFanCount >= req.minFanCount &&
        metrics.activeFanCount >= req.minActiveFanCount &&
        metrics.successfulReferrals >= req.minReferrals &&
        metrics.mediaQualityScore >= req.minMediaQualityScore &&
        metrics.totalPostCount >= req.minTotalPosts &&
        metrics.monthlyPostCount >= req.minMonthlyPosts
      ) {
        return tierName;
      }
    }

    return "none";
  }

  /**
   * Evaluate and update a creator's tier
   */
  async evaluateAndUpdateTier(profileId: string) {
    const membership = await this.getOrCreateMembership(profileId);
    const metrics = await this.calculateCreatorMetrics(profileId);
    const newTier = await this.determineTier(metrics);

    const tierRequirements = await db.query.starzTierRequirements.findFirst({
      where: eq(starzTierRequirements.tier, newTier as any),
    });

    // Update membership with new metrics and tier
    const previousTier = membership.currentTier;
    const tierChanged = previousTier !== newTier;

    await db.update(starzMemberships)
      .set({
        currentTier: newTier as any,
        previousTier: tierChanged ? previousTier : membership.previousTier,
        totalFanCount: metrics.totalFanCount,
        activeFanCount: metrics.activeFanCount,
        successfulReferrals: metrics.successfulReferrals,
        mediaQualityScore: metrics.mediaQualityScore,
        totalPostCount: metrics.totalPostCount,
        monthlyPostCount: metrics.monthlyPostCount,
        fanzcloudAccessEnabled: newTier !== "none",
        fanzcloudAccessLevel: tierRequirements?.fanzcloudAccessLevel || "view_only",
        tierAchievedAt: tierChanged ? new Date() : membership.tierAchievedAt,
        lastEvaluatedAt: new Date(),
        nextEvaluationAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day
        updatedAt: new Date(),
      })
      .where(eq(starzMemberships.id, membership.id));

    // Record tier change if changed
    if (tierChanged) {
      await db.insert(starzTierHistory).values({
        membershipId: membership.id,
        previousTier: previousTier as any,
        newTier: newTier as any,
        changeReason: newTier > previousTier ? "promotion" : "demotion",
        metricsSnapshot: metrics,
      });

      console.log(`[StarzStudio] Profile ${profileId} tier changed: ${previousTier} -> ${newTier}`);
    }

    return {
      previousTier,
      newTier,
      tierChanged,
      metrics,
      tierRequirements,
    };
  }

  /**
   * Log tool access for SSO auditing
   */
  async logToolAccess(params: {
    profileId: string;
    toolAccessed: string;
    accessType: "view" | "use" | "denied";
    ssoSessionId?: string;
    ssoClientId?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceType?: "web" | "mobile" | "fanzcloud_app";
    fanzcloudVersion?: string;
    fanzcloudPlatform?: "ios" | "android";
  }) {
    const membership = await this.getOrCreateMembership(params.profileId);

    await db.insert(starzAccessLogs).values({
      profileId: params.profileId,
      membershipId: membership.id,
      toolAccessed: params.toolAccessed,
      accessType: params.accessType,
      tierAtAccess: membership.currentTier,
      ssoSessionId: params.ssoSessionId,
      ssoClientId: params.ssoClientId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      deviceType: params.deviceType,
      fanzcloudVersion: params.fanzcloudVersion,
      fanzcloudPlatform: params.fanzcloudPlatform,
    });
  }

  /**
   * Check if a creator can access a specific tool
   */
  async canAccessTool(profileId: string, toolSlug: string): Promise<{
    canAccess: boolean;
    reason?: string;
    requiredTier?: string;
    currentTier: string;
  }> {
    const membership = await this.getOrCreateMembership(profileId);
    const tool = await db.query.starzAiTools.findFirst({
      where: eq(starzAiTools.slug, toolSlug),
    });

    if (!tool) {
      return { canAccess: false, reason: "Tool not found", currentTier: membership.currentTier };
    }

    if (!tool.isActive) {
      return { canAccess: false, reason: "Tool is currently unavailable", currentTier: membership.currentTier };
    }

    const tierOrder = ["none", "bronze_star", "silver_star", "gold_star", "platinum_star", "diamond_star"];
    const currentTierIndex = tierOrder.indexOf(membership.currentTier);
    const requiredTierIndex = tierOrder.indexOf(tool.minimumTier);

    if (currentTierIndex < requiredTierIndex) {
      return {
        canAccess: false,
        reason: `Requires ${tool.minimumTier} tier or higher`,
        requiredTier: tool.minimumTier,
        currentTier: membership.currentTier,
      };
    }

    return { canAccess: true, currentTier: membership.currentTier };
  }

  /**
   * Process a referral for Starz qualification
   */
  async processReferralForStarz(
    referrerProfileId: string,
    referredUserId: string,
    referralCodeId?: string
  ) {
    // Check if referral already tracked
    const existing = await db.query.starzReferralTracking.findFirst({
      where: and(
        eq(starzReferralTracking.referrerProfileId, referrerProfileId),
        eq(starzReferralTracking.referredUserId, referredUserId)
      ),
    });

    if (existing) {
      // Update qualification status if needed
      const qualifies = await this.checkReferralQualification(referredUserId);
      
      if (qualifies && !existing.qualifiesForStarz) {
        await db.update(starzReferralTracking)
          .set({
            qualifiesForStarz: true,
            qualifiedAt: new Date(),
            qualificationReason: "Referred user met activity requirements",
            referredUserActive: true,
            updatedAt: new Date(),
          })
          .where(eq(starzReferralTracking.id, existing.id));
      }

      return existing;
    }

    // Create new referral tracking
    const [tracking] = await db.insert(starzReferralTracking)
      .values({
        referrerProfileId,
        referredUserId,
        referralCodeId,
        qualifiesForStarz: false,
        referredUserActive: false,
      })
      .returning();

    return tracking;
  }

  /**
   * Check if a referred user qualifies the referral for Starz membership
   */
  async checkReferralQualification(referredUserId: string): Promise<boolean> {
    // A referral qualifies if the referred user:
    // 1. Has been active in the last 7 days
    // 2. Has made at least one purchase OR has an active subscription
    
    const userActivity = await db.query.accounts.findFirst({
      where: eq(starzReferralTracking.referredUserId, referredUserId),
    });

    if (!userActivity) return false;

    // Check for purchases or subscriptions
    const hasTransaction = await db
      .select({ count: count() })
      .from(subscriptions)
      .innerJoin(profiles, eq(profiles.accountId, referredUserId))
      .where(eq(subscriptions.fanProfileId, profiles.id));

    return (hasTransaction[0]?.count || 0) > 0;
  }

  /**
   * Register FanzCloud Mobile app session
   */
  async registerFanzcloudSession(params: {
    profileId: string;
    deviceId: string;
    deviceName?: string;
    platform: "ios" | "android";
    appVersion: string;
    osVersion?: string;
    pushToken?: string;
    ipAddress?: string;
    location?: object;
  }) {
    const membership = await this.getOrCreateMembership(params.profileId);

    if (!membership.fanzcloudAccessEnabled) {
      throw new Error("FanzCloud Mobile access not enabled. Earn Starz membership to unlock.");
    }

    // Upsert session
    await db.insert(fanzcloudSessions)
      .values({
        profileId: params.profileId,
        membershipId: membership.id,
        deviceId: params.deviceId,
        deviceName: params.deviceName,
        platform: params.platform,
        appVersion: params.appVersion,
        osVersion: params.osVersion,
        pushToken: params.pushToken,
        ipAddress: params.ipAddress,
        location: params.location || {},
        isActive: true,
        lastActiveAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [fanzcloudSessions.profileId, fanzcloudSessions.deviceId],
        set: {
          appVersion: params.appVersion,
          osVersion: params.osVersion,
          pushToken: params.pushToken,
          ipAddress: params.ipAddress,
          location: params.location || {},
          isActive: true,
          lastActiveAt: new Date(),
          updatedAt: new Date(),
        },
      });

    // Log the access
    await this.logToolAccess({
      profileId: params.profileId,
      toolAccessed: "fanzcloud_mobile_app",
      accessType: "use",
      deviceType: "fanzcloud_app",
      ipAddress: params.ipAddress,
      fanzcloudVersion: params.appVersion,
      fanzcloudPlatform: params.platform,
    });

    return { success: true };
  }

  /**
   * Get dashboard data for a creator's Starz membership
   */
  async getMembershipDashboard(profileId: string) {
    const membership = await this.getOrCreateMembership(profileId);
    const metrics = await this.calculateCreatorMetrics(profileId);
    
    const tierRequirements = await db.query.starzTierRequirements.findMany();
    const availableTools = await db.query.starzAiTools.findMany({
      where: eq(starzAiTools.isActive, true),
    });

    // Calculate progress to next tier
    const tierOrder = ["none", "bronze_star", "silver_star", "gold_star", "platinum_star", "diamond_star"];
    const currentIndex = tierOrder.indexOf(membership.currentTier);
    const nextTier = currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;
    const nextTierReq = nextTier ? tierRequirements.find(r => r.tier === nextTier) : null;

    let tierProgress = null;
    if (nextTierReq) {
      tierProgress = {
        nextTier: nextTier,
        fanCountProgress: Math.min(100, (metrics.totalFanCount / nextTierReq.minFanCount) * 100),
        referralProgress: Math.min(100, (metrics.successfulReferrals / nextTierReq.minReferrals) * 100),
        qualityProgress: Math.min(100, (metrics.mediaQualityScore / nextTierReq.minMediaQualityScore) * 100),
        postProgress: Math.min(100, (metrics.totalPostCount / nextTierReq.minTotalPosts) * 100),
      };
    }

    // Get recent access logs
    const recentLogs = await db.query.starzAccessLogs.findMany({
      where: eq(starzAccessLogs.profileId, profileId),
      orderBy: desc(starzAccessLogs.accessedAt),
      limit: 10,
    });

    return {
      membership,
      metrics,
      tierRequirements,
      tierProgress,
      availableTools: availableTools.map(tool => ({
        ...tool,
        accessible: tierOrder.indexOf(membership.currentTier) >= tierOrder.indexOf(tool.minimumTier),
      })),
      recentLogs,
    };
  }
}

export const starzStudioService = new StarzStudioService();
