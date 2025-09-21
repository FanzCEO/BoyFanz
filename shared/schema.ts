import { sql } from 'drizzle-orm';
import {
  index,
  unique,
  check,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum("user_role", ["fan", "creator", "moderator", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "suspended", "pending"]);

// Users table for both Replit Auth and local username/password auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique(), // For local auth
  email: varchar("email").unique(),
  password: varchar("password"), // For local auth (hashed)
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default("fan").notNull(),
  status: userStatusEnum("status").default("active").notNull(),
  authProvider: varchar("auth_provider").default("replit").notNull(), // "replit" or "local"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User profiles
export const profiles = pgTable("profiles", {
  userId: varchar("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  displayName: varchar("display_name"),
  bio: text("bio"),
  avatarUrl: varchar("avatar_url"),
  publicFlags: jsonb("public_flags").default({}),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  profileTheme: varchar("profile_theme").default("default"),
  engagementLevel: integer("engagement_level").default(0),
  totalPoints: integer("total_points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// KYC verifications
export const kycVerificationStatusEnum = pgEnum("kyc_status", ["pending", "approved", "rejected", "expired"]);

export const kycVerifications = pgTable("kyc_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider").default("verifymy").notNull(),
  externalId: varchar("external_id"),
  status: kycVerificationStatusEnum("status").default("pending").notNull(),
  dataJson: jsonb("data_json").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 18 U.S.C. §2257 compliance records
export const record2257TypeEnum = pgEnum("record_2257_type", ["id_verification", "consent_form", "model_release"]);

export const records2257 = pgTable("records_2257", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  docType: record2257TypeEnum("doc_type").notNull(),
  s3Key: varchar("s3_key").notNull(),
  checksum: varchar("checksum").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Media assets
export const mediaStatusEnum = pgEnum("media_status", ["pending", "approved", "rejected", "processing", "flagged", "ai_reviewing", "escalated"]);

export const mediaAssets = pgTable("media_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  s3Key: varchar("s3_key").notNull(),
  mimeType: varchar("mime_type").notNull(),
  size: integer("size").notNull(),
  checksum: varchar("checksum").notNull(),
  status: mediaStatusEnum("status").default("pending").notNull(),
  flagsJson: jsonb("flags_json").default({}),
  aiAnalysisJson: jsonb("ai_analysis_json").default({}),
  riskScore: integer("risk_score").default(0),
  contentTags: text("content_tags").array(),
  // Forensic watermarking fields
  forensicSignature: text("forensic_signature"),
  watermarked: boolean("watermarked").default(false),
  watermarkedAt: timestamp("watermarked_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Moderation queue
export const moderationStatusEnum = pgEnum("moderation_status", ["pending", "approved", "rejected", "escalated", "auto_approved", "auto_rejected"]);

export const moderationQueue = pgTable("moderation_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mediaId: varchar("media_id").notNull().references(() => mediaAssets.id, { onDelete: "cascade" }),
  reason: text("reason"),
  status: moderationStatusEnum("status").default("pending").notNull(),
  reviewerId: varchar("reviewer_id").references(() => users.id),
  notes: text("notes"),
  decidedAt: timestamp("decided_at"),
  aiRecommendation: varchar("ai_recommendation"),
  aiConfidence: integer("ai_confidence"),
  escalationReason: text("escalation_reason"),
  priority: integer("priority").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit logs
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actorId: varchar("actor_id").references(() => users.id), // nullable for system actions
  action: varchar("action").notNull(),
  targetType: varchar("target_type").notNull(),
  targetId: varchar("target_id").notNull(),
  diffJson: jsonb("diff_json").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payout accounts
export const payoutAccountStatusEnum = pgEnum("payout_account_status", ["active", "inactive", "suspended"]);

export const payoutAccounts = pgTable("payout_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider").notNull(),
  accountRef: varchar("account_ref").notNull(),
  status: payoutAccountStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payout requests
export const payoutStatusEnum = pgEnum("payout_status", ["pending", "processing", "completed", "failed", "cancelled"]);

export const payoutRequests = pgTable("payout_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(),
  currency: varchar("currency").default("USD").notNull(),
  status: payoutStatusEnum("status").default("pending").notNull(),
  providerRef: varchar("provider_ref"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Webhooks
export const webhookStatusEnum = pgEnum("webhook_status", ["active", "inactive"]);

export const webhooks = pgTable("webhooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  url: varchar("url").notNull(),
  secret: varchar("secret").notNull(),
  eventsJson: jsonb("events_json").default([]),
  status: webhookStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API keys
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  keyHash: varchar("key_hash").notNull(),
  scopes: jsonb("scopes").default([]),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Theme settings (legacy - keeping for backward compatibility)
export const themeSettings = pgTable("theme_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  isActive: boolean("is_active").default(false),
  colors: jsonb("colors").notNull().default({
    primary: "hsl(0, 100%, 50%)",
    primaryForeground: "hsl(0, 0%, 100%)",
    secondary: "hsl(45, 80%, 60%)",
    secondaryForeground: "hsl(0, 0%, 0%)",
    background: "hsl(0, 0%, 1%)",
    foreground: "hsl(0, 0%, 100%)",
    card: "hsl(15, 15%, 4%)",
    cardForeground: "hsl(0, 0%, 100%)",
    accent: "hsl(50, 100%, 65%)",
    accentForeground: "hsl(0, 0%, 0%)",
    border: "hsl(15, 15%, 15%)",
    input: "hsl(15, 15%, 18%)",
    muted: "hsl(0, 0%, 10%)",
    mutedForeground: "hsl(0, 0%, 60%)",
    destructive: "hsl(0, 84%, 60%)",
    destructiveForeground: "hsl(0, 0%, 100%)"
  }),
  typography: jsonb("typography").notNull().default({
    fontDisplay: "Orbitron",
    fontHeading: "Rajdhani",
    fontBody: "Inter"
  }),
  effects: jsonb("effects").notNull().default({
    neonIntensity: 1,
    glowEnabled: true,
    smokyBackground: true,
    flickerEnabled: true
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CMS Theme System (new architecture)
export const versionStatusEnum = pgEnum("version_status", ["draft", "published", "archived"]);
export const pageStatusEnum = pgEnum("page_status", ["draft", "published"]);

export const cmsThemes = pgTable("cms_themes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cmsThemeVersions = pgTable("cms_theme_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  themeId: varchar("theme_id").notNull().references(() => cmsThemes.id, { onDelete: "cascade" }),
  label: varchar("label").notNull().default("v1"),
  status: versionStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cmsThemeSettings = pgTable("cms_theme_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  themeVersionId: varchar("theme_version_id").notNull().references(() => cmsThemeVersions.id, { onDelete: "cascade" }),
  settingsJson: jsonb("settings_json").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cmsThemeAssets = pgTable("cms_theme_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  themeVersionId: varchar("theme_version_id").notNull().references(() => cmsThemeVersions.id, { onDelete: "cascade" }),
  path: varchar("path").notNull(),
  storageKey: varchar("storage_key").notNull(),
  mimeType: varchar("mime_type"),
  sizeBytes: integer("size_bytes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cmsPages = pgTable("cms_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: varchar("slug").notNull().unique(),
  title: varchar("title").notNull(),
  template: varchar("template").notNull().default("page"),
  status: pageStatusEnum("status").default("draft").notNull(),
  seoJson: jsonb("seo_json").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cmsPageSections = pgTable("cms_page_sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: varchar("page_id").notNull().references(() => cmsPages.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(),
  sortOrder: integer("sort_order").notNull(),
  propsJson: jsonb("props_json").notNull().default({}),
});

export const cmsMenus = pgTable("cms_menus", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  handle: varchar("handle").notNull().unique(),
  title: varchar("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cmsMenuItems: any = pgTable("cms_menu_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  menuId: varchar("menu_id").notNull().references(() => cmsMenus.id, { onDelete: "cascade" }),
  parentId: varchar("parent_id"),
  title: varchar("title").notNull(),
  url: varchar("url").notNull(),
  sortOrder: integer("sort_order").default(0),
});

export const cmsPublishes = pgTable("cms_publishes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actorId: varchar("actor_id").notNull().references(() => users.id),
  themeVersionId: varchar("theme_version_id").notNull().references(() => cmsThemeVersions.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Creator Economy Platform Tables

// Creator Profiles (extended from basic profiles)
export const creatorProfiles = pgTable("creator_profiles", {
  userId: varchar("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  monthlyPriceCents: integer("monthly_price_cents").notNull().default(0),
  isVerified: boolean("is_verified").default(false),
  verificationBadge: varchar("verification_badge").default("none"), // "verified", "featured", "none"
  coverImageUrl: varchar("cover_image_url"),
  socialProfiles: jsonb("social_profiles").default({}),
  welcomeMessageEnabled: boolean("welcome_message_enabled").default(false),
  welcomeMessageText: text("welcome_message_text"),
  welcomeMessagePriceCents: integer("welcome_message_price_cents").default(0),
  categories: text("categories").array().default([]),
  totalEarningsCents: integer("total_earnings_cents").default(0),
  totalSubscribers: integer("total_subscribers").default(0),
  isOnline: boolean("is_online").default(false),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscriptions
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "cancelled", "expired", "pending"]);

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fanId: varchar("fan_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  creatorId: varchar("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  status: subscriptionStatusEnum("status").default("pending").notNull(),
  monthlyPriceCents: integer("monthly_price_cents").notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Unique constraint to prevent duplicate subscriptions
  uniqueFanCreator: unique().on(table.fanId, table.creatorId),
  // Indexes for performance - composite indexes for common filters
  creatorStatusIdx: index("idx_subs_creator_status").on(table.creatorId, table.status),
  fanStatusIdx: index("idx_subs_fan_status").on(table.fanId, table.status),
  statusIdx: index("idx_subscriptions_status").on(table.status),
  currentPeriodEndIdx: index("idx_subscriptions_current_period_end").on(table.currentPeriodEnd),
}));

// Enhanced Subscription System
export const subscriptionPlanDurationEnum = pgEnum("subscription_plan_duration", ["weekly", "monthly", "quarterly", "semi_annually", "yearly"]);

// Subscription Plans (Multiple pricing tiers per creator)
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(), // "VIP", "Premium", "Gold", etc.
  description: text("description"),
  duration: subscriptionPlanDurationEnum("duration").notNull(),
  priceCents: integer("price_cents").notNull(),
  originalPriceCents: integer("original_price_cents"), // For showing discounts
  discountPercentage: integer("discount_percentage").default(0),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  benefits: jsonb("benefits").default([]), // List of benefits
  maxSubscribers: integer("max_subscribers"), // Limited availability
  currentSubscribers: integer("current_subscribers").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  creatorActiveIdx: index("idx_plans_creator_active").on(table.creatorId, table.isActive),
  creatorSortIdx: index("idx_plans_creator_sort").on(table.creatorId, table.sortOrder),
}));

// Promotional Codes
export const promoCodeStatusEnum = pgEnum("promo_code_status", ["active", "expired", "exhausted", "disabled"]);
export const promoCodeTypeEnum = pgEnum("promo_code_type", ["percentage", "fixed_amount", "free_trial"]);

export const promoCodes = pgTable("promo_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").references(() => users.id, { onDelete: "cascade" }), // null = global
  code: varchar("code").notNull().unique(),
  name: varchar("name").notNull(),
  description: text("description"),
  type: promoCodeTypeEnum("type").notNull(),
  discountPercentage: integer("discount_percentage"), // For percentage type
  discountAmountCents: integer("discount_amount_cents"), // For fixed amount type
  freeTrialDays: integer("free_trial_days"), // For free trial type
  minPurchaseCents: integer("min_purchase_cents").default(0),
  maxUsageCount: integer("max_usage_count"), // null = unlimited
  currentUsageCount: integer("current_usage_count").default(0),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true),
  status: promoCodeStatusEnum("status").default("active").notNull(),
  applicablePlans: text("applicable_plans").array().default([]), // Plan IDs
  firstTimeOnly: boolean("first_time_only").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  codeIdx: index("idx_promo_codes_code").on(table.code),
  creatorActiveIdx: index("idx_promo_codes_creator_active").on(table.creatorId, table.isActive),
  statusIdx: index("idx_promo_codes_status").on(table.status),
}));

// Promo Code Usage Tracking
export const promoCodeUsages = pgTable("promo_code_usages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  promoCodeId: varchar("promo_code_id").notNull().references(() => promoCodes.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subscriptionId: varchar("subscription_id").references(() => subscriptions.id, { onDelete: "set null" }),
  originalPriceCents: integer("original_price_cents").notNull(),
  discountedPriceCents: integer("discounted_price_cents").notNull(),
  savingsCents: integer("savings_cents").notNull(),
  usedAt: timestamp("used_at").defaultNow(),
}, (table) => ({
  promoCodeIdx: index("idx_promo_usage_code").on(table.promoCodeId),
  userIdx: index("idx_promo_usage_user").on(table.userId),
}));

// Update subscriptions table to reference subscription plans
export const subscriptionsEnhanced = pgTable("subscriptions_enhanced", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fanId: varchar("fan_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  creatorId: varchar("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subscriptionPlanId: varchar("subscription_plan_id").notNull().references(() => subscriptionPlans.id, { onDelete: "cascade" }),
  promoCodeId: varchar("promo_code_id").references(() => promoCodes.id, { onDelete: "set null" }),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  status: subscriptionStatusEnum("status").default("pending").notNull(),
  originalPriceCents: integer("original_price_cents").notNull(),
  finalPriceCents: integer("final_price_cents").notNull(), // After discounts
  discountAppliedCents: integer("discount_applied_cents").default(0),
  nextBillingDate: timestamp("next_billing_date").notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  trialEndDate: timestamp("trial_end_date"), // Free trial support
  autoRenew: boolean("auto_renew").default(true),
  cancelledAt: timestamp("cancelled_at"),
  cancelReason: text("cancel_reason"),
  renewalCount: integer("renewal_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueFanCreator: unique().on(table.fanId, table.creatorId),
  creatorStatusIdx: index("idx_subs_enh_creator_status").on(table.creatorId, table.status),
  fanStatusIdx: index("idx_subs_enh_fan_status").on(table.fanId, table.status),
  nextBillingIdx: index("idx_subs_enh_next_billing").on(table.nextBillingDate),
  planIdx: index("idx_subs_enh_plan").on(table.subscriptionPlanId),
}));

// Posts
export const postTypeEnum = pgEnum("post_type", ["photo", "video", "audio", "text", "reel", "story", "live"]);
export const postVisibilityEnum = pgEnum("post_visibility", ["free", "premium", "subscribers_only"]);

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: postTypeEnum("type").notNull(),
  visibility: postVisibilityEnum("visibility").default("free").notNull(),
  title: varchar("title"),
  content: text("content"),
  priceCents: integer("price_cents").default(0),
  mediaUrls: text("media_urls").array().default([]),
  thumbnailUrl: varchar("thumbnail_url"),
  hashtags: text("hashtags").array().default([]),
  isScheduled: boolean("is_scheduled").default(false),
  scheduledFor: timestamp("scheduled_for"),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  viewsCount: integer("views_count").default(0),
  isProcessing: boolean("is_processing").default(false),
  processingStatus: varchar("processing_status").default("pending"),
  expiresAt: timestamp("expires_at"), // For stories
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Critical indexes for feed queries and performance
  creatorCreatedAtIdx: index("idx_posts_creator_created_at").on(table.creatorId, table.createdAt.desc()),
  visibilityIdx: index("idx_posts_visibility").on(table.visibility),
  scheduledForIdx: index("idx_posts_scheduled_for").on(table.scheduledFor),
}));

// Post Media (for multiple files per post)
export const postMedia = pgTable("post_media", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  mediaAssetId: varchar("media_asset_id").notNull().references(() => mediaAssets.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comments  
export const comments: any = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  parentId: varchar("parent_id"), // For nested comments - will reference comments.id
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Indexes for comment queries
  postIdCreatedAtIdx: index("idx_comments_post_created_at").on(table.postId, table.createdAt),
  userIdIdx: index("idx_comments_user_id").on(table.userId),
}));

// Likes
export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: varchar("post_id").references(() => posts.id, { onDelete: "cascade" }),
  commentId: varchar("comment_id").references(() => comments.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Unique constraints to prevent duplicate likes
  uniqueUserPost: unique().on(table.userId, table.postId),
  uniqueUserComment: unique().on(table.userId, table.commentId),
  // Check constraint to ensure exactly one of postId or commentId is set
  checkExactlyOneTarget: check("chk_like_exactly_one", sql`(post_id IS NOT NULL)::int + (comment_id IS NOT NULL)::int = 1`),
  // Performance indexes for likes queries
  postIdIdx: index("idx_likes_post_id").on(table.postId),
  commentIdIdx: index("idx_likes_comment_id").on(table.commentId),
}));

// Messages
export const messageTypeEnum = pgEnum("message_type", ["text", "photo", "video", "audio", "tip", "welcome"]);

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: varchar("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: messageTypeEnum("type").default("text").notNull(),
  content: text("content"),
  mediaUrl: varchar("media_url"),
  priceCents: integer("price_cents").default(0),
  isPaid: boolean("is_paid").default(false),
  isMassMessage: boolean("is_mass_message").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Critical indexes for inbox and conversation queries
  receiverCreatedAtIdx: index("idx_messages_receiver_created_at").on(table.receiverId, table.createdAt.desc()),
  senderCreatedAtIdx: index("idx_messages_sender_created_at").on(table.senderId, table.createdAt.desc()),
  senderReceiverIdx: index("idx_messages_sender_receiver").on(table.senderId, table.receiverId),
  readAtIdx: index("idx_messages_read_at").on(table.readAt),
}));

// Tips/Transactions
export const transactionTypeEnum = pgEnum("transaction_type", ["subscription", "tip", "post_purchase", "message_purchase", "welcome_message", "live_stream"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "completed", "failed", "refunded"]);

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  toUserId: varchar("to_user_id").notNull().references(() => users.id),
  type: transactionTypeEnum("type").notNull(),
  amountCents: integer("amount_cents").notNull(),
  platformFeeCents: integer("platform_fee_cents").default(0),
  creatorEarningsCents: integer("creator_earnings_cents").notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  status: transactionStatusEnum("status").default("pending").notNull(),
  referenceId: varchar("reference_id"), // ID of related post, message, etc.
  referenceType: varchar("reference_type"), // "post", "message", "subscription"
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Critical indexes for payouts, analytics, and earnings queries
  toUserCreatedAtIdx: index("idx_tx_to_created_at").on(table.toUserId, table.createdAt.desc()),
  fromUserCreatedAtIdx: index("idx_tx_from_created_at").on(table.fromUserId, table.createdAt.desc()),
  statusIdx: index("idx_tx_status").on(table.status),
  typeIdx: index("idx_tx_type").on(table.type),
  toUserStatusIdx: index("idx_tx_to_status").on(table.toUserId, table.status),
}));

// Categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Live Streams
export const streamStatusEnum = pgEnum("stream_status", ["scheduled", "live", "ended", "cancelled"]);
export const streamTypeEnum = pgEnum("stream_type", ["public", "private", "subscribers_only"]);

export const liveStreams = pgTable("live_streams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  type: streamTypeEnum("type").default("public").notNull(),
  status: streamStatusEnum("status").default("scheduled").notNull(),
  priceCents: integer("price_cents").default(0),
  streamKey: varchar("stream_key"),
  streamUrl: varchar("stream_url"),
  thumbnailUrl: varchar("thumbnail_url"),
  // GetStream integration fields
  getstreamCallId: varchar("getstream_call_id"),
  recordingUrl: varchar("recording_url"),
  playbackUrl: varchar("playback_url"),
  hlsPlaylistUrl: varchar("hls_playlist_url"),
  rtmpIngestUrl: varchar("rtmp_ingest_url"),
  viewersCount: integer("viewers_count").default(0),
  maxViewers: integer("max_viewers").default(0),
  totalTipsCents: integer("total_tips_cents").default(0),
  scheduledFor: timestamp("scheduled_for"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stream Viewers
export const streamViewers = pgTable("stream_viewers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  streamId: varchar("stream_id").notNull().references(() => liveStreams.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
});

// Lovense Device Integration
export const lovenseDeviceStatusEnum = pgEnum("lovense_device_status", ["connected", "disconnected", "error"]);
export const lovenseActionTypeEnum = pgEnum("lovense_action_type", ["tip", "manual", "pattern", "remote_control"]);

export const lovenseDevices = pgTable("lovense_devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  deviceId: varchar("device_id").notNull(), // Lovense device ID
  deviceName: varchar("device_name").notNull(),
  deviceType: varchar("device_type").notNull(), // "lush", "domi", "nora", etc.
  status: lovenseDeviceStatusEnum("status").default("disconnected").notNull(),
  isEnabled: boolean("is_enabled").default(true),
  batteryLevel: integer("battery_level"),
  lastConnected: timestamp("last_connected"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  creatorDeviceIdx: index("idx_lovense_creator_device").on(table.creatorId, table.deviceId),
}));

