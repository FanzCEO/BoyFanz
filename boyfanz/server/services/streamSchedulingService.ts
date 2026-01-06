/**
 * Stream Scheduling & Notification Service
 * Handles scheduled streams, reminders, and go-live notifications
 */

import { EventEmitter } from "events";
import { logger } from "../logger";

interface ScheduledStream {
  id: string;
  creatorId: string;
  creatorUsername: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  scheduledFor: Date;
  estimatedDuration?: number;
  notifySubscribers: boolean;
  reminderSent15Min: boolean;
  reminderSent5Min: boolean;
  isRecurring: boolean;
  recurringPattern?: "daily" | "weekly" | "biweekly" | "monthly";
  actualStreamId?: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
  subscriberCount: number;
  interestedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface GoLiveNotification {
  id: string;
  streamId: string;
  creatorId: string;
  userId: string;
  sent: boolean;
  sentAt?: Date;
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  opened: boolean;
  openedAt?: Date;
}

interface NotificationPreferences {
  userId: string;
  enablePush: boolean;
  enableEmail: boolean;
  enableSms: boolean;
  followedCreators: string[];
  notifyOn: "all" | "scheduled_only" | "none";
}

class StreamSchedulingService extends EventEmitter {
  private scheduledStreams: Map<string, ScheduledStream> = new Map();
  private notifications: Map<string, GoLiveNotification[]> = new Map();
  private userPreferences: Map<string, NotificationPreferences> = new Map();
  private checkIntervalId?: NodeJS.Timeout;
  
  constructor() {
    super();
    this.startScheduleChecker();
    logger.info("StreamSchedulingService initialized");
  }
  
  // ===== STREAM SCHEDULING =====
  
