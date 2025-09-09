import { sql } from 'drizzle-orm';
import {
  index,
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
export const userRoleEnum = pgEnum("user_role", ["fan", "creator", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "suspended", "pending"]);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default("fan").notNull(),
  status: userStatusEnum("status").default("active").notNull(),
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
export const mediaStatusEnum = pgEnum("media_status", ["pending", "approved", "rejected", "processing"]);

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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Moderation queue
export const moderationStatusEnum = pgEnum("moderation_status", ["pending", "approved", "rejected"]);

export const moderationQueue = pgTable("moderation_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mediaId: varchar("media_id").notNull().references(() => mediaAssets.id, { onDelete: "cascade" }),
  reason: text("reason"),
  status: moderationStatusEnum("status").default("pending").notNull(),
  reviewerId: varchar("reviewer_id").references(() => users.id),
  notes: text("notes"),
  decidedAt: timestamp("decided_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit logs
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actorId: varchar("actor_id").references(() => users.id),
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

// Notifications
export const notificationKindEnum = pgEnum("notification_kind", ["payout", "moderation", "kyc", "system", "fan_activity"]);

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
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
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

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type ModerationQueueItem = typeof moderationQueue.$inferSelect;
export type PayoutRequest = typeof payoutRequests.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type KycVerification = typeof kycVerifications.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Webhook = typeof webhooks.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
