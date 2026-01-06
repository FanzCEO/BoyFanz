import { sql } from "drizzle-orm";
import { index, unique, jsonb, pgTable, timestamp, varchar, text, integer, boolean, pgEnum, real } from "drizzle-orm/pg-core";
import { users } from "./schema";

export const streamQualityEnum = pgEnum("stream_quality", ["360p", "480p", "720p", "1080p", "1440p", "4k"]);
export const streamSourceEnum = pgEnum("stream_source", ["browser", "phone", "obs", "hardware", "multi_cam"]);
export const streamModeEnum = pgEnum("stream_mode", ["standard", "low_latency", "ultra_low", "interactive"]);
export const guestStatusEnum = pgEnum("guest_status", ["pending", "approved", "live", "declined", "kicked"]);
export const challengeStatusEnum = pgEnum("challenge_status", ["pending", "funded", "in_progress", "completed", "failed", "refunded"]);
export const giftTypeEnum = pgEnum("gift_type", ["basic", "animated", "3d_physics", "exclusive", "custom"]);
export const overlayTypeEnum = pgEnum("overlay_type", ["tip_goal", "tip_menu", "poll", "countdown", "spin_wheel", "leaderboard", "custom_text", "media_share", "tip_jar"]);
export const clipStatusEnum = pgEnum("clip_status", ["processing", "ready", "featured", "removed"]);

export const streamSessions = pgTable("stream_sessions", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  streamId: varchar("stream_id").notNull(),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  source: streamSourceEnum("source").default("browser").notNull(),
  mode: streamModeEnum("mode").default("standard").notNull(),
  quality: streamQualityEnum("quality").default("1080p").notNull(),
  rtmpUrl: varchar("rtmp_url"),
  rtmpKey: varchar("rtmp_key"),
  whipEndpoint: varchar("whip_endpoint"),
  whepEndpoint: varchar("whep_endpoint"),
  hlsUrl: varchar("hls_url"),
  dashUrl: varchar("dash_url"),
  webrtcUrl: varchar("webrtc_url"),
  lowLatencyUrl: varchar("low_latency_url"),
  bitrateSettings: jsonb("bitrate_settings").default({}),
  adaptiveBitrate: boolean("adaptive_bitrate").default(true),
  isRecording: boolean("is_recording").default(false),
  recordingId: varchar("recording_id"),
  vodUrl: varchar("vod_url"),
  currentViewers: integer("current_viewers").default(0),
  peakViewers: integer("peak_viewers").default(0),
  totalViews: integer("total_views").default(0),
  chatMessages: integer("chat_messages").default(0),
  totalTipsCents: integer("total_tips_cents").default(0),
  latencyMs: integer("latency_ms").default(0),
  bitrateKbps: integer("bitrate_kbps").default(0),
  frameRate: real("frame_rate").default(30),
  droppedFrames: integer("dropped_frames").default(0),
  healthScore: integer("health_score").default(100),
  chatEnabled: boolean("chat_enabled").default(true),
  tipsEnabled: boolean("tips_enabled").default(true),
  giftsEnabled: boolean("gifts_enabled").default(true),
  pollsEnabled: boolean("polls_enabled").default(true),
  guestsEnabled: boolean("guests_enabled").default(false),
  lovenseEnabled: boolean("lovense_enabled").default(false),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [index("idx_stream_sessions_creator").on(table.creatorId), index("idx_stream_sessions_stream").on(table.streamId)]);

export const streamChat = pgTable("stream_chat", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  streamId: varchar("stream_id").notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  type: varchar("type").default("message").notNull(),
  emotes: jsonb("emotes").default([]),
  mentions: jsonb("mentions").default([]),
  mediaUrl: varchar("media_url"),
  isHidden: boolean("is_hidden").default(false),
  isHighlighted: boolean("is_highlighted").default(false),
  isPinned: boolean("is_pinned").default(false),
  moderatedBy: varchar("moderated_by").references(() => users.id),
  moderationReason: varchar("moderation_reason"),
  aiScore: real("ai_score"),
  aiFlags: jsonb("ai_flags").default([]),
  tipAmountCents: integer("tip_amount_cents"),
  tipMessage: text("tip_message"),
  createdAt: timestamp("created_at").defaultNow(),
  streamTimestamp: integer("stream_timestamp"),
}, (table) => [index("idx_stream_chat_stream").on(table.streamId), index("idx_stream_chat_user").on(table.userId)]);

