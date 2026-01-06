/**
 * FANZ Data Retention & Privacy Schema
 *
 * Implements GDPR, CCPA, LGPD compliance for:
 * - Data export (Right to Portability)
 * - Data deletion (Right to Erasure)
 * - Data retention policies
 * - Audit logging
 */

import { sql } from "drizzle-orm";
import {
  index,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  jsonb,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./schema";

// ===== DATA EXPORT REQUESTS =====

export const dataExportStatusEnum = pgEnum("data_export_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "expired",
  "downloaded",
]);

export const dataExportRequests = pgTable(
  "data_export_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    platformId: varchar("platform_id").notNull(), // Multi-tenant isolation
    status: dataExportStatusEnum("status").default("pending").notNull(),

    // What data to include
    includeProfile: boolean("include_profile").default(true),
    includeContent: boolean("include_content").default(true),
    includeMessages: boolean("include_messages").default(true),
    includeTransactions: boolean("include_transactions").default(true),
    includeSubscriptions: boolean("include_subscriptions").default(true),
    includePurchases: boolean("include_purchases").default(true),
    includeEarnings: boolean("include_earnings").default(true),
    includeActivityLogs: boolean("include_activity_logs").default(false),

    // Export details
    format: varchar("format").default("json").notNull(), // json, csv, zip
    archiveUrl: text("archive_url"), // Signed URL for download
    archiveSizeBytes: integer("archive_size_bytes"),
    archiveChecksum: varchar("archive_checksum"), // SHA-256 for integrity

    // Expiry and access
    expiresAt: timestamp("expires_at"), // Archive expires after 7 days
    downloadedAt: timestamp("downloaded_at"),
    downloadCount: integer("download_count").default(0),

    // Processing
    processingStartedAt: timestamp("processing_started_at"),
    processingCompletedAt: timestamp("processing_completed_at"),
    errorMessage: text("error_message"),

    // Audit
    requestedIp: varchar("requested_ip"),
    requestedUserAgent: text("requested_user_agent"),
    metadata: jsonb("metadata").default({}),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("data_export_user_idx").on(table.userId),
    platformIdx: index("data_export_platform_idx").on(table.platformId),
    statusIdx: index("data_export_status_idx").on(table.status),
    expiresIdx: index("data_export_expires_idx").on(table.expiresAt),
  })
);

// ===== ACCOUNT DELETION REQUESTS =====

export const deletionRequestStatusEnum = pgEnum("deletion_request_status", [
  "pending",           // Awaiting grace period
  "grace_period",      // In grace period (can be cancelled)
  "processing",        // Being processed
  "completed",         // Successfully deleted
  "cancelled",         // User cancelled
  "failed",            // Deletion failed
  "held",              // On legal hold
  "partial",           // Partial deletion (some data retained)
]);

export const deletionRequestTypeEnum = pgEnum("deletion_request_type", [
  "full_account",      // Delete entire account
  "platform_only",     // Delete from single platform
  "content_only",      // Delete content but keep account
  "messages_only",     // Delete messages only
  "financial_anonymize", // Anonymize financial records (can't delete)
]);

export const accountDeletionRequests = pgTable(
  "account_deletion_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
    platformId: varchar("platform_id").notNull(), // Where request originated

    // Request details
    requestType: deletionRequestTypeEnum("request_type").default("full_account").notNull(),
    status: deletionRequestStatusEnum("status").default("pending").notNull(),
    reason: text("reason"), // Optional reason for deletion

    // Grace period (30 days default)
    gracePeriodDays: integer("grace_period_days").default(30),
    gracePeriodEndsAt: timestamp("grace_period_ends_at"),
    canCancelUntil: timestamp("can_cancel_until"),

    // Retention exceptions
    retainFinancialRecords: boolean("retain_financial_records").default(true), // Tax compliance
    retainFraudData: boolean("retain_fraud_data").default(true), // Fraud prevention
    legalHoldId: varchar("legal_hold_id"), // If under legal hold
    legalHoldReason: text("legal_hold_reason"),

    // Processing
    scheduledDeletionAt: timestamp("scheduled_deletion_at"),
    processingStartedAt: timestamp("processing_started_at"),
    processingCompletedAt: timestamp("processing_completed_at"),

    // What was deleted
    deletionManifest: jsonb("deletion_manifest").default({}), // Log of what was deleted
    recordsDeleted: integer("records_deleted").default(0),
    contentFilesDeleted: integer("content_files_deleted").default(0),
    storageFreedBytes: integer("storage_freed_bytes").default(0),

    // Errors
    errorMessage: text("error_message"),
    retryCount: integer("retry_count").default(0),

    // Audit
    requestedIp: varchar("requested_ip"),
    requestedUserAgent: text("requested_user_agent"),
    confirmedAt: timestamp("confirmed_at"), // User confirmed deletion
    confirmationMethod: varchar("confirmation_method"), // email, sms, in-app
    processedBy: varchar("processed_by"), // Admin or system

    // Preserved for audit trail
    deletedUserEmail: varchar("deleted_user_email"), // Anonymized reference
    deletedUserHash: varchar("deleted_user_hash"), // For fraud prevention

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("deletion_user_idx").on(table.userId),
    platformIdx: index("deletion_platform_idx").on(table.platformId),
    statusIdx: index("deletion_status_idx").on(table.status),
    scheduledIdx: index("deletion_scheduled_idx").on(table.scheduledDeletionAt),
    gracePeriodIdx: index("deletion_grace_period_idx").on(table.gracePeriodEndsAt),
  })
);

