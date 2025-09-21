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
  // Creator Economy Types
  type CreatorProfile,
  type Subscription,
  type Post,
  type Comment,
  type Like,
  type Message,
  type Transaction,
  type Category,
  type LiveStream,
  type Report,
  // Creator Economy Tables
  creatorProfiles,
  subscriptions,
  posts,
  comments,
  likes,
  messages,
  transactions,
  categories,
  liveStreams,
  reports,
  // Admin delegation
  delegatedPermissions,
  type DelegatedPermission,
  type InsertDelegatedPermission,
  // DMCA compliance
  dmcaRequests,
  repeatInfringers,
  contentHashes,
  type DmcaRequest,
  type InsertDmcaRequest,
  type RepeatInfringer,
  type InsertRepeatInfringer,
  type ContentHash,
  type InsertContentHash,
  // Lovense integration
  type InsertLovenseDevice,
  type LovenseDevice,
  type InsertLovenseDeviceAction,
  type LovenseDeviceAction,
  type InsertLovenseIntegrationSettings,
  type LovenseIntegrationSettings,
  type UpdateLovenseIntegrationSettings,
  // Enhanced Lovense integration
  type LovenseAccount,
  type InsertLovenseAccount,
  type LovenseMapping,
  type InsertLovenseMapping,
  type LovenseSession,
  type InsertLovenseSession,
  lovenseDevices,
  lovenseDeviceActions,
  lovenseIntegrationSettings,
  lovenseAccounts,
  lovenseMappings,
  lovenseSessions,
  // Enhanced Subscription System
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type PromoCode,
  type InsertPromoCode,
  type PromoCodeUsage,
  type InsertPromoCodeUsage,
  type SubscriptionEnhanced,
  type InsertSubscriptionEnhanced,
  subscriptionPlans,
  promoCodes,
  promoCodeUsages,
  subscriptionsEnhanced,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql, or, lt, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  // Local auth operations
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<void>;
  
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
  
  // Creator Economy Operations
  
  // Creator Profiles
  createCreatorProfile(profile: Omit<CreatorProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<CreatorProfile>;
  getCreatorProfile(userId: string): Promise<CreatorProfile | undefined>;
  updateCreatorProfile(userId: string, updates: Partial<CreatorProfile>): Promise<CreatorProfile>;
  getCreators(limit?: number, categoryFilter?: string): Promise<(CreatorProfile & { user: User })[]>;

  // Subscriptions
  createSubscription(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription>;
  getSubscription(fanId: string, creatorId: string): Promise<Subscription | undefined>;
  getCreatorSubscriptions(creatorId: string): Promise<(Subscription & { fan: User })[]>;
  getFanSubscriptions(fanId: string): Promise<(Subscription & { creator: User })[]>;
  updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<Subscription>;

  // Posts
  createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post>;
  getPost(postId: string): Promise<Post | undefined>;
  getCreatorPosts(creatorId: string, limit?: number): Promise<Post[]>;
  getFeedPosts(userId: string, limit?: number, cursor?: { createdAt: Date; id: string }): Promise<{
    posts: (Post & { creator: User })[];
    nextCursor?: { createdAt: Date; id: string };
    hasMore: boolean;
  }>;
  updatePost(postId: string, updates: Partial<Post>): Promise<Post>;
  deletePost(postId: string): Promise<void>;

  // Comments & Likes
  createComment(comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment>;
  getPostComments(postId: string): Promise<(Comment & { user: User })[]>;
  likePost(userId: string, postId: string): Promise<void>;
  unlikePost(userId: string, postId: string): Promise<void>;

  // Messages
  createMessage(message: Omit<Message, 'id' | 'createdAt'>): Promise<Message>;
  getConversation(userId1: string, userId2: string, limit?: number): Promise<(Message & { sender: User; receiver: User })[]>;
  getUserConversations(userId: string): Promise<{ otherUser: User; lastMessage: Message; unreadCount: number }[]>;
  markMessageRead(messageId: string): Promise<void>;

  // Transactions
  createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction>;
  getCreatorEarnings(creatorId: string, startDate?: Date, endDate?: Date): Promise<Transaction[]>;
  getFanPurchases(fanId: string, limit?: number): Promise<Transaction[]>;

  // Live Streams
  createLiveStream(stream: Omit<LiveStream, 'id' | 'createdAt'>): Promise<LiveStream>;
  getLiveStream(streamId: string): Promise<LiveStream | undefined>;
  getLiveStreams(userId: string, options?: { status?: string; limit?: number }): Promise<LiveStream[]>;
  getCreatorStreams(creatorId: string): Promise<LiveStream[]>;
  getActiveStreams(): Promise<(LiveStream & { creator: User })[]>;
  getPublicLiveStreams(options?: { limit?: number; offset?: number }): Promise<(LiveStream & { creator: User })[]>;
  updateStreamStatus(streamId: string, status: string): Promise<void>;
  updateStreamField(streamId: string, field: string, value: any): Promise<void>;

  // Stats operations
  getDashboardStats(userId: string): Promise<{
    totalRevenue: number;
    activeFans: number;
    contentViews: number;
    pendingReviews: number;
  }>;

  // Admin delegation operations
  grantPermission(permission: InsertDelegatedPermission): Promise<DelegatedPermission>;
  revokePermission(userId: string, permission: string): Promise<void>;
  getUserPermissions(userId: string): Promise<DelegatedPermission[]>;
  hasPermission(userId: string, permission: string): Promise<boolean>;
  getAllDelegatedPermissions(): Promise<DelegatedPermission[]>;

  // Lovense integration operations
  getLovenseIntegrationSettings(creatorId: string): Promise<LovenseIntegrationSettings | undefined>;
  updateLovenseIntegrationSettings(creatorId: string, settings: UpdateLovenseIntegrationSettings): Promise<LovenseIntegrationSettings>;
  getLovenseDevices(creatorId: string): Promise<LovenseDevice[]>;
  getLovenseDevice(deviceId: string): Promise<LovenseDevice | undefined>;
  getLovenseDeviceByDeviceId(creatorId: string, deviceId: string): Promise<LovenseDevice | undefined>;
  createLovenseDevice(creatorId: string, device: InsertLovenseDevice): Promise<LovenseDevice>;
  updateLovenseDevice(deviceId: string, updates: Partial<LovenseDevice>): Promise<LovenseDevice>;
  getActiveLovenseDevices(creatorId: string): Promise<LovenseDevice[]>;
  createLovenseDeviceAction(action: InsertLovenseDeviceAction): Promise<LovenseDeviceAction>;
  getLovenseDeviceActions(deviceId: string, limit?: number): Promise<LovenseDeviceAction[]>;
  
  // Enhanced Lovense integration operations
  getLovenseAccount(userId: string): Promise<LovenseAccount | undefined>;
  createLovenseAccount(account: InsertLovenseAccount): Promise<LovenseAccount>;
  updateLovenseAccount(userId: string, updates: Partial<LovenseAccount>): Promise<LovenseAccount>;
  deleteLovenseAccount(userId: string): Promise<boolean>;
  getLovenseMappings(userId: string): Promise<LovenseMapping[]>;
  getLovenseMappingsByEvent(userId: string, eventType: string): Promise<LovenseMapping[]>;
  createLovenseMapping(mapping: InsertLovenseMapping): Promise<LovenseMapping>;
  updateLovenseMapping(mappingId: string, updates: Partial<LovenseMapping>): Promise<LovenseMapping>;
  deleteLovenseMapping(mappingId: string): Promise<boolean>;
  getLovenseSession(sessionId: string): Promise<LovenseSession | undefined>;
  getUserLovenseSessions(userId: string): Promise<LovenseSession[]>;
  getActiveLovenseSessions(userId: string): Promise<LovenseSession[]>;
  createLovenseSession(session: InsertLovenseSession): Promise<LovenseSession>;
  updateLovenseSession(sessionId: string, updates: Partial<LovenseSession>): Promise<LovenseSession>;
  disconnectLovenseSession(sessionId: string): Promise<boolean>;
  cleanupInactiveLovenseSessions(): Promise<number>;
  
  // DMCA compliance operations
  createDmcaRequest(request: InsertDmcaRequest): Promise<DmcaRequest>;
  getDmcaRequest(id: string): Promise<DmcaRequest | undefined>;
  updateDmcaRequest(id: string, updates: Partial<DmcaRequest>): Promise<void>;
  getDmcaRequestsByUser(userId: string): Promise<DmcaRequest[]>;
  getDmcaRequestsCount(status?: string): Promise<number>;
  getKycByExternalId(externalId: string): Promise<KycVerification | undefined>;
  
  // Content hash operations
  saveContentHash(hash: InsertContentHash): Promise<ContentHash>;
  checkBlockedHash(hashes: string[]): Promise<ContentHash | undefined>;
  getBlockedHashesCount(): Promise<number>;
  
  // Repeat infringer operations
  getRepeatInfringer(userId: string): Promise<RepeatInfringer | undefined>;
  saveRepeatInfringer(infringer: InsertRepeatInfringer): Promise<RepeatInfringer>;
  getRepeatInfringersCount(): Promise<number>;
  
  // Enhanced user operations
  updateUser(userId: string, updates: Partial<User>): Promise<void>;
  getMediaAssetsByOwner(ownerId: string): Promise<MediaAsset[]>;
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

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async updateUserRole(userId: string, role: string): Promise<void> {
    await db
      .update(users)
      .set({ role: role as any, updatedAt: new Date() })
      .where(eq(users.id, userId));
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

  // Creator Economy Methods - Creator Profiles
  async createCreatorProfile(profile: Omit<CreatorProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<CreatorProfile> {
    const [createdProfile] = await db.insert(creatorProfiles).values(profile).returning();
    return createdProfile;
  }

  async getCreatorProfile(userId: string): Promise<CreatorProfile | undefined> {
    const [profile] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.userId, userId));
    return profile;
  }

  async updateCreatorProfile(userId: string, updates: Partial<CreatorProfile>): Promise<CreatorProfile> {
    const [updatedProfile] = await db
      .update(creatorProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(creatorProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  async getCreators(limit = 50, categoryFilter?: string): Promise<(CreatorProfile & { user: User })[]> {
    let query = db
      .select()
      .from(creatorProfiles)
      .innerJoin(users, eq(creatorProfiles.userId, users.id))
      .orderBy(desc(creatorProfiles.totalSubscribers))
      .limit(limit);

    // Apply category filter if provided
    if (categoryFilter) {
      query = query.where(sql`${creatorProfiles.categories} @> ARRAY[${categoryFilter}]`);
    }

    const results = await query;
    return results.map(row => ({
      ...row.creator_profiles,
      user: row.users,
    }));
  }

  // Subscription Methods
  async createSubscription(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
    const [createdSubscription] = await db
      .insert(subscriptions)
      .values(subscription)
      .onConflictDoUpdate({
        target: [subscriptions.fanId, subscriptions.creatorId],
        set: {
          status: subscription.status,
          monthlyPriceCents: subscription.monthlyPriceCents,
          stripeSubscriptionId: subscription.stripeSubscriptionId,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelledAt: subscription.cancelledAt,
          updatedAt: new Date(),
        },
      })
      .returning();
    return createdSubscription;
  }

  async getSubscription(fanId: string, creatorId: string): Promise<Subscription | undefined> {
    const [subscription] = await db.select()
      .from(subscriptions)
      .where(and(eq(subscriptions.fanId, fanId), eq(subscriptions.creatorId, creatorId)));
    return subscription;
  }

  async getCreatorSubscriptions(creatorId: string): Promise<(Subscription & { fan: User })[]> {
    return await db.select({
      id: subscriptions.id,
      fanId: subscriptions.fanId,
      creatorId: subscriptions.creatorId,
      stripeSubscriptionId: subscriptions.stripeSubscriptionId,
      status: subscriptions.status,
      monthlyPriceCents: subscriptions.monthlyPriceCents,
      currentPeriodStart: subscriptions.currentPeriodStart,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      cancelledAt: subscriptions.cancelledAt,
      createdAt: subscriptions.createdAt,
      updatedAt: subscriptions.updatedAt,
      fan: users,
    })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.fanId, users.id))
    .where(eq(subscriptions.creatorId, creatorId))
    .orderBy(desc(subscriptions.createdAt));
  }

  async getFanSubscriptions(fanId: string): Promise<(Subscription & { creator: User })[]> {
    return await db.select({
      id: subscriptions.id,
      fanId: subscriptions.fanId,
      creatorId: subscriptions.creatorId,
      stripeSubscriptionId: subscriptions.stripeSubscriptionId,
      status: subscriptions.status,
      monthlyPriceCents: subscriptions.monthlyPriceCents,
      currentPeriodStart: subscriptions.currentPeriodStart,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      cancelledAt: subscriptions.cancelledAt,
      createdAt: subscriptions.createdAt,
      updatedAt: subscriptions.updatedAt,
      creator: users,
    })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.creatorId, users.id))
    .where(eq(subscriptions.fanId, fanId))
    .orderBy(desc(subscriptions.createdAt));
  }

  async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<Subscription> {
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(subscriptions.id, subscriptionId))
      .returning();
    return updatedSubscription;
  }

  // Posts Methods
  async createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    const [createdPost] = await db.insert(posts).values(post).returning();
    return createdPost;
  }

  async getPost(postId: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, postId));
    return post;
  }

  async getCreatorPosts(creatorId: string, limit = 50): Promise<Post[]> {
    return await db.select()
      .from(posts)
      .where(eq(posts.creatorId, creatorId))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async getFeedPosts(userId: string, limit = 50, cursor?: { createdAt: Date; id: string }): Promise<{
    posts: (Post & { creator: User })[];
    nextCursor?: { createdAt: Date; id: string };
    hasMore: boolean;
  }> {
    // Get posts from creators the user subscribes to (free + premium content)
    // Also include free posts from creators user doesn't subscribe to
    const currentTime = new Date();
    
    let whereConditions = [
      // Post is ready (not scheduled or scheduled for now/past)
      sql`(${posts.scheduledFor} IS NULL OR ${posts.scheduledFor} <= ${currentTime})`,
      // Post is not processing
      sql`${posts.isProcessing} = false`,
      // Post hasn't expired (for stories)
      sql`(${posts.expiresAt} IS NULL OR ${posts.expiresAt} > ${currentTime})`,
      // Visibility logic: free posts for everyone, premium/subscribers_only for active subscribers or creators seeing their own posts
      sql`(
        ${posts.visibility} = 'free' OR 
        ${posts.creatorId} = ${userId} OR
        (${subscriptions.id} IS NOT NULL AND ${posts.visibility} IN ('premium', 'subscribers_only'))
      )`
    ];

    // Add cursor-based pagination
    if (cursor) {
      whereConditions.push(sql`(
        ${posts.createdAt} < ${cursor.createdAt} OR 
        (${posts.createdAt} = ${cursor.createdAt} AND ${posts.id} < ${cursor.id})
      )`);
    }
    
    // Fetch one extra to determine if there are more results
    const results = await db
      .select()
      .from(posts)
      .innerJoin(users, eq(posts.creatorId, users.id))
      .leftJoin(subscriptions, and(
        eq(subscriptions.creatorId, posts.creatorId),
        eq(subscriptions.fanId, userId),
        eq(subscriptions.status, 'active'),
        // Time-bounded subscription validation
        sql`${subscriptions.currentPeriodStart} <= ${currentTime}`,
        sql`(${subscriptions.currentPeriodEnd} IS NULL OR ${subscriptions.currentPeriodEnd} > ${currentTime})`
      ))
      .where(and(...whereConditions))
      .orderBy(desc(posts.createdAt), desc(posts.id))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const postsData = results.slice(0, limit);
    
    let nextCursor: { createdAt: Date; id: string } | undefined;
    if (hasMore && postsData.length > 0) {
      const lastPost = postsData[postsData.length - 1];
      nextCursor = {
        createdAt: lastPost.posts.createdAt!,
        id: lastPost.posts.id,
      };
    }

    return {
      posts: postsData.map((row: any) => ({
        ...row.posts,
        creator: row.users,
      })),
      nextCursor,
      hasMore,
    };
  }

  async updatePost(postId: string, updates: Partial<Post>): Promise<Post> {
    const [updatedPost] = await db
      .update(posts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(posts.id, postId))
      .returning();
    return updatedPost;
  }

  async deletePost(postId: string): Promise<void> {
    await db.delete(posts).where(eq(posts.id, postId));
  }

  // Essential Social Methods
  async createComment(comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment> {
    const [createdComment] = await db.insert(comments).values(comment).returning();
    return createdComment;
  }

  async getPostComments(postId: string): Promise<(Comment & { user: User })[]> {
    const results = await db
      .select()
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(comments.createdAt);
    
    return results.map(row => ({
      ...row.comments,
      user: row.users,
    }));
  }

  async likePost(userId: string, postId: string): Promise<void> {
    await db
      .insert(likes)
      .values({ userId, postId, commentId: null })
      .onConflictDoNothing();
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    await db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
  }

  async createMessage(message: any): Promise<Message> {
    throw new Error("Not implemented yet");
  }

  async getConversation(userId1: string, userId2: string, limit?: number): Promise<any[]> {
    return [];
  }

  async getUserConversations(userId: string): Promise<any[]> {
    return [];
  }

  async markMessageRead(messageId: string): Promise<void> {
    throw new Error("Not implemented yet");
  }

  async createTransaction(transaction: any): Promise<Transaction> {
    throw new Error("Not implemented yet");
  }

  async getCreatorEarnings(creatorId: string, startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    return [];
  }

  async getFanPurchases(fanId: string, limit?: number): Promise<Transaction[]> {
    return [];
  }

  async createLiveStream(stream: Omit<LiveStream, 'id' | 'createdAt'>): Promise<LiveStream> {
    const [created] = await db.insert(liveStreams).values(stream).returning();
    return created;
  }

  async getLiveStream(streamId: string): Promise<LiveStream | undefined> {
    const [stream] = await db.select().from(liveStreams).where(eq(liveStreams.id, streamId));
    return stream;
  }

  async getLiveStreams(userId: string, options?: { status?: string; limit?: number }): Promise<LiveStream[]> {
    const conditions = [eq(liveStreams.creatorId, userId)];
    
    if (options?.status) {
      conditions.push(eq(liveStreams.status, options.status as any));
    }
    
    let query = db.select().from(liveStreams).where(and(...conditions)).orderBy(desc(liveStreams.createdAt));
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    return await query;
  }

  async getCreatorStreams(creatorId: string): Promise<LiveStream[]> {
    return await db.select().from(liveStreams)
      .where(eq(liveStreams.creatorId, creatorId))
      .orderBy(desc(liveStreams.createdAt));
  }

  async getActiveStreams(): Promise<(LiveStream & { creator: User })[]> {
    return await db.select({
      id: liveStreams.id,
      creatorId: liveStreams.creatorId,
      title: liveStreams.title,
      description: liveStreams.description,
      type: liveStreams.type,
      status: liveStreams.status,
      priceCents: liveStreams.priceCents,
      streamKey: liveStreams.streamKey,
      streamUrl: liveStreams.streamUrl,
      thumbnailUrl: liveStreams.thumbnailUrl,
      getstreamCallId: liveStreams.getstreamCallId,
      recordingUrl: liveStreams.recordingUrl,
      playbackUrl: liveStreams.playbackUrl,
      hlsPlaylistUrl: liveStreams.hlsPlaylistUrl,
      rtmpIngestUrl: liveStreams.rtmpIngestUrl,
      viewersCount: liveStreams.viewersCount,
      maxViewers: liveStreams.maxViewers,
      totalTipsCents: liveStreams.totalTipsCents,
      scheduledFor: liveStreams.scheduledFor,
      startedAt: liveStreams.startedAt,
      endedAt: liveStreams.endedAt,
      createdAt: liveStreams.createdAt,
      updatedAt: liveStreams.updatedAt,
      creator: {
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      },
    })
    .from(liveStreams)
    .innerJoin(users, eq(liveStreams.creatorId, users.id))
    .where(eq(liveStreams.status, 'live'))
    .orderBy(desc(liveStreams.startedAt));
  }

  async getPublicLiveStreams(options?: { limit?: number; offset?: number }): Promise<(LiveStream & { creator: User })[]> {
    let query = db.select({
      id: liveStreams.id,
      creatorId: liveStreams.creatorId,
      title: liveStreams.title,
      description: liveStreams.description,
      type: liveStreams.type,
      status: liveStreams.status,
      priceCents: liveStreams.priceCents,

      thumbnailUrl: liveStreams.thumbnailUrl,
      getstreamCallId: liveStreams.getstreamCallId,

      recordingUrl: liveStreams.recordingUrl,
      playbackUrl: liveStreams.playbackUrl,
      hlsPlaylistUrl: liveStreams.hlsPlaylistUrl,
      rtmpIngestUrl: liveStreams.rtmpIngestUrl,
      viewersCount: liveStreams.viewersCount,
      maxViewers: liveStreams.maxViewers,
      totalTipsCents: liveStreams.totalTipsCents,
      scheduledFor: liveStreams.scheduledFor,
      startedAt: liveStreams.startedAt,
      endedAt: liveStreams.endedAt,
      createdAt: liveStreams.createdAt,
      updatedAt: liveStreams.updatedAt,
      // SECURITY: streamKey and streamUrl are secrets - never expose in public APIs
      creator: {
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      },
    })
    .from(liveStreams)
    .innerJoin(users, eq(liveStreams.creatorId, users.id))
    .where(and(eq(liveStreams.status, 'live'), eq(liveStreams.type, 'public')))
    .orderBy(desc(liveStreams.viewersCount), desc(liveStreams.startedAt));
    
    // Enforce safe pagination limits
    const limit = options?.limit !== undefined ? Math.min(options.limit, 100) : 20;
    const offset = options?.offset !== undefined ? options.offset : 0;
    
    return await query.limit(limit).offset(offset);
  }

  async updateStreamStatus(streamId: string, status: string): Promise<void> {
    await db.update(liveStreams)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(liveStreams.id, streamId));
  }

  async updateStreamField(streamId: string, field: string, value: any): Promise<void> {
    const updateData: any = { updatedAt: new Date() };
    updateData[field] = value;
    
    await db.update(liveStreams)
      .set(updateData)
      .where(eq(liveStreams.id, streamId));
  }

  // Admin delegation operations
  async grantPermission(permission: InsertDelegatedPermission): Promise<DelegatedPermission> {
    const [granted] = await db
      .insert(delegatedPermissions)
      .values(permission)
      .onConflictDoUpdate({
        target: [delegatedPermissions.userId, delegatedPermissions.permission],
        set: { granted: permission.granted, grantedBy: permission.grantedBy, expiresAt: permission.expiresAt }
      })
      .returning();
    return granted;
  }

  async revokePermission(userId: string, permission: string): Promise<void> {
    await db
      .update(delegatedPermissions)
      .set({ granted: false })
      .where(and(
        eq(delegatedPermissions.userId, userId),
        eq(delegatedPermissions.permission, permission as any)
      ));
  }

  async getUserPermissions(userId: string): Promise<DelegatedPermission[]> {
    return await db
      .select()
      .from(delegatedPermissions)
      .where(and(
        eq(delegatedPermissions.userId, userId),
        eq(delegatedPermissions.granted, true)
      ));
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(delegatedPermissions)
      .where(and(
        eq(delegatedPermissions.userId, userId),
        eq(delegatedPermissions.permission, permission as any),
        eq(delegatedPermissions.granted, true)
      ));
    return !!result;
  }

  async getAllDelegatedPermissions(): Promise<DelegatedPermission[]> {
    return await db
      .select()
      .from(delegatedPermissions)
      .where(eq(delegatedPermissions.granted, true))
      .orderBy(delegatedPermissions.createdAt);
  }

  // Lovense integration operations
  async getLovenseIntegrationSettings(creatorId: string): Promise<LovenseIntegrationSettings | undefined> {
    const result = await db.select().from(lovenseIntegrationSettings)
      .where(eq(lovenseIntegrationSettings.creatorId, creatorId))
      .limit(1);
    return result[0];
  }

  async updateLovenseIntegrationSettings(creatorId: string, settings: UpdateLovenseIntegrationSettings): Promise<LovenseIntegrationSettings> {
    const updatedSettings = { 
      ...settings, 
      updatedAt: new Date().toISOString() 
    };
    
    const result = await db.insert(lovenseIntegrationSettings)
      .values({
        creatorId,
        ...settings,
        updatedAt: new Date().toISOString()
      })
      .onConflictDoUpdate({
        target: lovenseIntegrationSettings.creatorId,
        set: updatedSettings
      })
      .returning();
    
    return result[0];
  }

  async getLovenseDevices(creatorId: string): Promise<LovenseDevice[]> {
    return await db.select().from(lovenseDevices)
      .where(eq(lovenseDevices.creatorId, creatorId))
      .orderBy(desc(lovenseDevices.lastConnected));
  }

  async getLovenseDevice(deviceId: string): Promise<LovenseDevice | undefined> {
    const result = await db.select().from(lovenseDevices)
      .where(eq(lovenseDevices.id, deviceId))
      .limit(1);
    return result[0];
  }

  async getLovenseDeviceByDeviceId(creatorId: string, deviceId: string): Promise<LovenseDevice | undefined> {
    const result = await db.select().from(lovenseDevices)
      .where(and(
        eq(lovenseDevices.creatorId, creatorId),
        eq(lovenseDevices.deviceId, deviceId)
      ))
      .limit(1);
    return result[0];
  }

  async createLovenseDevice(creatorId: string, device: InsertLovenseDevice): Promise<LovenseDevice> {
    const result = await db.insert(lovenseDevices)
      .values({
        ...device,
        creatorId,
        status: 'disconnected',
        lastConnected: new Date().toISOString()
      })
      .returning();
    return result[0];
  }

  async updateLovenseDevice(deviceId: string, updates: Partial<LovenseDevice>): Promise<LovenseDevice> {
    const result = await db.update(lovenseDevices)
      .set(updates)
      .where(eq(lovenseDevices.id, deviceId))
      .returning();
    return result[0];
  }

  async getActiveLovenseDevices(creatorId: string): Promise<LovenseDevice[]> {
    return await db.select().from(lovenseDevices)
      .where(and(
        eq(lovenseDevices.creatorId, creatorId),
        eq(lovenseDevices.isEnabled, true),
        eq(lovenseDevices.status, 'connected')
      ));
  }

  async createLovenseDeviceAction(action: InsertLovenseDeviceAction): Promise<LovenseDeviceAction> {
    const result = await db.insert(lovenseDeviceActions)
      .values(action)
      .returning();
    return result[0];
  }

  async getLovenseDeviceActions(deviceId: string, limit: number = 50): Promise<LovenseDeviceAction[]> {
    return await db.select().from(lovenseDeviceActions)
      .where(eq(lovenseDeviceActions.deviceId, deviceId))
      .orderBy(desc(lovenseDeviceActions.createdAt))
      .limit(limit);
  }

  // Enhanced Lovense Integration Operations
  async getLovenseAccount(userId: string): Promise<LovenseAccount | undefined> {
    const result = await db.select().from(lovenseAccounts)
      .where(eq(lovenseAccounts.userId, userId))
      .limit(1);
    return result[0];
  }

  async createLovenseAccount(account: InsertLovenseAccount): Promise<LovenseAccount> {
    const result = await db.insert(lovenseAccounts)
      .values(account)
      .returning();
    return result[0];
  }

  async updateLovenseAccount(userId: string, updates: Partial<LovenseAccount>): Promise<LovenseAccount> {
    const result = await db.update(lovenseAccounts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(lovenseAccounts.userId, userId))
      .returning();
    return result[0];
  }

  async deleteLovenseAccount(userId: string): Promise<boolean> {
    await db.delete(lovenseAccounts)
      .where(eq(lovenseAccounts.userId, userId));
    return true;
  }

  async getLovenseMappings(userId: string): Promise<LovenseMapping[]> {
    return await db.select().from(lovenseMappings)
      .where(and(
        eq(lovenseMappings.userId, userId),
        eq(lovenseMappings.isActive, true)
      ))
      .orderBy(lovenseMappings.eventType, lovenseMappings.triggerValue);
  }

  async getLovenseMappingsByEvent(userId: string, eventType: string): Promise<LovenseMapping[]> {
    return await db.select().from(lovenseMappings)
      .where(and(
        eq(lovenseMappings.userId, userId),
        eq(lovenseMappings.eventType, eventType),
        eq(lovenseMappings.isActive, true)
      ))
      .orderBy(lovenseMappings.triggerValue);
  }

  async createLovenseMapping(mapping: InsertLovenseMapping): Promise<LovenseMapping> {
    const result = await db.insert(lovenseMappings)
      .values(mapping)
      .returning();
    return result[0];
  }

  async updateLovenseMapping(mappingId: string, updates: Partial<LovenseMapping>): Promise<LovenseMapping> {
    const result = await db.update(lovenseMappings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(lovenseMappings.id, mappingId))
      .returning();
    return result[0];
  }

  async deleteLovenseMapping(mappingId: string): Promise<boolean> {
    await db.update(lovenseMappings)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(lovenseMappings.id, mappingId));
    return true;
  }

  async getLovenseSession(sessionId: string): Promise<LovenseSession | undefined> {
    const result = await db.select().from(lovenseSessions)
      .where(eq(lovenseSessions.sessionId, sessionId))
      .limit(1);
    return result[0];
  }

  async getUserLovenseSessions(userId: string): Promise<LovenseSession[]> {
    return await db.select().from(lovenseSessions)
      .where(eq(lovenseSessions.userId, userId))
      .orderBy(desc(lovenseSessions.createdAt));
  }

  async getActiveLovenseSessions(userId: string): Promise<LovenseSession[]> {
    return await db.select().from(lovenseSessions)
      .where(and(
        eq(lovenseSessions.userId, userId),
        eq(lovenseSessions.connectionStatus, 'connected')
      ))
      .orderBy(desc(lovenseSessions.connectedAt));
  }

  async createLovenseSession(session: InsertLovenseSession): Promise<LovenseSession> {
    const result = await db.insert(lovenseSessions)
      .values(session)
      .returning();
    return result[0];
  }

  async updateLovenseSession(sessionId: string, updates: Partial<LovenseSession>): Promise<LovenseSession> {
    const result = await db.update(lovenseSessions)
      .set(updates)
      .where(eq(lovenseSessions.sessionId, sessionId))
      .returning();
    return result[0];
  }

  async disconnectLovenseSession(sessionId: string): Promise<boolean> {
    await db.update(lovenseSessions)
      .set({ 
        connectionStatus: 'disconnected',
        disconnectedAt: new Date()
      })
      .where(eq(lovenseSessions.sessionId, sessionId));
    return true;
  }

  async cleanupInactiveLovenseSessions(): Promise<number> {
    const cutoffTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
    const result = await db.update(lovenseSessions)
      .set({ 
        connectionStatus: 'disconnected',
        disconnectedAt: new Date()
      })
      .where(and(
        eq(lovenseSessions.connectionStatus, 'connected'),
        or(
          lt(lovenseSessions.lastPingAt, cutoffTime),
          isNull(lovenseSessions.lastPingAt)
        )
      ))
      .returning();
    return result.length;
  }

  // Enhanced Subscription System Operations
  async getCreatorSubscriptionPlans(creatorId: string): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans)
      .where(and(
        eq(subscriptionPlans.creatorId, creatorId),
        eq(subscriptionPlans.isActive, true)
      ))
      .orderBy(subscriptionPlans.sortOrder, subscriptionPlans.priceCents);
  }

  async getSubscriptionPlan(planId: string): Promise<SubscriptionPlan | undefined> {
    const result = await db.select().from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);
    return result[0];
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const result = await db.insert(subscriptionPlans)
      .values({
        ...plan,
        originalPriceCents: plan.originalPriceCents || plan.priceCents,
      })
      .returning();
    return result[0];
  }

  async updateSubscriptionPlan(planId: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const result = await db.update(subscriptionPlans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(subscriptionPlans.id, planId))
      .returning();
    return result[0];
  }

  async deleteSubscriptionPlan(planId: string): Promise<boolean> {
    await db.update(subscriptionPlans)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(subscriptionPlans.id, planId));
    return true;
  }

  // Promo Code Operations
  async getPromoCodeByCode(code: string): Promise<PromoCode | undefined> {
    const result = await db.select().from(promoCodes)
      .where(and(
        eq(promoCodes.code, code.toUpperCase()),
        eq(promoCodes.isActive, true),
        eq(promoCodes.status, 'active')
      ))
      .limit(1);
    return result[0];
  }

  async getCreatorPromoCodes(creatorId: string): Promise<PromoCode[]> {
    return await db.select().from(promoCodes)
      .where(eq(promoCodes.creatorId, creatorId))
      .orderBy(desc(promoCodes.createdAt));
  }

  async createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode> {
    const result = await db.insert(promoCodes)
      .values({
        ...promoCode,
        code: promoCode.code.toUpperCase(),
      })
      .returning();
    return result[0];
  }

  async updatePromoCode(codeId: string, updates: Partial<PromoCode>): Promise<PromoCode> {
    const result = await db.update(promoCodes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(promoCodes.id, codeId))
      .returning();
    return result[0];
  }

  async validatePromoCode(code: string, planId: string, userId: string): Promise<{
    valid: boolean;
    promoCode?: PromoCode;
    error?: string;
    discountedPrice?: number;
    savings?: number;
  }> {
    const promoCode = await this.getPromoCodeByCode(code);
    
    if (!promoCode) {
      return { valid: false, error: 'Invalid promo code' };
    }

    // Check if code is active and valid
    const now = new Date();
    if (promoCode.validUntil && new Date(promoCode.validUntil) < now) {
      await db.update(promoCodes)
        .set({ status: 'expired', updatedAt: new Date() })
        .where(eq(promoCodes.id, promoCode.id));
      return { valid: false, error: 'Promo code has expired' };
    }

    // Check usage limits
    if (promoCode.maxUsageCount && promoCode.currentUsageCount >= promoCode.maxUsageCount) {
      await db.update(promoCodes)
        .set({ status: 'exhausted', updatedAt: new Date() })
        .where(eq(promoCodes.id, promoCode.id));
      return { valid: false, error: 'Promo code usage limit reached' };
    }

    // Check if user has already used this code (for first-time only codes)
    if (promoCode.firstTimeOnly) {
      const existingUsage = await db.select().from(promoCodeUsages)
        .where(and(
          eq(promoCodeUsages.promoCodeId, promoCode.id),
          eq(promoCodeUsages.userId, userId)
        ))
        .limit(1);
      
      if (existingUsage.length > 0) {
        return { valid: false, error: 'This promo code can only be used once per user' };
      }
    }

    // Check if code applies to this plan
    if (promoCode.applicablePlans.length > 0 && !promoCode.applicablePlans.includes(planId)) {
      return { valid: false, error: 'This promo code is not valid for the selected plan' };
    }

    // Get plan details for price calculation
    const plan = await this.getSubscriptionPlan(planId);
    if (!plan) {
      return { valid: false, error: 'Invalid subscription plan' };
    }

    // Check minimum purchase requirement
    if (plan.priceCents < promoCode.minPurchaseCents) {
      return { valid: false, error: `Minimum purchase of $${promoCode.minPurchaseCents / 100} required` };
    }

    // Calculate discount
    let discountedPrice = plan.priceCents;
    let savings = 0;

    switch (promoCode.type) {
      case 'percentage':
        if (promoCode.discountPercentage) {
          savings = Math.round((plan.priceCents * promoCode.discountPercentage) / 100);
          discountedPrice = plan.priceCents - savings;
        }
        break;
      case 'fixed_amount':
        if (promoCode.discountAmountCents) {
          savings = Math.min(promoCode.discountAmountCents, plan.priceCents);
          discountedPrice = plan.priceCents - savings;
        }
        break;
      case 'free_trial':
        // Free trial doesn't affect price but extends trial period
        discountedPrice = plan.priceCents;
        savings = 0;
        break;
    }

    return {
      valid: true,
      promoCode,
      discountedPrice: Math.max(0, discountedPrice),
      savings
    };
  }

  async recordPromoCodeUsage(usage: InsertPromoCodeUsage): Promise<PromoCodeUsage> {
    const result = await db.insert(promoCodeUsages)
      .values(usage)
      .returning();

    // Update promo code usage count
    await db.update(promoCodes)
      .set({
        currentUsageCount: sql`${promoCodes.currentUsageCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(promoCodes.id, usage.promoCodeId));

    return result[0];
  }

  // Enhanced Subscription Operations
  async createEnhancedSubscription(subscription: InsertSubscriptionEnhanced): Promise<SubscriptionEnhanced> {
    const result = await db.insert(subscriptionsEnhanced)
      .values(subscription)
      .returning();

    // Update subscription plan subscriber count
    await db.update(subscriptionPlans)
      .set({
        currentSubscribers: sql`${subscriptionPlans.currentSubscribers} + 1`,
        updatedAt: new Date()
      })
      .where(eq(subscriptionPlans.id, subscription.subscriptionPlanId));

    return result[0];
  }

  async getEnhancedSubscription(fanId: string, creatorId: string): Promise<SubscriptionEnhanced | undefined> {
    const result = await db.select().from(subscriptionsEnhanced)
      .where(and(
        eq(subscriptionsEnhanced.fanId, fanId),
        eq(subscriptionsEnhanced.creatorId, creatorId)
      ))
      .limit(1);
    return result[0];
  }

  async getUserEnhancedSubscriptions(userId: string): Promise<SubscriptionEnhanced[]> {
    return await db.select().from(subscriptionsEnhanced)
      .where(eq(subscriptionsEnhanced.fanId, userId))
      .orderBy(desc(subscriptionsEnhanced.createdAt));
  }

  async getCreatorEnhancedSubscriptions(creatorId: string): Promise<SubscriptionEnhanced[]> {
    return await db.select().from(subscriptionsEnhanced)
      .where(eq(subscriptionsEnhanced.creatorId, creatorId))
      .orderBy(desc(subscriptionsEnhanced.createdAt));
  }

  // DMCA compliance operations
  async createDmcaRequest(request: InsertDmcaRequest): Promise<DmcaRequest> {
    const [dmcaRequest] = await db.insert(dmcaRequests).values(request).returning();
    return dmcaRequest;
  }

  async getDmcaRequest(id: string): Promise<DmcaRequest | undefined> {
    const [dmcaRequest] = await db.select().from(dmcaRequests).where(eq(dmcaRequests.id, id));
    return dmcaRequest;
  }

  async updateDmcaRequest(id: string, updates: Partial<DmcaRequest>): Promise<void> {
    await db
      .update(dmcaRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(dmcaRequests.id, id));
  }

  async getDmcaRequestsByUser(userId: string): Promise<DmcaRequest[]> {
    return await db.select().from(dmcaRequests)
      .where(eq(dmcaRequests.userId, userId))
      .orderBy(desc(dmcaRequests.submittedAt));
  }

  async getDmcaRequestsCount(status?: string): Promise<number> {
    const query = db.select({ count: sql<number>`count(*)::int` }).from(dmcaRequests);
    
    if (status) {
      query.where(eq(dmcaRequests.status, status as any));
    }
    
    const [result] = await query;
    return result.count;
  }

  async getKycByExternalId(externalId: string): Promise<KycVerification | undefined> {
    const [kyc] = await db.select().from(kycVerifications)
      .where(eq(kycVerifications.externalId, externalId));
    return kyc;
  }

  // Content hash operations
  async saveContentHash(hash: InsertContentHash): Promise<ContentHash> {
    const [contentHash] = await db.insert(contentHashes).values(hash).returning();
    return contentHash;
  }

  async checkBlockedHash(hashes: string[]): Promise<ContentHash | undefined> {
    const [blockedHash] = await db.select().from(contentHashes)
      .where(sql`${contentHashes.hash} = ANY(${hashes})`);
    return blockedHash;
  }

  async getBlockedHashesCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)::int` }).from(contentHashes);
    return result.count;
  }

  // Repeat infringer operations
  async getRepeatInfringer(userId: string): Promise<RepeatInfringer | undefined> {
    const [infringer] = await db.select().from(repeatInfringers)
      .where(eq(repeatInfringers.userId, userId));
    return infringer;
  }

  async saveRepeatInfringer(infringer: InsertRepeatInfringer): Promise<RepeatInfringer> {
    const [savedInfringer] = await db
      .insert(repeatInfringers)
      .values(infringer)
      .onConflictDoUpdate({
        target: repeatInfringers.userId,
        set: {
          ...infringer,
          updatedAt: new Date(),
        },
      })
      .returning();
    return savedInfringer;
  }

  async getRepeatInfringersCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)::int` }).from(repeatInfringers);
    return result.count;
  }

  // Enhanced user operations
  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async getMediaAssetsByOwner(ownerId: string): Promise<MediaAsset[]> {
    return await db.select().from(mediaAssets)
      .where(eq(mediaAssets.ownerId, ownerId))
      .orderBy(desc(mediaAssets.createdAt));
  }
}

export const storage = new DatabaseStorage();