export const virtualGifts = pgTable("virtual_gifts", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  name: varchar("name").notNull(),
  description: text("description"),
  type: giftTypeEnum("type").default("basic").notNull(),
  priceCents: integer("price_cents").notNull(),
  iconUrl: varchar("icon_url").notNull(),
  animationUrl: varchar("animation_url"),
  model3dUrl: varchar("model_3d_url"),
  soundUrl: varchar("sound_url"),
  physicsConfig: jsonb("physics_config").default({}),
  displayDuration: integer("display_duration").default(5000),
  screenEffect: varchar("screen_effect"),
  isActive: boolean("is_active").default(true),
  isExclusive: boolean("is_exclusive").default(false),
  exclusiveToCreator: varchar("exclusive_to_creator").references(() => users.id),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [index("idx_virtual_gifts_type").on(table.type)]);

export const giftTransactions = pgTable("gift_transactions", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  streamId: varchar("stream_id").notNull(),
  giftId: varchar("gift_id").notNull().references(() => virtualGifts.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  quantity: integer("quantity").default(1),
  totalCents: integer("total_cents").notNull(),
  message: text("message"),
  isAnonymous: boolean("is_anonymous").default(false),
  lovenseTriggered: boolean("lovense_triggered").default(false),
  lovenseIntensity: integer("lovense_intensity"),
  lovenseDuration: integer("lovense_duration"),
  createdAt: timestamp("created_at").defaultNow(),
  streamTimestamp: integer("stream_timestamp"),
}, (table) => [index("idx_gift_transactions_stream").on(table.streamId)]);

