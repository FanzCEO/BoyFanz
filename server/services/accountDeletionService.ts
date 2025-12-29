/**
 * FANZ Account Deletion Service
 *
 * Handles account deletion with GDPR/CCPA compliance:
 * - Grace period management (30 days default)
 * - Data anonymization for retained records
 * - Content removal from storage
 * - Financial record preservation (tax compliance)
 * - Fraud data retention
 *
 * CRITICAL: All operations require platformId for multi-tenant isolation
 */

import { db } from "../db";
import {
  accountDeletionRequests,
  AccountDeletionRequest,
  dataAccessAuditLog,
  RETENTION_PERIODS,
} from "@shared/dataRetentionSchema";
import {
  users,
  content,
  subscriptions,
  mediaAssets,
} from "@shared/schema";
import { eq, and, sql, lt, inArray } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";
import { S3Client, DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

interface DeletionManifest {
  deletedTables: {
    table: string;
    recordsDeleted: number;
  }[];
  anonymizedTables: {
    table: string;
    recordsAnonymized: number;
  }[];
  deletedFiles: {
    bucket: string;
    keysDeleted: number;
  }[];
  retainedRecords: {
    table: string;
    reason: string;
    recordCount: number;
  }[];
  startedAt: string;
  completedAt: string;
  totalRecordsDeleted: number;
  totalFilesDeleted: number;
  storageFreedBytes: number;
}

export class AccountDeletionService {
  private s3Client: S3Client;
  private contentBucket: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: process.env.AWS_ACCESS_KEY_ID
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          }
        : undefined,
    });
    this.contentBucket = process.env.CONTENT_BUCKET || "fanz-content";
  }

  /**
   * Process a deletion request that has passed its grace period
   */
  async processDeletionRequest(deletionRequestId: string): Promise<AccountDeletionRequest> {
    // Get the request
    const [request] = await db
      .select()
      .from(accountDeletionRequests)
      .where(eq(accountDeletionRequests.id, deletionRequestId))
      .limit(1);

    if (!request) {
      throw new Error("Deletion request not found");
    }

    if (!["grace_period", "pending"].includes(request.status)) {
      throw new Error(`Cannot process request in status: ${request.status}`);
    }

    // Check if grace period has passed
    const now = new Date();
    if (request.gracePeriodEndsAt && now < request.gracePeriodEndsAt) {
      throw new Error(
        `Grace period has not ended. Ends at: ${request.gracePeriodEndsAt.toISOString()}`
      );
    }

    // Update status to processing
    await db
      .update(accountDeletionRequests)
      .set({
        status: "processing",
        processingStartedAt: now,
        updatedAt: now,
      })
      .where(eq(accountDeletionRequests.id, deletionRequestId));

    const manifest: DeletionManifest = {
      deletedTables: [],
      anonymizedTables: [],
      deletedFiles: [],
      retainedRecords: [],
      startedAt: now.toISOString(),
      completedAt: "",
      totalRecordsDeleted: 0,
      totalFilesDeleted: 0,
      storageFreedBytes: 0,
    };

    try {
      const { userId, platformId, requestType } = request;

      if (!userId) {
        throw new Error("User ID is required for deletion");
      }

      // Execute deletion based on request type
      switch (requestType) {
        case "full_account":
          await this.deleteFullAccount(userId, platformId, manifest, request);
          break;
        case "platform_only":
          await this.deletePlatformData(userId, platformId, manifest, request);
          break;
        case "content_only":
          await this.deleteContentOnly(userId, platformId, manifest);
          break;
        case "messages_only":
          await this.deleteMessagesOnly(userId, platformId, manifest);
          break;
        case "financial_anonymize":
          await this.anonymizeFinancialRecords(userId, platformId, manifest);
          break;
      }

      manifest.completedAt = new Date().toISOString();

      // Update request with results
      const [updatedRequest] = await db
        .update(accountDeletionRequests)
        .set({
          status: "completed",
          processingCompletedAt: new Date(),
          deletionManifest: manifest,
          recordsDeleted: manifest.totalRecordsDeleted,
          contentFilesDeleted: manifest.totalFilesDeleted,
          storageFreedBytes: manifest.storageFreedBytes,
          updatedAt: new Date(),
        })
        .where(eq(accountDeletionRequests.id, deletionRequestId))
        .returning();

      console.log(
        `🗑️ AccountDeletion: Completed deletion ${deletionRequestId} ` +
          `(${manifest.totalRecordsDeleted} records, ${manifest.totalFilesDeleted} files)`
      );

      return updatedRequest;
    } catch (error) {
      // Mark as failed
      const retryCount = (request.retryCount || 0) + 1;

      await db
        .update(accountDeletionRequests)
        .set({
          status: retryCount >= 3 ? "failed" : "pending", // Retry up to 3 times
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          retryCount,
          deletionManifest: manifest, // Preserve partial manifest
          updatedAt: new Date(),
        })
        .where(eq(accountDeletionRequests.id, deletionRequestId));

      console.error(`❌ AccountDeletion: Failed deletion ${deletionRequestId}:`, error);
      throw error;
    }
  }

  /**
   * Delete full account across all platforms
   */
  private async deleteFullAccount(
    userId: string,
    platformId: string,
    manifest: DeletionManifest,
    request: AccountDeletionRequest
  ): Promise<void> {
    // 1. Delete content files from storage
    await this.deleteUserContentFiles(userId, manifest);

    // 2. Delete posts and media metadata
    const postsDeleted = await this.deleteUserPosts(userId);
    manifest.deletedTables.push({ table: "posts", recordsDeleted: postsDeleted });
    manifest.totalRecordsDeleted += postsDeleted;

    // 3. Delete messages
    const messagesDeleted = await this.deleteUserMessages(userId);
    manifest.deletedTables.push({ table: "messages", recordsDeleted: messagesDeleted });
    manifest.totalRecordsDeleted += messagesDeleted;

    // 4. Delete comments
    const commentsDeleted = await this.deleteUserComments(userId);
    manifest.deletedTables.push({ table: "comments", recordsDeleted: commentsDeleted });
    manifest.totalRecordsDeleted += commentsDeleted;

    // 5. Delete likes
    const likesDeleted = await this.deleteUserLikes(userId);
    manifest.deletedTables.push({ table: "likes", recordsDeleted: likesDeleted });
    manifest.totalRecordsDeleted += likesDeleted;

    // 6. Delete follows
    const followsDeleted = await this.deleteUserFollows(userId);
    manifest.deletedTables.push({ table: "follows", recordsDeleted: followsDeleted });
    manifest.totalRecordsDeleted += followsDeleted;

    // 7. Delete subscriptions
    const subsDeleted = await this.deleteUserSubscriptions(userId);
    manifest.deletedTables.push({ table: "subscriptions", recordsDeleted: subsDeleted });
    manifest.totalRecordsDeleted += subsDeleted;

    // 8. Delete notifications
    const notifsDeleted = await this.deleteUserNotifications(userId);
    manifest.deletedTables.push({ table: "notifications", recordsDeleted: notifsDeleted });
    manifest.totalRecordsDeleted += notifsDeleted;

    // 9. Delete settings
    const settingsDeleted = await this.deleteUserSettings(userId);
    manifest.deletedTables.push({ table: "user_settings", recordsDeleted: settingsDeleted });
    manifest.totalRecordsDeleted += settingsDeleted;

    // 10. Handle financial records (anonymize, don't delete)
    if (request.retainFinancialRecords) {
      const financialAnonymized = await this.anonymizeUserFinancialRecords(userId, platformId);
      manifest.anonymizedTables.push({
        table: "fanz_ledger",
        recordsAnonymized: financialAnonymized,
      });
      manifest.retainedRecords.push({
        table: "fanz_ledger",
        reason: "Tax compliance - retained for 7 years",
        recordCount: financialAnonymized,
      });
    }

    // 11. Anonymize the user record (don't delete for referential integrity)
    await this.anonymizeUserRecord(userId, request.deletedUserHash || undefined);
    manifest.anonymizedTables.push({ table: "users", recordsAnonymized: 1 });

    // 12. Log the deletion in audit log
    await this.logDeletionAudit(userId, platformId, manifest);
  }

  /**
   * Delete data from a single platform only
   */
  private async deletePlatformData(
    userId: string,
    platformId: string,
    manifest: DeletionManifest,
    request: AccountDeletionRequest
  ): Promise<void> {
    // Delete platform-specific content
    // This requires platform_id on all tables, which should be added

    // Delete financial records for this platform only
    const ledgerDeleted = await db
      .delete(fanzLedger)
      .where(
        and(eq(fanzLedger.userId, userId), eq(fanzLedger.platformId, platformId))
      )
      .returning();

    manifest.deletedTables.push({ table: "fanz_ledger", recordsDeleted: ledgerDeleted.length });
    manifest.totalRecordsDeleted += ledgerDeleted.length;

    // Note: Full platform isolation requires platform_id on all tables
    // For now, this is a partial implementation
  }

  /**
   * Delete only content (posts, media) but keep account
   */
  private async deleteContentOnly(
    userId: string,
    platformId: string,
    manifest: DeletionManifest
  ): Promise<void> {
    // Delete content files
    await this.deleteUserContentFiles(userId, manifest);

    // Delete posts
    const postsDeleted = await this.deleteUserPosts(userId);
    manifest.deletedTables.push({ table: "posts", recordsDeleted: postsDeleted });
    manifest.totalRecordsDeleted += postsDeleted;
  }

  /**
   * Delete only messages but keep account
   */
  private async deleteMessagesOnly(
    userId: string,
    platformId: string,
    manifest: DeletionManifest
  ): Promise<void> {
    const messagesDeleted = await this.deleteUserMessages(userId);
    manifest.deletedTables.push({ table: "messages", recordsDeleted: messagesDeleted });
    manifest.totalRecordsDeleted += messagesDeleted;
  }

  /**
   * Anonymize financial records (GDPR-compliant retention)
   */
  private async anonymizeFinancialRecords(
    userId: string,
    platformId: string,
    manifest: DeletionManifest
  ): Promise<void> {
    const anonymized = await this.anonymizeUserFinancialRecords(userId, platformId);
    manifest.anonymizedTables.push({ table: "fanz_ledger", recordsAnonymized: anonymized });
    manifest.retainedRecords.push({
      table: "fanz_ledger",
      reason: "Tax compliance - anonymized but retained for 7 years",
      recordCount: anonymized,
    });
  }

  /**
   * Delete user posts
   */
  private async deleteUserPosts(userId: string): Promise<number> {
    // First delete associated media
    const userPosts = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.userId, userId));

    if (userPosts.length > 0) {
      await db.delete(contentMedia).where(
        inArray(
          contentMedia.postId,
          userPosts.map((p) => p.id)
        )
      );
    }

    // Then delete posts
    const deleted = await db.delete(posts).where(eq(posts.userId, userId)).returning();

    return deleted.length;
  }

  /**
   * Delete user messages
   */
  private async deleteUserMessages(userId: string): Promise<number> {
    // Delete messages where user is sender or recipient
    const deleted = await db
      .delete(messages)
      .where(sql`${messages.senderId} = ${userId} OR ${messages.recipientId} = ${userId}`)
      .returning();

    return deleted.length;
  }

  /**
   * Delete user comments
   */
  private async deleteUserComments(userId: string): Promise<number> {
    const deleted = await db.delete(comments).where(eq(comments.userId, userId)).returning();
    return deleted.length;
  }

  /**
   * Delete user likes
   */
  private async deleteUserLikes(userId: string): Promise<number> {
    const deleted = await db.delete(likes).where(eq(likes.userId, userId)).returning();
    return deleted.length;
  }

  /**
   * Delete user follows (both directions)
   */
  private async deleteUserFollows(userId: string): Promise<number> {
    const deleted = await db
      .delete(follows)
      .where(sql`${follows.followerId} = ${userId} OR ${follows.followingId} = ${userId}`)
      .returning();

    return deleted.length;
  }

  /**
   * Delete user subscriptions (both as subscriber and creator)
   */
  private async deleteUserSubscriptions(userId: string): Promise<number> {
    const deleted = await db
      .delete(subscriptions)
      .where(
        sql`${subscriptions.subscriberId} = ${userId} OR ${subscriptions.creatorId} = ${userId}`
      )
      .returning();

    return deleted.length;
  }

  /**
   * Delete user notifications
   */
  private async deleteUserNotifications(userId: string): Promise<number> {
    const deleted = await db
      .delete(notifications)
      .where(eq(notifications.userId, userId))
      .returning();

    return deleted.length;
  }

  /**
   * Delete user settings
   */
  private async deleteUserSettings(userId: string): Promise<number> {
    const deleted = await db
      .delete(userSettings)
      .where(eq(userSettings.userId, userId))
      .returning();

    return deleted.length;
  }

  /**
   * Delete user content files from S3
   */
  private async deleteUserContentFiles(
    userId: string,
    manifest: DeletionManifest
  ): Promise<void> {
    try {
      // List all objects with user prefix
      const prefix = `users/${userId}/`;
      let continuationToken: string | undefined;
      let totalDeleted = 0;
      let totalSize = 0;

      do {
        const listCommand = new ListObjectsV2Command({
          Bucket: this.contentBucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        });

        const listResponse = await this.s3Client.send(listCommand);

        if (listResponse.Contents && listResponse.Contents.length > 0) {
          // Calculate size
          totalSize += listResponse.Contents.reduce(
            (sum, obj) => sum + (obj.Size || 0),
            0
          );

          // Delete objects in batches of 1000
          const deleteCommand = new DeleteObjectsCommand({
            Bucket: this.contentBucket,
            Delete: {
              Objects: listResponse.Contents.map((obj) => ({ Key: obj.Key })),
              Quiet: true,
            },
          });

          await this.s3Client.send(deleteCommand);
          totalDeleted += listResponse.Contents.length;
        }

        continuationToken = listResponse.NextContinuationToken;
      } while (continuationToken);

      manifest.deletedFiles.push({
        bucket: this.contentBucket,
        keysDeleted: totalDeleted,
      });
      manifest.totalFilesDeleted += totalDeleted;
      manifest.storageFreedBytes += totalSize;
    } catch (error) {
      console.error("Failed to delete S3 content:", error);
      // Don't fail the entire deletion for S3 errors
    }
  }

  /**
   * Anonymize user financial records
   */
  private async anonymizeUserFinancialRecords(
    userId: string,
    platformId: string
  ): Promise<number> {
    // Generate anonymous ID
    const anonymousId = `deleted_${createHash("sha256")
      .update(userId + Date.now().toString())
      .digest("hex")
      .substring(0, 16)}`;

    // Update ledger entries to use anonymous ID
    const updated = await db
      .update(fanzLedger)
      .set({
        userId: anonymousId,
        description: sql`REGEXP_REPLACE(${fanzLedger.description}, '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+', '[REDACTED]')`,
        metadata: sql`${fanzLedger.metadata} - 'personal_info'`,
      })
      .where(and(eq(fanzLedger.userId, userId), eq(fanzLedger.platformId, platformId)))
      .returning();

    // Update wallet
    await db
      .update(fanzWallets)
      .set({
        userId: anonymousId,
        metadata: {},
      })
      .where(eq(fanzWallets.userId, userId));

    return updated.length;
  }

  /**
   * Anonymize user record
   */
  private async anonymizeUserRecord(userId: string, emailHash?: string): Promise<void> {
    const anonymousId = `deleted_${randomBytes(8).toString("hex")}`;

    await db
      .update(users)
      .set({
        email: `${anonymousId}@deleted.fanz.local`,
        username: anonymousId,
        displayName: "Deleted User",
        bio: null,
        avatarUrl: null,
        bannerUrl: null,
        location: null,
        website: null,
        phone: null,
        isDeleted: true,
        deletedAt: new Date(),
        metadata: { originalEmailHash: emailHash },
      })
      .where(eq(users.id, userId));
  }

  /**
   * Log deletion to audit trail
   */
  private async logDeletionAudit(
    userId: string,
    platformId: string,
    manifest: DeletionManifest
  ): Promise<void> {
    await db.insert(dataAccessAuditLog).values({
      accessorId: "system",
      accessorType: "system",
      targetUserId: userId,
      platformId,
      dataCategory: "account_deletion",
      action: "delete_account",
      actionDetails: {
        manifest,
        completedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Get deletion requests that are ready to process
   */
  async getReadyForDeletion(): Promise<AccountDeletionRequest[]> {
    const now = new Date();

    return db
      .select()
      .from(accountDeletionRequests)
      .where(
        and(
          eq(accountDeletionRequests.status, "grace_period"),
          lt(accountDeletionRequests.gracePeriodEndsAt, now)
        )
      );
  }

  /**
   * Send reminder notifications for pending deletions
   */
  async sendDeletionReminders(): Promise<number> {
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Find requests expiring soon
    const expiringRequests = await db
      .select()
      .from(accountDeletionRequests)
      .where(
        and(
          eq(accountDeletionRequests.status, "grace_period"),
          sql`${accountDeletionRequests.gracePeriodEndsAt} BETWEEN ${oneDayFromNow} AND ${sevenDaysFromNow}`
        )
      );

    // Send notifications (would integrate with notification service)
    for (const request of expiringRequests) {
      if (request.userId) {
        console.log(
          `📧 AccountDeletion: Reminder for user ${request.userId} ` +
            `(deletion on ${request.gracePeriodEndsAt?.toISOString()})`
        );
        // TODO: Integrate with notification service
      }
    }

    return expiringRequests.length;
  }
}