// ===== DATA RETENTION POLICIES =====

export const retentionPolicies = pgTable(
  "retention_policies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    platformId: varchar("platform_id"), // null = global policy

    // Policy details
    name: varchar("name").notNull(),
    description: text("description"),
    dataCategory: varchar("data_category").notNull(), // profile, content, messages, transactions, logs

    // Retention rules
    retentionDays: integer("retention_days").notNull(), // Days to retain after trigger
    retentionTrigger: varchar("retention_trigger").notNull(), // account_deletion, last_access, created

    // Actions
    actionOnExpiry: varchar("action_on_expiry").default("delete").notNull(), // delete, anonymize, archive
    requiresManualReview: boolean("requires_manual_review").default(false),

    // Legal basis
    legalBasis: varchar("legal_basis"), // GDPR Article reference
    jurisdiction: varchar("jurisdiction"), // EU, US-CA, BR, etc.

    // Exceptions
    exceptionRules: jsonb("exception_rules").default({}),

    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    platformIdx: index("retention_policy_platform_idx").on(table.platformId),
    categoryIdx: index("retention_policy_category_idx").on(table.dataCategory),
    activeIdx: index("retention_policy_active_idx").on(table.isActive),
  })
);

// ===== DATA ACCESS AUDIT LOG =====

export const dataAccessAuditLog = pgTable(
  "data_access_audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Who accessed
    accessorId: varchar("accessor_id"), // User or admin ID
    accessorType: varchar("accessor_type").notNull(), // user, admin, system, api
    accessorIp: varchar("accessor_ip"),
    accessorUserAgent: text("accessor_user_agent"),

    // What was accessed
    targetUserId: varchar("target_user_id").notNull(), // Whose data
    platformId: varchar("platform_id").notNull(),
    dataCategory: varchar("data_category").notNull(), // profile, content, messages, etc.
    dataIds: jsonb("data_ids").default([]), // Specific record IDs accessed

    // Action details
    action: varchar("action").notNull(), // view, export, modify, delete
    actionDetails: jsonb("action_details").default({}),

    // Legal basis
    legalBasis: varchar("legal_basis"), // consent, contract, legal_obligation, etc.
    consentId: varchar("consent_id"), // Reference to consent record

    // Request context
    requestId: varchar("request_id"), // Correlation ID
    sessionId: varchar("session_id"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    accessorIdx: index("data_audit_accessor_idx").on(table.accessorId),
    targetIdx: index("data_audit_target_idx").on(table.targetUserId),
    platformIdx: index("data_audit_platform_idx").on(table.platformId),
    actionIdx: index("data_audit_action_idx").on(table.action),
    createdIdx: index("data_audit_created_idx").on(table.createdAt),
  })
);

// ===== CONSENT MANAGEMENT =====

export const consentStatusEnum = pgEnum("consent_status", [
  "granted",
  "withdrawn",
  "expired",
  "pending",
]);

export const userConsents = pgTable(
  "user_consents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    platformId: varchar("platform_id").notNull(),

    // Consent details
    consentType: varchar("consent_type").notNull(), // marketing, analytics, personalization, third_party
    status: consentStatusEnum("status").default("pending").notNull(),

    // Consent metadata
    version: varchar("version").notNull(), // Policy version consented to
    consentText: text("consent_text"), // What they agreed to

    // Timing
    grantedAt: timestamp("granted_at"),
    withdrawnAt: timestamp("withdrawn_at"),
    expiresAt: timestamp("expires_at"),

    // Evidence
    consentMethod: varchar("consent_method"), // checkbox, double_opt_in, verbal
    ipAddress: varchar("ip_address"),
    userAgent: text("user_agent"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("consent_user_idx").on(table.userId),
    platformIdx: index("consent_platform_idx").on(table.platformId),
    typeIdx: index("consent_type_idx").on(table.consentType),
    statusIdx: index("consent_status_idx").on(table.status),
  })
);

