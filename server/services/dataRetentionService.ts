/**
 * FANZ Data Retention Service
 *
 * Central orchestrator for GDPR/CCPA compliance:
 * - Data export requests
 * - Account deletion requests
 * - Retention policy enforcement
 * - Audit logging
 *
 * CRITICAL: All operations require platformId for multi-tenant isolation
 */

import { db } from "../db";
import {
  dataExportRequests,
  accountDeletionRequests,
  retentionPolicies,
  dataAccessAuditLog,
  userConsents,
  legalHolds,
  DataExportRequest,
  AccountDeletionRequest,
  RetentionPolicy,
  UserConsent,
  LegalHold,
  DATA_CATEGORIES,
  RETENTION_PERIODS,
} from "@shared/dataRetentionSchema";
import { users, posts, messages, subscriptions, fanzLedger } from "@shared/schema";
import { eq, and, lt, gt, isNull, sql, desc, inArray } from "drizzle-orm";
import { createHash } from "crypto";

export class DataRetentionService {
  /**
   * Request data export for a user
   * GDPR Article 20 - Right to Data Portability
   */
  async requestDataExport(params: {
    userId: string;
    platformId: string;
    includeProfile?: boolean;
    includeContent?: boolean;
    includeMessages?: boolean;
    includeTransactions?: boolean;
    includeSubscriptions?: boolean;
    includePurchases?: boolean;
    includeEarnings?: boolean;
    includeActivityLogs?: boolean;
    format?: "json" | "csv" | "zip";
    requestedIp?: string;
    requestedUserAgent?: string;
  }): Promise<DataExportRequest> {
    const { userId, platformId } = params;

    // Validate platformId
    if (!platformId) {
      throw new Error("platformId is required for data export requests");
    }

    // Check for existing pending/processing requests
    const existingRequest = await db
      .select()
      .from(dataExportRequests)
      .where(
        and(
          eq(dataExportRequests.userId, userId),
          eq(dataExportRequests.platformId, platformId),
          inArray(dataExportRequests.status, ["pending", "processing"])
        )
      )
      .limit(1);

    if (existingRequest.length > 0) {
      throw new Error("An export request is already in progress");
    }

    // Create export request
    const [exportRequest] = await db
      .insert(dataExportRequests)
      .values({
        userId,
        platformId,
        includeProfile: params.includeProfile ?? true,
        includeContent: params.includeContent ?? true,
        includeMessages: params.includeMessages ?? true,
        includeTransactions: params.includeTransactions ?? true,
        includeSubscriptions: params.includeSubscriptions ?? true,
        includePurchases: params.includePurchases ?? true,
        includeEarnings: params.includeEarnings ?? true,
        includeActivityLogs: params.includeActivityLogs ?? false,
        format: params.format ?? "json",
        requestedIp: params.requestedIp,
        requestedUserAgent: params.requestedUserAgent,
      })
      .returning();

    // Log the request
    await this.logDataAccess({
      accessorId: userId,
      accessorType: "user",
      accessorIp: params.requestedIp,
      accessorUserAgent: params.requestedUserAgent,
      targetUserId: userId,
      platformId,
      dataCategory: "export_request",
      action: "request_export",
      actionDetails: { exportRequestId: exportRequest.id },
    });

    console.log(`📦 DataRetention: Export requested for user ${userId} on ${platformId}`);

    return exportRequest;
  }

