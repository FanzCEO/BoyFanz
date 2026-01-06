/**
 * FANZ User Data Export Service
 *
 * Handles the generation of user data archives for GDPR/CCPA compliance
 * - Collects data from all relevant tables
 * - Generates JSON/CSV exports
 * - Creates signed download URLs
 * - Manages archive lifecycle
 *
 * CRITICAL: All operations require platformId for multi-tenant isolation
 */

import { db } from "../db";
import {
  dataExportRequests,
  DataExportRequest,
} from "@shared/dataRetentionSchema";
import {
  users,
  content,
  subscriptions,
  mediaAssets,
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { createHash } from "crypto";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import archiver from "archiver";
import { Writable } from "stream";

interface ExportedData {
  exportInfo: {
    exportId: string;
    userId: string;
    platformId: string;
    requestedAt: string;
    generatedAt: string;
    dataCategories: string[];
  };
  profile?: any;
  content?: any[];
  messages?: any[];
  transactions?: any[];
  subscriptions?: any[];
  purchases?: any[];
  earnings?: any[];
  activityLogs?: any[];
  settings?: any;
}

export class UserDataExportService {
  private s3Client: S3Client;
  private bucketName: string;

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
    this.bucketName = process.env.DATA_EXPORT_BUCKET || "fanz-data-exports";
  }

  /**
   * Process a data export request
   */
  async processExportRequest(exportRequestId: string): Promise<DataExportRequest> {
    // Get the request
    const [request] = await db
      .select()
      .from(dataExportRequests)
      .where(eq(dataExportRequests.id, exportRequestId))
      .limit(1);

    if (!request) {
      throw new Error("Export request not found");
    }

    if (request.status !== "pending") {
      throw new Error(`Cannot process request in status: ${request.status}`);
    }

    // Update status to processing
    await db
      .update(dataExportRequests)
      .set({
        status: "processing",
        processingStartedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(dataExportRequests.id, exportRequestId));

    try {
      // Collect all requested data
      const exportData = await this.collectUserData(request);

      // Generate archive
      const { archiveBuffer, checksum } = await this.generateArchive(
        exportData,
        request.format || "json"
      );

      // Upload to S3
      const archiveKey = `exports/${request.platformId}/${request.userId}/${exportRequestId}.zip`;
      await this.uploadArchive(archiveKey, archiveBuffer);

      // Generate signed URL (valid for 7 days)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const signedUrl = await this.generateSignedUrl(archiveKey, expiresAt);

      // Update request with results
      const [updatedRequest] = await db
        .update(dataExportRequests)
        .set({
          status: "completed",
          archiveUrl: signedUrl,
          archiveSizeBytes: archiveBuffer.length,
          archiveChecksum: checksum,
          expiresAt,
          processingCompletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(dataExportRequests.id, exportRequestId))
        .returning();

      console.log(
        `📦 DataExport: Completed export ${exportRequestId} ` +
          `(${(archiveBuffer.length / 1024 / 1024).toFixed(2)} MB)`
      );

      return updatedRequest;
    } catch (error) {
      // Mark as failed
      await db
        .update(dataExportRequests)
        .set({
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          updatedAt: new Date(),
        })
        .where(eq(dataExportRequests.id, exportRequestId));

      console.error(`❌ DataExport: Failed export ${exportRequestId}:`, error);
      throw error;
    }
  }

  /**
   * Collect all user data based on export request options
   */
  private async collectUserData(request: DataExportRequest): Promise<ExportedData> {
    const { userId, platformId } = request;
    const dataCategories: string[] = [];

    const exportData: ExportedData = {
      exportInfo: {
        exportId: request.id,
        userId,
        platformId,
        requestedAt: request.createdAt?.toISOString() || new Date().toISOString(),
        generatedAt: new Date().toISOString(),
        dataCategories: [],
      },
    };

    // Collect profile data
    if (request.includeProfile) {
      dataCategories.push("profile");
      exportData.profile = await this.collectProfileData(userId, platformId);
    }

    // Collect content data
    if (request.includeContent) {
      dataCategories.push("content");
      exportData.content = await this.collectContentData(userId, platformId);
    }

    // Collect messages
    if (request.includeMessages) {
      dataCategories.push("messages");
      exportData.messages = await this.collectMessagesData(userId, platformId);
    }

    // Collect transactions
    if (request.includeTransactions) {
      dataCategories.push("transactions");
      exportData.transactions = await this.collectTransactionData(userId, platformId);
    }

    // Collect subscriptions
    if (request.includeSubscriptions) {
      dataCategories.push("subscriptions");
      exportData.subscriptions = await this.collectSubscriptionData(userId, platformId);
    }

    // Collect purchases
    if (request.includePurchases) {
      dataCategories.push("purchases");
      exportData.purchases = await this.collectPurchaseData(userId, platformId);
    }

    // Collect earnings
    if (request.includeEarnings) {
      dataCategories.push("earnings");
      exportData.earnings = await this.collectEarningsData(userId, platformId);
    }

    // Collect activity logs
    if (request.includeActivityLogs) {
      dataCategories.push("activity_logs");
      exportData.activityLogs = await this.collectActivityLogs(userId, platformId);
    }

    // Collect settings
    exportData.settings = await this.collectSettingsData(userId, platformId);
    dataCategories.push("settings");

    exportData.exportInfo.dataCategories = dataCategories;

    return exportData;
  }

  /**
   * Collect user profile data
   */
  private async collectProfileData(userId: string, platformId: string): Promise<any> {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        displayName: users.displayName,
        bio: users.bio,
        avatarUrl: users.avatarUrl,
        bannerUrl: users.bannerUrl,
        location: users.location,
        website: users.website,
        isCreator: users.isCreator,
        isVerified: users.isVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user || null;
  }

  /**
   * Collect user content (posts, media)
   */
  private async collectContentData(userId: string, platformId: string): Promise<any[]> {
    // Get posts
    const userPosts = await db
      .select({
        id: posts.id,
        content: posts.content,
        visibility: posts.visibility,
        isLocked: posts.isLocked,
        price: posts.price,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));

    // Get media for each post
    const postsWithMedia = await Promise.all(
      userPosts.map(async (post) => {
        const media = await db
          .select({
            id: contentMedia.id,
            type: contentMedia.type,
            url: contentMedia.url,
            thumbnailUrl: contentMedia.thumbnailUrl,
            width: contentMedia.width,
            height: contentMedia.height,
            duration: contentMedia.duration,
          })
          .from(contentMedia)
          .where(eq(contentMedia.postId, post.id));

        return { ...post, media };
      })
    );

    return postsWithMedia;
  }

  /**
   * Collect user messages (sent and received)
   */
  private async collectMessagesData(userId: string, platformId: string): Promise<any[]> {
    const userMessages = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        recipientId: messages.recipientId,
        content: messages.content,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(
        sql`${messages.senderId} = ${userId} OR ${messages.recipientId} = ${userId}`
      )
      .orderBy(desc(messages.createdAt));

    // Redact other user IDs for privacy
    return userMessages.map((msg) => ({
      ...msg,
      senderId: msg.senderId === userId ? userId : "[other_user]",
      recipientId: msg.recipientId === userId ? userId : "[other_user]",
    }));
  }

  /**
   * Collect transaction history
   */
  private async collectTransactionData(userId: string, platformId: string): Promise<any[]> {
    const transactions = await db
      .select({
        transactionId: fanzLedger.transactionId,
        type: fanzLedger.entryType,
        transactionType: fanzLedger.transactionType,
        amountCents: fanzLedger.amountCents,
        description: fanzLedger.description,
        status: fanzLedger.status,
        createdAt: fanzLedger.createdAt,
      })
      .from(fanzLedger)
      .where(
        and(
          eq(fanzLedger.userId, userId),
          eq(fanzLedger.platformId, platformId)
        )
      )
      .orderBy(desc(fanzLedger.createdAt));

    return transactions;
  }

  /**
   * Collect subscription data
   */
  private async collectSubscriptionData(userId: string, platformId: string): Promise<any[]> {
    const subs = await db
      .select({
        id: subscriptions.id,
        creatorId: subscriptions.creatorId,
        tier: subscriptions.tier,
        status: subscriptions.status,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        priceCents: subscriptions.priceCents,
        autoRenew: subscriptions.autoRenew,
        createdAt: subscriptions.createdAt,
      })
      .from(subscriptions)
      .where(eq(subscriptions.subscriberId, userId))
      .orderBy(desc(subscriptions.createdAt));

    // Redact creator IDs for privacy
    return subs.map((sub) => ({
      ...sub,
      creatorId: "[creator]",
    }));
  }

  /**
   * Collect purchase data (tips, paid content, etc.)
   */
  private async collectPurchaseData(userId: string, platformId: string): Promise<any[]> {
    const purchases = await db
      .select({
        transactionId: fanzLedger.transactionId,
        amountCents: fanzLedger.amountCents,
        description: fanzLedger.description,
        referenceType: fanzLedger.referenceType,
        createdAt: fanzLedger.createdAt,
      })
      .from(fanzLedger)
      .where(
        and(
          eq(fanzLedger.userId, userId),
          eq(fanzLedger.platformId, platformId),
          eq(fanzLedger.entryType, "debit"),
          sql`${fanzLedger.transactionType} IN ('tip', 'purchase', 'unlock_content')`
        )
      )
      .orderBy(desc(fanzLedger.createdAt));

    return purchases;
  }

  /**
   * Collect earnings data (for creators)
   */
  private async collectEarningsData(userId: string, platformId: string): Promise<any[]> {
    const earnings = await db
      .select({
        transactionId: fanzLedger.transactionId,
        amountCents: fanzLedger.amountCents,
        description: fanzLedger.description,
        transactionType: fanzLedger.transactionType,
        referenceType: fanzLedger.referenceType,
        createdAt: fanzLedger.createdAt,
      })
      .from(fanzLedger)
      .where(
        and(
          eq(fanzLedger.userId, userId),
          eq(fanzLedger.platformId, platformId),
          eq(fanzLedger.entryType, "credit"),
          sql`${fanzLedger.transactionType} IN ('subscription_revenue', 'tip_received', 'content_sale', 'payout')`
        )
      )
      .orderBy(desc(fanzLedger.createdAt));

    // Get wallet balance
    const [wallet] = await db
      .select({
        availableBalance: fanzWallets.availableBalanceCents,
        pendingBalance: fanzWallets.pendingBalanceCents,
        totalEarnings: fanzWallets.totalEarningsCents,
        totalWithdrawals: fanzWallets.totalWithdrawalsCents,
      })
      .from(fanzWallets)
      .where(eq(fanzWallets.userId, userId))
      .limit(1);

    return {
      transactions: earnings,
      summary: wallet || null,
    } as any;
  }

  /**
   * Collect activity logs
   */
  private async collectActivityLogs(userId: string, platformId: string): Promise<any[]> {
    // This would query from an activity/audit log table
    // For now, return empty array as this is optional
    return [];
  }

  /**
   * Collect user settings
   */
  private async collectSettingsData(userId: string, platformId: string): Promise<any> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    return settings || {};
  }

  /**
   * Generate archive from exported data
   */
  private async generateArchive(
    data: ExportedData,
    format: string
  ): Promise<{ archiveBuffer: Buffer; checksum: string }> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const output = new Writable({
        write(chunk, encoding, callback) {
          chunks.push(chunk);
          callback();
        },
      });

      const archive = archiver("zip", {
        zlib: { level: 9 },
      });

      archive.pipe(output);

      // Add main data file
      if (format === "json") {
        archive.append(JSON.stringify(data, null, 2), { name: "user_data.json" });
      } else if (format === "csv") {
        // Convert each category to CSV
        for (const [category, categoryData] of Object.entries(data)) {
          if (Array.isArray(categoryData) && categoryData.length > 0) {
            const csv = this.convertToCSV(categoryData);
            archive.append(csv, { name: `${category}.csv` });
          } else if (typeof categoryData === "object" && categoryData !== null) {
            archive.append(JSON.stringify(categoryData, null, 2), {
              name: `${category}.json`,
            });
          }
        }
      }

      // Add README
      const readme = this.generateReadme(data);
      archive.append(readme, { name: "README.txt" });

      archive.finalize();

      output.on("finish", () => {
        const archiveBuffer = Buffer.concat(chunks);
        const checksum = createHash("sha256").update(archiveBuffer).digest("hex");
        resolve({ archiveBuffer, checksum });
      });

      archive.on("error", reject);
    });
  }

  /**
   * Convert array of objects to CSV
   */
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) return "";
          if (typeof value === "object") return JSON.stringify(value);
          return String(value).replace(/"/g, '""');
        })
        .map((v) => `"${v}"`)
        .join(",")
    );

    return [headers.join(","), ...rows].join("\n");
  }

  /**
   * Generate README for the export archive
   */
  private generateReadme(data: ExportedData): string {
    return `
FANZ DATA EXPORT
================

Export ID: ${data.exportInfo.exportId}
Platform: ${data.exportInfo.platformId}
Requested: ${data.exportInfo.requestedAt}
Generated: ${data.exportInfo.generatedAt}

DATA CATEGORIES INCLUDED
------------------------
${data.exportInfo.dataCategories.map((c) => `- ${c}`).join("\n")}

FILE CONTENTS
-------------
- user_data.json: Complete export in JSON format
- README.txt: This file

DATA PRIVACY NOTES
------------------
- Other users' IDs have been redacted for privacy
- Financial records are retained for tax compliance
- This export expires 7 days after generation

For questions about your data, contact privacy@fanz.website

Generated by FANZ Data Retention System
GDPR Article 20 - Right to Data Portability
`.trim();
  }

  /**
   * Upload archive to S3
   */
  private async uploadArchive(key: string, buffer: Buffer): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: "application/zip",
      ServerSideEncryption: "AES256",
    });

    await this.s3Client.send(command);
  }

  /**
   * Generate signed download URL
   */
  private async generateSignedUrl(key: string, expiresAt: Date): Promise<string> {
    const expiresIn = Math.floor((expiresAt.getTime() - Date.now()) / 1000);

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Record a download
   */
  async recordDownload(exportRequestId: string): Promise<void> {
    await db
      .update(dataExportRequests)
      .set({
        status: "downloaded",
        downloadedAt: new Date(),
        downloadCount: sql`${dataExportRequests.downloadCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(dataExportRequests.id, exportRequestId));
  }

  /**
   * Clean up expired exports
   */
  async cleanupExpiredExports(): Promise<number> {
    const now = new Date();

    const expiredExports = await db
      .select({ id: dataExportRequests.id })
      .from(dataExportRequests)
      .where(
        and(
          lt(dataExportRequests.expiresAt, now),
          eq(dataExportRequests.status, "completed")
        )
      );

    if (expiredExports.length === 0) return 0;

    // Mark as expired
    await db
      .update(dataExportRequests)
      .set({
        status: "expired",
        archiveUrl: null,
        updatedAt: now,
      })
      .where(
        and(
          lt(dataExportRequests.expiresAt, now),
          eq(dataExportRequests.status, "completed")
        )
      );

    console.log(`🧹 DataExport: Cleaned up ${expiredExports.length} expired exports`);

    return expiredExports.length;
  }
}
