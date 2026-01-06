import { db } from "../db";
import { eq, and, inArray } from "drizzle-orm";
import {
  userPlatformAccess,
  universal2257Verification,
  platformVerificationLink,
  crossPlatformTagDisplay,
  crosspostCredits,
  users,
} from "@shared/schema";

// Platform definitions
export const PLATFORM_DEFINITIONS = [
  { id: 'boyfanz', name: 'BoyFanz', domain: 'boy.fanz.website', color: '#6366f1', category: 'male' },
  { id: 'girlfanz', name: 'GirlFanz', domain: 'girl.fanz.website', color: '#ec4899', category: 'female' },
  { id: 'gayfanz', name: 'GayFanz', domain: 'gay.fanz.website', color: '#f472b6', category: 'male' },
  { id: 'transfanz', name: 'TransFanz', domain: 'trans.fanz.website', color: '#14b8a6', category: 'trans' },
  { id: 'bearfanz', name: 'BearFanz', domain: 'bear.fanz.website', color: '#78716c', category: 'male' },
  { id: 'daddyfanz', name: 'DaddyFanz', domain: 'daddy.fanz.website', color: '#1e40af', category: 'male' },
  { id: 'pupfanz', name: 'PupFanz', domain: 'pup.fanz.website', color: '#059669', category: 'niche' },
  { id: 'milffanz', name: 'MILFFanz', domain: 'milf.fanz.website', color: '#be185d', category: 'female' },
  { id: 'cougarfanz', name: 'CougarFanz', domain: 'cougar.fanz.website', color: '#b45309', category: 'female' },
  { id: 'femmefanz', name: 'FemmeFanz', domain: 'femme.fanz.website', color: '#a855f7', category: 'female' },
  { id: 'taboofanz', name: 'TabooFanz', domain: 'taboo.fanz.website', color: '#7c3aed', category: 'niche' },
  { id: 'fanzuncut', name: 'FanzUncut', domain: 'uncut.fanz.website', color: '#dc2626', category: 'niche' },
  { id: 'brofanz', name: 'BroFanz', domain: 'bro.fanz.website', color: '#3b82f6', category: 'male' },
  { id: 'southernfanz', name: 'SouthernFanz', domain: 'southern.fanz.website', color: '#d97706', category: 'niche' },
  { id: 'dlbroz', name: 'DL Broz', domain: 'dlbroz.fanz.website', color: '#1f2937', category: 'male' },
  { id: 'guyz', name: 'Guyz', domain: 'guyz.fanz.website', color: '#0ea5e9', category: 'male' },
];

export class PlatformAccessService {
  /**
   * Get all platforms a user has access to
   */
  async getUserPlatforms(userId: string) {
    const access = await db
      .select()
      .from(userPlatformAccess)
      .where(eq(userPlatformAccess.userId, userId));

    return {
      platforms: access.map(a => a.platformId),
      platformDetails: access,
      notificationCounts: {}, // TODO: Aggregate from notifications table
    };
  }

  /**
   * Enable platform access for a user
   */
  async enablePlatform(userId: string, platformId: string) {
    const existing = await db
      .select()
      .from(userPlatformAccess)
      .where(
        and(
          eq(userPlatformAccess.userId, userId),
          eq(userPlatformAccess.platformId, platformId)
        )
      );

    if (existing.length > 0) {
      // Update status to active
      await db
        .update(userPlatformAccess)
        .set({ status: 'active', updatedAt: new Date() })
        .where(eq(userPlatformAccess.id, existing[0].id));
      return existing[0];
    }

    // Create new access
    const [access] = await db
      .insert(userPlatformAccess)
      .values({
        userId,
        platformId,
        status: 'active',
      })
      .returning();

    return access;
  }

  /**
   * Disable platform access for a user
   */
  async disablePlatform(userId: string, platformId: string) {
    await db
      .update(userPlatformAccess)
      .set({ status: 'inactive', updatedAt: new Date() })
      .where(
        and(
          eq(userPlatformAccess.userId, userId),
          eq(userPlatformAccess.platformId, platformId)
        )
      );
  }

  /**
   * Bulk enable multiple platforms during signup
   */
  async enableMultiplePlatforms(userId: string, platformIds: string[]) {
    const results = await Promise.all(
      platformIds.map(platformId => this.enablePlatform(userId, platformId))
    );
    return results;
  }

  /**
   * Sync profile data to enabled platforms
   */
  async syncProfileToAllPlatforms(userId: string) {
    const access = await db
      .select()
      .from(userPlatformAccess)
      .where(
        and(
          eq(userPlatformAccess.userId, userId),
          eq(userPlatformAccess.status, 'active')
        )
      );

    // Mark all as synced
    await db
      .update(userPlatformAccess)
      .set({ profileSynced: true, updatedAt: new Date() })
      .where(eq(userPlatformAccess.userId, userId));

    return access.map(a => a.platformId);
  }

