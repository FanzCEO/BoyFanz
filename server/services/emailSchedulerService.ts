/**
 * Email Scheduler Service
 * Handles automated email reminders, verification follow-ups, and scheduled campaigns
 */

import { db } from '../db';
import { eq, and, lt, gt, isNull, sql, lte, gte } from 'drizzle-orm';
import { users } from '../../shared/schema';
import { emailMarketingService } from './emailMarketingService';
import crypto from 'crypto';

const APP_URL = process.env.APP_URL || 'https://boyfanz.fanz.website';

// Reminder intervals in hours
const VERIFICATION_REMINDERS = [
  { hoursAfterSignup: 1, hoursRemaining: 23, priority: 'low' },
  { hoursAfterSignup: 12, hoursRemaining: 12, priority: 'medium' },
  { hoursAfterSignup: 20, hoursRemaining: 4, priority: 'high' },
];

// Reengagement intervals in days
const REENGAGEMENT_INTERVALS = [7, 14, 30, 60];

interface ScheduledEmail {
  id: string;
  type: 'verification_reminder' | 'reengagement' | 'campaign' | 'notification';
  userId: string;
  email: string;
  scheduledFor: Date;
  data: Record<string, any>;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  lastError?: string;
  createdAt: Date;
  sentAt?: Date;
}

// In-memory queue (use Redis/Bull in production)
const scheduledEmails: Map<string, ScheduledEmail> = new Map();
const sentVerificationReminders: Map<string, Set<number>> = new Map(); // userId -> Set of hours already sent

export class EmailSchedulerService {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private checkInterval = 60000; // Check every minute