  /**
   * Request account deletion
   * GDPR Article 17 - Right to Erasure
   */
  async requestAccountDeletion(params: {
    userId: string;
    platformId: string;
    requestType?: "full_account" | "platform_only" | "content_only" | "messages_only" | "financial_anonymize";
    reason?: string;
    gracePeriodDays?: number;
    requestedIp?: string;
    requestedUserAgent?: string;
  }): Promise<AccountDeletionRequest> {
    const { userId, platformId } = params;

    // Validate platformId
    if (!platformId) {
      throw new Error("platformId is required for deletion requests");
    }

    // Check for legal holds
    const activeLegalHolds = await this.checkLegalHolds(userId, platformId);
    if (activeLegalHolds.length > 0) {
      throw new Error(
        `Account is under legal hold (Case: ${activeLegalHolds[0].caseReference}). Deletion not permitted.`
      );
    }

    // Check for existing pending requests
    const existingRequest = await db
      .select()
      .from(accountDeletionRequests)
      .where(
        and(
          eq(accountDeletionRequests.userId, userId),
          eq(accountDeletionRequests.platformId, platformId),
          inArray(accountDeletionRequests.status, ["pending", "grace_period", "processing"])
        )
      )
      .limit(1);

    if (existingRequest.length > 0) {
      throw new Error("A deletion request is already in progress");
    }

    // Calculate grace period
    const gracePeriodDays = params.gracePeriodDays ?? RETENTION_PERIODS.DELETED_ACCOUNT_GRACE;
    const now = new Date();
    const gracePeriodEndsAt = new Date(now.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000);
    const scheduledDeletionAt = gracePeriodEndsAt;

    // Get user email for audit trail (will be hashed)
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const emailHash = user?.email
      ? createHash("sha256").update(user.email.toLowerCase()).digest("hex")
      : null;

    // Create deletion request
    const [deletionRequest] = await db
      .insert(accountDeletionRequests)
      .values({
        userId,
        platformId,
        requestType: params.requestType ?? "full_account",
        status: "grace_period",
        reason: params.reason,
        gracePeriodDays,
        gracePeriodEndsAt,
        canCancelUntil: gracePeriodEndsAt,
        scheduledDeletionAt,
        retainFinancialRecords: true, // Tax compliance
        retainFraudData: true, // Fraud prevention
        requestedIp: params.requestedIp,
        requestedUserAgent: params.requestedUserAgent,
        deletedUserHash: emailHash,
      })
      .returning();

    // Log the request
    await this.logDataAccess({
      accessorId: userId,
      accessorType: "user",
      accessorIp: params.requestedIp,
      accessorUserAgent: params.requestedUserAgent,
      targetUserId: userId,
      platformId,
      dataCategory: "deletion_request",
      action: "request_deletion",
      actionDetails: {
        deletionRequestId: deletionRequest.id,
        requestType: params.requestType ?? "full_account",
        gracePeriodDays,
      },
    });

    console.log(
      `🗑️ DataRetention: Deletion requested for user ${userId} on ${platformId} ` +
        `(grace period ends: ${gracePeriodEndsAt.toISOString()})`
    );

    return deletionRequest;
  }

  /**
   * Cancel account deletion (during grace period)
   */
  async cancelAccountDeletion(params: {
    deletionRequestId: string;
    userId: string;
    platformId: string;
    cancelledIp?: string;
  }): Promise<AccountDeletionRequest> {
    const { deletionRequestId, userId, platformId } = params;

    if (!platformId) {
      throw new Error("platformId is required for cancellation");
    }

    // Get the request
    const [request] = await db
      .select()
      .from(accountDeletionRequests)
      .where(
        and(
          eq(accountDeletionRequests.id, deletionRequestId),
          eq(accountDeletionRequests.userId, userId),
          eq(accountDeletionRequests.platformId, platformId)
        )
      )
      .limit(1);

    if (!request) {
      throw new Error("Deletion request not found");
    }

    if (request.status !== "grace_period") {
      throw new Error(`Cannot cancel deletion request in status: ${request.status}`);
    }

    const now = new Date();
    if (request.canCancelUntil && now > request.canCancelUntil) {
      throw new Error("Grace period has expired, deletion cannot be cancelled");
    }

    // Cancel the request
    const [updatedRequest] = await db
      .update(accountDeletionRequests)
      .set({
        status: "cancelled",
        updatedAt: now,
      })
      .where(eq(accountDeletionRequests.id, deletionRequestId))
      .returning();

    // Log the cancellation
    await this.logDataAccess({
      accessorId: userId,
      accessorType: "user",
      accessorIp: params.cancelledIp,
      targetUserId: userId,
      platformId,
      dataCategory: "deletion_request",
      action: "cancel_deletion",
      actionDetails: { deletionRequestId },
    });

    console.log(`✅ DataRetention: Deletion cancelled for user ${userId} on ${platformId}`);

    return updatedRequest;
  }

  /**
   * Get user's data export requests
   */
  async getExportRequests(params: {
    userId: string;
    platformId: string;
    limit?: number;
  }): Promise<DataExportRequest[]> {
    const { userId, platformId, limit = 10 } = params;

    if (!platformId) {
      throw new Error("platformId is required");
    }

    return db
      .select()
      .from(dataExportRequests)
      .where(
        and(
          eq(dataExportRequests.userId, userId),
          eq(dataExportRequests.platformId, platformId)
        )
      )
      .orderBy(desc(dataExportRequests.createdAt))
      .limit(limit);
  }

  /**
   * Get user's deletion requests
   */
  async getDeletionRequests(params: {
    userId: string;
    platformId: string;
    limit?: number;
  }): Promise<AccountDeletionRequest[]> {
    const { userId, platformId, limit = 10 } = params;

    if (!platformId) {
      throw new Error("platformId is required");
    }

    return db
      .select()
      .from(accountDeletionRequests)
      .where(
        and(
          eq(accountDeletionRequests.userId, userId),
          eq(accountDeletionRequests.platformId, platformId)
        )
      )
      .orderBy(desc(accountDeletionRequests.createdAt))
      .limit(limit);
  }