export const lovenseDeviceActions = pgTable("lovense_device_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull().references(() => lovenseDevices.id, { onDelete: "cascade" }),
  streamId: varchar("stream_id").references(() => liveStreams.id, { onDelete: "cascade" }),
  triggeredByUserId: varchar("triggered_by_user_id").references(() => users.id, { onDelete: "set null" }),
  actionType: lovenseActionTypeEnum("action_type").notNull(),
  intensity: integer("intensity"), // 0-20 for Lovense devices
  duration: integer("duration"), // Duration in seconds
  pattern: varchar("pattern"), // Pattern name or custom pattern
  tipAmount: integer("tip_amount_cents"), // Tip amount that triggered this action
  metadata: jsonb("metadata").default({}), // Additional data like custom patterns, messages
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  deviceCreatedIdx: index("idx_lovense_actions_device_created").on(table.deviceId, table.createdAt.desc()),
  streamCreatedIdx: index("idx_lovense_actions_stream_created").on(table.streamId, table.createdAt.desc()),
}));

export const lovenseIntegrationSettings = pgTable("lovense_integration_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  isEnabled: boolean("is_enabled").default(false),
  connectAppToken: varchar("connect_app_token"), // Lovense Connect app token
  domainKey: varchar("domain_key"), // Platform domain key for Lovense API
  tipMinimum: integer("tip_minimum_cents").default(100), // Minimum tip to trigger device (in cents)
  tipMaximum: integer("tip_maximum_cents").default(10000), // Maximum tip for max intensity
  intensityMapping: jsonb("intensity_mapping").default({}), // Custom tip-to-intensity mapping
  allowRemoteControl: boolean("allow_remote_control").default(false),
  allowPatterns: boolean("allow_patterns").default(true),
  customPatterns: jsonb("custom_patterns").default({}), // User-defined patterns
  lastSync: timestamp("last_sync"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Lovense OAuth Integration
export const lovenseAccounts = pgTable("lovense_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  authType: varchar("auth_type").notNull().default("qr_code"), // "qr_code", "oauth", "manual"
  accessToken: text("access_token"), // Encrypted OAuth token
  refreshToken: text("refresh_token"), // Encrypted refresh token
  tokenExpiry: timestamp("token_expiry"),
  qrCodeData: jsonb("qr_code_data").default({}), // QR code connection data
  connectionStatus: varchar("connection_status").default("disconnected").notNull(), // "connected", "disconnected", "error"
  lastConnectedAt: timestamp("last_connected_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: unique("idx_lovense_accounts_user").on(table.userId),
}));

// Lovense Pattern Mappings
export const lovenseMappings = pgTable("lovense_mappings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventType: varchar("event_type").notNull(), // "tip", "follow", "subscription", "custom"
  triggerValue: integer("trigger_value"), // Tip amount, etc.
  pattern: varchar("pattern").notNull(), // "vibrate", "rotate", "custom_pattern_name"
  intensity: integer("intensity").notNull().default(5), // 1-20
  duration: integer("duration").notNull().default(3), // seconds
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userEventIdx: index("idx_lovense_mappings_user_event").on(table.userId, table.eventType),
}));

