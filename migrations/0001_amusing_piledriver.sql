CREATE TYPE "public"."admin_action_type" AS ENUM('user_suspend', 'user_unsuspend', 'user_delete', 'user_role_change', 'content_remove', 'content_approve', 'content_feature', 'payout_approve', 'payout_reject', 'refund_issue', 'verification_approve', 'verification_reject', 'setting_change', 'feature_toggle', 'mass_action', 'impersonation_start', 'impersonation_end', 'announcement_publish', 'complaint_resolve');--> statement-breakpoint
CREATE TYPE "public"."ai_hub_service_status" AS ENUM('available', 'degraded', 'maintenance', 'offline');--> statement-breakpoint
CREATE TYPE "public"."auxiliary_platform" AS ENUM('twitter', 'instagram', 'tiktok', 'youtube', 'discord', 'telegram', 'reddit', 'snapchat', 'twitch', 'pornhub', 'xvideos', 'manyvids', 'chaturbate', 'stripchat', 'fansly', 'onlyfans', 'linktree', 'allmylinks', 'beacons');--> statement-breakpoint
CREATE TYPE "public"."compliance_report_type" AS ENUM('2257_records', 'gdpr_data_export', 'gdpr_deletion', 'tax_1099', 'tax_summary', 'content_audit', 'user_activity', 'financial_summary');--> statement-breakpoint
CREATE TYPE "public"."content_import_status" AS ENUM('pending', 'downloading', 'processing', 'importing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."coupon_status" AS ENUM('active', 'paused', 'expired', 'depleted');--> statement-breakpoint
CREATE TYPE "public"."cross_post_status" AS ENUM('pending', 'scheduled', 'posting', 'posted', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."email_status" AS ENUM('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."email_template_type" AS ENUM('welcome', 'tier_upgrade', 'tier_downgrade', 'thank_you', 'achievement_earned', 'milestone_reached', 'custom', 'newsletter', 'promotional', 'system_alert');--> statement-breakpoint
CREATE TYPE "public"."experiment_status" AS ENUM('draft', 'running', 'paused', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."fraud_signal_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."fraud_signal_type" AS ENUM('suspicious_signup', 'payment_fraud', 'fake_engagement', 'account_takeover', 'chargeback_pattern', 'bot_activity', 'identity_mismatch', 'velocity_abuse', 'referral_fraud', 'multi_accounting', 'content_theft', 'suspicious_payout');--> statement-breakpoint
CREATE TYPE "public"."fuck_buddy_relationship" AS ENUM('fuckbuddy', 'fwb', 'crush', 'lover', 'playmate', 'admirer');--> statement-breakpoint
CREATE TYPE "public"."fuck_buddy_request_status" AS ENUM('pending', 'accepted', 'declined', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."hub_vault_sync_status" AS ENUM('pending', 'synced', 'failed', 'conflict');--> statement-breakpoint
CREATE TYPE "public"."leaderboard_category" AS ENUM('earnings', 'subscribers', 'content_views', 'engagement', 'tips', 'new_subscribers', 'growth_rate');--> statement-breakpoint
CREATE TYPE "public"."media_hub_processing_status" AS ENUM('queued', 'processing', 'completed', 'failed', 'retrying');--> statement-breakpoint
CREATE TYPE "public"."platform_connection_status" AS ENUM('pending', 'connected', 'expired', 'revoked', 'error');--> statement-breakpoint
CREATE TYPE "public"."promotion_status" AS ENUM('draft', 'scheduled', 'active', 'paused', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."promotion_type" AS ENUM('percentage', 'fixed_amount', 'trial_days', 'bundle_discount');--> statement-breakpoint
CREATE TYPE "public"."reconciliation_status" AS ENUM('pending', 'matched', 'discrepancy', 'resolved', 'manual_review');--> statement-breakpoint
CREATE TYPE "public"."starz_tier" AS ENUM('none', 'bronze_star', 'silver_star', 'gold_star', 'platinum_star', 'diamond_star');--> statement-breakpoint
CREATE TYPE "public"."fanz_platform" AS ENUM('boyfanz', 'girlfanz', 'gayfanz', 'transfanz', 'milffanz', 'cougarfanz', 'bearfanz', 'daddyfanz', 'pupfanz', 'taboofanz', 'fanzuncut', 'femmefanz', 'brofanz', 'southernfanz', 'dlbroz', 'guyz', 'fanzunlimited');--> statement-breakpoint
CREATE TYPE "public"."meetup_status" AS ENUM('pending', 'accepted', 'declined', 'cancelled', 'completed', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."meetup_type" AS ENUM('content_creation', 'collaboration', 'casual', 'business', 'fan_meet');--> statement-breakpoint
CREATE TYPE "public"."membership_tier" AS ENUM('free', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'vip', 'royal_creator');--> statement-breakpoint
CREATE TYPE "public"."reminder_channel" AS ENUM('push', 'email', 'sms', 'in_app');--> statement-breakpoint
CREATE TYPE "public"."reminder_status" AS ENUM('scheduled', 'sent', 'delivered', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "admin_audit_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"admin_id" varchar NOT NULL,
	"action_type" "admin_action_type" NOT NULL,
	"target_table" varchar NOT NULL,
	"target_id" varchar NOT NULL,
	"previous_state" jsonb DEFAULT '{}'::jsonb,
	"new_state" jsonb DEFAULT '{}'::jsonb,
	"reason" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"ip_address" "inet",
	"user_agent" text,
	"can_undo" boolean DEFAULT true,
	"undone_at" timestamp,
	"undone_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_hub_quotas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"membership_id" varchar NOT NULL,
	"service_id" varchar NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"quota_limit" integer NOT NULL,
	"quota_used" integer DEFAULT 0,
	"quota_remaining" integer NOT NULL,
	"overage_allowed" boolean DEFAULT false,
	"overage_used" integer DEFAULT 0,
	"overage_cost_cents" integer DEFAULT 0,
	"last_reset_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ai_hub_quotas_membership_id_service_id_period_start_unique" UNIQUE("membership_id","service_id","period_start")
);
--> statement-breakpoint
CREATE TABLE "ai_hub_services" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"ai_hub_endpoint" varchar NOT NULL,
	"http_method" varchar DEFAULT 'POST',
	"ai_model" varchar,
	"model_version" varchar,
	"status" "ai_hub_service_status" DEFAULT 'available' NOT NULL,
	"status_message" text,
	"last_health_check" timestamp,
	"minimum_tier" "starz_tier" DEFAULT 'bronze_star',
	"usage_limits" jsonb DEFAULT '{}'::jsonb,
	"rate_limit" integer DEFAULT 100,
	"price_per_request" numeric(10, 6),
	"included_requests" integer DEFAULT 0,
	"input_schema" jsonb DEFAULT '{}'::jsonb,
	"output_schema" jsonb DEFAULT '{}'::jsonb,
	"default_params" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"is_beta" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ai_hub_services_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ai_hub_usage" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"profile_id" varchar NOT NULL,
	"service_id" varchar NOT NULL,
	"membership_id" varchar,
	"request_id" varchar NOT NULL,
	"input_tokens" integer,
	"output_tokens" integer,
	"processing_time_ms" integer,
	"success" boolean DEFAULT true,
	"error_code" varchar,
	"error_message" text,
	"cost_cents" integer DEFAULT 0,
	"was_billable" boolean DEFAULT false,
	"client_platform" varchar DEFAULT 'boyfanz',
	"ip_address" "inet",
	"user_agent" text,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "ai_hub_usage_request_id_unique" UNIQUE("request_id")
);
--> statement-breakpoint
CREATE TABLE "auxiliary_platform_capabilities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" "auxiliary_platform" NOT NULL,
	"display_name" varchar NOT NULL,
	"description" text,
	"icon_url" varchar,
	"color" varchar,
	"oauth_enabled" boolean DEFAULT false,
	"oauth_scopes" text[] DEFAULT '{}',
	"supports_auto_post" boolean DEFAULT false,
	"supports_analytics" boolean DEFAULT false,
	"supports_content_import" boolean DEFAULT false,
	"supports_scheduling" boolean DEFAULT false,
	"supports_direct_messages" boolean DEFAULT false,
	"supports_images" boolean DEFAULT true,
	"supports_videos" boolean DEFAULT true,
	"supports_text" boolean DEFAULT true,
	"supports_links" boolean DEFAULT true,
	"max_media_per_post" integer DEFAULT 4,
	"max_caption_length" integer DEFAULT 2200,
	"max_hashtags" integer DEFAULT 30,
	"max_video_length" integer,
	"minimum_tier" "starz_tier" DEFAULT 'bronze_star',
	"is_active" boolean DEFAULT true,
	"is_coming_soon" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "auxiliary_platform_capabilities_platform_unique" UNIQUE("platform")
);
--> statement-breakpoint
CREATE TABLE "compliance_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_type" "compliance_report_type" NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"period_start" timestamp,
	"period_end" timestamp,
	"status" varchar DEFAULT 'generating',
	"file_url" varchar,
	"file_size" integer,
	"record_count" integer,
	"generated_by" varchar NOT NULL,
	"scheduled_expiry_at" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "coupon_redemptions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"coupon_id" bigint NOT NULL,
	"user_id" varchar NOT NULL,
	"subscription_id" varchar,
	"discount_amount_cents" integer NOT NULL,
	"original_price_cents" integer NOT NULL,
	"final_price_cents" integer NOT NULL,
	"redeemed_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"ip_address" varchar,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "creator_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" varchar NOT NULL,
	"period_type" varchar NOT NULL,
	"period_start" timestamp NOT NULL,
	"total_earnings_cents" integer DEFAULT 0,
	"subscription_earnings_cents" integer DEFAULT 0,
	"tip_earnings_cents" integer DEFAULT 0,
	"ppv_earnings_cents" integer DEFAULT 0,
	"referral_earnings_cents" integer DEFAULT 0,
	"total_subscribers" integer DEFAULT 0,
	"new_subscribers" integer DEFAULT 0,
	"cancelled_subscribers" integer DEFAULT 0,
	"reactivated_subscribers" integer DEFAULT 0,
	"posts_count" integer DEFAULT 0,
	"messages_count" integer DEFAULT 0,
	"stream_minutes" integer DEFAULT 0,
	"total_views" integer DEFAULT 0,
	"total_likes" integer DEFAULT 0,
	"total_comments" integer DEFAULT 0,
	"total_shares" integer DEFAULT 0,
	"avg_engagement_rate" numeric(5, 2) DEFAULT '0',
	"top_content" jsonb DEFAULT '[]'::jsonb,
	"best_posting_times" jsonb DEFAULT '[]'::jsonb,
	"audience_demographics" jsonb DEFAULT '{}'::jsonb,
	"top_countries" jsonb DEFAULT '[]'::jsonb,
	"device_breakdown" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "creator_analytics_creator_id_period_type_period_start_unique" UNIQUE("creator_id","period_type","period_start")
);
--> statement-breakpoint
CREATE TABLE "creator_coupons" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"creator_id" varchar NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"type" "promotion_type" NOT NULL,
	"value" integer NOT NULL,
	"trial_days" integer,
	"bundle_months" integer,
	"min_purchase_months" integer DEFAULT 1,
	"max_redemptions" integer,
	"max_redemptions_per_user" integer DEFAULT 1,
	"redemption_count" integer DEFAULT 0,
	"starts_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"status" "coupon_status" DEFAULT 'active' NOT NULL,
	"new_subscribers_only" boolean DEFAULT false,
	"requires_influencer_code" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "creator_health_scores" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" varchar NOT NULL,
	"overall_score" integer DEFAULT 0 NOT NULL,
	"content_quality_score" integer DEFAULT 0,
	"engagement_score" integer DEFAULT 0,
	"compliance_score" integer DEFAULT 0,
	"growth_score" integer DEFAULT 0,
	"retention_score" integer DEFAULT 0,
	"revenue_score" integer DEFAULT 0,
	"risk_factors" jsonb DEFAULT '[]'::jsonb,
	"recommendations" jsonb DEFAULT '[]'::jsonb,
	"trend_direction" varchar DEFAULT 'stable',
	"trend_percentage" numeric(5, 2) DEFAULT '0',
	"last_analyzed_at" timestamp DEFAULT now(),
	"ai_model_version" varchar DEFAULT 'v1',
	"raw_metrics" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "creator_leaderboards" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" varchar NOT NULL,
	"category" "leaderboard_category" NOT NULL,
	"period" "leaderboard_period" NOT NULL,
	"period_start" timestamp NOT NULL,
	"rank" integer NOT NULL,
	"previous_rank" integer,
	"rank_change" integer DEFAULT 0,
	"score" numeric(20, 4) NOT NULL,
	"display_value" varchar,
	"percentile" numeric(5, 2),
	"is_eligible" boolean DEFAULT true,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "creator_promotions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"creator_id" varchar NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"type" "promotion_type" NOT NULL,
	"value" integer NOT NULL,
	"trial_days" integer,
	"bundle_months" integer,
	"min_purchase_months" integer DEFAULT 1,
	"max_redemptions" integer,
	"redemption_count" integer DEFAULT 0,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp,
	"status" "promotion_status" DEFAULT 'draft' NOT NULL,
	"is_public" boolean DEFAULT true,
	"new_subscribers_only" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discount_analytics" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"creator_id" varchar NOT NULL,
	"date" varchar NOT NULL,
	"total_promotions_active" integer DEFAULT 0,
	"total_coupons_active" integer DEFAULT 0,
	"promotion_redemptions" integer DEFAULT 0,
	"coupon_redemptions" integer DEFAULT 0,
	"revenue_from_discounted_subs" integer DEFAULT 0,
	"revenue_lost_to_discounts" integer DEFAULT 0,
	"new_subs_from_promos" integer DEFAULT 0,
	"retention_rate" numeric(5, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experiment_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"experiment_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"variant" varchar NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"exposed_at" timestamp,
	"converted_at" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	CONSTRAINT "experiment_assignments_experiment_id_user_id_unique" UNIQUE("experiment_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "experiments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"hypothesis" text,
	"status" "experiment_status" DEFAULT 'draft' NOT NULL,
	"feature_flag" varchar NOT NULL,
	"variants" jsonb DEFAULT '[]'::jsonb,
	"targeting_rules" jsonb DEFAULT '{}'::jsonb,
	"traffic_percentage" integer DEFAULT 100,
	"primary_metric" varchar NOT NULL,
	"secondary_metrics" text[] DEFAULT '{}',
	"minimum_sample_size" integer DEFAULT 1000,
	"current_sample_size" integer DEFAULT 0,
	"statistical_significance" numeric(5, 2),
	"winning_variant" varchar,
	"results" jsonb DEFAULT '{}'::jsonb,
	"started_at" timestamp,
	"ended_at" timestamp,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fanzcloud_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" varchar NOT NULL,
	"membership_id" varchar,
	"sso_access_token" varchar,
	"sso_refresh_token" varchar,
	"sso_expires_at" timestamp,
	"device_id" varchar NOT NULL,
	"device_name" varchar,
	"platform" varchar NOT NULL,
	"app_version" varchar NOT NULL,
	"os_version" varchar,
	"push_token" text,
	"push_enabled" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"last_active_at" timestamp DEFAULT now(),
	"ip_address" "inet",
	"location" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "fanzcloud_sessions_profile_id_device_id_unique" UNIQUE("profile_id","device_id")
);
--> statement-breakpoint
CREATE TABLE "fanzdash_email_campaigns" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"template_id" varchar,
	"target_audience" varchar NOT NULL,
	"target_tiers" text[] DEFAULT '{}',
	"target_profile_ids" text[] DEFAULT '{}',
	"target_conditions" jsonb DEFAULT '{}'::jsonb,
	"custom_subject" varchar,
	"custom_html_body" text,
	"custom_text_body" text,
	"status" "email_status" DEFAULT 'draft' NOT NULL,
	"scheduled_for" timestamp,
	"total_recipients" integer DEFAULT 0,
	"sent_count" integer DEFAULT 0,
	"open_count" integer DEFAULT 0,
	"click_count" integer DEFAULT 0,
	"bounce_count" integer DEFAULT 0,
	"unsubscribe_count" integer DEFAULT 0,
	"sent_at" timestamp,
	"completed_at" timestamp,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fanzdash_email_sends" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"campaign_id" varchar NOT NULL,
	"profile_id" varchar NOT NULL,
	"email" varchar NOT NULL,
	"status" "email_status" DEFAULT 'scheduled' NOT NULL,
	"error_message" text,
	"message_id" varchar,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"bounced_at" timestamp,
	"unsubscribed_at" timestamp,
	"personalization_data" jsonb DEFAULT '{}'::jsonb,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fanzdash_email_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"type" "email_template_type" NOT NULL,
	"description" text,
	"subject" varchar NOT NULL,
	"html_body" text NOT NULL,
	"text_body" text,
	"target_tiers" text[] DEFAULT '{}',
	"target_conditions" jsonb DEFAULT '{}'::jsonb,
	"available_variables" text[] DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "fanzdash_email_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "financial_reconciliation" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"record_date" timestamp NOT NULL,
	"source" varchar NOT NULL,
	"external_ref" varchar,
	"internal_ref" varchar,
	"expected_amount_cents" integer NOT NULL,
	"actual_amount_cents" integer,
	"discrepancy_cents" integer DEFAULT 0,
	"status" "reconciliation_status" DEFAULT 'pending' NOT NULL,
	"transaction_type" varchar NOT NULL,
	"currency" varchar DEFAULT 'USD',
	"notes" text,
	"resolved_by" varchar,
	"resolved_at" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fraud_signals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"signal_type" "fraud_signal_type" NOT NULL,
	"severity" "fraud_signal_severity" NOT NULL,
	"confidence" numeric(5, 2) NOT NULL,
	"description" text NOT NULL,
	"evidence" jsonb DEFAULT '{}'::jsonb,
	"related_signals" text[] DEFAULT '{}',
	"status" varchar DEFAULT 'active',
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"resolution" text,
	"automated_action" varchar,
	"financial_impact_cents" integer DEFAULT 0,
	"ip_addresses" text[] DEFAULT '{}',
	"device_fingerprints" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fuck_buddies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"buddy_id" varchar NOT NULL,
	"relationship_type" "fuck_buddy_relationship" DEFAULT 'fuckbuddy' NOT NULL,
	"nickname" varchar,
	"is_top_eight" boolean DEFAULT false,
	"top_eight_position" integer,
	"connection_score" integer DEFAULT 0,
	"connected_at" timestamp DEFAULT now(),
	"last_interaction_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_fuck_buddy_pair" UNIQUE("user_id","buddy_id")
);
--> statement-breakpoint
CREATE TABLE "fuck_buddy_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender_id" varchar NOT NULL,
	"receiver_id" varchar NOT NULL,
	"relationship_type" "fuck_buddy_relationship" DEFAULT 'fuckbuddy' NOT NULL,
	"message" text,
	"status" "fuck_buddy_request_status" DEFAULT 'pending' NOT NULL,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_fuck_buddy_request" UNIQUE("sender_id","receiver_id")
);
--> statement-breakpoint
CREATE TABLE "hub_vault_achievements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vault_achievement_id" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"requirements" jsonb DEFAULT '{}'::jsonb,
	"rewards" jsonb DEFAULT '{}'::jsonb,
	"tier_points" integer DEFAULT 0,
	"icon_url" varchar,
	"badge_url" varchar,
	"color" varchar,
	"rarity" varchar DEFAULT 'common',
	"is_active" boolean DEFAULT true,
	"synced_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "hub_vault_achievements_vault_achievement_id_unique" UNIQUE("vault_achievement_id"),
	CONSTRAINT "hub_vault_achievements_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "hub_vault_tier_sync" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" varchar NOT NULL,
	"membership_id" varchar,
	"sync_direction" varchar NOT NULL,
	"previous_tier" "starz_tier",
	"new_tier" "starz_tier" NOT NULL,
	"vault_record_id" varchar,
	"vault_user_id" varchar,
	"status" "hub_vault_sync_status" DEFAULT 'pending' NOT NULL,
	"metrics_snapshot" jsonb DEFAULT '{}'::jsonb,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"requested_at" timestamp DEFAULT now(),
	"synced_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_hub_jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_asset_id" varchar NOT NULL,
	"profile_id" varchar NOT NULL,
	"job_type" varchar NOT NULL,
	"status" "media_hub_processing_status" DEFAULT 'queued' NOT NULL,
	"progress" integer DEFAULT 0,
	"media_hub_job_id" varchar,
	"media_hub_callback_url" varchar,
	"quality_score_result" jsonb DEFAULT '{}'::jsonb,
	"forensic_signature" text,
	"watermark_data" jsonb DEFAULT '{}'::jsonb,
	"processing_metadata" jsonb DEFAULT '{}'::jsonb,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"max_retries" integer DEFAULT 3,
	"queued_at" timestamp DEFAULT now(),
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_hub_webhook_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"job_id" varchar,
	"event_type" varchar NOT NULL,
	"payload" jsonb NOT NULL,
	"processed" boolean DEFAULT false,
	"processed_at" timestamp,
	"processing_error" text,
	"received_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_quality_scores" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_asset_id" varchar NOT NULL,
	"profile_id" varchar NOT NULL,
	"resolution_score" integer DEFAULT 0,
	"bitrate_score" integer DEFAULT 0,
	"framing_score" integer DEFAULT 0,
	"lighting_score" integer DEFAULT 0,
	"audio_score" integer DEFAULT 0,
	"originality_score" integer DEFAULT 0,
	"engagement_prediction" integer DEFAULT 0,
	"overall_score" integer DEFAULT 0,
	"ai_analysis_model" varchar,
	"ai_analysis_results" jsonb DEFAULT '{}'::jsonb,
	"analyzed_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metric_name" varchar NOT NULL,
	"metric_value" numeric(20, 4) NOT NULL,
	"dimension" varchar,
	"dimension_value" varchar,
	"period" varchar NOT NULL,
	"period_start" timestamp NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "platform_metrics_metric_name_period_period_start_dimension_dimension_value_unique" UNIQUE("metric_name","period","period_start","dimension","dimension_value")
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar NOT NULL,
	"value" jsonb NOT NULL,
	"category" varchar DEFAULT 'general',
	"description" text,
	"is_secret" boolean DEFAULT false,
	"is_editable" boolean DEFAULT true,
	"previous_value" jsonb,
	"changed_by" varchar,
	"changed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "platform_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "promotion_redemptions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"promotion_id" bigint NOT NULL,
	"user_id" varchar NOT NULL,
	"subscription_id" varchar,
	"discount_amount_cents" integer NOT NULL,
	"original_price_cents" integer NOT NULL,
	"final_price_cents" integer NOT NULL,
	"redeemed_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "social_notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"from_user_id" varchar,
	"type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"message" text,
	"action_url" varchar,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "starz_access_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"profile_id" varchar NOT NULL,
	"membership_id" varchar,
	"tool_accessed" varchar NOT NULL,
	"access_type" varchar NOT NULL,
	"tier_at_access" "starz_tier",
	"sso_session_id" varchar,
	"sso_client_id" varchar,
	"ip_address" "inet",
	"user_agent" text,
	"device_type" varchar,
	"fanzcloud_version" varchar,
	"fanzcloud_platform" varchar,
	"accessed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "starz_ai_tools" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"minimum_tier" "starz_tier" NOT NULL,
	"usage_limits" jsonb DEFAULT '{}'::jsonb,
	"api_endpoint" varchar,
	"ai_model" varchar,
	"parameters" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"is_beta" boolean DEFAULT false,
	"total_usage" bigint DEFAULT 0,
	"avg_rating" numeric(3, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "starz_ai_tools_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "starz_content_imports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" varchar NOT NULL,
	"connection_id" varchar,
	"source_platform" "auxiliary_platform" NOT NULL,
	"source_content_id" varchar,
	"source_url" text,
	"status" "content_import_status" DEFAULT 'pending' NOT NULL,
	"imported_content_id" varchar,
	"imported_media_ids" text[] DEFAULT '{}',
	"original_metadata" jsonb DEFAULT '{}'::jsonb,
	"processed_metadata" jsonb DEFAULT '{}'::jsonb,
	"conversion_log" jsonb DEFAULT '[]'::jsonb,
	"error_message" text,
	"error_details" jsonb DEFAULT '{}'::jsonb,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "starz_cross_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" varchar NOT NULL,
	"connection_id" varchar NOT NULL,
	"content_id" varchar,
	"title" varchar,
	"caption" text,
	"media_urls" text[] DEFAULT '{}',
	"hashtags" text[] DEFAULT '{}',
	"platform_caption" text,
	"platform_hashtags" text[] DEFAULT '{}',
	"platform_media_urls" text[] DEFAULT '{}',
	"status" "cross_post_status" DEFAULT 'pending' NOT NULL,
	"scheduled_for" timestamp,
	"posted_at" timestamp,
	"platform_post_id" varchar,
	"platform_post_url" varchar,
	"platform_response" jsonb DEFAULT '{}'::jsonb,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"max_retries" integer DEFAULT 3,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "starz_leaderboard" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" varchar NOT NULL,
	"membership_id" varchar NOT NULL,
	"period_type" varchar NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp,
	"overall_rank" integer,
	"tier_rank" integer,
	"category_rank" integer,
	"total_score" integer DEFAULT 0,
	"fan_growth" integer DEFAULT 0,
	"engagement_score" integer DEFAULT 0,
	"quality_score" integer DEFAULT 0,
	"referral_score" integer DEFAULT 0,
	"tier_at_ranking" "starz_tier",
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "starz_leaderboard_profile_id_period_type_period_start_unique" UNIQUE("profile_id","period_type","period_start")
);
--> statement-breakpoint
CREATE TABLE "starz_memberships" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" varchar NOT NULL,
	"current_tier" "starz_tier" DEFAULT 'none' NOT NULL,
	"previous_tier" "starz_tier",
	"total_fan_count" integer DEFAULT 0,
	"active_fan_count" integer DEFAULT 0,
	"successful_referrals" integer DEFAULT 0,
	"pending_referrals" integer DEFAULT 0,
	"media_quality_score" integer DEFAULT 0,
	"total_post_count" integer DEFAULT 0,
	"monthly_post_count" integer DEFAULT 0,
	"avg_engagement_rate" numeric(5, 2) DEFAULT '0.00',
	"content_consistency_score" integer DEFAULT 0,
	"community_health_score" integer DEFAULT 0,
	"tier_progress" jsonb DEFAULT '{}'::jsonb,
	"next_tier_requirements" jsonb DEFAULT '{}'::jsonb,
	"fanzcloud_access_enabled" boolean DEFAULT false,
	"fanzcloud_access_level" varchar DEFAULT 'view_only',
	"fanzcloud_activated_at" timestamp,
	"tier_achieved_at" timestamp DEFAULT now(),
	"tier_expires_at" timestamp,
	"last_evaluated_at" timestamp DEFAULT now(),
	"next_evaluation_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "starz_memberships_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "starz_platform_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"connection_id" varchar NOT NULL,
	"profile_id" varchar NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"followers" integer DEFAULT 0,
	"followers_gained" integer DEFAULT 0,
	"followers_lost" integer DEFAULT 0,
	"impressions" bigint DEFAULT 0,
	"reach" bigint DEFAULT 0,
	"engagements" bigint DEFAULT 0,
	"likes" bigint DEFAULT 0,
	"comments" bigint DEFAULT 0,
	"shares" bigint DEFAULT 0,
	"saves" bigint DEFAULT 0,
	"clicks" bigint DEFAULT 0,
	"posts_count" integer DEFAULT 0,
	"video_views" bigint DEFAULT 0,
	"avg_watch_time" integer,
	"platform_revenue" numeric(10, 2),
	"currency" varchar DEFAULT 'USD',
	"raw_data" jsonb DEFAULT '{}'::jsonb,
	"fetched_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "starz_platform_connections" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" varchar NOT NULL,
	"membership_id" varchar,
	"platform" "auxiliary_platform" NOT NULL,
	"platform_user_id" varchar,
	"platform_username" varchar,
	"platform_display_name" varchar,
	"platform_profile_url" varchar,
	"platform_avatar_url" varchar,
	"access_token" text,
	"refresh_token" text,
	"token_expires_at" timestamp,
	"token_scopes" text[] DEFAULT '{}',
	"status" "platform_connection_status" DEFAULT 'pending' NOT NULL,
	"last_sync_at" timestamp,
	"sync_error" text,
	"auto_post_enabled" boolean DEFAULT false,
	"analytics_enabled" boolean DEFAULT true,
	"import_enabled" boolean DEFAULT false,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"minimum_tier" "starz_tier" DEFAULT 'bronze_star',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "starz_platform_connections_profile_id_platform_unique" UNIQUE("profile_id","platform")
);
--> statement-breakpoint
CREATE TABLE "starz_referral_tracking" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_profile_id" varchar NOT NULL,
	"referred_user_id" varchar,
	"referral_code_id" varchar,
	"qualifies_for_starz" boolean DEFAULT false,
	"qualification_reason" text,
	"referred_user_active" boolean DEFAULT false,
	"referred_user_purchased" boolean DEFAULT false,
	"referred_user_subscribed" boolean DEFAULT false,
	"referred_user_value" numeric(10, 2) DEFAULT '0',
	"referral_date" timestamp DEFAULT now(),
	"qualified_at" timestamp,
	"disqualified_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "starz_thank_you_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_admin_id" varchar NOT NULL,
	"to_profile_id" varchar NOT NULL,
	"to_membership_id" varchar,
	"subject" varchar NOT NULL,
	"message" text NOT NULL,
	"message_type" varchar DEFAULT 'thank_you',
	"trigger_reason" varchar,
	"sent_via_email" boolean DEFAULT true,
	"sent_via_notification" boolean DEFAULT true,
	"email_sent" boolean DEFAULT false,
	"email_sent_at" timestamp,
	"notification_sent" boolean DEFAULT false,
	"notification_sent_at" timestamp,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "starz_tier_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"membership_id" varchar NOT NULL,
	"previous_tier" "starz_tier",
	"new_tier" "starz_tier" NOT NULL,
	"change_reason" varchar NOT NULL,
	"metrics_snapshot" jsonb DEFAULT '{}'::jsonb,
	"changed_at" timestamp DEFAULT now(),
	"changed_by" varchar
);
--> statement-breakpoint
CREATE TABLE "starz_tier_requirements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier" "starz_tier" NOT NULL,
	"min_fan_count" integer NOT NULL,
	"min_active_fan_count" integer NOT NULL,
	"min_referrals" integer NOT NULL,
	"min_media_quality_score" integer NOT NULL,
	"min_total_posts" integer NOT NULL,
	"min_monthly_posts" integer NOT NULL,
	"min_engagement_rate" numeric(5, 2),
	"min_consistency_score" integer,
	"min_community_health_score" integer,
	"features" jsonb DEFAULT '[]'::jsonb,
	"ai_tools_unlocked" text[] DEFAULT '{}',
	"fanzcloud_access_level" varchar NOT NULL,
	"display_name" varchar NOT NULL,
	"description" text,
	"badge_url" varchar,
	"color" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "starz_tier_requirements_tier_unique" UNIQUE("tier")
);
--> statement-breakpoint
CREATE TABLE "starz_vip_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"membership_id" varchar NOT NULL,
	"profile_id" varchar NOT NULL,
	"show_badge" boolean DEFAULT true,
	"badge_position" varchar DEFAULT 'top-right',
	"custom_badge_url" varchar,
	"custom_title" varchar,
	"show_tier_level" boolean DEFAULT true,
	"featured_in_dashboard" boolean DEFAULT true,
	"dashboard_priority" integer DEFAULT 0,
	"priority_support" boolean DEFAULT false,
	"dedicated_account_manager" varchar,
	"custom_features" jsonb DEFAULT '{}'::jsonb,
	"show_in_leaderboards" boolean DEFAULT true,
	"show_earnings_publicly" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "starz_vip_settings_membership_id_unique" UNIQUE("membership_id")
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"to_user_id" varchar NOT NULL,
	"from_user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"rating" integer DEFAULT 5,
	"is_approved" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_testimonial" UNIQUE("to_user_id","from_user_id")
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"cover_image_url" varchar,
	"current_mood" varchar,
	"fantasies" jsonb DEFAULT '[]'::jsonb,
	"kinks" jsonb DEFAULT '[]'::jsonb,
	"turn_ons" jsonb DEFAULT '[]'::jsonb,
	"turn_offs" jsonb DEFAULT '[]'::jsonb,
	"looking_for" jsonb DEFAULT '[]'::jsonb,
	"sexual_orientation" varchar,
	"relationship_status" varchar,
	"body_type" varchar,
	"position" varchar,
	"age" integer,
	"pronouns" varchar,
	"location" varchar,
	"bio" text,
	"style_attitude" jsonb DEFAULT '[]'::jsonb,
	"profile_theme" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "wall_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_user_id" varchar NOT NULL,
	"author_id" varchar NOT NULL,
	"type" varchar DEFAULT 'text' NOT NULL,
	"content" text,
	"media_urls" jsonb DEFAULT '[]'::jsonb,
	"mood" varchar,
	"mood_emoji" varchar,
	"location" varchar,
	"is_pinned" boolean DEFAULT false,
	"comments_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wall_reactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"reaction_type" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_wall_reaction" UNIQUE("post_id","user_id","reaction_type")
);
--> statement-breakpoint
CREATE TABLE "creator_meetups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" uuid NOT NULL,
	"requestee_id" uuid NOT NULL,
	"requester_platform" "fanz_platform" NOT NULL,
	"requestee_platform" "fanz_platform" NOT NULL,
	"type" "meetup_type" DEFAULT 'content_creation',
	"status" "meetup_status" DEFAULT 'pending',
	"title" varchar NOT NULL,
	"description" text,
	"proposed_date_time" timestamp NOT NULL,
	"alternate_date_time_1" timestamp,
	"alternate_date_time_2" timestamp,
	"confirmed_date_time" timestamp,
	"duration" integer DEFAULT 60,
	"location_name" varchar,
	"location_address" text,
	"location_latitude" numeric(10, 8),
	"location_longitude" numeric(11, 8),
	"is_virtual" boolean DEFAULT false,
	"virtual_meeting_url" text,
	"message_thread_id" uuid,
	"reminders_sent" jsonb DEFAULT '[]'::jsonb,
	"cancelled_at" timestamp,
	"cancelled_by_id" uuid,
	"cancellation_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cross_platform_visibility" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"home_platform" "fanz_platform" NOT NULL,
	"visible_platforms" text[] DEFAULT '{}',
	"allow_cross_platform_messaging" boolean DEFAULT true,
	"show_on_cross_platform_maps" boolean DEFAULT true,
	"membership_tier" "membership_tier" DEFAULT 'free',
	"membership_expires_at" timestamp,
	"can_view_exact_locations" boolean DEFAULT false,
	"can_initiate_meetups" boolean DEFAULT false,
	"can_receive_meetup_requests" boolean DEFAULT true,
	"max_meetups_per_month" integer DEFAULT 3,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "cross_platform_visibility_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "map_notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"push_enabled" boolean DEFAULT true,
	"push_for_meetup_requests" boolean DEFAULT true,
	"push_for_meetup_updates" boolean DEFAULT true,
	"push_for_nearby_creators" boolean DEFAULT false,
	"sms_enabled" boolean DEFAULT false,
	"sms_phone_number" varchar,
	"sms_phone_verified" boolean DEFAULT false,
	"sms_for_meetup_reminders" boolean DEFAULT true,
	"sms_for_24_hour_reminder" boolean DEFAULT true,
	"sms_for_1_hour_reminder" boolean DEFAULT true,
	"sms_for_15_min_reminder" boolean DEFAULT true,
	"email_for_meetups" boolean DEFAULT true,
	"quiet_hours_enabled" boolean DEFAULT false,
	"quiet_hours_start" varchar DEFAULT '22:00',
	"quiet_hours_end" varchar DEFAULT '08:00',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "map_notification_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "meetup_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meetup_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"minutes_before" integer NOT NULL,
	"channel" "reminder_channel" NOT NULL,
	"status" "reminder_status" DEFAULT 'scheduled',
	"phone_number" varchar,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tier_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier" "membership_tier" NOT NULL,
	"can_view_nearby_map" boolean DEFAULT true,
	"can_view_cross_platform" boolean DEFAULT false,
	"can_view_exact_locations" boolean DEFAULT false,
	"max_view_radius" integer DEFAULT 25,
	"can_message_from_map" boolean DEFAULT false,
	"can_cross_platform_message" boolean DEFAULT false,
	"can_schedule_meetups" boolean DEFAULT false,
	"max_meetups_per_month" integer DEFAULT 0,
	"can_receive_meetup_requests" boolean DEFAULT true,
	"has_push_notifications" boolean DEFAULT true,
	"has_sms_reminders" boolean DEFAULT false,
	"has_email_reminders" boolean DEFAULT true,
	"min_fanz_tokens" integer DEFAULT 0,
	"min_referrals" integer DEFAULT 0,
	"min_subscriber_count" integer DEFAULT 0,
	"requires_verification" boolean DEFAULT false,
	"requires_creator_status" boolean DEFAULT false,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "tier_features_tier_unique" UNIQUE("tier")
);
--> statement-breakpoint
CREATE TABLE "user_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"approx_latitude" numeric(10, 6),
	"approx_longitude" numeric(11, 6),
	"city" varchar,
	"state" varchar,
	"country" varchar DEFAULT 'US',
	"postal_code" varchar,
	"timezone" varchar,
	"accuracy" integer,
	"source" varchar DEFAULT 'browser',
	"is_location_public" boolean DEFAULT false,
	"show_exact_location" boolean DEFAULT false,
	"location_radius" integer DEFAULT 5,
	"visible_on_platforms" text[] DEFAULT '{}',
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "style_attitude" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_undone_by_users_id_fk" FOREIGN KEY ("undone_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_hub_quotas" ADD CONSTRAINT "ai_hub_quotas_membership_id_starz_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."starz_memberships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_hub_quotas" ADD CONSTRAINT "ai_hub_quotas_service_id_ai_hub_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."ai_hub_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_hub_usage" ADD CONSTRAINT "ai_hub_usage_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_hub_usage" ADD CONSTRAINT "ai_hub_usage_service_id_ai_hub_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."ai_hub_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_hub_usage" ADD CONSTRAINT "ai_hub_usage_membership_id_starz_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."starz_memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_reports" ADD CONSTRAINT "compliance_reports_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_analytics" ADD CONSTRAINT "creator_analytics_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_health_scores" ADD CONSTRAINT "creator_health_scores_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_leaderboards" ADD CONSTRAINT "creator_leaderboards_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiment_assignments" ADD CONSTRAINT "experiment_assignments_experiment_id_experiments_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."experiments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiment_assignments" ADD CONSTRAINT "experiment_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fanzcloud_sessions" ADD CONSTRAINT "fanzcloud_sessions_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fanzcloud_sessions" ADD CONSTRAINT "fanzcloud_sessions_membership_id_starz_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."starz_memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fanzdash_email_campaigns" ADD CONSTRAINT "fanzdash_email_campaigns_template_id_fanzdash_email_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."fanzdash_email_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fanzdash_email_campaigns" ADD CONSTRAINT "fanzdash_email_campaigns_created_by_accounts_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fanzdash_email_sends" ADD CONSTRAINT "fanzdash_email_sends_campaign_id_fanzdash_email_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."fanzdash_email_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fanzdash_email_sends" ADD CONSTRAINT "fanzdash_email_sends_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fanzdash_email_templates" ADD CONSTRAINT "fanzdash_email_templates_created_by_accounts_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_reconciliation" ADD CONSTRAINT "financial_reconciliation_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_signals" ADD CONSTRAINT "fraud_signals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_signals" ADD CONSTRAINT "fraud_signals_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuck_buddies" ADD CONSTRAINT "fuck_buddies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuck_buddies" ADD CONSTRAINT "fuck_buddies_buddy_id_users_id_fk" FOREIGN KEY ("buddy_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuck_buddy_requests" ADD CONSTRAINT "fuck_buddy_requests_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuck_buddy_requests" ADD CONSTRAINT "fuck_buddy_requests_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hub_vault_tier_sync" ADD CONSTRAINT "hub_vault_tier_sync_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hub_vault_tier_sync" ADD CONSTRAINT "hub_vault_tier_sync_membership_id_starz_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."starz_memberships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_hub_jobs" ADD CONSTRAINT "media_hub_jobs_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_hub_jobs" ADD CONSTRAINT "media_hub_jobs_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_hub_webhook_events" ADD CONSTRAINT "media_hub_webhook_events_job_id_media_hub_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."media_hub_jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_quality_scores" ADD CONSTRAINT "media_quality_scores_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_quality_scores" ADD CONSTRAINT "media_quality_scores_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD CONSTRAINT "platform_settings_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_notifications" ADD CONSTRAINT "social_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_notifications" ADD CONSTRAINT "social_notifications_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_access_logs" ADD CONSTRAINT "starz_access_logs_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_access_logs" ADD CONSTRAINT "starz_access_logs_membership_id_starz_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."starz_memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_content_imports" ADD CONSTRAINT "starz_content_imports_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_content_imports" ADD CONSTRAINT "starz_content_imports_connection_id_starz_platform_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."starz_platform_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_content_imports" ADD CONSTRAINT "starz_content_imports_imported_content_id_content_id_fk" FOREIGN KEY ("imported_content_id") REFERENCES "public"."content"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_cross_posts" ADD CONSTRAINT "starz_cross_posts_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_cross_posts" ADD CONSTRAINT "starz_cross_posts_connection_id_starz_platform_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."starz_platform_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_cross_posts" ADD CONSTRAINT "starz_cross_posts_content_id_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_leaderboard" ADD CONSTRAINT "starz_leaderboard_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_leaderboard" ADD CONSTRAINT "starz_leaderboard_membership_id_starz_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."starz_memberships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_memberships" ADD CONSTRAINT "starz_memberships_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_platform_analytics" ADD CONSTRAINT "starz_platform_analytics_connection_id_starz_platform_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."starz_platform_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_platform_analytics" ADD CONSTRAINT "starz_platform_analytics_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_platform_connections" ADD CONSTRAINT "starz_platform_connections_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_platform_connections" ADD CONSTRAINT "starz_platform_connections_membership_id_starz_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."starz_memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_referral_tracking" ADD CONSTRAINT "starz_referral_tracking_referrer_profile_id_profiles_id_fk" FOREIGN KEY ("referrer_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_referral_tracking" ADD CONSTRAINT "starz_referral_tracking_referred_user_id_accounts_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_referral_tracking" ADD CONSTRAINT "starz_referral_tracking_referral_code_id_referral_codes_id_fk" FOREIGN KEY ("referral_code_id") REFERENCES "public"."referral_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_thank_you_messages" ADD CONSTRAINT "starz_thank_you_messages_from_admin_id_accounts_id_fk" FOREIGN KEY ("from_admin_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_thank_you_messages" ADD CONSTRAINT "starz_thank_you_messages_to_profile_id_profiles_id_fk" FOREIGN KEY ("to_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_thank_you_messages" ADD CONSTRAINT "starz_thank_you_messages_to_membership_id_starz_memberships_id_fk" FOREIGN KEY ("to_membership_id") REFERENCES "public"."starz_memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_tier_history" ADD CONSTRAINT "starz_tier_history_membership_id_starz_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."starz_memberships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_tier_history" ADD CONSTRAINT "starz_tier_history_changed_by_accounts_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_vip_settings" ADD CONSTRAINT "starz_vip_settings_membership_id_starz_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."starz_memberships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starz_vip_settings" ADD CONSTRAINT "starz_vip_settings_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wall_posts" ADD CONSTRAINT "wall_posts_profile_user_id_users_id_fk" FOREIGN KEY ("profile_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wall_posts" ADD CONSTRAINT "wall_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wall_reactions" ADD CONSTRAINT "wall_reactions_post_id_wall_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."wall_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wall_reactions" ADD CONSTRAINT "wall_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_meetups" ADD CONSTRAINT "creator_meetups_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_meetups" ADD CONSTRAINT "creator_meetups_requestee_id_users_id_fk" FOREIGN KEY ("requestee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_meetups" ADD CONSTRAINT "creator_meetups_cancelled_by_id_users_id_fk" FOREIGN KEY ("cancelled_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cross_platform_visibility" ADD CONSTRAINT "cross_platform_visibility_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_notification_preferences" ADD CONSTRAINT "map_notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetup_reminders" ADD CONSTRAINT "meetup_reminders_meetup_id_creator_meetups_id_fk" FOREIGN KEY ("meetup_id") REFERENCES "public"."creator_meetups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetup_reminders" ADD CONSTRAINT "meetup_reminders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_locations" ADD CONSTRAINT "user_locations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_admin_audit_admin" ON "admin_audit_log" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "idx_admin_audit_action" ON "admin_audit_log" USING btree ("action_type");--> statement-breakpoint
CREATE INDEX "idx_admin_audit_target" ON "admin_audit_log" USING btree ("target_table","target_id");--> statement-breakpoint
CREATE INDEX "idx_admin_audit_created" ON "admin_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_ai_hub_quotas_membership" ON "ai_hub_quotas" USING btree ("membership_id");--> statement-breakpoint
CREATE INDEX "idx_ai_hub_quotas_service" ON "ai_hub_quotas" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "idx_ai_hub_quotas_period" ON "ai_hub_quotas" USING btree ("period_start","period_end");--> statement-breakpoint
CREATE INDEX "idx_ai_hub_services_slug" ON "ai_hub_services" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_ai_hub_services_category" ON "ai_hub_services" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_ai_hub_services_tier" ON "ai_hub_services" USING btree ("minimum_tier");--> statement-breakpoint
CREATE INDEX "idx_ai_hub_usage_profile" ON "ai_hub_usage" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_ai_hub_usage_service" ON "ai_hub_usage" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "idx_ai_hub_usage_request_id" ON "ai_hub_usage" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "idx_ai_hub_usage_requested_at" ON "ai_hub_usage" USING btree ("requested_at");--> statement-breakpoint
CREATE INDEX "idx_auxiliary_platform_capabilities_platform" ON "auxiliary_platform_capabilities" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "idx_auxiliary_platform_capabilities_tier" ON "auxiliary_platform_capabilities" USING btree ("minimum_tier");--> statement-breakpoint
CREATE INDEX "idx_compliance_reports_type" ON "compliance_reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "idx_compliance_reports_status" ON "compliance_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_creator_analytics_creator" ON "creator_analytics" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "idx_creator_analytics_period" ON "creator_analytics" USING btree ("period_type","period_start");--> statement-breakpoint
CREATE INDEX "idx_creator_health_creator" ON "creator_health_scores" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "idx_creator_health_score" ON "creator_health_scores" USING btree ("overall_score");--> statement-breakpoint
CREATE INDEX "idx_creator_health_trend" ON "creator_health_scores" USING btree ("trend_direction");--> statement-breakpoint
CREATE INDEX "idx_leaderboard_creator" ON "creator_leaderboards" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "idx_leaderboard_category_period" ON "creator_leaderboards" USING btree ("category","period","period_start");--> statement-breakpoint
CREATE INDEX "idx_leaderboard_rank" ON "creator_leaderboards" USING btree ("category","period","period_start","rank");--> statement-breakpoint
CREATE INDEX "idx_exp_assign_experiment" ON "experiment_assignments" USING btree ("experiment_id");--> statement-breakpoint
CREATE INDEX "idx_exp_assign_user" ON "experiment_assignments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_experiments_status" ON "experiments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_experiments_feature" ON "experiments" USING btree ("feature_flag");--> statement-breakpoint
CREATE INDEX "idx_fanzcloud_sessions_profile" ON "fanzcloud_sessions" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_fanzcloud_sessions_device" ON "fanzcloud_sessions" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX "idx_fanzcloud_sessions_active" ON "fanzcloud_sessions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_fanzdash_email_campaigns_status" ON "fanzdash_email_campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_fanzdash_email_campaigns_scheduled" ON "fanzdash_email_campaigns" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "idx_fanzdash_email_campaigns_created_by" ON "fanzdash_email_campaigns" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_fanzdash_email_sends_campaign" ON "fanzdash_email_sends" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "idx_fanzdash_email_sends_profile" ON "fanzdash_email_sends" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_fanzdash_email_sends_status" ON "fanzdash_email_sends" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_fanzdash_email_sends_message_id" ON "fanzdash_email_sends" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "idx_fanzdash_email_templates_type" ON "fanzdash_email_templates" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_fanzdash_email_templates_slug" ON "fanzdash_email_templates" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_reconciliation_date" ON "financial_reconciliation" USING btree ("record_date");--> statement-breakpoint
CREATE INDEX "idx_reconciliation_status" ON "financial_reconciliation" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_reconciliation_source" ON "financial_reconciliation" USING btree ("source");--> statement-breakpoint
CREATE INDEX "idx_fraud_signals_user" ON "fraud_signals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_fraud_signals_type" ON "fraud_signals" USING btree ("signal_type");--> statement-breakpoint
CREATE INDEX "idx_fraud_signals_severity" ON "fraud_signals" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_fraud_signals_status" ON "fraud_signals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_fraud_signals_created" ON "fraud_signals" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_fuck_buddies_user" ON "fuck_buddies" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_fuck_buddies_buddy" ON "fuck_buddies" USING btree ("buddy_id");--> statement-breakpoint
CREATE INDEX "idx_fuck_buddies_top_eight" ON "fuck_buddies" USING btree ("user_id","is_top_eight");--> statement-breakpoint
CREATE INDEX "idx_fuck_buddy_requests_sender" ON "fuck_buddy_requests" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "idx_fuck_buddy_requests_receiver" ON "fuck_buddy_requests" USING btree ("receiver_id");--> statement-breakpoint
CREATE INDEX "idx_fuck_buddy_requests_status" ON "fuck_buddy_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_hub_vault_achievements_slug" ON "hub_vault_achievements" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_hub_vault_achievements_category" ON "hub_vault_achievements" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_hub_vault_tier_sync_profile" ON "hub_vault_tier_sync" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_hub_vault_tier_sync_status" ON "hub_vault_tier_sync" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_hub_vault_tier_sync_vault_user" ON "hub_vault_tier_sync" USING btree ("vault_user_id");--> statement-breakpoint
CREATE INDEX "idx_media_hub_jobs_media" ON "media_hub_jobs" USING btree ("media_asset_id");--> statement-breakpoint
CREATE INDEX "idx_media_hub_jobs_profile" ON "media_hub_jobs" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_media_hub_jobs_status" ON "media_hub_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_media_hub_jobs_type" ON "media_hub_jobs" USING btree ("job_type");--> statement-breakpoint
CREATE INDEX "idx_media_hub_jobs_media_hub_id" ON "media_hub_jobs" USING btree ("media_hub_job_id");--> statement-breakpoint
CREATE INDEX "idx_media_hub_webhook_events_job" ON "media_hub_webhook_events" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "idx_media_hub_webhook_events_type" ON "media_hub_webhook_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_media_hub_webhook_events_processed" ON "media_hub_webhook_events" USING btree ("processed");--> statement-breakpoint
CREATE INDEX "idx_media_quality_scores_media" ON "media_quality_scores" USING btree ("media_asset_id");--> statement-breakpoint
CREATE INDEX "idx_media_quality_scores_profile" ON "media_quality_scores" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_media_quality_scores_overall" ON "media_quality_scores" USING btree ("overall_score");--> statement-breakpoint
CREATE INDEX "idx_platform_metrics_name" ON "platform_metrics" USING btree ("metric_name");--> statement-breakpoint
CREATE INDEX "idx_platform_metrics_period" ON "platform_metrics" USING btree ("period","period_start");--> statement-breakpoint
CREATE INDEX "idx_platform_settings_key" ON "platform_settings" USING btree ("key");--> statement-breakpoint
CREATE INDEX "idx_platform_settings_category" ON "platform_settings" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_social_notifications_user" ON "social_notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_social_notifications_unread" ON "social_notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "idx_social_notifications_created" ON "social_notifications" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_starz_access_logs_profile" ON "starz_access_logs" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_starz_access_logs_tool" ON "starz_access_logs" USING btree ("tool_accessed");--> statement-breakpoint
CREATE INDEX "idx_starz_access_logs_access_type" ON "starz_access_logs" USING btree ("access_type");--> statement-breakpoint
CREATE INDEX "idx_starz_access_logs_accessed_at" ON "starz_access_logs" USING btree ("accessed_at");--> statement-breakpoint
CREATE INDEX "idx_starz_access_logs_sso_session" ON "starz_access_logs" USING btree ("sso_session_id");--> statement-breakpoint
CREATE INDEX "idx_starz_ai_tools_slug" ON "starz_ai_tools" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_starz_ai_tools_category" ON "starz_ai_tools" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_starz_ai_tools_tier" ON "starz_ai_tools" USING btree ("minimum_tier");--> statement-breakpoint
CREATE INDEX "idx_starz_content_imports_profile" ON "starz_content_imports" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_starz_content_imports_status" ON "starz_content_imports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_starz_content_imports_source" ON "starz_content_imports" USING btree ("source_platform");--> statement-breakpoint
CREATE INDEX "idx_starz_cross_posts_profile" ON "starz_cross_posts" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_starz_cross_posts_connection" ON "starz_cross_posts" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX "idx_starz_cross_posts_content" ON "starz_cross_posts" USING btree ("content_id");--> statement-breakpoint
CREATE INDEX "idx_starz_cross_posts_status" ON "starz_cross_posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_starz_cross_posts_scheduled" ON "starz_cross_posts" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "idx_starz_leaderboard_profile" ON "starz_leaderboard" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_starz_leaderboard_period" ON "starz_leaderboard" USING btree ("period_type","period_start");--> statement-breakpoint
CREATE INDEX "idx_starz_leaderboard_rank" ON "starz_leaderboard" USING btree ("overall_rank");--> statement-breakpoint
CREATE INDEX "idx_starz_leaderboard_tier_rank" ON "starz_leaderboard" USING btree ("tier_rank");--> statement-breakpoint
CREATE INDEX "idx_starz_memberships_profile" ON "starz_memberships" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_starz_memberships_tier" ON "starz_memberships" USING btree ("current_tier");--> statement-breakpoint
CREATE INDEX "idx_starz_memberships_fanzcloud" ON "starz_memberships" USING btree ("fanzcloud_access_enabled");--> statement-breakpoint
CREATE INDEX "idx_starz_platform_analytics_connection" ON "starz_platform_analytics" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX "idx_starz_platform_analytics_profile" ON "starz_platform_analytics" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_starz_platform_analytics_period" ON "starz_platform_analytics" USING btree ("period_start","period_end");--> statement-breakpoint
CREATE INDEX "idx_starz_platform_connections_profile" ON "starz_platform_connections" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_starz_platform_connections_platform" ON "starz_platform_connections" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "idx_starz_platform_connections_status" ON "starz_platform_connections" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_starz_referral_tracking_referrer" ON "starz_referral_tracking" USING btree ("referrer_profile_id");--> statement-breakpoint
CREATE INDEX "idx_starz_referral_tracking_referred" ON "starz_referral_tracking" USING btree ("referred_user_id");--> statement-breakpoint
CREATE INDEX "idx_starz_referral_tracking_qualifies" ON "starz_referral_tracking" USING btree ("qualifies_for_starz");--> statement-breakpoint
CREATE INDEX "idx_starz_thank_you_from_admin" ON "starz_thank_you_messages" USING btree ("from_admin_id");--> statement-breakpoint
CREATE INDEX "idx_starz_thank_you_to_profile" ON "starz_thank_you_messages" USING btree ("to_profile_id");--> statement-breakpoint
CREATE INDEX "idx_starz_thank_you_type" ON "starz_thank_you_messages" USING btree ("message_type");--> statement-breakpoint
CREATE INDEX "idx_starz_tier_history_membership" ON "starz_tier_history" USING btree ("membership_id");--> statement-breakpoint
CREATE INDEX "idx_starz_tier_history_changed_at" ON "starz_tier_history" USING btree ("changed_at");--> statement-breakpoint
CREATE INDEX "idx_starz_tier_requirements_tier" ON "starz_tier_requirements" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "idx_starz_vip_settings_membership" ON "starz_vip_settings" USING btree ("membership_id");--> statement-breakpoint
CREATE INDEX "idx_starz_vip_settings_profile" ON "starz_vip_settings" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_starz_vip_settings_featured" ON "starz_vip_settings" USING btree ("featured_in_dashboard");--> statement-breakpoint
CREATE INDEX "idx_starz_vip_settings_priority" ON "starz_vip_settings" USING btree ("dashboard_priority");--> statement-breakpoint
CREATE INDEX "idx_testimonials_to_user" ON "testimonials" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "idx_testimonials_from_user" ON "testimonials" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "idx_user_profiles_user" ON "user_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_wall_posts_profile" ON "wall_posts" USING btree ("profile_user_id");--> statement-breakpoint
CREATE INDEX "idx_wall_posts_author" ON "wall_posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_wall_posts_pinned" ON "wall_posts" USING btree ("profile_user_id","is_pinned");--> statement-breakpoint
CREATE INDEX "idx_wall_posts_created" ON "wall_posts" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_wall_reactions_post" ON "wall_reactions" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_wall_reactions_user" ON "wall_reactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_meetups_requester" ON "creator_meetups" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "idx_meetups_requestee" ON "creator_meetups" USING btree ("requestee_id");--> statement-breakpoint
CREATE INDEX "idx_meetups_status" ON "creator_meetups" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_meetups_date" ON "creator_meetups" USING btree ("proposed_date_time");--> statement-breakpoint
CREATE INDEX "idx_meetups_confirmed" ON "creator_meetups" USING btree ("confirmed_date_time");--> statement-breakpoint
CREATE INDEX "idx_cross_platform_user" ON "cross_platform_visibility" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_cross_platform_home" ON "cross_platform_visibility" USING btree ("home_platform");--> statement-breakpoint
CREATE INDEX "idx_cross_platform_tier" ON "cross_platform_visibility" USING btree ("membership_tier");--> statement-breakpoint
CREATE INDEX "idx_map_notif_prefs_user" ON "map_notification_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_reminders_meetup" ON "meetup_reminders" USING btree ("meetup_id");--> statement-breakpoint
CREATE INDEX "idx_reminders_user" ON "meetup_reminders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_reminders_scheduled" ON "meetup_reminders" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "idx_reminders_status" ON "meetup_reminders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_tier_features_tier" ON "tier_features" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "idx_user_locations_user" ON "user_locations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_locations_coords" ON "user_locations" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "idx_user_locations_approx" ON "user_locations" USING btree ("approx_latitude","approx_longitude");--> statement-breakpoint
CREATE INDEX "idx_user_locations_city_state" ON "user_locations" USING btree ("city","state");