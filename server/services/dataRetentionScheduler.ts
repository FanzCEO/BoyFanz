/**
 * FANZ Data Retention Scheduler
 *
 * Automated background jobs for GDPR/CCPA compliance:
 * - Process pending data export requests
 * - Execute scheduled account deletions
 * - Clean up expired export archives
 * - Send deletion reminder notifications
 * - Enforce retention policies
 *
 * CRITICAL: All operations are platform-isolated
 */

import { db } from "../db";
import {
  dataExportRequests,
  accountDeletionRequests,
  retentionPolicies,
  DataExportRequest,
  AccountDeletionRequest,
  RETENTION_PERIODS,
} from "@shared/dataRetentionSchema";
import { users } from "@shared/schema";
import { eq, and, lt, sql, inArray, desc } from "drizzle-orm";
import { UserDataExportService } from "./userDataExportService";
import { AccountDeletionService } from "./accountDeletionService";
import { DataRetentionService } from "./dataRetentionService";
import { Resend } from "resend";

interface SchedulerConfig {
  exportProcessingIntervalMs: number;
  deletionProcessingIntervalMs: number;
  cleanupIntervalMs: number;
  reminderIntervalMs: number;
  maxConcurrentExports: number;
  maxConcurrentDeletions: number;
  enableEmailNotifications: boolean;
}

interface SchedulerStats {
  exportsProcessed: number;
  exportsFailed: number;
  deletionsProcessed: number;
  deletionsFailed: number;
  archivesCleaned: number;
  remindersSent: number;
  lastRunAt: Date | null;
  isRunning: boolean;
}

const DEFAULT_CONFIG: SchedulerConfig = {
  exportProcessingIntervalMs: 60000, // 1 minute
  deletionProcessingIntervalMs: 300000, // 5 minutes
  cleanupIntervalMs: 3600000, // 1 hour
  reminderIntervalMs: 86400000, // 24 hours
  maxConcurrentExports: 3,
  maxConcurrentDeletions: 1,
  enableEmailNotifications: true,
};

export class DataRetentionScheduler {
  private config: SchedulerConfig;
  private exportService: UserDataExportService;
  private deletionService: AccountDeletionService;
  private retentionService: DataRetentionService;
  private resend: Resend | null = null;

  private exportInterval: ReturnType<typeof setInterval> | null = null;
  private deletionInterval: ReturnType<typeof setInterval> | null = null;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private reminderInterval: ReturnType<typeof setInterval> | null = null;

  private stats: SchedulerStats = {
    exportsProcessed: 0,
    exportsFailed: 0,
    deletionsProcessed: 0,
    deletionsFailed: 0,
    archivesCleaned: 0,
    remindersSent: 0,
    lastRunAt: null,
    isRunning: false,
  };

  constructor(config: Partial<SchedulerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.exportService = new UserDataExportService();
    this.deletionService = new AccountDeletionService();
    this.retentionService = new DataRetentionService();

    // Initialize email client
    if (process.env.RESEND_API_KEY && this.config.enableEmailNotifications) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
  }

  /**
   * Start all scheduled jobs
   */
  start(): void {
    if (this.stats.isRunning) {
      console.warn("⚠️ DataRetentionScheduler: Already running");
      return;
    }

    console.log("🚀 DataRetentionScheduler: Starting scheduled jobs");
    this.stats.isRunning = true;

    // Start export processing
    this.exportInterval = setInterval(
      () => this.processExportQueue(),
      this.config.exportProcessingIntervalMs
    );

    // Start deletion processing
    this.deletionInterval = setInterval(
      () => this.processDeletionQueue(),
      this.config.deletionProcessingIntervalMs
    );

    // Start cleanup
    this.cleanupInterval = setInterval(
      () => this.runCleanup(),
      this.config.cleanupIntervalMs
    );

    // Start reminders
    this.reminderInterval = setInterval(
      () => this.sendReminders(),
      this.config.reminderIntervalMs
    );

    // Run initial processing
    this.processExportQueue();
    this.processDeletionQueue();
    this.runCleanup();

    console.log("✅ DataRetentionScheduler: All jobs started");
  }