// Lovense WebSocket Sessions
export const lovenseSessions = pgTable("lovense_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id").notNull().unique(), // WebSocket session identifier
  streamId: varchar("stream_id").references(() => liveStreams.id, { onDelete: "cascade" }),
  connectionStatus: varchar("connection_status").default("connecting").notNull(), // "connecting", "connected", "disconnected", "error"
  clientInfo: jsonb("client_info").default({}), // Browser/device info
  lastPingAt: timestamp("last_ping_at"),
  connectedAt: timestamp("connected_at"),
  disconnectedAt: timestamp("disconnected_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userSessionIdx: index("idx_lovense_sessions_user_session").on(table.userId, table.sessionId),
  streamSessionIdx: index("idx_lovense_sessions_stream").on(table.streamId, table.connectedAt.desc()),
  statusIdx: index("idx_lovense_sessions_status").on(table.connectionStatus),
}));

// Co-star Verification System
export const costarVerificationStatusEnum = pgEnum("costar_verification_status", ["pending", "approved", "rejected", "expired"]);

export const costarVerifications = pgTable("costar_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mediaId: varchar("media_id").references(() => mediaAssets.id, { onDelete: "cascade" }),
  liveStreamId: varchar("live_stream_id").references(() => liveStreams.id, { onDelete: "cascade" }),
  primaryCreatorId: varchar("primary_creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  coStarUserId: varchar("co_star_user_id").references(() => users.id, { onDelete: "set null" }),
  coStarEmail: varchar("co_star_email"), // If co-star doesn't have account yet
  status: costarVerificationStatusEnum("status").default("pending").notNull(),
  inviteToken: varchar("invite_token").unique(),
  consentDocument2257Id: varchar("consent_document_2257_id").references(() => records2257.id, { onDelete: "set null" }),
  signedAt: timestamp("signed_at"),
  kycVerificationId: varchar("kyc_verification_id").references(() => kycVerifications.id, { onDelete: "set null" }),
  notes: text("notes"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  mediaCreatorIdx: index("idx_costar_media_creator").on(table.mediaId, table.primaryCreatorId),
  streamCreatorIdx: index("idx_costar_stream_creator").on(table.liveStreamId, table.primaryCreatorId),
  statusIdx: index("idx_costar_status").on(table.status),
  inviteTokenIdx: index("idx_costar_invite_token").on(table.inviteToken),
}));

