/**
 * Creator Ad Service
 *
 * Revenue model:
 * - Creators get 100% of their content revenue (subscriptions, tips, PPV)
 * - Creators can opt-in to ads on their profile, feed, and videos
 * - Ad revenue split: 70% to creator, 30% to Wittle Bear Foundation
 * - Creators can donate part or all of their 70% to charity too
 * - Charity supporters get special badges on their profile
 */

import { db } from '../db';
import {
  ads,
  advertisers,
  creatorAdSettings,
  charityAdImpressions,
  charityAdClicks,
  creatorAdRevenue,
  charities,
  charityDonations,
  charityBadges,
  users,
  type Ad,
  type CreatorAdSettings,
  type AdImpression,
  type Charity,
  type CharityBadge,
  type InsertAdImpression,
  type InsertAdClick,
  type InsertCharityDonation,
  type InsertCharityBadge,
} from '@shared/schema';
import { eq, and, desc, gte, lte, sql, isNull, inArray } from 'drizzle-orm';
import { createHash } from 'crypto';

// Badge tier thresholds
const BADGE_TIERS = {
  supporter: { min: 1, max: 49, color: '#8B5CF6', icon: '🐻' },
  bronze: { min: 50, max: 199, color: '#CD7F32', icon: '🥉' },
  silver: { min: 200, max: 499, color: '#C0C0C0', icon: '🥈' },
  gold: { min: 500, max: 999, color: '#FFD700', icon: '🥇' },
  diamond: { min: 1000, max: 4999, color: '#B9F2FF', icon: '💎' },
  champion: { min: 5000, max: Infinity, color: '#FF6B6B', icon: '👑' },
} as const;

// Revenue split percentages
const CREATOR_SHARE_PERCENT = 70;
const CHARITY_SHARE_PERCENT = 30;

// Wittle Bear Foundation default ID
const WITTLE_BEAR_FOUNDATION_ID = 'wittle-bear-foundation';

interface AdSelectionContext {
  creatorId: string;
  placementType: 'profile_banner' | 'feed_inline' | 'video_preroll' | 'video_overlay' | 'sidebar' | 'story_interstitial';
  viewerId?: string;
  sessionId?: string;
  country?: string;
}

interface ImpressionData {
  adId: string;
  creatorId: string;
  viewerId?: string;
  placementType: string;
  sessionId?: string;
  ipHash?: string;
  userAgent?: string;
  country?: string;
  viewDuration?: number;
}

interface ClickData {
  adId: string;
  impressionId?: string;
  creatorId: string;
  viewerId?: string;
  ipHash?: string;
  referrer?: string;
}

export class CreatorAdService {
  /**
   * Initialize default charity (Wittle Bear Foundation)
   */
  async initializeWittleBearFoundation(): Promise<Charity> {
    const existing = await db
      .select()
      .from(charities)
      .where(eq(charities.slug, WITTLE_BEAR_FOUNDATION_ID))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const [charity] = await db
      .insert(charities)
      .values({
        id: WITTLE_BEAR_FOUNDATION_ID,
        slug: WITTLE_BEAR_FOUNDATION_ID,
        name: 'Wittle Bear Foundation',
        description: 'Supporting homeless youth and shelter animals across America. Every ad view on FANZ helps provide food, shelter, and care for those in need.',
        mission: 'To give homeless youth and shelter animals a second chance at life through community support and direct action.',
        website: 'https://wittlebear.org',
        logoUrl: '/images/charities/wittle-bear-logo.png',
        bannerUrl: '/images/charities/wittle-bear-banner.jpg',
        causes: ['homeless_youth', 'animal_shelters'],
        isVerified: true,
        isActive: true,
        totalReceived: '0',
      })
      .returning();

    return charity;
  }

  /**
   * Get or create creator ad settings
   */
  async getCreatorAdSettings(creatorId: string): Promise<CreatorAdSettings> {
    const existing = await db
      .select()
      .from(creatorAdSettings)
      .where(eq(creatorAdSettings.creatorId, creatorId))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create default settings (all ads disabled by default)
    const [settings] = await db
      .insert(creatorAdSettings)
      .values({
        creatorId,
        enableProfileBanner: false,
        enableFeedAds: false,
        enableVideoPreroll: false,
        enableVideoOverlay: false,
        enableSidebar: false,
        enableStoryAds: false,
        allowedCategories: ['adult_products', 'dating_apps', 'wellness', 'fashion', 'entertainment'],
        blockedAdvertisers: [],
        donationPercentage: 0,
        donateToCharity: false,
        charityId: WITTLE_BEAR_FOUNDATION_ID,
        totalEarned: '0',
        totalDonated: '0',
        pendingPayout: '0',
        hasCharityBadge: false,
        badgeTier: 'none',
      })
      .returning();

    return settings;
  }