  async scheduleStream(params: {
    creatorId: string;
    creatorUsername: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    scheduledFor: Date;
    estimatedDuration?: number;
    notifySubscribers?: boolean;
    isRecurring?: boolean;
    recurringPattern?: "daily" | "weekly" | "biweekly" | "monthly";
  }): Promise<{ success: boolean; scheduleId?: string }> {
    
    if (params.scheduledFor <= new Date()) {
      return { success: false };
    }
    
    const scheduleId = this.generateId("schedule");
    
    const scheduled: ScheduledStream = {
      id: scheduleId,
      creatorId: params.creatorId,
      creatorUsername: params.creatorUsername,
      title: params.title,
      description: params.description,
      thumbnailUrl: params.thumbnailUrl,
      scheduledFor: params.scheduledFor,
      estimatedDuration: params.estimatedDuration,
      notifySubscribers: params.notifySubscribers ?? true,
      reminderSent15Min: false,
      reminderSent5Min: false,
      isRecurring: params.isRecurring || false,
      recurringPattern: params.recurringPattern,
      status: "scheduled",
      subscriberCount: 0,
      interestedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.scheduledStreams.set(scheduleId, scheduled);
    
    // Queue initial notification to subscribers
    if (scheduled.notifySubscribers) {
      this.queueScheduleNotifications(scheduleId);
    }
    
    this.emit("stream:scheduled", { scheduled });
    
    logger.info("Stream scheduled", { scheduleId, scheduledFor: params.scheduledFor });
    
    return { success: true, scheduleId };
  }
  
  async updateScheduledStream(scheduleId: string, updates: Partial<ScheduledStream>): Promise<boolean> {
    const scheduled = this.scheduledStreams.get(scheduleId);
    if (!scheduled) return false;
    
    Object.assign(scheduled, updates, { updatedAt: new Date() });
    
    // If time changed, reset reminder flags
    if (updates.scheduledFor) {
      scheduled.reminderSent15Min = false;
      scheduled.reminderSent5Min = false;
    }
    
    this.emit("stream:schedule_updated", { scheduled });
    
    return true;
  }
  
  async cancelScheduledStream(scheduleId: string): Promise<boolean> {
    const scheduled = this.scheduledStreams.get(scheduleId);
    if (!scheduled) return false;
    
    scheduled.status = "cancelled";
    scheduled.updatedAt = new Date();
    
    // Notify interested users
    this.sendCancellationNotifications(scheduleId);
    
    this.emit("stream:schedule_cancelled", { scheduled });
    
    return true;
  }
  
  async markInterested(scheduleId: string, userId: string): Promise<boolean> {
    const scheduled = this.scheduledStreams.get(scheduleId);
    if (!scheduled) return false;
    
    scheduled.interestedCount++;
    
    // Add to notification list
    this.addToNotificationList(scheduleId, userId);
    
    return true;
  }
  
  // ===== GO-LIVE NOTIFICATIONS =====
  
  async sendGoLiveNotifications(streamId: string, creatorId: string): Promise<{ sent: number }> {
    // Get all subscribers/followers
    const subscribers = await this.getSubscribers(creatorId);
    
    let sent = 0;
    
    for (const userId of subscribers) {
      const prefs = this.userPreferences.get(userId) || {
        userId,
        enablePush: true,
        enableEmail: true,
        enableSms: false,
        followedCreators: [],
        notifyOn: "all"
      };
      
      if (prefs.notifyOn === "none") continue;
      
      const notification: GoLiveNotification = {
        id: this.generateId("notif"),
        streamId,
        creatorId,
        userId,
        sent: false,
        channels: {
          push: prefs.enablePush,
          email: prefs.enableEmail,
          sms: prefs.enableSms
        },
        opened: false
      };
      
      // Send through each enabled channel
      if (notification.channels.push) {
        await this.sendPushNotification(userId, {
          title: "Live Now!",
          body: "A creator you follow is now streaming",
          data: { streamId }
        });
      }
      
      if (notification.channels.email) {
        await this.sendEmailNotification(userId, {
          subject: "Live Now!",
          body: "A creator you follow is now streaming",
          streamId
        });
      }
      
      if (notification.channels.sms) {
        await this.sendSmsNotification(userId, {
          message: "A creator you follow is now streaming!",
          streamId
        });
      }
      
      notification.sent = true;
      notification.sentAt = new Date();
      
      const streamNotifs = this.notifications.get(streamId) || [];
      streamNotifs.push(notification);
      this.notifications.set(streamId, streamNotifs);
      
      sent++;
    }
    
    this.emit("notifications:sent", { streamId, count: sent });
    
    return { sent };
  }
  
  async markNotificationOpened(notificationId: string): Promise<boolean> {
    for (const notifs of this.notifications.values()) {
      const notif = notifs.find(n => n.id === notificationId);
      if (notif) {
        notif.opened = true;
        notif.openedAt = new Date();
        return true;
      }
    }
    return false;
  }
  
  // ===== SCHEDULE CHECKING =====
  
  private startScheduleChecker() {
    this.checkIntervalId = setInterval(() => {
      this.checkScheduledStreams();
    }, 60000); // Check every minute
  }
  
  private async checkScheduledStreams() {
    const now = new Date();
    
    for (const [scheduleId, scheduled] of this.scheduledStreams) {
      if (scheduled.status !== "scheduled") continue;
      
      const timeUntil = scheduled.scheduledFor.getTime() - now.getTime();
      const minutesUntil = Math.floor(timeUntil / 60000);
      
      // 15-minute reminder
      if (minutesUntil <= 15 && minutesUntil > 5 && !scheduled.reminderSent15Min) {
        await this.sendReminders(scheduleId, 15);
        scheduled.reminderSent15Min = true;
      }
      
      // 5-minute reminder
      if (minutesUntil <= 5 && minutesUntil > 0 && !scheduled.reminderSent5Min) {
        await this.sendReminders(scheduleId, 5);
        scheduled.reminderSent5Min = true;
      }
      
      // Past scheduled time - mark for creator to start
      if (timeUntil < 0) {
        this.emit("stream:should_start", { scheduled });
      }
    }
  }
  
  private async sendReminders(scheduleId: string, minutesUntil: number) {
    const scheduled = this.scheduledStreams.get(scheduleId);
    if (!scheduled) return;
    
    logger.info("Sending reminders", { scheduleId, minutesUntil });
    
    this.emit("stream:reminder", { scheduled, minutesUntil });
  }
  
  // ===== HELPER METHODS =====
  
  private generateId(prefix: string): string {
    return prefix + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }
  
  private async getSubscribers(creatorId: string): Promise<string[]> {
    // Would fetch from database
    return [];
  }
  
  private async queueScheduleNotifications(scheduleId: string) {
    const scheduled = this.scheduledStreams.get(scheduleId);
    if (!scheduled) return;
    
    // Queue notifications for subscribers
    logger.info("Queuing schedule notifications", { scheduleId });
  }
  
  private async sendCancellationNotifications(scheduleId: string) {
    const scheduled = this.scheduledStreams.get(scheduleId);
    if (!scheduled) return;
    
    logger.info("Sending cancellation notifications", { scheduleId });
  }
  
  private addToNotificationList(scheduleId: string, userId: string) {
    logger.info("Adding user to notification list", { scheduleId, userId });
  }
  
  private async sendPushNotification(userId: string, data: { title: string; body: string; data: any }) {
    // Would integrate with push notification service
    logger.info("Sending push notification", { userId, title: data.title });
  }
  
  private async sendEmailNotification(userId: string, data: { subject: string; body: string; streamId: string }) {
    // Would integrate with email service
    logger.info("Sending email notification", { userId, subject: data.subject });
  }
  
  private async sendSmsNotification(userId: string, data: { message: string; streamId: string }) {
    // Would integrate with SMS service
    logger.info("Sending SMS notification", { userId });
  }
  
  // ===== GETTERS =====
  
  getScheduledStreams(creatorId?: string): ScheduledStream[] {
    let streams = Array.from(this.scheduledStreams.values())
      .filter(s => s.status === "scheduled" && s.scheduledFor > new Date());
    
    if (creatorId) {
      streams = streams.filter(s => s.creatorId === creatorId);
    }
    
    return streams.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
  }
  
  getUpcomingStreams(limit: number = 20): ScheduledStream[] {
    return this.getScheduledStreams().slice(0, limit);
  }
  
  getScheduledStream(scheduleId: string): ScheduledStream | null {
    return this.scheduledStreams.get(scheduleId) || null;
  }
  
  cleanup() {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
    }
  }
}

export const streamSchedulingService = new StreamSchedulingService();
export { StreamSchedulingService, ScheduledStream, GoLiveNotification };
