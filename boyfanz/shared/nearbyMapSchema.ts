/**
 * Enhanced Near By Me / Cross-Platform Map Schema
 *
 * Features:
 * - Real geolocation storage with privacy controls
 * - Cross-platform creator visibility (all FANZ platforms)
 * - Meetup scheduling with reminders
 * - Push notification and SMS integration
 * - Membership tier access control (Bronze → Royal Creator)
 */

import {
  pgTable,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  decimal,
  jsonb,
  pgEnum,
  index,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

// ===== MEMBERSHIP TIERS =====
export const membershipTierEnum = pgEnum("membership_tier", [
  "free",
  "bronze",
  "silver",
  "gold",
  "platinum",
  "diamond",
  "vip",
  "royal_creator",
]);

// ===== FANZ ECOSYSTEM PLATFORMS =====
export const fanzPlatformEnum = pgEnum("fanz_platform", [
  "boyfanz",
  "girlfanz",
  "gayfanz",
  "transfanz",
  "milffanz",
  "cougarfanz",
  "bearfanz",
  "daddyfanz",
  "pupfanz",
  "taboofanz",
  "fanzuncut",
  "femmefanz",
  "brofanz",
  "southernfanz",
  "dlbroz",
  "guyz",
  "fanzunlimited",
]);

// ===== USER GEOLOCATION =====
export const userLocations = pgTable(
  "user_locations",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Real coordinates (encrypted at rest)
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),

    // Approximate location for privacy (shown to non-premium users)
    approxLatitude: decimal("approx_latitude", { precision: 10, scale: 6 }), // ~100m precision
    approxLongitude: decimal("approx_longitude", { precision: 11, scale: 6 }),

    // Location metadata
    city: varchar("city"),
    state: varchar("state"),
    country: varchar("country").default("US"),
    postalCode: varchar("postal_code"),
    timezone: varchar("timezone"),

    // Location accuracy and source
    accuracy: integer("accuracy"), // meters
    source: varchar("source").default("browser"), // browser, manual, ip_lookup

    // Privacy settings
    isLocationPublic: boolean("is_location_public").default(false),
    showExactLocation: boolean("show_exact_location").default(false), // Only for premium tiers
    locationRadius: integer("location_radius").default(5), // miles - fuzzy radius for privacy

    // Cross-platform visibility
    visibleOnPlatforms: text("visible_on_platforms").array().default([]), // Which platforms can see this user

    lastUpdated: timestamp("last_updated").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_user_locations_user").on(table.userId),
    index("idx_user_locations_coords").on(table.latitude, table.longitude),
    index("idx_user_locations_approx").on(table.approxLatitude, table.approxLongitude),
    index("idx_user_locations_city_state").on(table.city, table.state),
  ]
);

// ===== CROSS-PLATFORM VISIBILITY SETTINGS =====
export const crossPlatformVisibility = pgTable(
  "cross_platform_visibility",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Home platform where user is primarily registered
    homePlatform: fanzPlatformEnum("home_platform").notNull(),

    // Which platforms this user is visible on for "Near By Me"
    visiblePlatforms: text("visible_platforms").array().default([]),

    // Whether this user allows cross-platform messaging
    allowCrossPlatformMessaging: boolean("allow_cross_platform_messaging").default(true),

    // Whether to show on maps across platforms
    showOnCrossPlatformMaps: boolean("show_on_cross_platform_maps").default(true),

    // Membership tier determines visibility features
    membershipTier: membershipTierEnum("membership_tier").default("free"),
    membershipExpiresAt: timestamp("membership_expires_at"),

    // Premium features based on tier
    canViewExactLocations: boolean("can_view_exact_locations").default(false), // Gold+
    canInitiateMeetups: boolean("can_initiate_meetups").default(false), // Silver+
    canReceiveMeetupRequests: boolean("can_receive_meetup_requests").default(true),
    maxMeetupsPerMonth: integer("max_meetups_per_month").default(3), // Increases with tier

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    unique().on(table.userId),
    index("idx_cross_platform_user").on(table.userId),
    index("idx_cross_platform_home").on(table.homePlatform),
    index("idx_cross_platform_tier").on(table.membershipTier),
  ]
);

// ===== MEETUP SCHEDULING =====
export const meetupStatusEnum = pgEnum("meetup_status", [
  "pending",
  "accepted",
  "declined",
  "cancelled",
  "completed",
  "no_show",
]);

export const meetupTypeEnum = pgEnum("meetup_type", [
  "content_creation",
  "collaboration",
  "casual",
  "business",
  "fan_meet",
]);