  /**
   * Check for active legal holds affecting a user
   */
  async checkLegalHolds(userId: string, platformId: string): Promise<LegalHold[]> {
    const now = new Date();

    const holds = await db
      .select()
      .from(legalHolds)
      .where(
        and(
          eq(legalHolds.isActive, true),
          lt(legalHolds.holdStartDate, now)
        )
      );

    // Filter holds that affect this user
    return holds.filter((hold) => {
      const affectedUsers = (hold.affectedUserIds as string[]) || [];
      const affectedPlatforms = (hold.affectedPlatformIds as string[]) || [];

      const userAffected =
        affectedUsers.length === 0 || affectedUsers.includes(userId);
      const platformAffected =
        affectedPlatforms.length === 0 || affectedPlatforms.includes(platformId);

      // Check if hold has ended
      if (hold.holdEndDate && now > hold.holdEndDate) {
        return false;
      }

      return userAffected && platformAffected;
    });
  }

  /**
   * Get or create retention policy
   */
  async getRetentionPolicy(params: {
    platformId?: string;
    dataCategory: string;
  }): Promise<RetentionPolicy | null> {
    const { platformId, dataCategory } = params;

    // First try platform-specific policy
    if (platformId) {
      const [platformPolicy] = await db
        .select()
        .from(retentionPolicies)
        .where(
          and(
            eq(retentionPolicies.platformId, platformId),
            eq(retentionPolicies.dataCategory, dataCategory),
            eq(retentionPolicies.isActive, true)
          )
        )
        .limit(1);

      if (platformPolicy) return platformPolicy;
    }

    // Fall back to global policy
    const [globalPolicy] = await db
      .select()
      .from(retentionPolicies)
      .where(
        and(
          isNull(retentionPolicies.platformId),
          eq(retentionPolicies.dataCategory, dataCategory),
          eq(retentionPolicies.isActive, true)
        )
      )
      .limit(1);

    return globalPolicy || null;
  }