// Media to 2257 Record Links
export const media2257Links = pgTable("media_2257_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mediaId: varchar("media_id").notNull().references(() => mediaAssets.id, { onDelete: "cascade" }),
  record2257Id: varchar("record_2257_id").notNull().references(() => records2257.id, { onDelete: "cascade" }),
  role: varchar("role").notNull().default("primary"), // "primary", "co_star"
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  mediaRecordIdx: unique("idx_media_2257_media_record").on(table.mediaId, table.record2257Id),
  mediaUserRoleIdx: index("idx_media_2257_media_user_role").on(table.mediaId, table.userId, table.role),
}));

// Custodian of Records (2257 Compliance)
export const custodianOfRecords = pgTable("custodian_of_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  title: varchar("title").notNull(),
  businessName: varchar("business_name").notNull(),
  address: text("address").notNull(),
  phone: varchar("phone").notNull(),
  email: varchar("email").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  activeIdx: index("idx_custodian_active").on(table.isActive),
}));

// Reports
export const reportTypeEnum = pgEnum("report_type", ["spam", "harassment", "inappropriate_content", "copyright", "fake_account", "other"]);
export const reportStatusEnum = pgEnum("report_status", ["pending", "reviewing", "resolved", "dismissed"]);

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  reportedUserId: varchar("reported_user_id").references(() => users.id),
  reportedPostId: varchar("reported_post_id").references(() => posts.id),
  type: reportTypeEnum("type").notNull(),
  reason: text("reason").notNull(),
  status: reportStatusEnum("status").default("pending").notNull(),
  reviewerId: varchar("reviewer_id").references(() => users.id),
  reviewNotes: text("review_notes"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notificationKindEnum = pgEnum("notification_kind", ["payout", "moderation", "kyc", "system", "fan_activity", "dmca"]);

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  kind: notificationKindEnum("kind").notNull(),
  payloadJson: jsonb("payload_json").default({}),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles),
  kycVerifications: many(kycVerifications),
  records2257: many(records2257),
  mediaAssets: many(mediaAssets),
  payoutAccounts: many(payoutAccounts),
  payoutRequests: many(payoutRequests),
  webhooks: many(webhooks),
  apiKeys: many(apiKeys),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ one, many }) => ({
  owner: one(users, {
    fields: [mediaAssets.ownerId],
    references: [users.id],
  }),
  moderationQueue: many(moderationQueue),
}));