export const creatorMeetups = pgTable(
  "creator_meetups",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),

    // Participants
    requesterId: uuid("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    requesteeId: uuid("requestee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Platform context
    requesterPlatform: fanzPlatformEnum("requester_platform").notNull(),
    requesteePlatform: fanzPlatformEnum("requestee_platform").notNull(),

    // Meetup details
    type: meetupTypeEnum("type").default("content_creation"),
    status: meetupStatusEnum("status").default("pending"),

    title: varchar("title").notNull(),
    description: text("description"),

    // Scheduling
    proposedDateTime: timestamp("proposed_date_time").notNull(),
    alternateDateTime1: timestamp("alternate_date_time_1"),
    alternateDateTime2: timestamp("alternate_date_time_2"),
    confirmedDateTime: timestamp("confirmed_date_time"),
    duration: integer("duration").default(60), // minutes

    // Location
    locationName: varchar("location_name"),
    locationAddress: text("location_address"),
    locationLatitude: decimal("location_latitude", { precision: 10, scale: 8 }),
    locationLongitude: decimal("location_longitude", { precision: 11, scale: 8 }),
    isVirtual: boolean("is_virtual").default(false),
    virtualMeetingUrl: text("virtual_meeting_url"),

    // Communication
    messageThreadId: uuid("message_thread_id"), // Link to messaging system

    // Reminders (notification preferences)
    remindersSent: jsonb("reminders_sent").default([]), // Array of sent reminder timestamps

    // Cancellation
    cancelledAt: timestamp("cancelled_at"),
    cancelledById: uuid("cancelled_by_id").references(() => users.id),
    cancellationReason: text("cancellation_reason"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_meetups_requester").on(table.requesterId),
    index("idx_meetups_requestee").on(table.requesteeId),
    index("idx_meetups_status").on(table.status),
    index("idx_meetups_date").on(table.proposedDateTime),
    index("idx_meetups_confirmed").on(table.confirmedDateTime),
  ]
);

// ===== MEETUP REMINDERS =====
export const reminderChannelEnum = pgEnum("reminder_channel", [
  "push",
  "email",
  "sms",
  "in_app",
]);

export const reminderStatusEnum = pgEnum("reminder_status", [
  "scheduled",
  "sent",
  "delivered",
  "failed",
  "cancelled",
]);

export const meetupReminders = pgTable(
  "meetup_reminders",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),

    meetupId: uuid("meetup_id")
      .notNull()
      .references(() => creatorMeetups.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Reminder timing
    scheduledFor: timestamp("scheduled_for").notNull(),
    minutesBefore: integer("minutes_before").notNull(), // 24hr, 1hr, 15min, etc.

    // Delivery
    channel: reminderChannelEnum("channel").notNull(),
    status: reminderStatusEnum("status").default("scheduled"),

    // SMS specific
    phoneNumber: varchar("phone_number"), // For SMS reminders

    // Tracking
    sentAt: timestamp("sent_at"),
    deliveredAt: timestamp("delivered_at"),
    failureReason: text("failure_reason"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_reminders_meetup").on(table.meetupId),
    index("idx_reminders_user").on(table.userId),
    index("idx_reminders_scheduled").on(table.scheduledFor),
    index("idx_reminders_status").on(table.status),
  ]
);

// ===== NOTIFICATION PREFERENCES FOR MAP FEATURES =====
export const mapNotificationPreferences = pgTable(
  "map_notification_preferences",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Push notifications
    pushEnabled: boolean("push_enabled").default(true),
    pushForMeetupRequests: boolean("push_for_meetup_requests").default(true),
    pushForMeetupUpdates: boolean("push_for_meetup_updates").default(true),
    pushForNearbyCreators: boolean("push_for_nearby_creators").default(false),

    // SMS notifications
    smsEnabled: boolean("sms_enabled").default(false),
    smsPhoneNumber: varchar("sms_phone_number"),
    smsPhoneVerified: boolean("sms_phone_verified").default(false),
    smsForMeetupReminders: boolean("sms_for_meetup_reminders").default(true),
    smsFor24HourReminder: boolean("sms_for_24_hour_reminder").default(true),
    smsFor1HourReminder: boolean("sms_for_1_hour_reminder").default(true),
    smsFor15MinReminder: boolean("sms_for_15_min_reminder").default(true),

    // Email notifications (backup)
    emailForMeetups: boolean("email_for_meetups").default(true),

    // Quiet hours
    quietHoursEnabled: boolean("quiet_hours_enabled").default(false),
    quietHoursStart: varchar("quiet_hours_start").default("22:00"),
    quietHoursEnd: varchar("quiet_hours_end").default("08:00"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    unique().on(table.userId),
    index("idx_map_notif_prefs_user").on(table.userId),
  ]
);

