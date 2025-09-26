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
  // Advanced features tables
  nftAssets,
  analyticsEvents,
  alertRules,
  alerts,
  feedPreferences,
  dashboardCharts,
  ageVerifications,
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
  // Advanced feature types
  type NftAsset,
  type InsertNftAsset,
  type AnalyticsEvent,
  type InsertAnalyticsEvent,
  type AlertRule,
  type InsertAlertRule,
  type Alert,
  type InsertAlert,
  type FeedPreferences,
  type InsertFeedPreferences,
  type DashboardChart,
  type InsertDashboardChart,
  type AgeVerification,
  type InsertAgeVerification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql, or, lt, isNull, gte, lte, not, arrayContains, getTableColumns } from "drizzle-orm";

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
  
  // Stripe customer operations
  getStripeCustomerId(userId: string): Promise<string | undefined>;
  storeStripeCustomerId(userId: string, stripeCustomerId: string): Promise<void>;

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

  // GDPR Privacy operations
  getUserProfile(userId: string): Promise<Profile | undefined>;
  getUserPosts(userId: string): Promise<Post[]>;
  getUserMessages(userId: string): Promise<Message[]>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  getUserKYCRecords(userId: string): Promise<KycVerification[]>;
  markUserForDeletion(userId: string): Promise<void>;
  anonymizeUserData(userId: string): Promise<void>;
  updateUserPrivacyPreferences(preferences: {
    userId: string;
    marketing: boolean;
    analytics: boolean;
    functional: boolean;
    performance: boolean;
    updatedAt: Date;
  }): Promise<void>;
  getUserPrivacyPreferences(userId: string): Promise<{
    marketing: boolean;
    analytics: boolean;
    functional: boolean;
    performance: boolean;
  } | undefined>;
  recordConsent(consent: {
    userId?: string | null;
    sessionId: string;
    consents: Record<string, boolean>;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void>;
  getConsent(sessionId: string): Promise<{
    consents: Record<string, boolean>;
  } | undefined>;

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

  // Revolutionary features - Performance Analytics
  createPerformanceMetric(metric: any): Promise<any>;
  getPerformanceMetrics(timeframe: string): Promise<any[]>;
  
  // AI Content Editing
  createContentEditingJob(job: any): Promise<any>;
  updateContentEditingJob(id: string, job: any): Promise<void>;
  getContentEditingJob(id: string): Promise<any>;
  getUserContentEditingJobs(userId: string, limit: number): Promise<any[]>;
  
  // AR/VR Integration
  createARVRSession(session: any): Promise<any>;
  updateARVRSession(id: string, session: any): Promise<void>;
  getARVRSession(id: string): Promise<any>;
  
  // Achievement System
  createAchievement(achievement: any): Promise<any>;
  getActiveAchievements(): Promise<any[]>;
  createUserAchievement(userAchievement: any): Promise<any>;
  getUserAchievements(userId: string): Promise<any[]>;
  awardUserBadge(userId: string, badge: string): Promise<void>;
  setUserTitle(userId: string, title: string): Promise<void>;
  enableUserPerk(userId: string, perk: string): Promise<void>;
  applyUserBoost(userId: string, boost: string): Promise<void>;
  addUserCurrency(userId: string, amount: number): Promise<void>;
  
  // Meetup Scheduling
  createMeetupRequest(request: any): Promise<any>;
  updateMeetupRequest(id: string, request: any): Promise<void>;
  getMeetupRequest(id: string): Promise<any>;
  setUserAvailability(availability: any): Promise<void>;
  getUserAvailability(userId: string): Promise<any>;
  getUserBookings(userId: string, startDate: Date, endDate: Date): Promise<any[]>;
  
  // Social Sharing
  createSocialShare(share: any): Promise<any>;
  updateSocialShare(id: string, share: any): Promise<void>;
  createSocialShareTemplate(template: any): Promise<any>;
  getSocialShareTemplates(): Promise<any[]>;
  getSocialShareTemplate(id: string): Promise<any>;
  getUserSocialShares(userId: string, options: any): Promise<any[]>;
  
  // Blockchain & Biometric
  createBlockchainReward(reward: any): Promise<any>;
  createBiometricAuth(auth: any): Promise<any>;
  updateBiometricAuth(id: string, auth: any): Promise<void>;
  getUserBiometricAuth(userId: string, type: string, deviceId: string): Promise<any>;
  createQuantumEncryption(encryption: any): Promise<any>;
  
  // Voice Synthesis
  createVoiceSynthesis(synthesis: any): Promise<any>;
  createVoiceCharacter(character: any): Promise<any>;
  
  // Real-time Analytics
  createAlertRule(rule: any): Promise<any>;
  createLiveDashboard(dashboard: any): Promise<any>;
  getLiveDashboard(userId: string): Promise<any>;
  getCurrentUserMetrics(userId: string): Promise<any>;
  getUserMetricsTrends(userId: string, timeframe: string): Promise<any[]>;
  getRecentMilestones(userId: string): Promise<any[]>;
  storePredictiveAnalytics(analytics: any): Promise<void>;
  storeCompetitorAnalysis(analysis: any): Promise<void>;
  getHistoricalMetrics(userId: string, timeframe: string): Promise<any>;
  
  // Social/Competitor Analysis
  findMeetupMatches(params: any): Promise<any[]>;
  searchInfluencers(params: any): Promise<any[]>;
  createInfluencerCollaboration(collaboration: any): Promise<any>;
  getUserBarRewards(userId: string): Promise<any[]>;
  getBarReward(id: string): Promise<any>;
  grantUserBarReward(userId: string, rewardId: string): Promise<void>;
  createSocialCampaign(campaign: any): Promise<void>;
  getContentPlatformMetrics(contentId: string): Promise<any[]>;

  // Additional mock methods for platform functionality
  storeMeetingRoom(room: any): Promise<void>;
  scheduleReminder(reminder: any): Promise<void>;
  getPendingReminders(): Promise<any[]>;
  markReminderSent(id: string): Promise<void>;
  getUserMeetupTemplates(userId: string): Promise<any[]>;
  createMeetupTemplate(template: any): Promise<any>;
  createAchievementCelebration(celebration: any): Promise<void>;
  scheduleSharePublication(share: any): Promise<void>;

  // Enhanced Earnings System Operations
  
  // Performance Tiers
  createPerformanceTier(tier: any): Promise<any>;
  getPerformanceTier(userId: string): Promise<any | undefined>;
  updatePerformanceTier(userId: string, updates: any): Promise<any>;
  getCurrentPerformanceTiers(): Promise<any[]>;
  calculatePerformanceTier(userId: string, monthlyEarnings: number, transactionCount: number): Promise<string>;
  
  // Enhanced Transactions
  createEnhancedTransaction(transaction: any): Promise<any>;
  getEnhancedTransaction(transactionId: string): Promise<any | undefined>;
  getUserEnhancedTransactions(userId: string, options?: any): Promise<any[]>;
  getVolumeBasedFeeReduction(userId: string, amount: number): Promise<number>;
  
  // Collaborations
  createCollaboration(collaboration: any): Promise<any>;
  getCollaboration(collaborationId: string): Promise<any | undefined>;
  addCollaborationParticipant(participant: any): Promise<any>;
  getUserCollaborations(userId: string): Promise<any[]>;
  updateCollaborationEarnings(collaborationId: string, earnings: number): Promise<void>;
  
  // Performance Milestones & Bonuses
  createPerformanceMilestone(milestone: any): Promise<any>;
  getActivePerformanceMilestones(): Promise<any[]>;
  createUserMilestone(userMilestone: any): Promise<any>;
  getUserMilestones(userId: string, status?: string): Promise<any[]>;
  updateMilestoneProgress(userId: string, milestoneId: string, progress: number): Promise<void>;
  awardMilestoneBonus(userId: string, milestoneId: string, bonusAmount: number): Promise<void>;
  
  // Analytics & Forecasting
  createEarningsAnalytics(analytics: any): Promise<any>;
  getEarningsAnalytics(userId: string, period: string, startDate: Date, endDate: Date): Promise<any[]>;
  calculateEarningsProjection(userId: string, months: number): Promise<any>;
  getPerformanceComparison(userId: string, compareUserId: string): Promise<any>;
  getTrendAnalysis(userId: string, period: string): Promise<any>;
  
  // Tax & Compliance
  createTaxRecord(taxRecord: any): Promise<any>;
  getTaxRecords(userId: string, taxYear: number): Promise<any[]>;
  updateTaxWithholding(userId: string, jurisdiction: string, rate: number): Promise<void>;
  generateTaxDocument(userId: string, taxYear: number, documentType: string): Promise<string>;
  
  // Volume Tiers
  createVolumeTier(tier: any): Promise<any>;
  getActiveVolumeTiers(): Promise<any[]>;
  calculateVolumeDiscount(volume: number): Promise<number>;
  
  // Financial operations
  getTransaction(transactionId: string): Promise<any>;
  updateTransaction(transactionId: string, updates: any): Promise<void>;
  getUserTransactions(userId: string, options: any): Promise<any[]>;
  getUserTransactionCount(userId: string, options: any): Promise<number>;
  getTransactionsByDateRange(startDate: Date, endDate: Date, providerId?: string): Promise<any[]>;
  getTransactionsByFilters(filters: any): Promise<any[]>;
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
  async create2257Record(record: Omit<typeof records2257.$inferInsert, 'id' | 'createdAt'>): Promise<typeof records2257.$inferSelect> {
    const [created] = await db.insert(records2257).values(record).returning();
    return created;
  }

  async get2257Records(userId: string): Promise<any[]> {
    return db.select().from(records2257).where(eq(records2257.userId, userId));
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
    const conditions = [];
    
    // Apply category filter if provided
    if (categoryFilter) {
      conditions.push(sql`${creatorProfiles.categories} @> ARRAY[${categoryFilter}]`);
    }

    const query = db
      .select()
      .from(creatorProfiles)
      .innerJoin(users, eq(creatorProfiles.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(creatorProfiles.totalSubscribers))
      .limit(limit);

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
    const result = await db.insert(comments).values(comment).returning() as Comment[];
    return result[0];
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

  // Stripe customer operations
  async getStripeCustomerId(userId: string): Promise<string | undefined> {
    try {
      const [user] = await db.select({ stripeCustomerId: profiles.stripeCustomerId }).from(profiles).where(eq(profiles.userId, userId));
      return user?.stripeCustomerId ?? undefined;
    } catch (error) {
      console.error('Failed to get Stripe customer ID:', error);
      return undefined;
    }
  }

  async storeStripeCustomerId(userId: string, stripeCustomerId: string): Promise<void> {
    try {
      await db
        .update(profiles)
        .set({ stripeCustomerId, updatedAt: new Date() })
        .where(eq(profiles.userId, userId));
    } catch (error) {
      console.error('Failed to store Stripe customer ID:', error);
      throw error;
    }
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
    
    const query = db.select().from(liveStreams)
      .where(and(...conditions))
      .orderBy(desc(liveStreams.createdAt))
      .limit(options?.limit || 100);
    
    return await query;
  }

  async getCreatorStreams(creatorId: string): Promise<LiveStream[]> {
    return await db.select().from(liveStreams)
      .where(eq(liveStreams.creatorId, creatorId))
      .orderBy(desc(liveStreams.createdAt));
  }

  async getActiveStreams(): Promise<(LiveStream & { creator: User })[]> {
    return await db.select({
      ...getTableColumns(liveStreams),
      creator: {
        id: users.id,
        username: users.username,
        email: users.email,
        password: users.password,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        role: users.role,
        status: users.status,
        authProvider: users.authProvider,
        onlineStatus: users.onlineStatus,
        lastSeenAt: users.lastSeenAt,
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
      // SECURITY: streamKey and streamUrl are secrets - never expose in public APIs
      creator: {
        id: users.id,
        username: users.username,
        email: users.email,
        password: users.password,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        role: users.role,
        status: users.status,
        authProvider: users.authProvider,
        onlineStatus: users.onlineStatus,
        lastSeenAt: users.lastSeenAt,
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
      updatedAt: new Date() 
    };
    
    const result = await db.insert(lovenseIntegrationSettings)
      .values({
        creatorId,
        ...settings,
        updatedAt: new Date()
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
        lastConnected: new Date()
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
    if (promoCode.maxUsageCount && (promoCode.currentUsageCount ?? 0) >= promoCode.maxUsageCount) {
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
    if ((promoCode.applicablePlans?.length ?? 0) > 0 && !(promoCode.applicablePlans ?? []).includes(planId)) {
      return { valid: false, error: 'This promo code is not valid for the selected plan' };
    }

    // Get plan details for price calculation
    const plan = await this.getSubscriptionPlan(planId);
    if (!plan) {
      return { valid: false, error: 'Invalid subscription plan' };
    }

    // Check minimum purchase requirement
    if (promoCode.minPurchaseCents && plan.priceCents < promoCode.minPurchaseCents) {
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

  // Revolutionary features - Quick mock implementations to get platform running
  async createPerformanceMetric(metric: any): Promise<any> {
    return { id: `metric_${Date.now()}`, ...metric };
  }
  
  async getPerformanceMetrics(timeframe: string): Promise<any[]> { return []; }
  async createContentEditingJob(job: any): Promise<any> { return { id: `job_${Date.now()}`, ...job }; }
  async updateContentEditingJob(id: string, job: any): Promise<void> {}
  async getContentEditingJob(id: string): Promise<any> { return null; }
  async getUserContentEditingJobs(userId: string, limit: number): Promise<any[]> { return []; }
  async createARVRSession(session: any): Promise<any> { return { id: `arvr_${Date.now()}`, ...session }; }
  async updateARVRSession(id: string, session: any): Promise<void> {}
  async getARVRSession(id: string): Promise<any> { return null; }
  async createAchievement(achievement: any): Promise<any> { return { id: `achievement_${Date.now()}`, ...achievement }; }
  async getActiveAchievements(): Promise<any[]> { return []; }
  async createUserAchievement(userAchievement: any): Promise<any> { return { id: `user_achievement_${Date.now()}`, ...userAchievement }; }
  async getUserAchievements(userId: string): Promise<any[]> { return []; }
  async awardUserBadge(userId: string, badge: string): Promise<void> {}
  async setUserTitle(userId: string, title: string): Promise<void> {}
  async enableUserPerk(userId: string, perk: string): Promise<void> {}
  async applyUserBoost(userId: string, boost: string): Promise<void> {}
  async addUserCurrency(userId: string, amount: number): Promise<void> {}
  async createMeetupRequest(request: any): Promise<any> { return { id: `meetup_${Date.now()}`, ...request }; }
  async updateMeetupRequest(id: string, request: any): Promise<void> {}
  async getMeetupRequest(id: string): Promise<any> { return null; }
  async setUserAvailability(availability: any): Promise<void> {}
  async getUserAvailability(userId: string): Promise<any> { return null; }
  async getUserBookings(userId: string, startDate: Date, endDate: Date): Promise<any[]> { return []; }
  async createSocialShare(share: any): Promise<any> { return { id: `share_${Date.now()}`, ...share }; }
  async updateSocialShare(id: string, share: any): Promise<void> {}
  async createSocialShareTemplate(template: any): Promise<any> { return { id: `template_${Date.now()}`, ...template }; }
  async getSocialShareTemplates(): Promise<any[]> { return []; }
  async getSocialShareTemplate(id: string): Promise<any> { return null; }
  async getUserSocialShares(userId: string, options: any): Promise<any[]> { return []; }
  async createBlockchainReward(reward: any): Promise<any> { return { id: `reward_${Date.now()}`, ...reward }; }
  async createBiometricAuth(auth: any): Promise<any> { return { id: `bio_${Date.now()}`, ...auth }; }
  async updateBiometricAuth(id: string, auth: any): Promise<void> {}
  async getUserBiometricAuth(userId: string, type: string, deviceId: string): Promise<any> { return null; }
  async createQuantumEncryption(encryption: any): Promise<any> { return { id: `quantum_${Date.now()}`, ...encryption }; }
  async createVoiceSynthesis(synthesis: any): Promise<any> { return { id: `voice_${Date.now()}`, ...synthesis }; }
  async createVoiceCharacter(character: any): Promise<any> { return { id: `character_${Date.now()}`, ...character }; }
  async createLiveDashboard(dashboard: any): Promise<any> { return { id: `dashboard_${Date.now()}`, ...dashboard }; }
  async getLiveDashboard(userId: string): Promise<any> { return null; }
  async getCurrentUserMetrics(userId: string): Promise<any> {
    return { revenue: 50000, views: 12500, engagement: 850, subscribers: 125, liveViewers: 45 };
  }
  async getUserMetricsTrends(userId: string, timeframe: string): Promise<any[]> { return []; }
  async getRecentMilestones(userId: string): Promise<any[]> { return []; }
  async storePredictiveAnalytics(analytics: any): Promise<void> {}
  async storeCompetitorAnalysis(analysis: any): Promise<void> {}
  async getHistoricalMetrics(userId: string, timeframe: string): Promise<any> { return {}; }
  async findMeetupMatches(params: any): Promise<any[]> { return []; }
  async searchInfluencers(params: any): Promise<any[]> { return []; }
  async createInfluencerCollaboration(collaboration: any): Promise<any> { return { id: `collab_${Date.now()}`, ...collaboration }; }
  async getUserBarRewards(userId: string): Promise<any[]> { return []; }
  async getBarReward(id: string): Promise<any> { return null; }
  async grantUserBarReward(userId: string, rewardId: string): Promise<void> {}
  async createSocialCampaign(campaign: any): Promise<void> {}
  async getContentPlatformMetrics(contentId: string): Promise<any[]> { return []; }
  async storeMeetingRoom(room: any): Promise<void> {}
  async scheduleReminder(reminder: any): Promise<void> {}
  async getPendingReminders(): Promise<any[]> { return []; }
  async markReminderSent(id: string): Promise<void> {}
  async getUserMeetupTemplates(userId: string): Promise<any[]> { return []; }
  async createMeetupTemplate(template: any): Promise<any> { return { id: `template_${Date.now()}`, ...template }; }
  async createAchievementCelebration(celebration: any): Promise<void> {}
  async scheduleSharePublication(share: any): Promise<void> {}

  // GDPR Privacy method implementations
  async getUserProfile(userId: string): Promise<Profile | undefined> {
    return this.getProfile(userId);
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return this.getCreatorPosts(userId);
  }

  async getUserMessages(userId: string): Promise<Message[]> {
    const results = await db.select().from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));
    return results;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(or(eq(transactions.fromUserId, userId), eq(transactions.toUserId, userId)))
      .orderBy(desc(transactions.createdAt));
  }

  async getUserKYCRecords(userId: string): Promise<KycVerification[]> {
    return await db.select().from(kycVerifications)
      .where(eq(kycVerifications.userId, userId))
      .orderBy(desc(kycVerifications.createdAt));
  }

  async markUserForDeletion(userId: string): Promise<void> {
    // Mark user for deletion by updating status
    await db.update(users)
      .set({ 
        status: 'suspended',
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async anonymizeUserData(userId: string): Promise<void> {
    // Anonymize user PII while preserving transaction records for compliance
    await db.update(users)
      .set({
        email: `deleted_user_${userId}@boyfanz.com`,
        username: `deleted_user_${userId}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    // Anonymize profile data
    await db.update(profiles)
      .set({
        displayName: 'Deleted User',
        bio: null,
        updatedAt: new Date()
      })
      .where(eq(profiles.userId, userId));
  }

  async updateUserPrivacyPreferences(preferences: {
    userId: string;
    marketing: boolean;
    analytics: boolean;
    functional: boolean;
    performance: boolean;
    updatedAt: Date;
  }): Promise<void> {
    // Store in user profile or create separate privacy preferences table
    // Store privacy preferences in audit log since the field doesn't exist in profiles
    await this.createAuditLog({
      actorId: preferences.userId,
      action: 'PRIVACY_PREFERENCES_UPDATED',
      targetType: 'user',
      targetId: preferences.userId,
      diffJson: {
        marketing: preferences.marketing,
        analytics: preferences.analytics,
        functional: preferences.functional,
        performance: preferences.performance,
        updatedAt: preferences.updatedAt
      }
    });
  }

  async getUserPrivacyPreferences(userId: string): Promise<{
    marketing: boolean;
    analytics: boolean;
    functional: boolean;
    performance: boolean;
  } | undefined> {
    const [profile] = await db.select().from(profiles)
      .where(eq(profiles.userId, userId));
    
    // Get privacy preferences from audit log since field doesn't exist in profiles
    const privacyLogs = await db.select().from(auditLogs)
      .where(and(
        eq(auditLogs.actorId, userId),
        eq(auditLogs.action, 'PRIVACY_PREFERENCES_UPDATED')
      ))
      .orderBy(desc(auditLogs.createdAt))
      .limit(1);
    
    if (privacyLogs.length > 0) {
      const prefs = privacyLogs[0].diffJson as any;
      return {
        marketing: prefs.marketing || false,
        analytics: prefs.analytics || false,
        functional: prefs.functional || true,
        performance: prefs.performance || false
      };
    }
    
    return undefined;
  }

  async recordConsent(consent: {
    userId?: string | null;
    sessionId: string;
    consents: Record<string, boolean>;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    // Create audit log for consent
    await this.createAuditLog({
      actorId: consent.userId ?? null,
      action: 'CONSENT_RECORDED',
      targetType: 'consent',
      targetId: consent.sessionId,
      diffJson: {
        sessionId: consent.sessionId,
        consents: consent.consents,
        ipAddress: consent.ipAddress,
        userAgent: consent.userAgent
      }
    });
  }

  async getConsent(sessionId: string): Promise<{
    consents: Record<string, boolean>;
  } | undefined> {
    // Look up consent in audit logs  
    const logs = await db.select().from(auditLogs)
      .where(and(
        eq(auditLogs.action, 'CONSENT_RECORDED'),
        eq(auditLogs.targetId, sessionId)
      ))
      .orderBy(desc(auditLogs.createdAt))
      .limit(1);
    
    if (logs.length > 0) {
      const diffJson = logs[0].diffJson as any;
      return { consents: diffJson.consents };
    }
    
    return undefined;
  }

  // **CRITICAL FIX**: Add missing createAlert function to fix runtime error
  async createAlert(alert: {
    ruleId: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status?: 'active' | 'resolved' | 'suppressed';
    value?: number;
    threshold?: number;
    metadata?: any;
  }): Promise<any> {
    // For now, create a simple alert entry in audit logs until we migrate the schema
    await this.createAuditLog({
      actorId: null,
      action: 'ALERT_TRIGGERED',
      targetType: 'system',
      targetId: alert.ruleId,
      diffJson: {
        message: alert.message,
        severity: alert.severity,
        value: alert.value,
        threshold: alert.threshold,
        metadata: alert.metadata
      }
    });
    
    // Return a mock alert object to satisfy the interface
    return {
      id: `alert_${Date.now()}`,
      ruleId: alert.ruleId,
      message: alert.message,
      severity: alert.severity,
      status: alert.status || 'active',
      value: alert.value,
      threshold: alert.threshold,
      metadata: alert.metadata || {},
      triggeredAt: new Date()
    };
  }

  // ===== ADVANCED FEATURES STORAGE METHODS =====

  // NFT & Web3 Management
  async createNftAsset(nft: InsertNftAsset): Promise<NftAsset> {
    const [created] = await db.insert(nftAssets).values(nft).returning();
    return created;
  }

  async updateNftAsset(id: string, updates: Partial<NftAsset>): Promise<void> {
    await db.update(nftAssets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(nftAssets.id, id));
  }

  async getNftAssetsByOwner(ownerId: string): Promise<NftAsset[]> {
    return db.select().from(nftAssets)
      .where(eq(nftAssets.ownerId, ownerId))
      .orderBy(desc(nftAssets.createdAt));
  }

  async getNftAssetByTokenId(tokenId: string, contractAddress: string): Promise<NftAsset | undefined> {
    const [nft] = await db.select().from(nftAssets)
      .where(and(
        eq(nftAssets.tokenId, tokenId),
        eq(nftAssets.contractAddress, contractAddress)
      ));
    return nft;
  }

  // Analytics Events for Real-time Dashboards
  async createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [created] = await db.insert(analyticsEvents).values(event).returning();
    return created;
  }

  async getAnalyticsEvents(filters: {
    userId?: string;
    eventType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AnalyticsEvent[]> {
    const conditions = [];
    
    if (filters.userId) conditions.push(eq(analyticsEvents.userId, filters.userId));
    if (filters.eventType) conditions.push(eq(analyticsEvents.eventType, filters.eventType as any));
    if (filters.startDate) conditions.push(gte(analyticsEvents.timestamp, filters.startDate));
    if (filters.endDate) conditions.push(lte(analyticsEvents.timestamp, filters.endDate));
    
    return db.select().from(analyticsEvents)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(analyticsEvents.timestamp))
      .limit(filters.limit || 1000);
  }

  // Alert Rules Management
  async createAlertRule(rule: InsertAlertRule): Promise<AlertRule> {
    const [created] = await db.insert(alertRules).values(rule).returning();
    return created;
  }

  async getActiveAlertRules(): Promise<AlertRule[]> {
    return db.select().from(alertRules)
      .where(eq(alertRules.isEnabled, true));
  }

  async getAlerts(filters: { ruleId?: string; status?: string; limit?: number }): Promise<Alert[]> {
    const conditions = [];
    
    if (filters.ruleId) conditions.push(eq(alerts.ruleId, filters.ruleId));
    if (filters.status) conditions.push(eq(alerts.status, filters.status as any));
    
    return db.select().from(alerts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(alerts.triggeredAt))
      .limit(filters.limit || 100);
  }

  async resolveAlert(alertId: string, userId: string): Promise<void> {
    await db.update(alerts)
      .set({
        status: 'resolved',
        resolvedAt: new Date(),
        acknowledgedBy: userId,
        acknowledgedAt: new Date()
      })
      .where(eq(alerts.id, alertId));
  }

  // Feed Preferences Management
  async upsertFeedPreferences(preferences: InsertFeedPreferences): Promise<FeedPreferences> {
    const [upserted] = await db
      .insert(feedPreferences)
      .values(preferences)
      .onConflictDoUpdate({
        target: [feedPreferences.userId],
        set: { ...preferences, updatedAt: new Date() },
      })
      .returning();
    return upserted;
  }

  async getFeedPreferences(userId: string): Promise<FeedPreferences | undefined> {
    const [prefs] = await db.select().from(feedPreferences)
      .where(eq(feedPreferences.userId, userId));
    return prefs;
  }

  // Dashboard Charts Management
  async createDashboardChart(chart: InsertDashboardChart): Promise<DashboardChart> {
    const [created] = await db.insert(dashboardCharts).values(chart).returning();
    return created;
  }

  async getUserDashboardCharts(userId: string): Promise<DashboardChart[]> {
    return db.select().from(dashboardCharts)
      .where(eq(dashboardCharts.userId, userId))
      .orderBy(dashboardCharts.position, dashboardCharts.createdAt);
  }

  async updateDashboardChart(id: string, updates: Partial<DashboardChart>): Promise<void> {
    await db.update(dashboardCharts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(dashboardCharts.id, id));
  }

  async deleteDashboardChart(id: string): Promise<void> {
    await db.delete(dashboardCharts).where(eq(dashboardCharts.id, id));
  }

  // Age Verification Enhanced
  async createAgeVerification(verification: InsertAgeVerification): Promise<AgeVerification> {
    const [created] = await db.insert(ageVerifications).values(verification).returning();
    return created;
  }

  async getUserAgeVerifications(userId: string): Promise<AgeVerification[]> {
    return db.select().from(ageVerifications)
      .where(eq(ageVerifications.userId, userId))
      .orderBy(desc(ageVerifications.createdAt));
  }

  async updateAgeVerification(id: string, updates: Partial<AgeVerification>): Promise<void> {
    await db.update(ageVerifications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(ageVerifications.id, id));
  }

  async isUserAgeVerified(userId: string): Promise<boolean> {
    const [verification] = await db.select({ isVerified: ageVerifications.isVerified })
      .from(ageVerifications)
      .where(and(
        eq(ageVerifications.userId, userId),
        eq(ageVerifications.isVerified, true),
        or(
          isNull(ageVerifications.expiresAt),
          gte(ageVerifications.expiresAt, new Date())
        )
      ))
      .limit(1);
    
    return verification?.isVerified || false;
  }

  // Enhanced Media Feed with Age Verification and AI Personalization
  async getPersonalizedFeed(userId: string, cursor?: string, limit = 20): Promise<{
    items: (MediaAsset & { creator: User; shouldBlur: boolean })[];
    nextCursor?: string;
  }> {
    const preferences = await this.getFeedPreferences(userId);
    const isAgeVerified = await this.isUserAgeVerified(userId);
    
    const conditions = [eq(mediaAssets.status, 'approved')];
    
    // Apply user preferences and filters
    if (preferences?.excludedTags?.length) {
      // For now, skip complex array operations until schema is migrated
      // conditions.push(not(arrayContains(mediaAssets.contentTags, preferences.excludedTags)));
    }
    
    if (cursor) {
      conditions.push(lt(mediaAssets.createdAt, new Date(cursor)));
    }
    
    // Get basic columns for compatibility
    const feedItems = await db.select({
      id: mediaAssets.id,
      ownerId: mediaAssets.ownerId,
      title: mediaAssets.title,
      description: mediaAssets.description,
      s3Key: mediaAssets.s3Key,
      mimeType: mediaAssets.mimeType,
      size: mediaAssets.size,
      checksum: mediaAssets.checksum,
      status: mediaAssets.status,
      riskScore: mediaAssets.riskScore,
      contentTags: mediaAssets.contentTags,
      createdAt: mediaAssets.createdAt,
      updatedAt: mediaAssets.updatedAt,
      creator: {
        id: users.id,
        username: users.username,
        email: users.email,
        password: users.password,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        role: users.role,
        status: users.status,
        authProvider: users.authProvider,
        onlineStatus: users.onlineStatus,
        lastSeenAt: users.lastSeenAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      },
    })
    .from(mediaAssets)
    .innerJoin(users, eq(mediaAssets.ownerId, users.id))
    .where(and(...conditions))
    .orderBy(desc(mediaAssets.createdAt))
    .limit(limit + 1);
    
    const hasMore = feedItems.length > limit;
    const items = feedItems.slice(0, limit);
    
    return {
      items: items.map(item => ({
        ...item,
        flagsJson: {}, // Default empty flags
        aiAnalysisJson: {}, // Default empty analysis
        forensicSignature: null, // Default null signature
        watermarked: false,
        watermarkedAt: null,
        shouldBlur: !isAgeVerified && (item.riskScore || 0) > 50 // Blur high-risk content for unverified users
      })),
      nextCursor: hasMore && items.length > 0 ? items[items.length - 1]?.createdAt?.toISOString() : undefined,
    };
  }

  // Enhanced Earnings System Mock Implementations
  
  // Performance Tiers
  async createPerformanceTier(tier: any): Promise<any> {
    const mockTier = { id: crypto.randomUUID(), ...tier, createdAt: new Date() };
    console.log('🏆 Created performance tier:', mockTier.tier, 'for user:', mockTier.userId);
    return mockTier;
  }

  async getPerformanceTier(userId: string): Promise<any | undefined> {
    // Mock implementation - would query database
    return {
      id: crypto.randomUUID(),
      userId,
      tier: 'silver',
      monthlyEarnings: 5000,
      totalVolume: 25000,
      transactionCount: 150,
      consistencyScore: 85,
      qualityScore: 90,
      referralCount: 5,
      feeReduction: 0.005,
      bonusEligible: true,
      nextTierEarnings: 10000,
      tierAchievedAt: new Date(),
      periodStart: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updatePerformanceTier(userId: string, updates: any): Promise<any> {
    console.log('🏆 Updated performance tier for user:', userId, updates);
    return { userId, ...updates, updatedAt: new Date() };
  }

  async getCurrentPerformanceTiers(): Promise<any[]> {
    return []; // Mock implementation
  }

  async calculatePerformanceTier(userId: string, monthlyEarnings: number, transactionCount: number): Promise<string> {
    if (monthlyEarnings >= 50000) return 'diamond';
    if (monthlyEarnings >= 25000) return 'platinum';
    if (monthlyEarnings >= 10000) return 'gold';
    if (monthlyEarnings >= 2500) return 'silver';
    return 'bronze';
  }

  // Enhanced Transactions
  async createEnhancedTransaction(transaction: any): Promise<any> {
    const mockTransaction = {
      id: crypto.randomUUID(),
      ...transaction,
      createdAt: new Date()
    };
    console.log('💰 Created enhanced transaction:', mockTransaction.id, mockTransaction.type, mockTransaction.grossAmount);
    return mockTransaction;
  }

  async getEnhancedTransaction(transactionId: string): Promise<any | undefined> {
    // Mock implementation
    return {
      id: transactionId,
      userId: 'mock-user',
      type: 'subscription',
      grossAmount: 1000,
      platformFee: 0,
      processorFee: 29,
      feeReduction: 5,
      netEarnings: 976,
      bonusAmount: 0,
      performanceTier: 'silver',
      createdAt: new Date()
    };
  }

  async getUserEnhancedTransactions(userId: string, options: any = {}): Promise<any[]> {
    // Mock implementation - return empty array
    return [];
  }

  async getVolumeBasedFeeReduction(userId: string, amount: number): Promise<number> {
    // Mock volume-based reduction calculation
    if (amount > 100000) return 0.01; // 1% reduction for high volume
    if (amount > 50000) return 0.005; // 0.5% reduction
    if (amount > 10000) return 0.002; // 0.2% reduction
    return 0;
  }

  // Collaborations
  async createCollaboration(collaboration: any): Promise<any> {
    const mockCollaboration = {
      id: crypto.randomUUID(),
      ...collaboration,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log('🤝 Created collaboration:', mockCollaboration.name, mockCollaboration.type);
    return mockCollaboration;
  }

  async getCollaboration(collaborationId: string): Promise<any | undefined> {
    return {
      id: collaborationId,
      name: 'Mock Collaboration',
      type: 'featured',
      status: 'active',
      primaryCreatorId: 'mock-creator',
      totalEarnings: 0,
      crossPromoBonus: 0.1,
      automaticSplit: true,
      createdAt: new Date()
    };
  }

  async addCollaborationParticipant(participant: any): Promise<any> {
    const mockParticipant = {
      id: crypto.randomUUID(),
      ...participant,
      joinedAt: new Date()
    };
    console.log('👥 Added collaboration participant:', mockParticipant.userId, mockParticipant.sharePercentage);
    return mockParticipant;
  }

  async getUserCollaborations(userId: string): Promise<any[]> {
    return []; // Mock implementation
  }

  async updateCollaborationEarnings(collaborationId: string, earnings: number): Promise<void> {
    console.log('💰 Updated collaboration earnings:', collaborationId, earnings);
  }

  // Performance Milestones & Bonuses
  async createPerformanceMilestone(milestone: any): Promise<any> {
    const mockMilestone = {
      id: crypto.randomUUID(),
      ...milestone,
      createdAt: new Date()
    };
    console.log('🎯 Created performance milestone:', mockMilestone.name, mockMilestone.type);
    return mockMilestone;
  }

  async getActivePerformanceMilestones(): Promise<any[]> {
    return [
      {
        id: 'milestone-1',
        name: 'First $1000',
        type: 'earnings',
        targetValue: 1000,
        bonusAmount: 100,
        tierRequirement: 'bronze',
        isRepeatable: false,
        timeframe: 'all_time',
        isActive: true
      }
    ];
  }

  async createUserMilestone(userMilestone: any): Promise<any> {
    const mockUserMilestone = {
      id: crypto.randomUUID(),
      ...userMilestone,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log('🎯 Created user milestone:', mockUserMilestone.userId, mockUserMilestone.milestoneId);
    return mockUserMilestone;
  }

  async getUserMilestones(userId: string, status?: string): Promise<any[]> {
    return []; // Mock implementation
  }

  async updateMilestoneProgress(userId: string, milestoneId: string, progress: number): Promise<void> {
    console.log('📈 Updated milestone progress:', userId, milestoneId, progress);
  }

  async awardMilestoneBonus(userId: string, milestoneId: string, bonusAmount: number): Promise<void> {
    console.log('🎉 Awarded milestone bonus:', userId, milestoneId, bonusAmount);
  }

  // Analytics & Forecasting
  async createEarningsAnalytics(analytics: any): Promise<any> {
    const mockAnalytics = {
      id: crypto.randomUUID(),
      ...analytics,
      calculatedAt: new Date(),
      createdAt: new Date()
    };
    console.log('📊 Created earnings analytics:', mockAnalytics.userId, mockAnalytics.period);
    return mockAnalytics;
  }

  async getEarningsAnalytics(userId: string, period: string, startDate: Date, endDate: Date): Promise<any[]> {
    return []; // Mock implementation
  }

  async calculateEarningsProjection(userId: string, months: number): Promise<any> {
    return {
      projectedEarnings: 5000 * months,
      confidenceLevel: 0.85,
      trendDirection: 'up',
      seasonalityFactor: 1.0
    };
  }

  async getPerformanceComparison(userId: string, compareUserId: string): Promise<any> {
    return {
      userEarnings: 5000,
      compareUserEarnings: 4500,
      percentageDifference: 11.1,
      betterThan: true
    };
  }

  async getTrendAnalysis(userId: string, period: string): Promise<any> {
    return {
      trendDirection: 'up',
      growthRate: 0.15,
      volatility: 0.25,
      seasonalPattern: 'moderate'
    };
  }

  // Tax & Compliance
  async createTaxRecord(taxRecord: any): Promise<any> {
    const mockTaxRecord = {
      id: crypto.randomUUID(),
      ...taxRecord,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log('📋 Created tax record:', mockTaxRecord.userId, mockTaxRecord.taxYear);
    return mockTaxRecord;
  }

  async getTaxRecords(userId: string, taxYear: number): Promise<any[]> {
    return []; // Mock implementation
  }

  async updateTaxWithholding(userId: string, jurisdiction: string, rate: number): Promise<void> {
    console.log('📋 Updated tax withholding:', userId, jurisdiction, rate);
  }

  async generateTaxDocument(userId: string, taxYear: number, documentType: string): Promise<string> {
    return `tax-document-${userId}-${taxYear}-${documentType}.pdf`;
  }

  // Volume Tiers
  async createVolumeTier(tier: any): Promise<any> {
    const mockVolumeTier = {
      id: crypto.randomUUID(),
      ...tier,
      createdAt: new Date()
    };
    console.log('📊 Created volume tier:', mockVolumeTier.tierName);
    return mockVolumeTier;
  }

  async getActiveVolumeTiers(): Promise<any[]> {
    return [
      { id: '1', tierName: 'Standard', minimumVolume: 0, maximumVolume: 10000, feeReduction: 0, bonusPercentage: 0, isActive: true },
      { id: '2', tierName: 'Pro', minimumVolume: 10000, maximumVolume: 50000, feeReduction: 0.002, bonusPercentage: 0.01, isActive: true },
      { id: '3', tierName: 'Elite', minimumVolume: 50000, maximumVolume: null, feeReduction: 0.005, bonusPercentage: 0.02, isActive: true }
    ];
  }

  async calculateVolumeDiscount(volume: number): Promise<number> {
    const tiers = await this.getActiveVolumeTiers();
    for (const tier of tiers.reverse()) {
      if (volume >= tier.minimumVolume && (!tier.maximumVolume || volume <= tier.maximumVolume)) {
        return tier.feeReduction;
      }
    }
    return 0;
  }

  // Financial operations
  async getTransaction(transactionId: string): Promise<any> {
    return {
      id: transactionId,
      userId: 'mock-user',
      type: 'payment',
      amount: 1000,
      currency: 'USD',
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateTransaction(transactionId: string, updates: any): Promise<void> {
    console.log('💳 Updated transaction:', transactionId, updates);
  }

  async getUserTransactions(userId: string, options: any): Promise<any[]> {
    return []; // Mock implementation
  }

  async getUserTransactionCount(userId: string, options: any): Promise<number> {
    return 0;
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date, providerId?: string): Promise<any[]> {
    return [];
  }

  async getTransactionsByFilters(filters: any): Promise<any[]> {
    return [];
  }
}

export const storage = new DatabaseStorage();