  /**
   * Update creator ad settings
   */
  async updateCreatorAdSettings(
    creatorId: string,
    updates: Partial<{
      enableProfileBanner: boolean;
      enableFeedAds: boolean;
      enableVideoPreroll: boolean;
      enableVideoOverlay: boolean;
      enableSidebar: boolean;
      enableStoryAds: boolean;
      allowedCategories: string[];
      blockedAdvertisers: string[];
      donationPercentage: number;
      donateToCharity: boolean;
      charityId: string;
    }>
  ): Promise<CreatorAdSettings> {
    // Ensure settings exist
    await this.getCreatorAdSettings(creatorId);

    const [updated] = await db
      .update(creatorAdSettings)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(creatorAdSettings.creatorId, creatorId))
      .returning();

    return updated;
  }

  /**
   * Check if creator has ads enabled for a specific placement
   */
  async isPlacementEnabled(creatorId: string, placementType: string): Promise<boolean> {
    const settings = await this.getCreatorAdSettings(creatorId);

    switch (placementType) {
      case 'profile_banner':
        return settings.enableProfileBanner ?? false;
      case 'feed_inline':
        return settings.enableFeedAds ?? false;
      case 'video_preroll':
        return settings.enableVideoPreroll ?? false;
      case 'video_overlay':
        return settings.enableVideoOverlay ?? false;
      case 'sidebar':
        return settings.enableSidebar ?? false;
      case 'story_interstitial':
        return settings.enableStoryAds ?? false;
      default:
        return false;
    }
  }

  /**
   * Select the best ad for a given context
   */
  async selectAd(context: AdSelectionContext): Promise<Ad | null> {
    // Check if creator has this placement enabled
    const isEnabled = await this.isPlacementEnabled(context.creatorId, context.placementType);
    if (!isEnabled) {
      return null;
    }

    const settings = await this.getCreatorAdSettings(context.creatorId);
    const now = new Date();

    // Find eligible ads
    const eligibleAds = await db
      .select()
      .from(ads)
      .where(
        and(
          eq(ads.status, 'active'),
          eq(ads.placementType, context.placementType),
          // Within date range
          lte(ads.startDate, now),
          gte(ads.endDate, now),
          // Within budget
          sql`${ads.totalSpent} < ${ads.totalBudget}`,
          // In allowed categories
          inArray(ads.category, settings.allowedCategories || []),
          // Not from blocked advertisers
          settings.blockedAdvertisers && settings.blockedAdvertisers.length > 0
            ? sql`${ads.advertiserId} NOT IN (${settings.blockedAdvertisers.join(',')})`
            : sql`1=1`
        )
      )
      .orderBy(desc(ads.bidAmountCpm))
      .limit(10);

    if (eligibleAds.length === 0) {
      return null;
    }

    // Simple weighted random selection based on bid amount
    const totalWeight = eligibleAds.reduce((sum, ad) => sum + parseFloat(ad.bidAmountCpm || '1'), 0);
    let random = Math.random() * totalWeight;

    for (const ad of eligibleAds) {
      random -= parseFloat(ad.bidAmountCpm || '1');
      if (random <= 0) {
        return ad;
      }
    }

    return eligibleAds[0];
  }

  /**
   * Record an ad impression and calculate revenue
   */
  async recordImpression(data: ImpressionData): Promise<AdImpression> {
    const ad = await db.select().from(ads).where(eq(ads.id, data.adId)).limit(1);
    if (!ad.length) {
      throw new Error('Ad not found');
    }

    const cpmRate = parseFloat(ad[0].bidAmountCpm || '1');
    const revenuePerImpression = cpmRate / 1000; // CPM = cost per 1000 impressions

    // Calculate split: 70% creator, 30% charity
    const creatorEarned = revenuePerImpression * (CREATOR_SHARE_PERCENT / 100);
    const charityEarned = revenuePerImpression * (CHARITY_SHARE_PERCENT / 100);

    // Record impression
    const [impression] = await db
      .insert(charityAdImpressions)
      .values({
        adId: data.adId,
        creatorId: data.creatorId,
        viewerId: data.viewerId,
        placementType: data.placementType as any,
        sessionId: data.sessionId,
        ipHash: data.ipHash,
        userAgent: data.userAgent,
        country: data.country,
        earnedAmount: creatorEarned.toFixed(4),
        charityAmount: charityEarned.toFixed(4),
        viewDuration: data.viewDuration,
      })
      .returning();

    // Update ad stats
    await db
      .update(ads)
      .set({
        impressions: sql`${ads.impressions} + 1`,
        totalSpent: sql`${ads.totalSpent} + ${revenuePerImpression}`,
        updatedAt: new Date(),
      })
      .where(eq(ads.id, data.adId));

    // Update creator earnings
    await this.updateCreatorEarnings(data.creatorId, creatorEarned, charityEarned);

    return impression;
  }

  /**
   * Record an ad click and calculate revenue
   */
  async recordClick(data: ClickData): Promise<void> {
    const ad = await db.select().from(ads).where(eq(ads.id, data.adId)).limit(1);
    if (!ad.length) {
      throw new Error('Ad not found');
    }

    const cpcRate = parseFloat(ad[0].bidAmountCpc || '0.10');
    const creatorEarned = cpcRate * (CREATOR_SHARE_PERCENT / 100);
    const charityEarned = cpcRate * (CHARITY_SHARE_PERCENT / 100);

    // Record click
    await db.insert(charityAdClicks).values({
      adId: data.adId,
      impressionId: data.impressionId,
      creatorId: data.creatorId,
      viewerId: data.viewerId,
      earnedAmount: creatorEarned.toFixed(4),
      charityAmount: charityEarned.toFixed(4),
      ipHash: data.ipHash,
      referrer: data.referrer,
    });

    // Update ad stats
    await db
      .update(ads)
      .set({
        clicks: sql`${ads.clicks} + 1`,
        totalSpent: sql`${ads.totalSpent} + ${cpcRate}`,
        updatedAt: new Date(),
      })
      .where(eq(ads.id, data.adId));

    // Update creator earnings
    await this.updateCreatorEarnings(data.creatorId, creatorEarned, charityEarned);
  }

  /**
   * Update creator earnings and handle charity donations
   */
  private async updateCreatorEarnings(
    creatorId: string,
    creatorAmount: number,
    charityAmount: number
  ): Promise<void> {
    const settings = await this.getCreatorAdSettings(creatorId);

    // Check if creator wants to donate part of their share
    let actualCreatorPayout = creatorAmount;
    let additionalCharityDonation = 0;

    if (settings.donateToCharity && settings.donationPercentage && settings.donationPercentage > 0) {
      additionalCharityDonation = creatorAmount * (settings.donationPercentage / 100);
      actualCreatorPayout = creatorAmount - additionalCharityDonation;
    }

    const totalCharityAmount = charityAmount + additionalCharityDonation;

    // Update creator settings with earnings
    await db
      .update(creatorAdSettings)
      .set({
        totalEarned: sql`${creatorAdSettings.totalEarned} + ${creatorAmount}`,
        totalDonated: sql`${creatorAdSettings.totalDonated} + ${additionalCharityDonation}`,
        pendingPayout: sql`${creatorAdSettings.pendingPayout} + ${actualCreatorPayout}`,
        updatedAt: new Date(),
      })
      .where(eq(creatorAdSettings.creatorId, creatorId));

    // Update charity total
    const charityId = settings.charityId || WITTLE_BEAR_FOUNDATION_ID;
    await db
      .update(charities)
      .set({
        totalReceived: sql`${charities.totalReceived} + ${totalCharityAmount}`,
        updatedAt: new Date(),
      })
      .where(eq(charities.id, charityId));

    // Check if creator qualifies for a badge upgrade
    if (additionalCharityDonation > 0) {
      await this.checkAndUpdateBadge(creatorId, charityId);
    }
  }

  /**
   * Check and update charity badge for a user
   */
  async checkAndUpdateBadge(userId: string, charityId: string): Promise<CharityBadge | null> {
    const settings = await this.getCreatorAdSettings(userId);
    const totalDonated = parseFloat(settings.totalDonated || '0');

    if (totalDonated < 1) {
      return null;
    }

    // Determine tier
    let tier: keyof typeof BADGE_TIERS = 'supporter';
    for (const [tierName, thresholds] of Object.entries(BADGE_TIERS)) {
      if (totalDonated >= thresholds.min && totalDonated <= thresholds.max) {
        tier = tierName as keyof typeof BADGE_TIERS;
        break;
      }
    }

    const tierInfo = BADGE_TIERS[tier];
    const charity = await db.select().from(charities).where(eq(charities.id, charityId)).limit(1);
    const charityName = charity[0]?.name || 'Wittle Bear Foundation';

    // Check for existing badge
    const existingBadge = await db
      .select()
      .from(charityBadges)
      .where(and(eq(charityBadges.userId, userId), eq(charityBadges.charityId, charityId)))
      .limit(1);

    if (existingBadge.length > 0) {
      // Update existing badge
      const [updated] = await db
        .update(charityBadges)
        .set({
          tier: tier,
          badgeName: `${charityName} ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
          badgeIcon: tierInfo.icon,
          badgeColor: tierInfo.color,
          totalDonated: totalDonated.toFixed(2),
          donationCount: sql`${charityBadges.donationCount} + 1`,
          upgradedAt: new Date(),
        })
        .where(eq(charityBadges.id, existingBadge[0].id))
        .returning();

      // Update settings
      await db
        .update(creatorAdSettings)
        .set({
          hasCharityBadge: true,
          badgeTier: tier,
          badgeEarnedAt: existingBadge[0].earnedAt,
        })
        .where(eq(creatorAdSettings.creatorId, userId));

      return updated;
    }

    // Create new badge
    const [badge] = await db
      .insert(charityBadges)
      .values({
        userId,
        charityId,
        tier: tier,
        badgeName: `${charityName} ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
        badgeIcon: tierInfo.icon,
        badgeColor: tierInfo.color,
        causes: charity[0]?.causes || ['homeless_youth', 'animal_shelters'],
        totalDonated: totalDonated.toFixed(2),
        donationCount: 1,
        isDisplayed: true,
        isPrimary: true,
      })
      .returning();

    // Update settings
    await db
      .update(creatorAdSettings)
      .set({
        hasCharityBadge: true,
        badgeTier: tier,
        badgeEarnedAt: new Date(),
      })
      .where(eq(creatorAdSettings.creatorId, userId));

    return badge;
  }

  /**
   * Get user's charity badges
   */
  async getUserBadges(userId: string): Promise<CharityBadge[]> {
    return db
      .select()
      .from(charityBadges)
      .where(and(eq(charityBadges.userId, userId), eq(charityBadges.isDisplayed, true)))
      .orderBy(desc(charityBadges.isPrimary), desc(charityBadges.totalDonated));
  }

  /**
   * Get creator's ad revenue stats
   */
  async getCreatorAdStats(creatorId: string): Promise<{
    settings: CreatorAdSettings;
    totalImpressions: number;
    totalClicks: number;
    totalEarned: string;
    totalDonated: string;
    pendingPayout: string;
    badges: CharityBadge[];
  }> {
    const settings = await this.getCreatorAdSettings(creatorId);
    const badges = await this.getUserBadges(creatorId);

    // Get impression count
    const impressionResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(charityAdImpressions)
      .where(eq(charityAdImpressions.creatorId, creatorId));

    // Get click count
    const clickResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(charityAdClicks)
      .where(eq(charityAdClicks.creatorId, creatorId));

    return {
      settings,
      totalImpressions: Number(impressionResult[0]?.count || 0),
      totalClicks: Number(clickResult[0]?.count || 0),
      totalEarned: settings.totalEarned || '0',
      totalDonated: settings.totalDonated || '0',
      pendingPayout: settings.pendingPayout || '0',
      badges,
    };
  }

  /**
   * Get charity leaderboard
   */
  async getCharityLeaderboard(charityId: string = WITTLE_BEAR_FOUNDATION_ID, limit: number = 50): Promise<{
    charity: Charity;
    topDonors: Array<{
      userId: string;
      username: string;
      avatar: string;
      tier: string;
      totalDonated: string;
      badgeIcon: string;
    }>;
    totalRaised: string;
    donorCount: number;
  }> {
    const [charity] = await db
      .select()
      .from(charities)
      .where(eq(charities.id, charityId))
      .limit(1);

    if (!charity) {
      throw new Error('Charity not found');
    }

    const topDonors = await db
      .select({
        userId: charityBadges.userId,
        username: users.username,
        avatar: users.profileImageUrl,
        tier: charityBadges.tier,
        totalDonated: charityBadges.totalDonated,
        badgeIcon: charityBadges.badgeIcon,
      })
      .from(charityBadges)
      .innerJoin(users, eq(users.id, charityBadges.userId))
      .where(eq(charityBadges.charityId, charityId))
      .orderBy(desc(charityBadges.totalDonated))
      .limit(limit);

    const donorCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(charityBadges)
      .where(eq(charityBadges.charityId, charityId));

    return {
      charity,
      topDonors: topDonors.map(d => ({
        userId: d.userId,
        username: d.username || 'Anonymous',
        avatar: d.avatar || '',
        tier: d.tier,
        totalDonated: d.totalDonated || '0',
        badgeIcon: d.badgeIcon || '🐻',
      })),
      totalRaised: charity.totalReceived || '0',
      donorCount: Number(donorCountResult[0]?.count || 0),
    };
  }

  /**
   * Hash IP for privacy
   */
  hashIP(ip: string): string {
    return createHash('sha256').update(ip + process.env.IP_SALT || 'fanz-salt').digest('hex').substring(0, 16);
  }
}

export const creatorAdService = new CreatorAdService();