export const moderationQueueRelations = relations(moderationQueue, ({ one }) => ({
  media: one(mediaAssets, {
    fields: [moderationQueue.mediaId],
    references: [mediaAssets.id],
  }),
  reviewer: one(users, {
    fields: [moderationQueue.reviewerId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
  authProvider: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const registerUserSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["fan", "creator", "admin"]).default("fan"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const insertProfileSchema = createInsertSchema(profiles).pick({
  displayName: true,
  bio: true,
  avatarUrl: true,
  publicFlags: true,
});

export const insertMediaAssetSchema = createInsertSchema(mediaAssets).pick({
  title: true,
  description: true,
  s3Key: true,
  mimeType: true,
  size: true,
  checksum: true,
});

export const insertPayoutRequestSchema = createInsertSchema(payoutRequests).pick({
  amountCents: true,
  currency: true,
});

export const insertWebhookSchema = createInsertSchema(webhooks).pick({
  url: true,
  eventsJson: true,
});

export const insertThemeSettingsSchema = createInsertSchema(themeSettings).pick({
  name: true,
  colors: true,
  typography: true,
  effects: true,
});

export const updateThemeSettingsSchema = createInsertSchema(themeSettings).pick({
  name: true,
  isActive: true,
  colors: true,
  typography: true,
  effects: true,
});

// CMS schemas
export const insertCmsThemeSchema = createInsertSchema(cmsThemes).pick({
  name: true,
});

export const insertCmsThemeVersionSchema = createInsertSchema(cmsThemeVersions).pick({
  label: true,
});

export const insertCmsThemeSettingsSchema = createInsertSchema(cmsThemeSettings).pick({
  settingsJson: true,
});

export const insertCmsThemeAssetSchema = createInsertSchema(cmsThemeAssets).pick({
  path: true,
  storageKey: true,
  mimeType: true,
  sizeBytes: true,
});

export const insertCmsPageSchema = createInsertSchema(cmsPages).pick({
  slug: true,
  title: true,
  template: true,
  status: true,
  seoJson: true,
});

export const insertCmsPageSectionSchema = createInsertSchema(cmsPageSections).pick({
  type: true,
  sortOrder: true,
  propsJson: true,
});

export const insertCmsMenuSchema = createInsertSchema(cmsMenus).pick({
  handle: true,
  title: true,
});

export const insertCmsMenuItemSchema = createInsertSchema(cmsMenuItems).pick({
  title: true,
  url: true,
  sortOrder: true,
});

// Creator Economy Schemas
export const insertCreatorProfileSchema = createInsertSchema(creatorProfiles).pick({
  monthlyPriceCents: true,
  coverImageUrl: true,
  socialProfiles: true,
  welcomeMessageEnabled: true,
  welcomeMessageText: true,
  welcomeMessagePriceCents: true,
  categories: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  fanId: true,
  creatorId: true,
  stripeSubscriptionId: true,
  status: true,
  monthlyPriceCents: true,
  currentPeriodStart: true,
  currentPeriodEnd: true,
  cancelledAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  creatorId: true,
  likesCount: true,
  commentsCount: true,
  viewsCount: true,
  isProcessing: true,
  processingStatus: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  postId: true,
  content: true,
  parentId: true,
});

export const insertLikeSchema = createInsertSchema(likes).pick({
  postId: true,
  commentId: true,
}).superRefine((data, ctx) => {
  const hasPostId = !!data.postId;
  const hasCommentId = !!data.commentId;
  
  if (!hasPostId && !hasCommentId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Either postId or commentId is required",
      path: ["postId"],
    });
  }
  
  if (hasPostId && hasCommentId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Cannot like both a post and comment simultaneously",
      path: ["postId"],
    });
  }
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  senderId: true,
  readAt: true,
  isPaid: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  fromUserId: true,
  toUserId: true,
  platformFeeCents: true,
  creatorEarningsCents: true,
  status: true,
  stripePaymentIntentId: true,
  createdAt: true,
});

// Earnings API validation schemas
export const subscriptionPaymentSchema = z.object({
  creatorUserId: z.string().uuid("Invalid creator ID format"),
  amount: z.number().int().min(1, "Amount must be at least 1 cent").max(100000000, "Amount too large"),
});

export const ppvPurchaseSchema = z.object({
  creatorUserId: z.string().uuid("Invalid creator ID format"),
  mediaId: z.string().uuid("Invalid media ID format"),
  amount: z.number().int().min(1, "Amount must be at least 1 cent").max(100000000, "Amount too large"),
});

export const tipSchema = z.object({
  creatorUserId: z.string().uuid("Invalid creator ID format"),
  amount: z.number().int().min(1, "Amount must be at least 1 cent").max(100000000, "Amount too large"),
  message: z.string().min(1, "Message cannot be empty").max(500, "Message too long").optional(),
});

export const liveStreamTokensSchema = z.object({
  creatorUserId: z.string().uuid("Invalid creator ID format"),
  tokenCount: z.number().int().min(1, "Token count must be at least 1").max(10000, "Too many tokens"),
  tokenValue: z.number().int().min(1, "Token value must be at least 1 cent").max(10000, "Token value too high"),
});

// Lovense Integration Schemas
export const insertLovenseDeviceSchema = createInsertSchema(lovenseDevices).pick({
  deviceId: true,
  deviceName: true,
  deviceType: true,
  isEnabled: true,
});

export const insertLovenseDeviceActionSchema = createInsertSchema(lovenseDeviceActions).pick({
  deviceId: true,
  streamId: true,
  actionType: true,
  intensity: true,
  duration: true,
  pattern: true,
  tipAmount: true,
  metadata: true,
});

export const insertLovenseIntegrationSettingsSchema = createInsertSchema(lovenseIntegrationSettings).pick({
  isEnabled: true,
  connectAppToken: true,
  domainKey: true,
  tipMinimum: true,
  tipMaximum: true,
  intensityMapping: true,
  allowRemoteControl: true,
  allowPatterns: true,
  customPatterns: true,
});

// Enhanced Lovense and Co-star Schemas
export const insertLovenseAccountSchema = createInsertSchema(lovenseAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLovenseMappingSchema = createInsertSchema(lovenseMappings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLovenseSessionSchema = createInsertSchema(lovenseSessions).omit({
  id: true,
  createdAt: true,
});

export const insertCostarVerificationSchema = createInsertSchema(costarVerifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMedia2257LinkSchema = createInsertSchema(media2257Links).omit({
  id: true,
  createdAt: true,
});

export const insertCustodianOfRecordsSchema = createInsertSchema(custodianOfRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateLovenseIntegrationSettingsSchema = createInsertSchema(lovenseIntegrationSettings).pick({
  isEnabled: true,
  connectAppToken: true,
  domainKey: true,
  tipMinimum: true,
  tipMaximum: true,
  intensityMapping: true,
  allowRemoteControl: true,
  allowPatterns: true,
  customPatterns: true,
});

// Device control schemas for API endpoints
export const lovenseDeviceControlSchema = z.object({
  action: z.enum(['vibrate', 'rotate', 'pump', 'stop']),
  intensity: z.number().min(0).max(20).optional(),
  duration: z.number().min(1).max(300).optional(), // Max 5 minutes
  pattern: z.string().optional(),
});

export const lovenseTestDeviceSchema = z.object({
  deviceId: z.string(),
  action: z.enum(['test_vibration', 'check_battery', 'ping']),
  intensity: z.number().min(1).max(10).optional().default(5),
  duration: z.number().min(1).max(5).optional().default(2),
});

// Moderation API validation schemas
export const moderationDecisionSchema = z.object({
  notes: z.string().max(1000, "Notes too long").optional(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  sortOrder: true,
});

export const insertLiveStreamSchema = createInsertSchema(liveStreams).pick({
  title: true,
  description: true,
  type: true,
  priceCents: true,
  scheduledFor: true,
});

export const insertReportSchema = createInsertSchema(reports).pick({
  reportedUserId: true,
  reportedPostId: true,
  type: true,
  reason: true,
});

// Enhanced Subscription System Schemas
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentSubscribers: true,
});
export type InsertSubscriptionPlanType = z.infer<typeof insertSubscriptionPlanSchema>;

export const updateSubscriptionPlanSchema = insertSubscriptionPlanSchema.partial();
export type UpdateSubscriptionPlanType = z.infer<typeof updateSubscriptionPlanSchema>;

export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentUsageCount: true,
});
export type InsertPromoCodeType = z.infer<typeof insertPromoCodeSchema>;

export const updatePromoCodeSchema = insertPromoCodeSchema.partial();
export type UpdatePromoCodeType = z.infer<typeof updatePromoCodeSchema>;

export const validatePromoCodeSchema = z.object({
  code: z.string().min(1),
  subscriptionPlanId: z.string().optional(),
});
export type ValidatePromoCodeType = z.infer<typeof validatePromoCodeSchema>;

export const applyPromoCodeSchema = z.object({
  code: z.string().min(1),
  subscriptionPlanId: z.string(),
});
export type ApplyPromoCodeType = z.infer<typeof applyPromoCodeSchema>;

export const createSubscriptionEnhancedSchema = createInsertSchema(subscriptionsEnhanced).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  renewalCount: true,
});
export type CreateSubscriptionEnhancedType = z.infer<typeof createSubscriptionEnhancedSchema>;

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type Profile = typeof profiles.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type ModerationQueueItem = typeof moderationQueue.$inferSelect;
export type PayoutRequest = typeof payoutRequests.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type KycVerification = typeof kycVerifications.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Webhook = typeof webhooks.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type ThemeSettings = typeof themeSettings.$inferSelect;
export type InsertThemeSettings = z.infer<typeof insertThemeSettingsSchema>;
export type UpdateThemeSettings = z.infer<typeof updateThemeSettingsSchema>;

// CMS Types
export type CmsTheme = typeof cmsThemes.$inferSelect;
export type CmsThemeVersion = typeof cmsThemeVersions.$inferSelect;
export type CmsThemeSettings = typeof cmsThemeSettings.$inferSelect;
export type CmsThemeAsset = typeof cmsThemeAssets.$inferSelect;
export type CmsPage = typeof cmsPages.$inferSelect;
export type CmsPageSection = typeof cmsPageSections.$inferSelect;
export type CmsMenu = typeof cmsMenus.$inferSelect;
export type CmsMenuItem = typeof cmsMenuItems.$inferSelect;
export type CmsPublish = typeof cmsPublishes.$inferSelect;
export type InsertCmsTheme = z.infer<typeof insertCmsThemeSchema>;
export type InsertCmsThemeVersion = z.infer<typeof insertCmsThemeVersionSchema>;
export type InsertCmsThemeSettings = z.infer<typeof insertCmsThemeSettingsSchema>;
export type InsertCmsThemeAsset = z.infer<typeof insertCmsThemeAssetSchema>;
export type InsertCmsPage = z.infer<typeof insertCmsPageSchema>;
export type InsertCmsPageSection = z.infer<typeof insertCmsPageSectionSchema>;
export type InsertCmsMenu = z.infer<typeof insertCmsMenuSchema>;
export type InsertCmsMenuItem = z.infer<typeof insertCmsMenuItemSchema>;

// Admin delegation system
export const adminPermissionEnum = pgEnum("admin_permission", [
  "moderation_queue",
  "user_management", 
  "theme_management",
  "analytics_access",
  "content_approval",
  "system_settings"
]);

export const delegatedPermissions = pgTable("delegated_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  grantedBy: varchar("granted_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  permission: adminPermissionEnum("permission").notNull(),
  granted: boolean("granted").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
}, (table) => [
  unique("unique_user_permission").on(table.userId, table.permission)
]);