// ===== MEMBERSHIP TIER FEATURES =====
export const tierFeatures = pgTable(
  "tier_features",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),
    tier: membershipTierEnum("tier").notNull().unique(),

    // Map visibility features
    canViewNearbyMap: boolean("can_view_nearby_map").default(true),
    canViewCrossPlatform: boolean("can_view_cross_platform").default(false), // Bronze+
    canViewExactLocations: boolean("can_view_exact_locations").default(false), // Gold+
    maxViewRadius: integer("max_view_radius").default(25), // miles

    // Messaging features
    canMessageFromMap: boolean("can_message_from_map").default(false), // Bronze+
    canCrossPlatformMessage: boolean("can_cross_platform_message").default(false), // Silver+

    // Meetup features
    canScheduleMeetups: boolean("can_schedule_meetups").default(false), // Silver+
    maxMeetupsPerMonth: integer("max_meetups_per_month").default(0),
    canReceiveMeetupRequests: boolean("can_receive_meetup_requests").default(true),

    // Notification features
    hasPushNotifications: boolean("has_push_notifications").default(true),
    hasSMSReminders: boolean("has_sms_reminders").default(false), // Gold+
    hasEmailReminders: boolean("has_email_reminders").default(true),

    // Tier Requirements (based on membership level from FANZ tokens & referrals)
    minFanzTokens: integer("min_fanz_tokens").default(0), // Minimum FANZ tokens required
    minReferrals: integer("min_referrals").default(0), // Minimum successful referrals
    minSubscriberCount: integer("min_subscriber_count").default(0), // For creator tiers
    requiresVerification: boolean("requires_verification").default(false), // ID/age verified
    requiresCreatorStatus: boolean("requires_creator_status").default(false), // Must be a creator

    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_tier_features_tier").on(table.tier),
  ]
);

// ===== SCHEMAS FOR VALIDATION =====

export const insertUserLocationSchema = createInsertSchema(userLocations, {
  latitude: z.string().regex(/^-?([1-8]?[0-9]\.{1}\d{1,8}|90\.{1}0{1,8})$/),
  longitude: z.string().regex(/^-?((1[0-7][0-9]|[1-9]?[0-9])\.{1}\d{1,8}|180\.{1}0{1,8})$/),
}).omit({ id: true, createdAt: true, lastUpdated: true });