export const streamOverlays = pgTable("stream_overlays", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  streamId: varchar("stream_id").notNull(),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  type: overlayTypeEnum("type").notNull(),
  name: varchar("name").notNull(),
  position: jsonb("position").default({}),
  isVisible: boolean("is_visible").default(true),
  zIndex: integer("z_index").default(1),
  config: jsonb("config").default({}),
  goalAmountCents: integer("goal_amount_cents"),
  currentAmountCents: integer("current_amount_cents").default(0),
  goalTitle: varchar("goal_title"),
  pollOptions: jsonb("poll_options").default([]),
  pollVotes: jsonb("poll_votes").default({}),
  pollEndsAt: timestamp("poll_ends_at"),
  wheelSegments: jsonb("wheel_segments").default([]),
  spinCostCents: integer("spin_cost_cents"),
  countdownEndsAt: timestamp("countdown_ends_at"),
  countdownTitle: varchar("countdown_title"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [index("idx_stream_overlays_stream").on(table.streamId)]);

export const streamChallenges = pgTable("stream_challenges", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  streamId: varchar("stream_id"),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  goalCents: integer("goal_cents").notNull(),
  fundedCents: integer("funded_cents").default(0),
  status: challengeStatusEnum("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at"),
  completedAt: timestamp("completed_at"),
  proofUrl: varchar("proof_url"),
  contributorCount: integer("contributor_count").default(0),
  refundIfFailed: boolean("refund_if_failed").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [index("idx_stream_challenges_creator").on(table.creatorId)]);

export const challengeContributions = pgTable("challenge_contributions", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  challengeId: varchar("challenge_id").notNull().references(() => streamChallenges.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  amountCents: integer("amount_cents").notNull(),
  message: text("message"),
  isAnonymous: boolean("is_anonymous").default(false),
  refunded: boolean("refunded").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [index("idx_challenge_contributions_challenge").on(table.challengeId)]);

export const streamGuests = pgTable("stream_guests", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  streamId: varchar("stream_id").notNull(),
  hostId: varchar("host_id").notNull().references(() => users.id),
  guestId: varchar("guest_id").notNull().references(() => users.id),
  status: guestStatusEnum("status").default("pending").notNull(),
  requestMessage: text("request_message"),
  requestedAt: timestamp("requested_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  joinedAt: timestamp("joined_at"),
  leftAt: timestamp("left_at"),
  canVideo: boolean("can_video").default(true),
  canAudio: boolean("can_audio").default(true),
  canScreenShare: boolean("can_screen_share").default(false),
  webrtcOffer: text("webrtc_offer"),
  webrtcAnswer: text("webrtc_answer"),
  iceCandidates: jsonb("ice_candidates").default([]),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [index("idx_stream_guests_stream").on(table.streamId)]);

export const streamCameras = pgTable("stream_cameras", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  streamId: varchar("stream_id").notNull(),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  deviceId: varchar("device_id"),
  isActive: boolean("is_active").default(false),
  isPrimary: boolean("is_primary").default(false),
  webrtcUrl: varchar("webrtc_url"),
  layoutPosition: jsonb("layout_position").default({}),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [index("idx_stream_cameras_stream").on(table.streamId)]);

export const privateShows = pgTable("private_shows", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  viewerId: varchar("viewer_id").notNull().references(() => users.id),
  pricePerMinuteCents: integer("price_per_minute_cents").notNull(),
  minimumMinutes: integer("minimum_minutes").default(5),
  status: varchar("status").default("requested").notNull(),
  requestedAt: timestamp("requested_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  totalMinutes: integer("total_minutes").default(0),
  totalCents: integer("total_cents").default(0),
  creatorStreamUrl: varchar("creator_stream_url"),
  viewerStreamUrl: varchar("viewer_stream_url"),
  viewerVideoEnabled: boolean("viewer_video_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [index("idx_private_shows_creator").on(table.creatorId)]);

export const streamParties = pgTable("stream_parties", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  hostId: varchar("host_id").notNull().references(() => users.id),
  streamId: varchar("stream_id").notNull(),
  name: varchar("name").notNull(),
  isPublic: boolean("is_public").default(false),
  maxParticipants: integer("max_participants").default(10),
  currentTimestamp: integer("current_timestamp").default(0),
  isPaused: boolean("is_paused").default(false),
  chatEnabled: boolean("chat_enabled").default(true),
  voiceChatEnabled: boolean("voice_chat_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  endedAt: timestamp("ended_at"),
}, (table) => [index("idx_stream_parties_host").on(table.hostId)]);

export const partyParticipants = pgTable("party_participants", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  partyId: varchar("party_id").notNull().references(() => streamParties.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
}, (table) => [index("idx_party_participants_party").on(table.partyId), unique("unique_party_participant").on(table.partyId, table.userId)]);

export const streamClips = pgTable("stream_clips", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  streamId: varchar("stream_id").notNull(),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  clipperId: varchar("clipper_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  startTimestamp: integer("start_timestamp").notNull(),
  endTimestamp: integer("end_timestamp").notNull(),
  duration: integer("duration").notNull(),
  status: clipStatusEnum("status").default("processing").notNull(),
  videoUrl: varchar("video_url"),
  thumbnailUrl: varchar("thumbnail_url"),
  isAiGenerated: boolean("is_ai_generated").default(false),
  aiHighlightScore: real("ai_highlight_score"),
  viewCount: integer("view_count").default(0),
  likeCount: integer("like_count").default(0),
  shareCount: integer("share_count").default(0),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [index("idx_stream_clips_stream").on(table.streamId)]);

export const vodReplays = pgTable("vod_replays", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  streamId: varchar("stream_id").notNull(),
  sessionId: varchar("session_id").notNull(),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  videoUrl: varchar("video_url").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  duration: integer("duration").notNull(),
  qualities: jsonb("qualities").default({}),
  chatReplayUrl: varchar("chat_replay_url"),
  chatMessageCount: integer("chat_message_count").default(0),
  viewCount: integer("view_count").default(0),
  isPublic: boolean("is_public").default(true),
  subscriberOnly: boolean("subscriber_only").default(false),
  priceCents: integer("price_cents").default(0),
  highlights: jsonb("highlights").default([]),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [index("idx_vod_replays_creator").on(table.creatorId)]);

export const scheduledStreams = pgTable("scheduled_streams", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  thumbnailUrl: varchar("thumbnail_url"),
  scheduledFor: timestamp("scheduled_for").notNull(),
  estimatedDuration: integer("estimated_duration"),
  notifySubscribers: boolean("notify_subscribers").default(true),
  reminderSent15Min: boolean("reminder_sent_15min").default(false),
  reminderSent5Min: boolean("reminder_sent_5min").default(false),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: varchar("recurring_pattern"),
  actualStreamId: varchar("actual_stream_id"),
  status: varchar("status").default("scheduled").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [index("idx_scheduled_streams_creator").on(table.creatorId)]);

export const streamRaids = pgTable("stream_raids", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  fromStreamId: varchar("from_stream_id").notNull(),
  fromCreatorId: varchar("from_creator_id").notNull().references(() => users.id),
  toStreamId: varchar("to_stream_id").notNull(),
  toCreatorId: varchar("to_creator_id").notNull().references(() => users.id),
  viewersRaided: integer("viewers_raided").notNull(),
  status: varchar("status").default("initiated").notNull(),
  acceptedAt: timestamp("accepted_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [index("idx_stream_raids_from").on(table.fromStreamId)]);

export const tipAnimations = pgTable("tip_animations", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  minTipCents: integer("min_tip_cents").notNull(),
  maxTipCents: integer("max_tip_cents"),
  animationUrl: varchar("animation_url").notNull(),
  soundUrl: varchar("sound_url"),
  duration: integer("duration").default(5000),
  position: varchar("position").default("center"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [index("idx_tip_animations_creator").on(table.creatorId)]);

export const streamMusicTracks = pgTable("stream_music_tracks", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  title: varchar("title").notNull(),
  artist: varchar("artist").notNull(),
  album: varchar("album"),
  audioUrl: varchar("audio_url").notNull(),
  duration: integer("duration").notNull(),
  genre: varchar("genre"),
  mood: varchar("mood"),
  bpm: integer("bpm"),
  licenseType: varchar("license_type").notNull(),
  licenseDetails: jsonb("license_details").default({}),
  playCount: integer("play_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [index("idx_stream_music_genre").on(table.genre)]);

export const streamStatistics = pgTable("stream_statistics", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  streamId: varchar("stream_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  viewerCount: integer("viewer_count").notNull(),
  uniqueViewers: integer("unique_viewers").notNull(),
  newViewers: integer("new_viewers").default(0),
  chatMessagesPerMinute: integer("chat_messages_per_minute").default(0),
  tipsPerMinute: integer("tips_per_minute").default(0),
  engagementScore: real("engagement_score").default(0),
  tipsCentsThisPeriod: integer("tips_cents_this_period").default(0),
  cumulativeTipsCents: integer("cumulative_tips_cents").default(0),
  avgBitrateKbps: integer("avg_bitrate_kbps"),
  avgLatencyMs: integer("avg_latency_ms"),
  bufferingPercentage: real("buffering_percentage"),
}, (table) => [index("idx_stream_statistics_stream").on(table.streamId)]);

export const aiModerationLog = pgTable("ai_moderation_log", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  streamId: varchar("stream_id").notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  contentType: varchar("content_type").notNull(),
  contentId: varchar("content_id"),
  content: text("content"),
  toxicityScore: real("toxicity_score"),
  spamScore: real("spam_score"),
  nsfwScore: real("nsfw_score"),
  flags: jsonb("flags").default([]),
  actionTaken: varchar("action_taken"),
  actionReason: text("action_reason"),
  manuallyReviewed: boolean("manually_reviewed").default(false),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewOutcome: varchar("review_outcome"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [index("idx_ai_moderation_stream").on(table.streamId)]);

export const goLiveNotifications = pgTable("go_live_notifications", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  streamId: varchar("stream_id").notNull(),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  sent: boolean("sent").default(false),
  sentAt: timestamp("sent_at"),
  pushSent: boolean("push_sent").default(false),
  emailSent: boolean("email_sent").default(false),
  smsSent: boolean("sms_sent").default(false),
  opened: boolean("opened").default(false),
  openedAt: timestamp("opened_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [index("idx_go_live_notifications_stream").on(table.streamId)]);

export type StreamSession = typeof streamSessions.\$inferSelect;
export type InsertStreamSession = typeof streamSessions.\$inferInsert;
export type StreamChatMessage = typeof streamChat.\$inferSelect;
export type VirtualGift = typeof virtualGifts.\$inferSelect;
export type GiftTransaction = typeof giftTransactions.\$inferSelect;
export type StreamOverlay = typeof streamOverlays.\$inferSelect;
export type StreamChallenge = typeof streamChallenges.\$inferSelect;
export type StreamGuest = typeof streamGuests.\$inferSelect;
export type StreamCamera = typeof streamCameras.\$inferSelect;
export type PrivateShow = typeof privateShows.\$inferSelect;
export type StreamParty = typeof streamParties.\$inferSelect;
export type StreamClip = typeof streamClips.\$inferSelect;
export type VodReplay = typeof vodReplays.\$inferSelect;
export type ScheduledStream = typeof scheduledStreams.\$inferSelect;
export type StreamRaid = typeof streamRaids.\$inferSelect;
export type TipAnimation = typeof tipAnimations.\$inferSelect;
export type StreamMusicTrack = typeof streamMusicTracks.\$inferSelect;