export const insertDelegatedPermissionSchema = createInsertSchema(delegatedPermissions).omit({
  id: true,
  createdAt: true,
});

// Creator Economy Types
export type CreatorProfile = typeof creatorProfiles.$inferSelect;

// Enhanced Subscription System Types
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = typeof promoCodes.$inferInsert;
export type PromoCodeUsage = typeof promoCodeUsages.$inferSelect;
export type InsertPromoCodeUsage = typeof promoCodeUsages.$inferInsert;
export type SubscriptionEnhanced = typeof subscriptionsEnhanced.$inferSelect;
export type InsertSubscriptionEnhanced = typeof subscriptionsEnhanced.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type PostMedia = typeof postMedia.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type LiveStream = typeof liveStreams.$inferSelect;
export type StreamViewer = typeof streamViewers.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type InsertCreatorProfile = z.infer<typeof insertCreatorProfileSchema>;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertLiveStream = z.infer<typeof insertLiveStreamSchema>;
export type InsertReport = z.infer<typeof insertReportSchema>;

// Lovense Integration Types
export type LovenseDevice = typeof lovenseDevices.$inferSelect;
export type LovenseDeviceAction = typeof lovenseDeviceActions.$inferSelect;
export type LovenseIntegrationSettings = typeof lovenseIntegrationSettings.$inferSelect;
export type InsertLovenseDevice = z.infer<typeof insertLovenseDeviceSchema>;
export type InsertLovenseDeviceAction = z.infer<typeof insertLovenseDeviceActionSchema>;
export type InsertLovenseIntegrationSettings = z.infer<typeof insertLovenseIntegrationSettingsSchema>;
export type UpdateLovenseIntegrationSettings = z.infer<typeof updateLovenseIntegrationSettingsSchema>;
export type LovenseDeviceControl = z.infer<typeof lovenseDeviceControlSchema>;
export type LovenseTestDevice = z.infer<typeof lovenseTestDeviceSchema>;

