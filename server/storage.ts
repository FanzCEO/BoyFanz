import {
  users,
  profiles,
  mediaAssets,
  moderationQueue,
  payoutRequests,
  notifications,
  kycVerifications,
  auditLogs,
  webhooks,
  apiKeys,
  themeSettings,
  records2257,
  type User,
  type UpsertUser,
  type Profile,
  type MediaAsset,
  type ModerationQueueItem,
  type PayoutRequest,
  type Notification,
  type KycVerification,
  type AuditLog,
  type Webhook,
  type ApiKey,
  type ThemeSettings,
  type InsertThemeSettings,
  type UpdateThemeSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  // Local auth operations
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  
  // Profile operations
  getProfile(userId: string): Promise<Profile | undefined>;
  upsertProfile(userId: string, profile: Partial<Profile>): Promise<Profile>;
  
  // Media operations
  createMediaAsset(asset: Omit<MediaAsset, 'id' | 'createdAt' | 'updatedAt'>): Promise<MediaAsset>;
  getMediaAssets(ownerId: string, limit?: number): Promise<MediaAsset[]>;
  getMediaAsset(id: string): Promise<MediaAsset | undefined>;
  updateMediaAssetStatus(id: string, status: string): Promise<void>;
  
  // Moderation operations
  getModerationQueue(limit?: number): Promise<(ModerationQueueItem & { media: MediaAsset; owner: User })[]>;
  getModerationItem(id: string): Promise<ModerationQueueItem | undefined>;
  updateModerationItem(id: string, updates: Partial<ModerationQueueItem>): Promise<void>;
  
  // Payout operations
  createPayoutRequest(request: Omit<PayoutRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<PayoutRequest>;
  getPayoutRequests(userId: string): Promise<PayoutRequest[]>;
  updatePayoutRequest(id: string, updates: Partial<PayoutRequest>): Promise<void>;
  
  // Notification operations
  createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>;
  getNotifications(userId: string, limit?: number): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
  
  // KYC operations
  upsertKycVerification(verification: Omit<KycVerification, 'id' | 'createdAt' | 'updatedAt'>): Promise<KycVerification>;
  getKycVerification(userId: string): Promise<KycVerification | undefined>;
  
  // Audit operations
  createAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
  
  // Webhook operations
  createWebhook(webhook: Omit<Webhook, 'id' | 'createdAt' | 'updatedAt'>): Promise<Webhook>;
  getWebhooks(userId: string): Promise<Webhook[]>;
  
  // API key operations
  createApiKey(apiKey: Omit<ApiKey, 'id' | 'createdAt'>): Promise<ApiKey>;
  getApiKeys(userId: string): Promise<ApiKey[]>;
  
  // Theme operations
  createTheme(theme: InsertThemeSettings): Promise<ThemeSettings>;
  getThemes(): Promise<ThemeSettings[]>;
  getTheme(id: string): Promise<ThemeSettings | undefined>;
  getActiveTheme(): Promise<ThemeSettings | undefined>;
  updateTheme(id: string, updates: UpdateThemeSettings): Promise<ThemeSettings>;
  setActiveTheme(id: string): Promise<void>;
  deleteTheme(id: string): Promise<void>;
  
  // Stats operations
  getDashboardStats(userId: string): Promise<{
    totalRevenue: number;
    activeFans: number;
    contentViews: number;
    pendingReviews: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Local auth operations
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  // Profile operations
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async upsertProfile(userId: string, profileData: Partial<Profile>): Promise<Profile> {
    const [profile] = await db
      .insert(profiles)
      .values({ userId, ...profileData })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: {
          ...profileData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return profile;
  }

  // Media operations
  async createMediaAsset(asset: Omit<MediaAsset, 'id' | 'createdAt' | 'updatedAt'>): Promise<MediaAsset> {
    const [mediaAsset] = await db.insert(mediaAssets).values(asset).returning();
    return mediaAsset;
  }

  async getMediaAssets(ownerId: string, limit = 50): Promise<MediaAsset[]> {
    return db.select()
      .from(mediaAssets)
      .where(eq(mediaAssets.ownerId, ownerId))
      .orderBy(desc(mediaAssets.createdAt))
      .limit(limit);
  }

  async getMediaAsset(id: string): Promise<MediaAsset | undefined> {
    const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id));
    return asset;
  }

  async updateMediaAssetStatus(id: string, status: string): Promise<void> {
    await db
      .update(mediaAssets)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(mediaAssets.id, id));
  }

  async updateMediaAsset(id: string, updates: Partial<any>): Promise<void> {
    await db
      .update(mediaAssets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(mediaAssets.id, id));
  }

  // Moderation operations
  async getModerationQueue(limit = 50): Promise<(ModerationQueueItem & { media: MediaAsset; owner: User })[]> {
    return db.select({
      id: moderationQueue.id,
      mediaId: moderationQueue.mediaId,
      reason: moderationQueue.reason,
      status: moderationQueue.status,
      reviewerId: moderationQueue.reviewerId,
      notes: moderationQueue.notes,
      decidedAt: moderationQueue.decidedAt,
      createdAt: moderationQueue.createdAt,
      aiRecommendation: moderationQueue.aiRecommendation,
      aiConfidence: moderationQueue.aiConfidence,
      escalationReason: moderationQueue.escalationReason,
      priority: moderationQueue.priority,
      media: mediaAssets,
      owner: users,
    })
      .from(moderationQueue)
      .innerJoin(mediaAssets, eq(moderationQueue.mediaId, mediaAssets.id))
      .innerJoin(users, eq(mediaAssets.ownerId, users.id))
      .where(eq(moderationQueue.status, 'pending'))
      .orderBy(desc(moderationQueue.priority), desc(moderationQueue.createdAt))
      .limit(limit);
  }

  async getModerationItem(id: string): Promise<ModerationQueueItem | undefined> {
    const [item] = await db.select().from(moderationQueue).where(eq(moderationQueue.id, id));
    return item;
  }

  async updateModerationItem(id: string, updates: Partial<ModerationQueueItem>): Promise<void> {
    await db
      .update(moderationQueue)
      .set(updates)
      .where(eq(moderationQueue.id, id));
  }

  // Payout operations
  async createPayoutRequest(request: Omit<PayoutRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<PayoutRequest> {
    const [payoutRequest] = await db.insert(payoutRequests).values(request).returning();
    return payoutRequest;
  }

  async getPayoutRequests(userId: string): Promise<PayoutRequest[]> {
    return db.select()
      .from(payoutRequests)
      .where(eq(payoutRequests.userId, userId))
      .orderBy(desc(payoutRequests.createdAt));
  }

  async updatePayoutRequest(id: string, updates: Partial<PayoutRequest>): Promise<void> {
    await db
      .update(payoutRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(payoutRequests.id, id));
  }

  // Notification operations
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const [notif] = await db.insert(notifications).values(notification).returning();
    return notif;
  }

  async getNotifications(userId: string, limit = 50): Promise<Notification[]> {
    return db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async markNotificationRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(eq(notifications.id, id));
  }

  // KYC operations
  async upsertKycVerification(verification: Omit<KycVerification, 'id' | 'createdAt' | 'updatedAt'>): Promise<KycVerification> {
    const [kyc] = await db
      .insert(kycVerifications)
      .values(verification)
      .onConflictDoUpdate({
        target: [kycVerifications.userId, kycVerifications.provider],
        set: {
          ...verification,
          updatedAt: new Date(),
        },
      })
      .returning();
    return kyc;
  }

  async getKycVerification(userId: string): Promise<KycVerification | undefined> {
    const [kyc] = await db.select().from(kycVerifications).where(eq(kycVerifications.userId, userId));
    return kyc;
  }

  // Audit operations
  async createAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const [auditLog] = await db.insert(auditLogs).values(log).returning();
    return auditLog;
  }

  // 2257 Compliance operations
  async create2257Record(record: Omit<any, 'id' | 'createdAt'>): Promise<any> {
    const [created] = await db.insert(records2257).values(record).returning();
    return created;
  }

  async get2257Records(userId: string): Promise<any[]> {
    return db.select().from(records2257).where(eq(records2257.userId, userId));
  }

  async getKycByExternalId(externalId: string): Promise<any | undefined> {
    const [kyc] = await db.select().from(kycVerifications).where(eq(kycVerifications.externalId, externalId));
    return kyc;
  }

  async updateUser(id: string, updates: Partial<any>): Promise<void> {
    await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async getMediaAssetsByOwner(ownerId: string): Promise<any[]> {
    return db.select().from(mediaAssets).where(eq(mediaAssets.ownerId, ownerId));
  }

  async getAuditLogs(limit = 100): Promise<AuditLog[]> {
    return db.select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  // Webhook operations
  async createWebhook(webhook: Omit<Webhook, 'id' | 'createdAt' | 'updatedAt'>): Promise<Webhook> {
    const [wh] = await db.insert(webhooks).values(webhook).returning();
    return wh;
  }

  async getWebhooks(userId: string): Promise<Webhook[]> {
    return db.select()
      .from(webhooks)
      .where(eq(webhooks.userId, userId))
      .orderBy(desc(webhooks.createdAt));
  }

  // API key operations
  async createApiKey(apiKey: Omit<ApiKey, 'id' | 'createdAt'>): Promise<ApiKey> {
    const [key] = await db.insert(apiKeys).values(apiKey).returning();
    return key;
  }

  async getApiKeys(userId: string): Promise<ApiKey[]> {
    return db.select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt));
  }

  // Stats operations
  async getDashboardStats(userId: string): Promise<{
    totalRevenue: number;
    activeFans: number;
    contentViews: number;
    pendingReviews: number;
  }> {
    // Mock implementation - replace with actual calculations
    const [mediaCount] = await db.select({ count: count() })
      .from(mediaAssets)
      .where(eq(mediaAssets.ownerId, userId));

    const [pendingCount] = await db.select({ count: count() })
      .from(moderationQueue)
      .innerJoin(mediaAssets, eq(moderationQueue.mediaId, mediaAssets.id))
      .where(and(
        eq(mediaAssets.ownerId, userId),
        eq(moderationQueue.status, 'pending')
      ));

    return {
      totalRevenue: 12847, // Mock value
      activeFans: 2847, // Mock value
      contentViews: 184000, // Mock value
      pendingReviews: pendingCount.count,
    };
  }

  // Theme operations
  async createTheme(theme: InsertThemeSettings): Promise<ThemeSettings> {
    const [newTheme] = await db.insert(themeSettings).values(theme).returning();
    return newTheme;
  }

  async getThemes(): Promise<ThemeSettings[]> {
    return await db.select().from(themeSettings).orderBy(desc(themeSettings.createdAt));
  }

  async getTheme(id: string): Promise<ThemeSettings | undefined> {
    const [theme] = await db.select().from(themeSettings).where(eq(themeSettings.id, id));
    return theme;
  }

  async getActiveTheme(): Promise<ThemeSettings | undefined> {
    const [theme] = await db.select().from(themeSettings).where(eq(themeSettings.isActive, true));
    return theme;
  }

  async updateTheme(id: string, updates: UpdateThemeSettings): Promise<ThemeSettings> {
    const [theme] = await db
      .update(themeSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(themeSettings.id, id))
      .returning();
    return theme;
  }

  async setActiveTheme(id: string): Promise<void> {
    // First, deactivate all themes
    await db.update(themeSettings).set({ isActive: false });
    // Then activate the selected theme
    await db.update(themeSettings).set({ isActive: true }).where(eq(themeSettings.id, id));
  }

  async deleteTheme(id: string): Promise<void> {
    await db.delete(themeSettings).where(eq(themeSettings.id, id));
  }
}

export const storage = new DatabaseStorage();