  /**
   * Stop all scheduled jobs
   */
  stop(): void {
    console.log("🛑 DataRetentionScheduler: Stopping scheduled jobs");

    if (this.exportInterval) {
      clearInterval(this.exportInterval);
      this.exportInterval = null;
    }

    if (this.deletionInterval) {
      clearInterval(this.deletionInterval);
      this.deletionInterval = null;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
    }

    this.stats.isRunning = false;
    console.log("✅ DataRetentionScheduler: All jobs stopped");
  }

  /**
   * Get scheduler statistics
   */
  getStats(): SchedulerStats {
    return { ...this.stats };
  }

  /**
   * Process pending export requests
   */
  async processExportQueue(): Promise<void> {
    try {
      // Get pending export requests
      const pendingExports = await db
        .select()
        .from(dataExportRequests)
        .where(eq(dataExportRequests.status, "pending"))
        .orderBy(dataExportRequests.createdAt)
        .limit(this.config.maxConcurrentExports);

      if (pendingExports.length === 0) {
        return;
      }

      console.log(
        `📦 DataRetentionScheduler: Processing ${pendingExports.length} export requests`
      );

      for (const request of pendingExports) {
        try {
          await this.exportService.processExportRequest(request.id);
          this.stats.exportsProcessed++;

          // Send notification email
          await this.sendExportReadyEmail(request);
        } catch (error) {
          console.error(
            `❌ DataRetentionScheduler: Failed to process export ${request.id}:`,
            error
          );
          this.stats.exportsFailed++;
        }
      }

      this.stats.lastRunAt = new Date();
    } catch (error) {
      console.error("❌ DataRetentionScheduler: Export queue processing failed:", error);
    }
  }

  /**
   * Process scheduled account deletions
   */
  async processDeletionQueue(): Promise<void> {
    try {
      // Get requests ready for deletion
      const readyForDeletion = await this.deletionService.getReadyForDeletion();

      if (readyForDeletion.length === 0) {
        return;
      }

      console.log(
        `🗑️ DataRetentionScheduler: Processing ${readyForDeletion.length} deletion requests`
      );

      // Process one at a time to ensure data integrity
      for (const request of readyForDeletion.slice(
        0,
        this.config.maxConcurrentDeletions
      )) {
        try {
          // Send final warning email before deletion
          await this.sendDeletionFinalWarningEmail(request);

          // Process the deletion
          await this.deletionService.processDeletionRequest(request.id);
          this.stats.deletionsProcessed++;

          // Send confirmation email
          await this.sendDeletionConfirmationEmail(request);
        } catch (error) {
          console.error(
            `❌ DataRetentionScheduler: Failed to process deletion ${request.id}:`,
            error
          );
          this.stats.deletionsFailed++;
        }
      }

      this.stats.lastRunAt = new Date();
    } catch (error) {
      console.error(
        "❌ DataRetentionScheduler: Deletion queue processing failed:",
        error
      );
    }
  }

  /**
   * Run cleanup tasks
   */
  async runCleanup(): Promise<void> {
    try {
      console.log("🧹 DataRetentionScheduler: Running cleanup tasks");

      // Clean up expired export archives
      const cleanedExports = await this.exportService.cleanupExpiredExports();
      this.stats.archivesCleaned += cleanedExports;

      // Clean up very old completed requests (keep for 90 days)
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      await db
        .delete(dataExportRequests)
        .where(
          and(
            inArray(dataExportRequests.status, ["expired", "downloaded"]),
            lt(dataExportRequests.createdAt, ninetyDaysAgo)
          )
        );

      // Clean up old completed deletion requests (keep for 1 year for audit)
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

      await db
        .delete(accountDeletionRequests)
        .where(
          and(
            inArray(accountDeletionRequests.status, ["completed", "cancelled"]),
            lt(accountDeletionRequests.createdAt, oneYearAgo)
          )
        );

      console.log(
        `✅ DataRetentionScheduler: Cleanup complete (${cleanedExports} exports cleaned)`
      );
      this.stats.lastRunAt = new Date();
    } catch (error) {
      console.error("❌ DataRetentionScheduler: Cleanup failed:", error);
    }
  }