// Enhanced Integration Types
export type LovenseAccount = typeof lovenseAccounts.$inferSelect;
export type LovenseMapping = typeof lovenseMappings.$inferSelect;
export type LovenseSession = typeof lovenseSessions.$inferSelect;
export type CostarVerification = typeof costarVerifications.$inferSelect;
export type Media2257Link = typeof media2257Links.$inferSelect;
export type CustodianOfRecords = typeof custodianOfRecords.$inferSelect;
export type InsertLovenseAccount = z.infer<typeof insertLovenseAccountSchema>;
export type InsertLovenseMapping = z.infer<typeof insertLovenseMappingSchema>;
export type InsertLovenseSession = z.infer<typeof insertLovenseSessionSchema>;
export type InsertCostarVerification = z.infer<typeof insertCostarVerificationSchema>;
export type InsertMedia2257Link = z.infer<typeof insertMedia2257LinkSchema>;
export type InsertCustodianOfRecords = z.infer<typeof insertCustodianOfRecordsSchema>;

// DMCA Compliance Tables
export const dmcaStatusEnum = pgEnum("dmca_status", ["pending", "processed", "rejected", "counter_claimed"]);
export const repeatInfringerStatusEnum = pgEnum("repeat_infringer_status", ["warning", "probation", "suspended", "terminated"]);
export const contentHashAlgorithmEnum = pgEnum("content_hash_algorithm", ["md5", "sha256", "perceptual"]);

export const dmcaRequests = pgTable("dmca_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  complaintId: varchar("complaint_id").notNull().unique(),
  complainantName: varchar("complainant_name").notNull(),
  complainantEmail: varchar("complainant_email").notNull(),
  complainantAddress: text("complainant_address").notNull(),
  copyrightOwner: varchar("copyright_owner").notNull(),
  workDescription: text("work_description").notNull(),
  infringementUrls: text("infringement_urls").array().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  mediaAssetId: varchar("media_asset_id").references(() => mediaAssets.id, { onDelete: "set null" }),
  status: dmcaStatusEnum("status").default("pending").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  processorId: varchar("processor_id").references(() => users.id, { onDelete: "set null" }),
  legalHoldApplied: boolean("legal_hold_applied").default(false),
  contentHash: varchar("content_hash"),
  counterNotification: jsonb("counter_notification"),
  counterSubmittedAt: timestamp("counter_submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const repeatInfringers = pgTable("repeat_infringers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  infringementCount: integer("infringement_count").default(0),
  firstInfringement: timestamp("first_infringement").defaultNow(),
  lastInfringement: timestamp("last_infringement").defaultNow(),
  status: repeatInfringerStatusEnum("status").default("warning").notNull(),
  strikeHistory: text("strike_history").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contentHashes = pgTable("content_hashes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hash: varchar("hash").notNull(),
  algorithm: contentHashAlgorithmEnum("algorithm").notNull(),
  mediaAssetId: varchar("media_asset_id").notNull().references(() => mediaAssets.id, { onDelete: "cascade" }),
  dmcaRequestId: varchar("dmca_request_id").references(() => dmcaRequests.id, { onDelete: "cascade" }),
  blockedAt: timestamp("blocked_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_content_hash").on(table.hash),
  index("idx_content_hash_algorithm").on(table.algorithm),
]);

// DMCA Insert/Select schemas
export const insertDmcaRequestSchema = createInsertSchema(dmcaRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRepeatInfringerSchema = createInsertSchema(repeatInfringers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContentHashSchema = createInsertSchema(contentHashes).omit({ id: true, createdAt: true });

// Admin delegation types
export type DelegatedPermission = typeof delegatedPermissions.$inferSelect;
export type InsertDelegatedPermission = z.infer<typeof insertDelegatedPermissionSchema>;

// DMCA types
export type DmcaRequest = typeof dmcaRequests.$inferSelect;
export type InsertDmcaRequest = z.infer<typeof insertDmcaRequestSchema>;
export type RepeatInfringer = typeof repeatInfringers.$inferSelect;
export type InsertRepeatInfringer = z.infer<typeof insertRepeatInfringerSchema>;
export type ContentHash = typeof contentHashes.$inferSelect;
export type InsertContentHash = z.infer<typeof insertContentHashSchema>;
