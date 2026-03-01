import { sql } from "drizzle-orm";
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
  bigserial,
  bigint,
  inet,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Unified account system - one account across all FANZ empire brands
export const accountStatusEnum = pgEnum("account_status", [
  "active",
  "disabled",
  "pending",
  "suspended",
]);

export const accounts = pgTable(
  "accounts",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    email: varchar("email").unique().notNull(), // using citext equivalent
    phone: varchar("phone"),
    passwordHash: varchar("password_hash"), // null for social-only accounts
    status: accountStatusEnum("status").default("active").notNull(),
    emailVerified: boolean("email_verified").default(false),
    phoneVerified: boolean("phone_verified").default(false),
    lastLoginAt: timestamp("last_login_at"),
    metadata: jsonb("metadata").default({}), // additional account data
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_accounts_email").on(table.email),
    index("idx_accounts_status").on(table.status),
  ],
);

// Unified profile system - creator/fan profiles are global with per-tenant presence
export const profileTypeEnum = pgEnum("profile_type", [
  "creator",
  "fan",
  "staff",
  "admin",
]);

// KYC and compliance enums for profiles
export const profileKycStatusEnum = pgEnum("profile_kyc_status", [
  "pending",
  "verified",
  "rejected",
  "expired",
]);
export const sanctionsStatusEnum = pgEnum("sanctions_status", [
  "clear",
  "pending",
  "blocked",
  "reviewing",
]);

export const creatorSignup = pgTable(
  "creator_signup",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    accountId: varchar("account_id")
          .notNull()
          .references(() => accounts.id, { onDelete: "cascade" }),

    handle: varchar("handle").unique().notNull(), // global handle across all tenants
    displayName: varchar("display_name").unique().notNull(), // this is the username
    bio: text("bio"),

    legal_first_name: varchar("legal_first_name").notNull(),
    legal_last_name: varchar("legal_last_name").notNull(),
    dob: date("dob").notNull(),
    country: varchar("country").notNull(),
    state: varchar("state"),
    id_type: varchar("id_type").notNull(),
    id_number: varchar("id_number").notNull(),
    expiry_date: date("expiry_date").notNull(),
    id_front_url: varchar("id_front_url").notNull(),
    id_back_url: varchar("id_back_url"),
    selfie_with_id_url: varchar("selfie_with_id_url").notNull(),

    styleAttitude: jsonb("style_attitude").$type<string[]>().default([]),
    type: profileTypeEnum("type").default("fan").notNull(),
    avatarUrl: varchar("avatar_url"),
    bannerUrl: varchar("banner_url"),
    website: varchar("website"),
    socialLinks: jsonb("social_links").default({}), // twitter, instagram, etc.
    flags: jsonb("flags").default({}), // profile flags and settings
    preferences: jsonb("preferences").default({}), // user preferences
    stats: jsonb("stats").default({}), // follower counts, engagement, etc.
    verificationLevel: integer("verification_level").default(0), // 0=unverified, 1=verified, 2=official

    // Compliance fields for quick auth middleware checks
    kycStatus: profileKycStatusEnum("kyc_status").default("pending"),
    ageVerified: boolean("age_verified").default(false),
    is2257Compliant: boolean("is_2257_compliant").default(false),
    lastSanctionsScreening: timestamp("last_sanctions_screening"),
    sanctionsStatus: sanctionsStatusEnum("sanctions_status").default("clear"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_profiles_handle").on(table.handle),
    index("idx_profiles_account").on(table.accountId),
    index("idx_profiles_type").on(table.type),
    index("idx_profiles_kyc_status").on(table.kycStatus),
    index("idx_profiles_sanctions_status").on(table.sanctionsStatus),
  ],
);

export const insertCreatorSignupSchema = createInsertSchema(creatorSignup);
export type CreatorSignup = typeof creatorSignup.$inferSelect;
export type InsertCreatorSignup = typeof creatorSignup.$inferInsert;