  /**
   * Send reminder notifications
   */
  async sendReminders(): Promise<void> {
    try {
      console.log("📧 DataRetentionScheduler: Sending reminder notifications");

      // Get requests expiring in the next 7 days
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // 7-day reminder
      const sevenDayReminders = await db
        .select()
        .from(accountDeletionRequests)
        .where(
          and(
            eq(accountDeletionRequests.status, "grace_period"),
            sql`${accountDeletionRequests.gracePeriodEndsAt} BETWEEN ${sevenDaysFromNow} AND ${new Date(sevenDaysFromNow.getTime() + 24 * 60 * 60 * 1000)}`,
            sql`${accountDeletionRequests.metadata}->>'reminder_7_day_sent' IS NULL`
          )
        );

      for (const request of sevenDayReminders) {
        await this.sendDeletionReminderEmail(request, 7);

        // Mark reminder as sent
        await db
          .update(accountDeletionRequests)
          .set({
            metadata: sql`COALESCE(${accountDeletionRequests.metadata}, '{}'::jsonb) || '{"reminder_7_day_sent": true}'::jsonb`,
            updatedAt: new Date(),
          })
          .where(eq(accountDeletionRequests.id, request.id));

        this.stats.remindersSent++;
      }

      // 1-day reminder
      const oneDayReminders = await db
        .select()
        .from(accountDeletionRequests)
        .where(
          and(
            eq(accountDeletionRequests.status, "grace_period"),
            sql`${accountDeletionRequests.gracePeriodEndsAt} BETWEEN ${oneDayFromNow} AND ${new Date(oneDayFromNow.getTime() + 24 * 60 * 60 * 1000)}`,
            sql`${accountDeletionRequests.metadata}->>'reminder_1_day_sent' IS NULL`
          )
        );

      for (const request of oneDayReminders) {
        await this.sendDeletionReminderEmail(request, 1);

        // Mark reminder as sent
        await db
          .update(accountDeletionRequests)
          .set({
            metadata: sql`COALESCE(${accountDeletionRequests.metadata}, '{}'::jsonb) || '{"reminder_1_day_sent": true}'::jsonb`,
            updatedAt: new Date(),
          })
          .where(eq(accountDeletionRequests.id, request.id));

        this.stats.remindersSent++;
      }

      console.log(
        `✅ DataRetentionScheduler: Sent ${sevenDayReminders.length + oneDayReminders.length} reminder emails`
      );
      this.stats.lastRunAt = new Date();
    } catch (error) {
      console.error("❌ DataRetentionScheduler: Reminder sending failed:", error);
    }
  }

  /**
   * Send email when export is ready
   */
  private async sendExportReadyEmail(request: DataExportRequest): Promise<void> {
    if (!this.resend || !request.userId) return;

    try {
      // Get user email
      const [user] = await db
        .select({ email: users.email, displayName: users.displayName })
        .from(users)
        .where(eq(users.id, request.userId))
        .limit(1);

      if (!user?.email) return;

      // Get updated request with archive URL
      const [updatedRequest] = await db
        .select()
        .from(dataExportRequests)
        .where(eq(dataExportRequests.id, request.id))
        .limit(1);

      const platformName = this.getPlatformDisplayName(request.platformId);

      await this.resend.emails.send({
        from: `${platformName} <noreply@fanz.website>`,
        to: user.email,
        subject: `Your data export is ready - ${platformName}`,
        html: this.generateExportReadyEmailHtml({
          displayName: user.displayName || "User",
          platformName,
          downloadUrl: updatedRequest?.archiveUrl || "#",
          expiresAt: updatedRequest?.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          sizeBytes: updatedRequest?.archiveSizeBytes || 0,
        }),
      });

      console.log(`📧 DataRetentionScheduler: Export ready email sent to ${user.email}`);
    } catch (error) {
      console.error("Failed to send export ready email:", error);
    }
  }

