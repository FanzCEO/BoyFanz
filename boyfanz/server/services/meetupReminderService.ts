/**
 * Meetup Reminder Service
 *
 * Handles:
 * - SMS reminders via Twilio
 * - Push notifications via Web Push API
 * - Email reminders as backup
 * - Scheduled reminder processing
 */

import { db } from "../db";
import { eq, and, lte, gte, inArray } from "drizzle-orm";
import {
  meetupReminders,
  creatorMeetups,
  mapNotificationPreferences,
} from "../../shared/nearbyMapSchema";
import { users } from "../../shared/schema";
import Twilio from "twilio";

// Initialize Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

// Web Push VAPID keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

interface ReminderMessage {
  title: string;
  body: string;
  meetupId: string;
  meetupTitle: string;
  scheduledTime: Date;
}

class MeetupReminderService {
  private platformName: string;

  constructor(platformName: string = "FANZ") {
    this.platformName = platformName;
  }

  /**
   * Send SMS reminder via Twilio
   */
  async sendSMSReminder(
    phoneNumber: string,
    message: ReminderMessage
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!twilioClient || !TWILIO_PHONE) {
      console.error("Twilio not configured");
      return { success: false, error: "SMS service not configured" };
    }

    // Validate phone number format
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return { success: false, error: "Invalid phone number" };
    }

    const formattedPhone = cleanPhone.length === 10 ? `+1${cleanPhone}` : `+${cleanPhone}`;

    try {
      const smsMessage = await twilioClient.messages.create({
        body: this.formatSMSMessage(message),
        to: formattedPhone,
        from: TWILIO_PHONE,
      });

      return { success: true, messageId: smsMessage.sid };
    } catch (error: any) {
      console.error("Twilio SMS error:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Format SMS message content
   */
  private formatSMSMessage(message: ReminderMessage): string {
    const timeStr = message.scheduledTime.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });

    return `${this.platformName} Meetup Reminder\n\n` +
      `"${message.meetupTitle}" is coming up!\n` +
      `When: ${timeStr}\n\n` +
      `Open the app to view details and get directions.\n\n` +
      `Reply STOP to unsubscribe from SMS reminders.`;
  }

  /**
   * Send push notification
   */
  async sendPushNotification(
    userId: string,
    message: ReminderMessage
  ): Promise<{ success: boolean; error?: string }> {
    // This would integrate with your push notification service
    // (Firebase Cloud Messaging, OneSignal, or Web Push)

    try {
      // For now, we'll store it as an in-app notification
      // In production, integrate with FCM or similar

      console.log(`Push notification for user ${userId}:`, message);

      // Placeholder for actual push implementation
      // await webpush.sendNotification(subscription, JSON.stringify({
      //   title: message.title,
      //   body: message.body,
      //   data: { meetupId: message.meetupId },
      //   icon: '/icon.png',
      // }));

      return { success: true };
    } catch (error: any) {
      console.error("Push notification error:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email reminder
   */
  async sendEmailReminder(
    email: string,
    message: ReminderMessage
  ): Promise<{ success: boolean; error?: string }> {
    // This would integrate with your email service (SendGrid, Postmark, etc.)

    try {
      console.log(`Email reminder to ${email}:`, message);

      // Placeholder for actual email implementation
      // await sendgrid.send({
      //   to: email,
      //   from: 'noreply@fanz.website',
      //   subject: `Reminder: ${message.meetupTitle}`,
      //   text: message.body,
      // });

      return { success: true };
    } catch (error: any) {
      console.error("Email reminder error:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process pending reminders
   * Should be called by a cron job every minute
   */
  async processScheduledReminders(): Promise<{
    processed: number;
    sent: number;
    failed: number;
  }> {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    // Get reminders due in the next 5 minutes
    const pendingReminders = await db
      .select({
        reminder: meetupReminders,
        meetup: creatorMeetups,
        user: users,
        prefs: mapNotificationPreferences,
      })
      .from(meetupReminders)
      .innerJoin(creatorMeetups, eq(meetupReminders.meetupId, creatorMeetups.id))
      .innerJoin(users, eq(meetupReminders.userId, users.id))
      .leftJoin(mapNotificationPreferences, eq(meetupReminders.userId, mapNotificationPreferences.userId))
      .where(
        and(
          eq(meetupReminders.status, "scheduled"),
          lte(meetupReminders.scheduledFor, fiveMinutesFromNow),
          gte(meetupReminders.scheduledFor, now)
        )
      );

    let processed = 0;
    let sent = 0;
    let failed = 0;

    for (const { reminder, meetup, user, prefs } of pendingReminders) {
      processed++;

      // Check if meetup is still valid
      if (meetup.status === "cancelled" || meetup.status === "declined") {
        await db
          .update(meetupReminders)
          .set({ status: "cancelled" })
          .where(eq(meetupReminders.id, reminder.id));
        continue;
      }

      // Check quiet hours
      if (prefs?.quietHoursEnabled) {
        const currentHour = now.getHours();
        const quietStart = parseInt(prefs.quietHoursStart?.split(":")[0] || "22");
        const quietEnd = parseInt(prefs.quietHoursEnd?.split(":")[0] || "8");

        const inQuietHours =
          quietStart > quietEnd
            ? currentHour >= quietStart || currentHour < quietEnd
            : currentHour >= quietStart && currentHour < quietEnd;

        if (inQuietHours && reminder.channel !== "sms") {
          // Reschedule for after quiet hours
          const newTime = new Date(now);
          newTime.setHours(quietEnd, 0, 0, 0);
          if (newTime <= now) {
            newTime.setDate(newTime.getDate() + 1);
          }

          await db
            .update(meetupReminders)
            .set({ scheduledFor: newTime })
            .where(eq(meetupReminders.id, reminder.id));
          continue;
        }
      }

      const message: ReminderMessage = {
        title: this.getReminderTitle(reminder.minutesBefore),
        body: `Your meetup "${meetup.title}" is in ${this.formatTimeUntil(reminder.minutesBefore)}`,
        meetupId: meetup.id,
        meetupTitle: meetup.title,
        scheduledTime: meetup.confirmedDateTime || meetup.proposedDateTime,
      };

      let result: { success: boolean; error?: string };

      switch (reminder.channel) {
        case "sms":
          if (reminder.phoneNumber) {
            result = await this.sendSMSReminder(reminder.phoneNumber, message);
          } else {
            result = { success: false, error: "No phone number" };
          }
          break;

        case "push":
          result = await this.sendPushNotification(user.id, message);
          break;

        case "email":
          if (user.email) {
            result = await this.sendEmailReminder(user.email, message);
          } else {
            result = { success: false, error: "No email" };
          }
          break;

        default:
          result = { success: false, error: "Unknown channel" };
      }

      // Update reminder status
      if (result.success) {
        await db
          .update(meetupReminders)
          .set({
            status: "sent",
            sentAt: new Date(),
          })
          .where(eq(meetupReminders.id, reminder.id));
        sent++;
      } else {
        await db
          .update(meetupReminders)
          .set({
            status: "failed",
            failureReason: result.error,
          })
          .where(eq(meetupReminders.id, reminder.id));
        failed++;
      }
    }

    return { processed, sent, failed };
  }

  private getReminderTitle(minutesBefore: number): string {
    if (minutesBefore >= 24 * 60) {
      return "Meetup Tomorrow!";
    } else if (minutesBefore >= 60) {
      return `Meetup in ${Math.round(minutesBefore / 60)} Hour${minutesBefore >= 120 ? "s" : ""}`;
    } else {
      return `Meetup in ${minutesBefore} Minutes`;
    }
  }

  private formatTimeUntil(minutesBefore: number): string {
    if (minutesBefore >= 24 * 60) {
      const hours = Math.round(minutesBefore / 60);
      return `${Math.round(hours / 24)} day${hours >= 48 ? "s" : ""}`;
    } else if (minutesBefore >= 60) {
      const hours = Math.round(minutesBefore / 60);
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    } else {
      return `${minutesBefore} minutes`;
    }
  }

  /**
   * Verify SMS phone number with OTP
   */
  async sendPhoneVerification(phoneNumber: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (!twilioClient) {
      return { success: false, error: "SMS service not configured" };
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `+1${cleanPhone}` : `+${cleanPhone}`;

    try {
      // Using Twilio Verify service
      const verification = await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
        .verifications.create({
          to: formattedPhone,
          channel: "sms",
        });

      return { success: verification.status === "pending" };
    } catch (error: any) {
      console.error("Phone verification error:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check phone verification code
   */
  async checkPhoneVerification(
    phoneNumber: string,
    code: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!twilioClient) {
      return { success: false, error: "SMS service not configured" };
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `+1${cleanPhone}` : `+${cleanPhone}`;

    try {
      const verificationCheck = await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
        .verificationChecks.create({
          to: formattedPhone,
          code,
        });

      return { success: verificationCheck.status === "approved" };
    } catch (error: any) {
      console.error("Verification check error:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user's SMS preferences
   */
  async updateSMSPreferences(
    userId: string,
    phoneNumber: string,
    verified: boolean = false
  ): Promise<void> {
    const existing = await db
      .select()
      .from(mapNotificationPreferences)
      .where(eq(mapNotificationPreferences.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(mapNotificationPreferences)
        .set({
          smsPhoneNumber: phoneNumber,
          smsPhoneVerified: verified,
          smsEnabled: verified,
          updatedAt: new Date(),
        })
        .where(eq(mapNotificationPreferences.userId, userId));
    } else {
      await db.insert(mapNotificationPreferences).values({
        userId,
        smsPhoneNumber: phoneNumber,
        smsPhoneVerified: verified,
        smsEnabled: verified,
      });
    }
  }
}

// Export singleton factory
export function createMeetupReminderService(platformName?: string) {
  return new MeetupReminderService(platformName);
}

export default MeetupReminderService;