  /**
   * Record user consent
   */
  async recordConsent(params: {
    userId: string;
    platformId: string;
    consentType: string;
    granted: boolean;
    version: string;
    consentText?: string;
    consentMethod?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<UserConsent> {
    const { userId, platformId } = params;

    if (!platformId) {
      throw new Error("platformId is required for consent recording");
    }

    const now = new Date();

    // Update existing or insert new
    const [consent] = await db
      .insert(userConsents)
      .values({
        userId,
        platformId,
        consentType: params.consentType,
        status: params.granted ? "granted" : "withdrawn",
        version: params.version,
        consentText: params.consentText,
        grantedAt: params.granted ? now : undefined,
        withdrawnAt: params.granted ? undefined : now,
        consentMethod: params.consentMethod,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      })
      .onConflictDoUpdate({
        target: [userConsents.userId, userConsents.platformId, userConsents.consentType],
        set: {
          status: params.granted ? "granted" : "withdrawn",
          version: params.version,
          grantedAt: params.granted ? now : undefined,
          withdrawnAt: params.granted ? undefined : now,
          consentMethod: params.consentMethod,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          updatedAt: now,
        },
      })
      .returning();

    console.log(
      `📝 DataRetention: Consent ${params.granted ? "granted" : "withdrawn"} ` +
        `for ${params.consentType} by user ${userId} on ${platformId}`
    );

    return consent;
  }

  /**
   * Get user's consents
   */
  async getUserConsents(params: {
    userId: string;
    platformId: string;
  }): Promise<UserConsent[]> {
    const { userId, platformId } = params;

    if (!platformId) {
      throw new Error("platformId is required");
    }

    return db
      .select()
      .from(userConsents)
      .where(
        and(
          eq(userConsents.userId, userId),
          eq(userConsents.platformId, platformId)
        )
      );
  }

  /**
   * Log data access for audit trail
   */
  async logDataAccess(params: {
    accessorId?: string;
    accessorType: "user" | "admin" | "system" | "api";
    accessorIp?: string;
    accessorUserAgent?: string;
    targetUserId: string;
    platformId: string;
    dataCategory: string;
    dataIds?: string[];
    action: string;
    actionDetails?: Record<string, any>;
    legalBasis?: string;
    consentId?: string;
    requestId?: string;
    sessionId?: string;
  }): Promise<void> {
    const { platformId } = params;

    if (!platformId) {
      throw new Error("platformId is required for audit logging");
    }

    await db.insert(dataAccessAuditLog).values({
      accessorId: params.accessorId,
      accessorType: params.accessorType,
      accessorIp: params.accessorIp,
      accessorUserAgent: params.accessorUserAgent,
      targetUserId: params.targetUserId,
      platformId,
      dataCategory: params.dataCategory,
      dataIds: params.dataIds || [],
      action: params.action,
      actionDetails: params.actionDetails || {},
      legalBasis: params.legalBasis,
      consentId: params.consentId,
      requestId: params.requestId,
      sessionId: params.sessionId,
    });
  }

  /**
   * Get data access audit log for a user
   */
  async getAuditLog(params: {
    targetUserId: string;
    platformId: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<any[]> {
    const { targetUserId, platformId, startDate, endDate, limit = 100 } = params;

    if (!platformId) {
      throw new Error("platformId is required");
    }

    let query = db
      .select()
      .from(dataAccessAuditLog)
      .where(
        and(
          eq(dataAccessAuditLog.targetUserId, targetUserId),
          eq(dataAccessAuditLog.platformId, platformId)
        )
      );

    // Add date filters if provided
    // Note: Would need to add these conditions properly with drizzle

    return query.orderBy(desc(dataAccessAuditLog.createdAt)).limit(limit);
  }

  /**
   * Create a legal hold
   */
  async createLegalHold(params: {
    name: string;
    description?: string;
    caseReference?: string;
    affectedUserIds?: string[];
    affectedPlatformIds?: string[];
    dataCategories?: string[];
    holdStartDate: Date;
    holdEndDate?: Date;
    createdBy: string;
    approvedBy?: string;
  }): Promise<LegalHold> {
    const [hold] = await db
      .insert(legalHolds)
      .values({
        name: params.name,
        description: params.description,
        caseReference: params.caseReference,
        affectedUserIds: params.affectedUserIds || [],
        affectedPlatformIds: params.affectedPlatformIds || [],
        dataCategories: params.dataCategories || [],
        holdStartDate: params.holdStartDate,
        holdEndDate: params.holdEndDate,
        createdBy: params.createdBy,
        approvedBy: params.approvedBy,
        isActive: true,
      })
      .returning();

    console.log(`⚖️ DataRetention: Legal hold created - ${hold.id} (Case: ${params.caseReference})`);

    return hold;
  }

  /**
   * Release a legal hold
   */
  async releaseLegalHold(params: {
    holdId: string;
    releasedBy: string;
  }): Promise<LegalHold> {
    const [hold] = await db
      .update(legalHolds)
      .set({
        isActive: false,
        holdEndDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(legalHolds.id, params.holdId))
      .returning();

    if (!hold) {
      throw new Error("Legal hold not found");
    }

    console.log(`⚖️ DataRetention: Legal hold released - ${hold.id}`);

    return hold;
  }

  /**
   * Get summary statistics for admin dashboard
   */
  async getRetentionStats(platformId: string): Promise<{
    pendingExports: number;
    pendingDeletions: number;
    activeLegalHolds: number;
    exportsThisMonth: number;
    deletionsThisMonth: number;
  }> {
    if (!platformId) {
      throw new Error("platformId is required");
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [stats] = await db
      .select({
        pendingExports: sql<number>`
          (SELECT COUNT(*) FROM data_export_requests
           WHERE platform_id = ${platformId}
           AND status IN ('pending', 'processing'))
        `,
        pendingDeletions: sql<number>`
          (SELECT COUNT(*) FROM account_deletion_requests
           WHERE platform_id = ${platformId}
           AND status IN ('pending', 'grace_period', 'processing'))
        `,
        activeLegalHolds: sql<number>`
          (SELECT COUNT(*) FROM legal_holds WHERE is_active = true)
        `,
        exportsThisMonth: sql<number>`
          (SELECT COUNT(*) FROM data_export_requests
           WHERE platform_id = ${platformId}
           AND created_at >= ${monthStart})
        `,
        deletionsThisMonth: sql<number>`
          (SELECT COUNT(*) FROM account_deletion_requests
           WHERE platform_id = ${platformId}
           AND created_at >= ${monthStart})
        `,
      })
      .from(sql`(SELECT 1) as dummy`);

    return {
      pendingExports: Number(stats?.pendingExports || 0),
      pendingDeletions: Number(stats?.pendingDeletions || 0),
      activeLegalHolds: Number(stats?.activeLegalHolds || 0),
      exportsThisMonth: Number(stats?.exportsThisMonth || 0),
      deletionsThisMonth: Number(stats?.deletionsThisMonth || 0),
    };
  }
}