  /**
   * Send deletion reminder email
   */
  private async sendDeletionReminderEmail(
    request: AccountDeletionRequest,
    daysRemaining: number
  ): Promise<void> {
    if (!this.resend || !request.userId) return;

    try {
      // Get user email
      const [user] = await db
        .select({ email: users.email, displayName: users.displayName })
        .from(users)
        .where(eq(users.id, request.userId))
        .limit(1);

      if (!user?.email) return;

      const platformName = this.getPlatformDisplayName(request.platformId);
      const cancelUrl = `https://${request.platformId}.fanz.website/settings/privacy/cancel-deletion?id=${request.id}`;

      await this.resend.emails.send({
        from: `${platformName} <noreply@fanz.website>`,
        to: user.email,
        subject: `⚠️ ${daysRemaining} day${daysRemaining > 1 ? "s" : ""} until account deletion - ${platformName}`,
        html: this.generateDeletionReminderEmailHtml({
          displayName: user.displayName || "User",
          platformName,
          daysRemaining,
          deletionDate: request.gracePeriodEndsAt || new Date(),
          cancelUrl,
        }),
      });

      console.log(
        `📧 DataRetentionScheduler: Deletion reminder (${daysRemaining} days) sent to ${user.email}`
      );
    } catch (error) {
      console.error("Failed to send deletion reminder email:", error);
    }
  }

  /**
   * Send final warning before deletion
   */
  private async sendDeletionFinalWarningEmail(
    request: AccountDeletionRequest
  ): Promise<void> {
    if (!this.resend || !request.userId) return;

    try {
      // Get user email
      const [user] = await db
        .select({ email: users.email, displayName: users.displayName })
        .from(users)
        .where(eq(users.id, request.userId))
        .limit(1);

      if (!user?.email) return;

      const platformName = this.getPlatformDisplayName(request.platformId);

      await this.resend.emails.send({
        from: `${platformName} <noreply@fanz.website>`,
        to: user.email,
        subject: `🚨 Final Notice: Your account will be deleted today - ${platformName}`,
        html: this.generateDeletionFinalWarningEmailHtml({
          displayName: user.displayName || "User",
          platformName,
        }),
      });

      console.log(
        `📧 DataRetentionScheduler: Final deletion warning sent to ${user.email}`
      );
    } catch (error) {
      console.error("Failed to send final warning email:", error);
    }
  }

  /**
   * Send deletion confirmation email
   */
  private async sendDeletionConfirmationEmail(
    request: AccountDeletionRequest
  ): Promise<void> {
    // Note: We use deletedUserEmail since user record is now anonymized
    if (!this.resend) return;

    const email = request.deletedUserEmail;
    if (!email) return;

    try {
      const platformName = this.getPlatformDisplayName(request.platformId);

      await this.resend.emails.send({
        from: `${platformName} <noreply@fanz.website>`,
        to: email,
        subject: `Account deletion complete - ${platformName}`,
        html: this.generateDeletionConfirmationEmailHtml({ platformName }),
      });

      console.log(
        `📧 DataRetentionScheduler: Deletion confirmation sent to ${email}`
      );
    } catch (error) {
      console.error("Failed to send deletion confirmation email:", error);
    }
  }

  /**
   * Get platform display name
   */
  private getPlatformDisplayName(platformId: string): string {
    const platformNames: Record<string, string> = {
      boyfanz: "BoyFanz",
      girlfanz: "GirlFanz",
      gayfanz: "GayFanz",
      transfanz: "TransFanz",
      milffanz: "MilfFanz",
      cougarfanz: "CougarFanz",
      bearfanz: "BearFanz",
      daddyfanz: "DaddyFanz",
      pupfanz: "PupFanz",
      taboofanz: "TabooFanz",
      fanzuncut: "FanzUncut",
      femmefanz: "FemmeFanz",
      brofanz: "BroFanz",
      southernfanz: "SouthernFanz",
      dlbroz: "DLBroz",
      guyz: "Guyz",
    };

    return platformNames[platformId.toLowerCase()] || platformId;
  }