  constructor() {
    console.log('📧 Email Scheduler Service initialized');
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isRunning) {
      console.log('⚠️  Email scheduler already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Email Scheduler started');

    // Run immediately then on interval
    this.processScheduledEmails();
    this.checkVerificationReminders();
    this.checkReengagementEmails();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.processScheduledEmails();
    }, this.checkInterval);

    // Check verification reminders every 5 minutes
    setInterval(() => {
      this.checkVerificationReminders();
    }, 5 * 60 * 1000);

    // Check reengagement emails every hour
    setInterval(() => {
      this.checkReengagementEmails();
    }, 60 * 60 * 1000);
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Email Scheduler stopped');
  }

  /**
   * Process scheduled emails that are due
   */
  private async processScheduledEmails(): Promise<void> {
    const now = new Date();
    let processed = 0;
    let failed = 0;

    for (const [id, email] of scheduledEmails) {
      if (email.status !== 'pending') continue;
      if (email.scheduledFor > now) continue;

      try {
        await this.sendScheduledEmail(email);
        email.status = 'sent';
        email.sentAt = new Date();
        processed++;
      } catch (error: any) {
        email.attempts++;
        email.lastError = error.message;

        if (email.attempts >= 3) {
          email.status = 'failed';
          failed++;
        }
      }
    }

    if (processed > 0 || failed > 0) {
      console.log(`📧 Processed ${processed} emails, ${failed} failed`);
    }
  }

  /**
   * Send a scheduled email
   */
  private async sendScheduledEmail(scheduled: ScheduledEmail): Promise<void> {
    switch (scheduled.type) {
      case 'verification_reminder':
        await emailMarketingService.sendTemplatedEmail(
          'verification_reminder',
          scheduled.email,
          scheduled.data
        );
        break;
      case 'reengagement':
        await emailMarketingService.sendTemplatedEmail(
          'reengagement',
          scheduled.email,
          scheduled.data,
          { unsubscribeUrl: `${APP_URL}/unsubscribe?email=${encodeURIComponent(scheduled.email)}` }
        );
        break;
      default:
        console.warn(`Unknown email type: ${scheduled.type}`);
    }
  }

  /**
   * Check for unverified users and schedule verification reminders
   */
  async checkVerificationReminders(): Promise<void> {
    try {
      // Get unverified users created in the last 24 hours
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const unverifiedUsers = await db.select({
        id: users.id,
        email: users.email,
        username: users.username,
        createdAt: users.createdAt,
        verificationToken: users.verificationToken,
      })
        .from(users)
        .where(
          and(
            isNull(users.emailVerifiedAt),
            gt(users.createdAt, twentyFourHoursAgo)
          )
        );

      const now = new Date();
      let scheduled = 0;

      for (const user of unverifiedUsers) {
        if (!user.email || !user.createdAt) continue;

        const hoursSinceSignup = (now.getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60);
        const userReminders = sentVerificationReminders.get(user.id) || new Set();

        for (const reminder of VERIFICATION_REMINDERS) {
          // Check if this reminder is due and hasn't been sent
          if (hoursSinceSignup >= reminder.hoursAfterSignup && !userReminders.has(reminder.hoursAfterSignup)) {
            // Schedule the reminder
            const verificationUrl = user.verificationToken
              ? `${APP_URL}/auth/verify-email?token=${user.verificationToken}`
              : `${APP_URL}/auth/resend-verification?email=${encodeURIComponent(user.email)}`;

            this.scheduleEmail({
              type: 'verification_reminder',
              userId: user.id,
              email: user.email,
              scheduledFor: new Date(), // Send immediately
              data: {
                username: user.username || 'there',
                verificationUrl,
                hoursRemaining: reminder.hoursRemaining,
              },
            });

            // Mark as sent
            userReminders.add(reminder.hoursAfterSignup);
            sentVerificationReminders.set(user.id, userReminders);
            scheduled++;
          }
        }
      }

      if (scheduled > 0) {
        console.log(`📧 Scheduled ${scheduled} verification reminder emails`);
      }
    } catch (error) {
      console.error('Error checking verification reminders:', error);
    }
  }

  /**
   * Check for inactive users and schedule reengagement emails
   */
  async checkReengagementEmails(): Promise<void> {
    try {
      const now = new Date();

      for (const days of REENGAGEMENT_INTERVALS) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - days);
        const targetDateStart = new Date(targetDate);
        targetDateStart.setHours(0, 0, 0, 0);
        const targetDateEnd = new Date(targetDate);
        targetDateEnd.setHours(23, 59, 59, 999);

        // Find users who were last active exactly X days ago
        const inactiveUsers = await db.select({
          id: users.id,
          email: users.email,
          username: users.username,
          lastActiveAt: users.lastActiveAt,
        })
          .from(users)
          .where(
            and(
              gte(users.lastActiveAt, targetDateStart),
              lte(users.lastActiveAt, targetDateEnd)
            )
          )
          .limit(100); // Process in batches

        for (const user of inactiveUsers) {
          if (!user.email) continue;

          // Check if we already sent a reengagement email for this interval
          const existingEmail = Array.from(scheduledEmails.values()).find(
            e => e.userId === user.id &&
                 e.type === 'reengagement' &&
                 e.data.daysSinceActive === days
          );

          if (!existingEmail) {
            this.scheduleEmail({
              type: 'reengagement',
              userId: user.id,
              email: user.email,
              scheduledFor: new Date(), // Send immediately
              data: {
                username: user.username || 'there',
                daysSinceActive: days,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking reengagement emails:', error);
    }
  }

  /**
   * Schedule an email
   */
  scheduleEmail(options: {
    type: ScheduledEmail['type'];
    userId: string;
    email: string;
    scheduledFor: Date;
    data: Record<string, any>;
  }): string {
    const id = `email_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const scheduled: ScheduledEmail = {
      id,
      type: options.type,
      userId: options.userId,
      email: options.email,
      scheduledFor: options.scheduledFor,
      data: options.data,
      status: 'pending',
      attempts: 0,
      createdAt: new Date(),
    };

    scheduledEmails.set(id, scheduled);
    return id;
  }

  /**
   * Cancel a scheduled email
   */
  cancelEmail(id: string): boolean {
    const email = scheduledEmails.get(id);
    if (email && email.status === 'pending') {
      email.status = 'cancelled';
      return true;
    }
    return false;
  }

  /**
   * Get scheduler stats
   */
  getStats(): {
    isRunning: boolean;
    totalScheduled: number;
    pending: number;
    sent: number;
    failed: number;
    cancelled: number;
    verificationReminders: {
      usersTracked: number;
    };
  } {
    const emails = Array.from(scheduledEmails.values());

    return {
      isRunning: this.isRunning,
      totalScheduled: emails.length,
      pending: emails.filter(e => e.status === 'pending').length,
      sent: emails.filter(e => e.status === 'sent').length,
      failed: emails.filter(e => e.status === 'failed').length,
      cancelled: emails.filter(e => e.status === 'cancelled').length,
      verificationReminders: {
        usersTracked: sentVerificationReminders.size,
      },
    };
  }

  /**
   * Get scheduled emails for admin view
   */
  getScheduledEmails(options?: {
    type?: ScheduledEmail['type'];
    status?: ScheduledEmail['status'];
    limit?: number;
    offset?: number;
  }): { emails: ScheduledEmail[]; total: number } {
    let emails = Array.from(scheduledEmails.values());

    if (options?.type) {
      emails = emails.filter(e => e.type === options.type);
    }
    if (options?.status) {
      emails = emails.filter(e => e.status === options.status);
    }

    emails.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = emails.length;

    if (options?.offset) {
      emails = emails.slice(options.offset);
    }
    if (options?.limit) {
      emails = emails.slice(0, options.limit);
    }

    return { emails, total };
  }

  /**
   * Manually trigger verification reminder for a user
   */
  async sendVerificationReminder(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const [user] = await db.select({
        id: users.id,
        email: users.email,
        username: users.username,
        verificationToken: users.verificationToken,
        emailVerifiedAt: users.emailVerifiedAt,
      })
        .from(users)
        .where(eq(users.id, userId));

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (user.emailVerifiedAt) {
        return { success: false, error: 'User already verified' };
      }

      if (!user.email) {
        return { success: false, error: 'User has no email' };
      }

      const verificationUrl = user.verificationToken
        ? `${APP_URL}/auth/verify-email?token=${user.verificationToken}`
        : `${APP_URL}/auth/resend-verification?email=${encodeURIComponent(user.email)}`;

      const result = await emailMarketingService.sendTemplatedEmail(
        'verification_reminder',
        user.email,
        {
          username: user.username || 'there',
          verificationUrl,
          hoursRemaining: 24,
        }
      );

      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send bulk verification reminders to all unverified users
   */
  async sendBulkVerificationReminders(): Promise<{ sent: number; failed: number }> {
    try {
      const unverifiedUsers = await db.select({
        id: users.id,
        email: users.email,
        username: users.username,
        verificationToken: users.verificationToken,
      })
        .from(users)
        .where(isNull(users.emailVerifiedAt));

      let sent = 0;
      let failed = 0;

      for (const user of unverifiedUsers) {
        if (!user.email) continue;

        const verificationUrl = user.verificationToken
          ? `${APP_URL}/auth/verify-email?token=${user.verificationToken}`
          : `${APP_URL}/auth/resend-verification?email=${encodeURIComponent(user.email)}`;

        const result = await emailMarketingService.sendTemplatedEmail(
          'verification_reminder',
          user.email,
          {
            username: user.username || 'there',
            verificationUrl,
            hoursRemaining: 24,
          }
        );

        if (result.success) {
          sent++;
        } else {
          failed++;
        }

        // Rate limit: 1 email per 100ms
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return { sent, failed };
    } catch (error) {
      console.error('Error sending bulk verification reminders:', error);
      return { sent: 0, failed: 0 };
    }
  }
}

export const emailSchedulerService = new EmailSchedulerService();

// Auto-start scheduler when module loads
if (process.env.NODE_ENV !== 'test') {
  setTimeout(() => {
    emailSchedulerService.start();
  }, 10000); // Start after 10 seconds to let server initialize
}