  /**
   * Get universal 2257 verification for user
   */
  async getUniversalVerification(userId: string) {
    const verification = await db
      .select()
      .from(universal2257Verification)
      .where(
        and(
          eq(universal2257Verification.userId, userId),
          eq(universal2257Verification.status, 'active')
        )
      );

    if (verification.length === 0) return null;

    // Get linked platforms
    const links = await db
      .select()
      .from(platformVerificationLink)
      .where(eq(platformVerificationLink.verificationId, verification[0].id));

    return {
      ...verification[0],
      linkedPlatforms: links.map(l => l.platformId),
    };
  }

  /**
   * Create universal 2257 verification
   */
  async createUniversalVerification(
    userId: string,
    verificationType: string,
    verifiedBy: string,
    documentHash?: string,
    expirationDate?: Date
  ) {
    const [verification] = await db
      .insert(universal2257Verification)
      .values({
        userId,
        verificationType,
        verifiedBy,
        documentHash,
        expirationDate: expirationDate?.toISOString().split('T')[0],
        verifiedAt: new Date(),
        status: 'active',
      })
      .returning();

    return verification;
  }

  /**
   * Link verification to specific platforms
   */
  async linkVerificationToPlatforms(verificationId: string, platformIds: string[]) {
    const links = await Promise.all(
      platformIds.map(async (platformId) => {
        const [link] = await db
          .insert(platformVerificationLink)
          .values({
            verificationId,
            platformId,
            autoLinked: false,
          })
          .onConflictDoNothing()
          .returning();
        return link;
      })
    );

    return links.filter(Boolean);
  }

  /**
   * Share verification to all user's active platforms
   */
  async shareVerificationToAllPlatforms(userId: string, verificationId: string) {
    const platforms = await this.getUserPlatforms(userId);
    return this.linkVerificationToPlatforms(verificationId, platforms.platforms);
  }

  /**
   * Check if user is verified on a specific platform
   */
  async isVerifiedOnPlatform(userId: string, platformId: string): Promise<boolean> {
    const verification = await db
      .select()
      .from(universal2257Verification)
      .innerJoin(
        platformVerificationLink,
        eq(universal2257Verification.id, platformVerificationLink.verificationId)
      )
      .where(
        and(
          eq(universal2257Verification.userId, userId),
          eq(universal2257Verification.status, 'active'),
          eq(platformVerificationLink.platformId, platformId)
        )
      );

    return verification.length > 0;
  }

  /**
   * Get pending tag approvals for user
   */
  async getPendingTagApprovals(userId: string) {
    const pending = await db
      .select()
      .from(crossPlatformTagDisplay)
      .where(
        and(
          eq(crossPlatformTagDisplay.taggedUserId, userId),
          eq(crossPlatformTagDisplay.approvalStatus, 'pending')
        )
      );

    return pending;
  }

  /**
   * Approve tag and set display platforms
   */
  async approveTag(tagDisplayId: string, displayPlatforms: string[]) {
    const [updated] = await db
      .update(crossPlatformTagDisplay)
      .set({
        approvalStatus: 'approved',
        displayPlatforms,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(crossPlatformTagDisplay.id, tagDisplayId))
      .returning();

    return updated;
  }

  /**
   * Reject tag
   */
  async rejectTag(tagDisplayId: string) {
    const [updated] = await db
      .update(crossPlatformTagDisplay)
      .set({
        approvalStatus: 'rejected',
        updatedAt: new Date(),
      })
      .where(eq(crossPlatformTagDisplay.id, tagDisplayId))
      .returning();

    return updated;
  }

  /**
   * Get pending crosspost approvals for OP
   */
  async getPendingCrosspostApprovals(userId: string) {
    const pending = await db
      .select()
      .from(crosspostCredits)
      .where(
        and(
          eq(crosspostCredits.originalCreatorId, userId),
          eq(crosspostCredits.opApprovalStatus, 'pending')
        )
      );

    return pending;
  }

  /**
   * Approve crosspost credit
   */
  async approveCrosspostCredit(
    creditId: string,
    displaySettings?: { showCredit?: boolean; linkToProfile?: boolean; preferredPlatformLink?: string }
  ) {
    const [updated] = await db
      .update(crosspostCredits)
      .set({
        opApprovalStatus: 'approved',
        opApprovedAt: new Date(),
        displaySettings: displaySettings || { showCredit: true, linkToProfile: true },
        updatedAt: new Date(),
      })
      .where(eq(crosspostCredits.id, creditId))
      .returning();

    return updated;
  }

  /**
   * Reject crosspost credit
   */
  async rejectCrosspostCredit(creditId: string) {
    const [updated] = await db
      .update(crosspostCredits)
      .set({
        opApprovalStatus: 'rejected',
        updatedAt: new Date(),
      })
      .where(eq(crosspostCredits.id, creditId))
      .returning();

    return updated;
  }

  /**
   * Get all platform definitions
   */
  getPlatformDefinitions() {
    return PLATFORM_DEFINITIONS;
  }
}

export const platformAccessService = new PlatformAccessService();