  /**
   * Generate export ready email HTML
   */
  private generateExportReadyEmailHtml(params: {
    displayName: string;
    platformName: string;
    downloadUrl: string;
    expiresAt: Date;
    sizeBytes: number;
  }): string {
    const sizeFormatted =
      params.sizeBytes > 1024 * 1024
        ? `${(params.sizeBytes / 1024 / 1024).toFixed(2)} MB`
        : `${(params.sizeBytes / 1024).toFixed(2)} KB`;

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; border-bottom: 3px solid #4CAF50; }
    .logo { font-size: 24px; font-weight: bold; color: #4CAF50; }
    .content { padding: 30px 0; }
    .button { display: inline-block; padding: 14px 28px; background: #4CAF50; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .info-box { background: #f8f9fa; border-radius: 6px; padding: 15px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">${params.platformName}</div>
  </div>

  <div class="content">
    <h2>Your Data Export is Ready!</h2>
    <p>Hi ${params.displayName},</p>
    <p>Your data export has been generated and is ready for download.</p>

    <div class="info-box">
      <strong>Export Details:</strong><br>
      Size: ${sizeFormatted}<br>
      Expires: ${params.expiresAt.toLocaleDateString()} at ${params.expiresAt.toLocaleTimeString()}
    </div>

    <p><a href="${params.downloadUrl}" class="button">Download Your Data</a></p>

    <p><strong>Important:</strong> This link will expire in 7 days. After that, you'll need to request a new export.</p>

    <p>Your export includes all the data you requested in a secure, encrypted archive.</p>
  </div>

  <div class="footer">
    <p>This export was generated as part of your GDPR/CCPA data portability rights.</p>
    <p>&copy; ${new Date().getFullYear()} ${params.platformName}. All rights reserved.</p>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate deletion reminder email HTML
   */
  private generateDeletionReminderEmailHtml(params: {
    displayName: string;
    platformName: string;
    daysRemaining: number;
    deletionDate: Date;
    cancelUrl: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; border-bottom: 3px solid #ff9800; }
    .logo { font-size: 24px; font-weight: bold; color: #ff9800; }
    .content { padding: 30px 0; }
    .warning { background: #fff3e0; border: 2px solid #ff9800; border-radius: 6px; padding: 20px; margin: 20px 0; text-align: center; }
    .warning h3 { color: #e65100; margin-top: 0; }
    .button { display: inline-block; padding: 14px 28px; background: #4CAF50; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">⚠️ ${params.platformName}</div>
  </div>

  <div class="content">
    <h2>Account Deletion Reminder</h2>
    <p>Hi ${params.displayName},</p>

    <div class="warning">
      <h3>${params.daysRemaining} Day${params.daysRemaining > 1 ? "s" : ""} Remaining</h3>
      <p>Your account is scheduled for deletion on:<br>
      <strong>${params.deletionDate.toLocaleDateString()} at ${params.deletionDate.toLocaleTimeString()}</strong></p>
    </div>

    <p>Once deleted, your account and all associated data will be permanently removed and cannot be recovered.</p>

    <h3>Changed your mind?</h3>
    <p>You can cancel the deletion request at any time before the scheduled date:</p>

    <p><a href="${params.cancelUrl}" class="button">Cancel Account Deletion</a></p>

    <p>After cancellation, your account will remain active with all your data intact.</p>
  </div>

  <div class="footer">
    <p>You requested this deletion on your account. If this wasn't you, please cancel immediately and secure your account.</p>
    <p>&copy; ${new Date().getFullYear()} ${params.platformName}. All rights reserved.</p>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate final warning email HTML
   */
  private generateDeletionFinalWarningEmailHtml(params: {
    displayName: string;
    platformName: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; border-bottom: 3px solid #f44336; }
    .logo { font-size: 24px; font-weight: bold; color: #f44336; }
    .content { padding: 30px 0; }
    .alert { background: #ffebee; border: 2px solid #f44336; border-radius: 6px; padding: 20px; margin: 20px 0; text-align: center; }
    .alert h3 { color: #c62828; margin-top: 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🚨 ${params.platformName}</div>
  </div>

  <div class="content">
    <h2>Final Notice: Account Deletion in Progress</h2>
    <p>Hi ${params.displayName},</p>

    <div class="alert">
      <h3>Your Account is Being Deleted</h3>
      <p>The grace period has ended and your account deletion is now being processed.</p>
    </div>

    <p>This action is <strong>irreversible</strong>. All your data, content, and account information will be permanently removed.</p>

    <h3>What's Being Deleted:</h3>
    <ul>
      <li>Profile information</li>
      <li>All posts and content</li>
      <li>Messages</li>
      <li>Subscriptions</li>
      <li>Account settings</li>
    </ul>

    <h3>What's Being Retained (for legal compliance):</h3>
    <ul>
      <li>Anonymized financial records (7 years for tax purposes)</li>
      <li>Anonymized fraud prevention data</li>
    </ul>

    <p>Thank you for being part of ${params.platformName}. We're sorry to see you go.</p>
  </div>

  <div class="footer">
    <p>This is an automated notification. No reply is needed.</p>
    <p>&copy; ${new Date().getFullYear()} ${params.platformName}. All rights reserved.</p>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate deletion confirmation email HTML
   */
  private generateDeletionConfirmationEmailHtml(params: {
    platformName: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; border-bottom: 3px solid #9e9e9e; }
    .logo { font-size: 24px; font-weight: bold; color: #9e9e9e; }
    .content { padding: 30px 0; }
    .success { background: #e8f5e9; border: 2px solid #4CAF50; border-radius: 6px; padding: 20px; margin: 20px 0; text-align: center; }
    .success h3 { color: #2e7d32; margin-top: 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">${params.platformName}</div>
  </div>

  <div class="content">
    <h2>Account Deletion Complete</h2>

    <div class="success">
      <h3>✓ Your Account Has Been Deleted</h3>
      <p>Your account and personal data have been permanently removed.</p>
    </div>

    <h3>What was deleted:</h3>
    <ul>
      <li>Profile information and settings</li>
      <li>All posts and uploaded content</li>
      <li>Messages and conversations</li>
      <li>Subscriptions and follows</li>
    </ul>

    <h3>What was retained (legal requirements):</h3>
    <ul>
      <li>Anonymized financial records (retained for 7 years for tax compliance)</li>
      <li>Anonymized data for fraud prevention</li>
    </ul>

    <p>If you ever want to return, you're welcome to create a new account.</p>

    <p>Thank you for being part of our community. We wish you all the best!</p>
  </div>

  <div class="footer">
    <p>This confirmation email is sent in compliance with GDPR Article 17 (Right to Erasure).</p>
    <p>&copy; ${new Date().getFullYear()} ${params.platformName}. All rights reserved.</p>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Manually trigger export processing (for admin use)
   */
  async triggerExportProcessing(): Promise<number> {
    await this.processExportQueue();
    return this.stats.exportsProcessed;
  }

  /**
   * Manually trigger deletion processing (for admin use)
   */
  async triggerDeletionProcessing(): Promise<number> {
    await this.processDeletionQueue();
    return this.stats.deletionsProcessed;
  }

  /**
   * Get pending work summary
   */
  async getPendingWorkSummary(): Promise<{
    pendingExports: number;
    pendingDeletions: number;
    expiringSoonDeletions: number;
    expiredExports: number;
  }> {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [summary] = await db
      .select({
        pendingExports: sql<number>`
          (SELECT COUNT(*) FROM data_export_requests WHERE status = 'pending')
        `,
        pendingDeletions: sql<number>`
          (SELECT COUNT(*) FROM account_deletion_requests
           WHERE status = 'grace_period' AND grace_period_ends_at < NOW())
        `,
        expiringSoonDeletions: sql<number>`
          (SELECT COUNT(*) FROM account_deletion_requests
           WHERE status = 'grace_period'
           AND grace_period_ends_at BETWEEN NOW() AND ${sevenDaysFromNow})
        `,
        expiredExports: sql<number>`
          (SELECT COUNT(*) FROM data_export_requests
           WHERE status = 'completed' AND expires_at < NOW())
        `,
      })
      .from(sql`(SELECT 1) as dummy`);

    return {
      pendingExports: Number(summary?.pendingExports || 0),
      pendingDeletions: Number(summary?.pendingDeletions || 0),
      expiringSoonDeletions: Number(summary?.expiringSoonDeletions || 0),
      expiredExports: Number(summary?.expiredExports || 0),
    };
  }
}

// Export singleton instance
export const dataRetentionScheduler = new DataRetentionScheduler();