export const insertCrossPlatformVisibilitySchema = createInsertSchema(crossPlatformVisibility).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCreatorMeetupSchema = createInsertSchema(creatorMeetups, {
  title: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertMeetupReminderSchema = createInsertSchema(meetupReminders).omit({
  id: true,
  createdAt: true,
});

export const insertMapNotificationPrefsSchema = createInsertSchema(mapNotificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ===== TYPE EXPORTS =====

export type UserLocation = typeof userLocations.$inferSelect;
export type InsertUserLocation = z.infer<typeof insertUserLocationSchema>;

export type CrossPlatformVisibility = typeof crossPlatformVisibility.$inferSelect;
export type InsertCrossPlatformVisibility = z.infer<typeof insertCrossPlatformVisibilitySchema>;

export type CreatorMeetup = typeof creatorMeetups.$inferSelect;
export type InsertCreatorMeetup = z.infer<typeof insertCreatorMeetupSchema>;

export type MeetupReminder = typeof meetupReminders.$inferSelect;
export type InsertMeetupReminder = z.infer<typeof insertMeetupReminderSchema>;

export type MapNotificationPreferences = typeof mapNotificationPreferences.$inferSelect;
export type InsertMapNotificationPreferences = z.infer<typeof insertMapNotificationPrefsSchema>;

export type TierFeatures = typeof tierFeatures.$inferSelect;

// ===== DEFAULT TIER FEATURES SEED DATA =====
// Tiers are earned based on FANZ tokens and referrals, NOT paid subscriptions
export const defaultTierFeatures = [
  {
    tier: "free" as const,
    canViewNearbyMap: true,
    canViewCrossPlatform: false,
    canViewExactLocations: false,
    maxViewRadius: 10,
    canMessageFromMap: false,
    canCrossPlatformMessage: false,
    canScheduleMeetups: false,
    maxMeetupsPerMonth: 0,
    canReceiveMeetupRequests: false,
    hasPushNotifications: false,
    hasSMSReminders: false,
    hasEmailReminders: true,
    minFanzTokens: 0,
    minReferrals: 0,
    minSubscriberCount: 0,
    requiresVerification: false,
    requiresCreatorStatus: false,
    description: "Basic map view - single platform only",
  },
  {
    tier: "bronze" as const,
    canViewNearbyMap: true,
    canViewCrossPlatform: true,
    canViewExactLocations: false,
    maxViewRadius: 25,
    canMessageFromMap: true,
    canCrossPlatformMessage: false,
    canScheduleMeetups: false,
    maxMeetupsPerMonth: 0,
    canReceiveMeetupRequests: true,
    hasPushNotifications: true,
    hasSMSReminders: false,
    hasEmailReminders: true,
    minFanzTokens: 100,
    minReferrals: 0,
    minSubscriberCount: 0,
    requiresVerification: true,
    requiresCreatorStatus: false,
    description: "Cross-platform map visibility + messaging from map. Requires 100 FANZ tokens & verification.",
  },
  {
    tier: "silver" as const,
    canViewNearbyMap: true,
    canViewCrossPlatform: true,
    canViewExactLocations: false,
    maxViewRadius: 50,
    canMessageFromMap: true,
    canCrossPlatformMessage: true,
    canScheduleMeetups: true,
    maxMeetupsPerMonth: 3,
    canReceiveMeetupRequests: true,
    hasPushNotifications: true,
    hasSMSReminders: false,
    hasEmailReminders: true,
    minFanzTokens: 500,
    minReferrals: 2,
    minSubscriberCount: 0,
    requiresVerification: true,
    requiresCreatorStatus: false,
    description: "Cross-platform messaging + meetup scheduling. Requires 500 FANZ tokens & 2 referrals.",
  },
  {
    tier: "gold" as const,
    canViewNearbyMap: true,
    canViewCrossPlatform: true,
    canViewExactLocations: true,
    maxViewRadius: 100,
    canMessageFromMap: true,
    canCrossPlatformMessage: true,
    canScheduleMeetups: true,
    maxMeetupsPerMonth: 10,
    canReceiveMeetupRequests: true,
    hasPushNotifications: true,
    hasSMSReminders: true,
    hasEmailReminders: true,
    minFanzTokens: 1000,
    minReferrals: 5,
    minSubscriberCount: 10,
    requiresVerification: true,
    requiresCreatorStatus: true,
    description: "Exact locations + SMS reminders. Requires 1000 FANZ tokens, 5 referrals & creator status.",
  },
  {
    tier: "platinum" as const,
    canViewNearbyMap: true,
    canViewCrossPlatform: true,
    canViewExactLocations: true,
    maxViewRadius: 200,
    canMessageFromMap: true,
    canCrossPlatformMessage: true,
    canScheduleMeetups: true,
    maxMeetupsPerMonth: 25,
    canReceiveMeetupRequests: true,
    hasPushNotifications: true,
    hasSMSReminders: true,
    hasEmailReminders: true,
    minFanzTokens: 2500,
    minReferrals: 10,
    minSubscriberCount: 50,
    requiresVerification: true,
    requiresCreatorStatus: true,
    description: "Extended range + more meetups. Requires 2500 FANZ tokens, 10 referrals & 50 subscribers.",
  },
  {
    tier: "diamond" as const,
    canViewNearbyMap: true,
    canViewCrossPlatform: true,
    canViewExactLocations: true,
    maxViewRadius: 500,
    canMessageFromMap: true,
    canCrossPlatformMessage: true,
    canScheduleMeetups: true,
    maxMeetupsPerMonth: 50,
    canReceiveMeetupRequests: true,
    hasPushNotifications: true,
    hasSMSReminders: true,
    hasEmailReminders: true,
    minFanzTokens: 5000,
    minReferrals: 25,
    minSubscriberCount: 100,
    requiresVerification: true,
    requiresCreatorStatus: true,
    description: "Premium tier with nationwide reach. Requires 5000 FANZ tokens, 25 referrals & 100 subscribers.",
  },
  {
    tier: "vip" as const,
    canViewNearbyMap: true,
    canViewCrossPlatform: true,
    canViewExactLocations: true,
    maxViewRadius: 1000,
    canMessageFromMap: true,
    canCrossPlatformMessage: true,
    canScheduleMeetups: true,
    maxMeetupsPerMonth: 100,
    canReceiveMeetupRequests: true,
    hasPushNotifications: true,
    hasSMSReminders: true,
    hasEmailReminders: true,
    minFanzTokens: 10000,
    minReferrals: 50,
    minSubscriberCount: 500,
    requiresVerification: true,
    requiresCreatorStatus: true,
    description: "VIP access with priority features. Requires 10000 FANZ tokens, 50 referrals & 500 subscribers.",
  },
  {
    tier: "royal_creator" as const,
    canViewNearbyMap: true,
    canViewCrossPlatform: true,
    canViewExactLocations: true,
    maxViewRadius: 5000, // Effectively worldwide
    canMessageFromMap: true,
    canCrossPlatformMessage: true,
    canScheduleMeetups: true,
    maxMeetupsPerMonth: -1, // Unlimited
    canReceiveMeetupRequests: true,
    hasPushNotifications: true,
    hasSMSReminders: true,
    hasEmailReminders: true,
    minFanzTokens: 25000,
    minReferrals: 100,
    minSubscriberCount: 1000,
    requiresVerification: true,
    requiresCreatorStatus: true,
    description: "Ultimate tier - verified top creators only. Requires 25000 FANZ tokens, 100 referrals & 1000 subscribers.",
  },
];