// ===== LEGAL HOLDS =====

export const legalHolds = pgTable(
  "legal_holds",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Hold details
    name: varchar("name").notNull(),
    description: text("description"),
    caseReference: varchar("case_reference"), // Legal case number

    // Scope
    affectedUserIds: jsonb("affected_user_ids").default([]),
    affectedPlatformIds: jsonb("affected_platform_ids").default([]),
    dataCategories: jsonb("data_categories").default([]), // What data to preserve

    // Timeline
    holdStartDate: timestamp("hold_start_date").notNull(),
    holdEndDate: timestamp("hold_end_date"),

    // Management
    createdBy: varchar("created_by").notNull(), // Admin who created
    approvedBy: varchar("approved_by"), // Legal approval
    isActive: boolean("is_active").default(true),

    // Audit
    metadata: jsonb("metadata").default({}),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    activeIdx: index("legal_hold_active_idx").on(table.isActive),
    caseIdx: index("legal_hold_case_idx").on(table.caseReference),
  })
);

// ===== SCHEMAS =====

export const insertDataExportRequestSchema = createInsertSchema(dataExportRequests).omit({
  id: true,
  status: true,
  archiveUrl: true,
  archiveSizeBytes: true,
  archiveChecksum: true,
  expiresAt: true,
  downloadedAt: true,
  downloadCount: true,
  processingStartedAt: true,
  processingCompletedAt: true,
  errorMessage: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAccountDeletionRequestSchema = createInsertSchema(accountDeletionRequests).omit({
  id: true,
  status: true,
  gracePeriodEndsAt: true,
  canCancelUntil: true,
  scheduledDeletionAt: true,
  processingStartedAt: true,
  processingCompletedAt: true,
  deletionManifest: true,
  recordsDeleted: true,
  contentFilesDeleted: true,
  storageFreedBytes: true,
  errorMessage: true,
  retryCount: true,
  confirmedAt: true,
  deletedUserEmail: true,
  deletedUserHash: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRetentionPolicySchema = createInsertSchema(retentionPolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserConsentSchema = createInsertSchema(userConsents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLegalHoldSchema = createInsertSchema(legalHolds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ===== TYPES =====

export type DataExportRequest = typeof dataExportRequests.$inferSelect;
export type InsertDataExportRequest = z.infer<typeof insertDataExportRequestSchema>;

export type AccountDeletionRequest = typeof accountDeletionRequests.$inferSelect;
export type InsertAccountDeletionRequest = z.infer<typeof insertAccountDeletionRequestSchema>;

export type RetentionPolicy = typeof retentionPolicies.$inferSelect;
export type InsertRetentionPolicy = z.infer<typeof insertRetentionPolicySchema>;

export type DataAccessAuditLog = typeof dataAccessAuditLog.$inferSelect;

export type UserConsent = typeof userConsents.$inferSelect;
export type InsertUserConsent = z.infer<typeof insertUserConsentSchema>;

export type LegalHold = typeof legalHolds.$inferSelect;
export type InsertLegalHold = z.infer<typeof insertLegalHoldSchema>;

// ===== CONSTANTS =====

export const DATA_CATEGORIES = [
  "profile",
  "content",
  "messages",
  "transactions",
  "subscriptions",
  "purchases",
  "earnings",
  "activity_logs",
  "notifications",
  "settings",
] as const;

export const RETENTION_PERIODS = {
  ACTIVE_ACCOUNT: null, // Indefinite while active
  DELETED_ACCOUNT_GRACE: 30, // 30 days grace period
  FINANCIAL_RECORDS: 2555, // 7 years (tax compliance)
  FRAUD_DATA: 1825, // 5 years
  SERVER_LOGS: 90, // 90 days
  ANALYTICS: 365, // 1 year
  CHAT_MESSAGES: null, // User-controlled
  EXPORT_ARCHIVES: 7, // 7 days
} as const;

export const GDPR_LEGAL_BASES = [
  "consent",           // Art. 6(1)(a) - User consent
  "contract",          // Art. 6(1)(b) - Contract performance
  "legal_obligation",  // Art. 6(1)(c) - Legal obligation
  "vital_interests",   // Art. 6(1)(d) - Vital interests
  "public_task",       // Art. 6(1)(e) - Public task
  "legitimate_interest", // Art. 6(1)(f) - Legitimate interest
] as const;
