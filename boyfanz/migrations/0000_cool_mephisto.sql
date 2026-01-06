CREATE TYPE "public"."account_status" AS ENUM('active', 'disabled', 'pending', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."achievement_status" AS ENUM('locked', 'unlocked', 'claimed');--> statement-breakpoint
CREATE TYPE "public"."achievement_type" AS ENUM('referral_count', 'earnings_milestone', 'conversion_rate', 'streak', 'tier_upgrade', 'special_event');--> statement-breakpoint
CREATE TYPE "public"."ad_campaign_status" AS ENUM('draft', 'active', 'paused', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."ad_campaign_type" AS ENUM('content_promotion', 'profile_promotion', 'brand_awareness', 'cross_platform');--> statement-breakpoint
CREATE TYPE "public"."ad_creative_kind" AS ENUM('image', 'video', 'carousel', 'story', 'native');--> statement-breakpoint
CREATE TYPE "public"."ad_creative_status" AS ENUM('pending', 'approved', 'rejected', 'active', 'paused');--> statement-breakpoint
CREATE TYPE "public"."ad_placement_type" AS ENUM('feed_top', 'feed_inline', 'sidebar', 'banner', 'story', 'profile');--> statement-breakpoint
CREATE TYPE "public"."admin_permission" AS ENUM('moderation_queue', 'user_management', 'theme_management', 'analytics_access', 'content_approval', 'system_settings');--> statement-breakpoint
CREATE TYPE "public"."admin_report_type" AS ENUM('financial', 'user_analytics', 'content', 'compliance', 'custom');--> statement-breakpoint
CREATE TYPE "public"."affiliate_status" AS ENUM('active', 'inactive', 'suspended', 'pending_approval');--> statement-breakpoint
CREATE TYPE "public"."affiliate_tier" AS ENUM('bronze', 'silver', 'gold', 'platinum', 'diamond');--> statement-breakpoint
CREATE TYPE "public"."age_verification_method" AS ENUM('id_document', 'credit_card', 'phone_verification', 'third_party');--> statement-breakpoint
CREATE TYPE "public"."alert_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."alert_status" AS ENUM('active', 'resolved', 'suppressed');--> statement-breakpoint
CREATE TYPE "public"."aml_check_type" AS ENUM('sanctions', 'pep', 'adverse_media', 'identity', 'source_of_funds');--> statement-breakpoint
CREATE TYPE "public"."aml_status" AS ENUM('clear', 'flagged', 'under_review', 'blocked', 'escalated');--> statement-breakpoint
CREATE TYPE "public"."analytics_event_type" AS ENUM('page_view', 'media_view', 'purchase', 'tip', 'subscription', 'message', 'like', 'comment', 'share', 'upload', 'stream_start', 'stream_end', 'nft_mint', 'nft_purchase', 'profile_view', 'search');--> statement-breakpoint
CREATE TYPE "public"."analytics_metric_type" AS ENUM('clicks', 'conversions', 'earnings', 'conversion_rate', 'lifetime_value', 'geographic', 'device', 'source');--> statement-breakpoint
CREATE TYPE "public"."analytics_timeframe" AS ENUM('hour', 'day', 'week', 'month', 'quarter', 'year');--> statement-breakpoint
CREATE TYPE "public"."announcement_status" AS ENUM('draft', 'scheduled', 'active', 'paused', 'ended', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."announcement_type" AS ENUM('system', 'feature', 'maintenance', 'promotion', 'emergency');--> statement-breakpoint
CREATE TYPE "public"."article_status" AS ENUM('draft', 'pending_review', 'published', 'archived', 'deprecated');--> statement-breakpoint
CREATE TYPE "public"."article_type" AS ENUM('guide', 'tutorial', 'faq', 'troubleshooting', 'policy', 'announcement', 'reference');--> statement-breakpoint
CREATE TYPE "public"."attribution_type" AS ENUM('first_click', 'last_click', 'multi_touch', 'time_decay');--> statement-breakpoint
CREATE TYPE "public"."ban_type" AS ENUM('temporary', 'permanent', 'shadow');--> statement-breakpoint
CREATE TYPE "public"."billing_cycle" AS ENUM('weekly', 'monthly', 'quarterly', 'annually');--> statement-breakpoint
CREATE TYPE "public"."blockchain" AS ENUM('ethereum', 'polygon', 'base', 'arbitrum', 'solana');--> statement-breakpoint
CREATE TYPE "public"."bonus_status" AS ENUM('pending', 'awarded', 'claimed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."bonus_type" AS ENUM('milestone', 'quality', 'referral', 'loyalty', 'volume', 'consistency');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."card_status" AS ENUM('pending', 'active', 'frozen', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."chart_type" AS ENUM('line', 'bar', 'pie', 'doughnut', 'area', 'gauge');--> statement-breakpoint
CREATE TYPE "public"."collaboration_status" AS ENUM('active', 'expired', 'pending', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."collaboration_type" AS ENUM('featured', 'guest', 'split', 'crosspromo', 'series', 'custom');--> statement-breakpoint
CREATE TYPE "public"."comment_status" AS ENUM('approved', 'pending', 'flagged', 'hidden', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."complaint_category" AS ENUM('content', 'user_behavior', 'technical', 'billing', 'copyright', 'harassment', 'spam', 'other');--> statement-breakpoint
CREATE TYPE "public"."complaint_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."complaint_status" AS ENUM('open', 'in_progress', 'resolved', 'closed', 'escalated');--> statement-breakpoint
CREATE TYPE "public"."consent_form_status" AS ENUM('pending', 'signed', 'expired', 'withdrawn', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."consent_form_type" AS ENUM('model_release', 'costar_consent', 'age_verification', 'custom_form');--> statement-breakpoint
CREATE TYPE "public"."consent_status" AS ENUM('granted', 'denied', 'pending', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."content_hash_algorithm" AS ENUM('md5', 'sha256', 'perceptual');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'scheduled', 'published', 'archived', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."content_visibility" AS ENUM('public', 'subscribers', 'ppv', 'private');--> statement-breakpoint
CREATE TYPE "public"."conversion_type" AS ENUM('signup', 'purchase', 'subscription', 'deposit', 'content_purchase');--> statement-breakpoint
CREATE TYPE "public"."costar_verification_status" AS ENUM('pending', 'approved', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."credit_line_status" AS ENUM('pending', 'active', 'frozen', 'defaulted', 'closed');--> statement-breakpoint
CREATE TYPE "public"."dashboard_widget_type" AS ENUM('stat_card', 'chart', 'table', 'activity_feed', 'quick_actions', 'alert_panel');--> statement-breakpoint
CREATE TYPE "public"."deepfake_report_status" AS ENUM('reported', 'under_review', 'confirmed', 'false_positive', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."delivery_status" AS ENUM('pending', 'sent', 'delivered', 'failed', 'bounced');--> statement-breakpoint
CREATE TYPE "public"."deposit_method" AS ENUM('bank_transfer', 'wire', 'crypto', 'card', 'paypal', 'stripe_transfer');--> statement-breakpoint
CREATE TYPE "public"."deposit_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'under_review');--> statement-breakpoint
CREATE TYPE "public"."dispute_status" AS ENUM('open', 'investigating', 'resolved', 'closed', 'escalated');--> statement-breakpoint
CREATE TYPE "public"."dmca_status" AS ENUM('pending', 'processed', 'rejected', 'counter_claimed');--> statement-breakpoint
CREATE TYPE "public"."earnings_status" AS ENUM('pending', 'approved', 'paid', 'disputed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."earnings_type" AS ENUM('signup_bonus', 'percentage_commission', 'fixed_commission', 'milestone_bonus', 'tier_bonus', 'campaign_bonus');--> statement-breakpoint
CREATE TYPE "public"."enhanced_transaction_type" AS ENUM('subscription', 'ppv', 'tip', 'live_token', 'shop_sale', 'nft_sale', 'collaboration', 'bonus', 'referral_commission');--> statement-breakpoint
CREATE TYPE "public"."event_access" AS ENUM('free', 'ticketed', 'subscription_only', 'tier_gated');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('scheduled', 'live', 'ended', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('public_meetup', 'private_show', 'vip_experience', 'fan_meetup', 'exclusive_stream');--> statement-breakpoint
CREATE TYPE "public"."financial_report_format" AS ENUM('pdf', 'csv', 'xlsx', 'json');--> statement-breakpoint
CREATE TYPE "public"."financial_report_type" AS ENUM('revenue', 'transactions', 'tax', 'billing', 'deposits', 'payouts', 'compliance');--> statement-breakpoint
CREATE TYPE "public"."fraud_event_type" AS ENUM('suspicious_signup', 'duplicate_device', 'ip_abuse', 'rapid_referrals', 'unusual_pattern', 'self_referral');--> statement-breakpoint
CREATE TYPE "public"."fraud_rule_type" AS ENUM('velocity', 'amount', 'geo', 'device', 'behavioral', 'pattern');--> statement-breakpoint
CREATE TYPE "public"."fraud_status" AS ENUM('flagged', 'investigating', 'confirmed', 'false_positive', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."fulfillment_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."gateway_status" AS ENUM('active', 'inactive', 'testing', 'maintenance');--> statement-breakpoint
CREATE TYPE "public"."gateway_type" AS ENUM('stripe', 'paypal', 'square', 'coinbase', 'bitpay', 'bank_transfer', 'custom');--> statement-breakpoint
CREATE TYPE "public"."holographic_mode" AS ENUM('vr', 'ar', 'mixed', '360', 'spatial');--> statement-breakpoint
CREATE TYPE "public"."holographic_quality" AS ENUM('low', 'medium', 'high', 'ultra');--> statement-breakpoint
CREATE TYPE "public"."insight_priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."insight_type" AS ENUM('price_recommendation', 'demand_forecast', 'competitor_analysis', 'revenue_optimization', 'engagement_trend', 'seasonal_pattern');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."kyc_document_type" AS ENUM('passport', 'drivers_license', 'national_id', 'utility_bill', 'bank_statement', 'tax_document');--> statement-breakpoint
CREATE TYPE "public"."leaderboard_period" AS ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'all_time');--> statement-breakpoint
CREATE TYPE "public"."leaderboard_type" AS ENUM('earnings', 'engagement', 'followers', 'content', 'tips', 'streams', 'posts');--> statement-breakpoint
CREATE TYPE "public"."ledger_entry_type" AS ENUM('debit', 'credit');--> statement-breakpoint
CREATE TYPE "public"."ledger_transaction_type" AS ENUM('payment', 'refund', 'chargeback', 'transfer', 'fee', 'payout', 'deposit', 'withdrawal', 'reward', 'credit_issued', 'credit_repaid', 'token_purchase', 'token_redemption');--> statement-breakpoint
CREATE TYPE "public"."loan_status" AS ENUM('pending', 'approved', 'active', 'completed', 'defaulted', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."lovense_action_type" AS ENUM('tip', 'manual', 'pattern', 'remote_control');--> statement-breakpoint
CREATE TYPE "public"."lovense_device_status" AS ENUM('connected', 'disconnected', 'error');--> statement-breakpoint
CREATE TYPE "public"."media_status" AS ENUM('pending', 'processing', 'approved', 'rejected', 'flagged', 'ai_reviewing', 'escalated');--> statement-breakpoint
CREATE TYPE "public"."media_variant_kind" AS ENUM('original', 'hls', 'dash', 'thumbnail', 'preview', 'watermarked');--> statement-breakpoint
CREATE TYPE "public"."message_flag_reason" AS ENUM('spam', 'harassment', 'inappropriate', 'scam', 'other');--> statement-breakpoint
CREATE TYPE "public"."message_status" AS ENUM('normal', 'flagged', 'hidden', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."message_template_type" AS ENUM('welcome', 'promotion', 'announcement', 'reminder', 'custom');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('text', 'photo', 'video', 'audio', 'tip', 'welcome');--> statement-breakpoint
CREATE TYPE "public"."milestone_type" AS ENUM('earnings', 'followers', 'content', 'engagement', 'consistency', 'referrals');--> statement-breakpoint
CREATE TYPE "public"."model_release_status" AS ENUM('pending', 'signed', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."moderation_state" AS ENUM('pending', 'approved', 'rejected', 'escalated');--> statement-breakpoint
CREATE TYPE "public"."moderation_status" AS ENUM('pending', 'approved', 'rejected', 'escalated', 'auto_approved', 'auto_rejected');--> statement-breakpoint
CREATE TYPE "public"."nft_status" AS ENUM('minting', 'minted', 'transferred', 'burned', 'failed');--> statement-breakpoint
CREATE TYPE "public"."nft_transaction_type" AS ENUM('mint', 'sale', 'transfer', 'burn');--> statement-breakpoint
CREATE TYPE "public"."notification_kind" AS ENUM('payout', 'moderation', 'kyc', 'system', 'fan_activity', 'dmca');--> statement-breakpoint
CREATE TYPE "public"."notification_platform" AS ENUM('web', 'ios', 'android', 'desktop');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."page_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."payment_method_type" AS ENUM('card', 'bank_transfer', 'crypto', 'paypal', 'stripe_connect', 'wire');--> statement-breakpoint
CREATE TYPE "public"."payout_account_status" AS ENUM('active', 'inactive', 'suspended', 'pending_verification');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'scheduled');--> statement-breakpoint
CREATE TYPE "public"."performance_tier" AS ENUM('bronze', 'silver', 'gold', 'platinum', 'diamond');--> statement-breakpoint
CREATE TYPE "public"."post_type" AS ENUM('photo', 'video', 'audio', 'text', 'reel', 'story', 'live');--> statement-breakpoint
CREATE TYPE "public"."post_visibility" AS ENUM('free', 'premium', 'subscribers_only');--> statement-breakpoint
CREATE TYPE "public"."pricing_rule_status" AS ENUM('active', 'paused', 'testing', 'archived');--> statement-breakpoint
CREATE TYPE "public"."pricing_strategy" AS ENUM('fixed', 'dynamic', 'tiered', 'auction', 'time_decay', 'demand_based', 'competitive');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'active', 'inactive', 'out_of_stock', 'discontinued');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('digital', 'physical', 'subscription', 'bundle');--> statement-breakpoint
CREATE TYPE "public"."profile_kyc_status" AS ENUM('pending', 'verified', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."profile_type" AS ENUM('creator', 'fan', 'staff', 'admin');--> statement-breakpoint
CREATE TYPE "public"."promo_code_status" AS ENUM('active', 'expired', 'exhausted', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."promo_code_type" AS ENUM('percentage', 'fixed_amount', 'free_trial');--> statement-breakpoint
CREATE TYPE "public"."proof_status" AS ENUM('pending', 'under_review', 'approved', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."purchase_status" AS ENUM('pending', 'completed', 'failed', 'refunded', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."purchase_type" AS ENUM('ppv', 'tip', 'subscription', 'bundle', 'live_stream');--> statement-breakpoint
CREATE TYPE "public"."push_delivery_status" AS ENUM('pending', 'sent', 'delivered', 'clicked', 'failed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."quest_status" AS ENUM('draft', 'active', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."quest_type" AS ENUM('revenue_goal', 'fan_contribution', 'content_unlock', 'collaborative_project');--> statement-breakpoint
CREATE TYPE "public"."record_2257_type" AS ENUM('id_verification', 'consent_form', 'model_release', 'age_verification', 'performer_agreement');--> statement-breakpoint
CREATE TYPE "public"."referral_campaign_status" AS ENUM('draft', 'active', 'paused', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."referral_code_status" AS ENUM('active', 'inactive', 'expired', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."relationship_status" AS ENUM('active', 'inactive', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."relationship_type" AS ENUM('direct', 'indirect');--> statement-breakpoint
CREATE TYPE "public"."repayment_status" AS ENUM('pending', 'paid', 'overdue', 'waived');--> statement-breakpoint
CREATE TYPE "public"."repeat_infringer_status" AS ENUM('warning', 'probation', 'suspended', 'terminated');--> statement-breakpoint
CREATE TYPE "public"."report_format" AS ENUM('pdf', 'csv', 'excel', 'json');--> statement-breakpoint
CREATE TYPE "public"."report_frequency" AS ENUM('on_demand', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'reviewing', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('spam', 'harassment', 'inappropriate_content', 'copyright', 'fake_account', 'other');--> statement-breakpoint
CREATE TYPE "public"."revenue_split_type" AS ENUM('collaborative', 'affiliate', 'referral', 'platform_fee', 'royalty');--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."role_scope" AS ENUM('global', 'tenant');--> statement-breakpoint
CREATE TYPE "public"."sanctions_status" AS ENUM('clear', 'pending', 'blocked', 'reviewing');--> statement-breakpoint
CREATE TYPE "public"."sentiment" AS ENUM('positive', 'neutral', 'negative', 'toxic');--> statement-breakpoint
CREATE TYPE "public"."storage_config_status" AS ENUM('active', 'inactive', 'testing', 'error', 'maintenance');--> statement-breakpoint
CREATE TYPE "public"."storage_health_status" AS ENUM('healthy', 'degraded', 'unhealthy', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."storage_provider" AS ENUM('aws_s3', 'digitalocean_spaces', 'wasabi', 'backblaze_b2', 'vultr_object_storage', 'pushr');--> statement-breakpoint
CREATE TYPE "public"."storage_tier" AS ENUM('hot', 'warm', 'cold', 'archive');--> statement-breakpoint
CREATE TYPE "public"."story_status" AS ENUM('active', 'expired', 'archived', 'hidden', 'flagged');--> statement-breakpoint
CREATE TYPE "public"."story_type" AS ENUM('photo', 'video', 'text', 'poll', 'question');--> statement-breakpoint
CREATE TYPE "public"."stream_status" AS ENUM('scheduled', 'live', 'ended', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."stream_type" AS ENUM('public', 'private', 'subscribers_only');--> statement-breakpoint
CREATE TYPE "public"."subscription_interval" AS ENUM('monthly', 'yearly', 'lifetime');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete');--> statement-breakpoint
CREATE TYPE "public"."suspension_reason" AS ENUM('violation', 'abuse', 'fraud', 'dmca', 'manual', 'auto_flag');--> statement-breakpoint
CREATE TYPE "public"."system_setting_category" AS ENUM('general', 'maintenance', 'email', 'theme', 'security', 'backup', 'api', 'features', 'languages', 'custom');--> statement-breakpoint
CREATE TYPE "public"."system_setting_type" AS ENUM('string', 'number', 'boolean', 'json', 'encrypted');--> statement-breakpoint
CREATE TYPE "public"."target_audience" AS ENUM('all', 'creators', 'fans', 'subscribers', 'verified', 'custom');--> statement-breakpoint
CREATE TYPE "public"."tax_calculation_method" AS ENUM('inclusive', 'exclusive', 'compound');--> statement-breakpoint
CREATE TYPE "public"."tax_document_type" AS ENUM('1099_nec', '1099_k', 'w9', 'w8ben', 'annual_summary', 'quarterly_report');--> statement-breakpoint
CREATE TYPE "public"."tax_jurisdiction" AS ENUM('us_federal', 'us_state', 'uk', 'eu', 'canada', 'australia', 'other');--> statement-breakpoint
CREATE TYPE "public"."tax_type" AS ENUM('vat', 'sales', 'gst', 'income', 'withholding', 'digital_services');--> statement-breakpoint
CREATE TYPE "public"."tenant_status" AS ENUM('active', 'inactive', 'maintenance');--> statement-breakpoint
CREATE TYPE "public"."ticket_category" AS ENUM('technical_support', 'bug_report', 'feature_request', 'billing', 'account_issues', 'compliance', 'content_policy', 'general_inquiry');--> statement-breakpoint
CREATE TYPE "public"."ticket_channel" AS ENUM('in_app', 'email', 'chat', 'api', 'phone');--> statement-breakpoint
CREATE TYPE "public"."ticket_message_type" AS ENUM('user_message', 'agent_response', 'internal_note', 'system_message', 'auto_response');--> statement-breakpoint
CREATE TYPE "public"."ticket_priority" AS ENUM('low', 'normal', 'high', 'urgent', 'critical');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('open', 'pending', 'in_progress', 'waiting_user', 'resolved', 'closed', 'escalated');--> statement-breakpoint
CREATE TYPE "public"."token_type" AS ENUM('fanzcoin', 'fanztoken', 'loyalty', 'reward', 'utility');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('subscription', 'tip', 'post_purchase', 'message_purchase', 'welcome_message', 'live_stream');--> statement-breakpoint
CREATE TYPE "public"."trust_tier" AS ENUM('unverified', 'bronze', 'silver', 'gold', 'platinum', 'diamond');--> statement-breakpoint
CREATE TYPE "public"."tutorial_difficulty" AS ENUM('beginner', 'intermediate', 'advanced', 'expert');--> statement-breakpoint
CREATE TYPE "public"."tutorial_progress_status" AS ENUM('not_started', 'in_progress', 'completed', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."tutorial_status" AS ENUM('draft', 'published', 'archived', 'maintenance');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('fan', 'creator', 'moderator', 'admin');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended', 'pending');--> statement-breakpoint
CREATE TYPE "public"."verification_check_type" AS ENUM('KYC', 'Age', 'KYB', 'Sanctions');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('pending', 'verified', 'suspicious', 'deepfake', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."version_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."voice_message_status" AS ENUM('pending', 'generating', 'completed', 'failed', 'sent');--> statement-breakpoint
CREATE TYPE "public"."voice_profile_status" AS ENUM('pending', 'cloning', 'active', 'failed', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."wallet_status" AS ENUM('active', 'frozen', 'suspended', 'closed');--> statement-breakpoint
CREATE TYPE "public"."wallet_type" AS ENUM('standard', 'business', 'creator', 'escrow', 'rewards');--> statement-breakpoint
CREATE TYPE "public"."webhook_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."device_type" AS ENUM('web', 'ios', 'android', 'desktop');--> statement-breakpoint
CREATE TYPE "public"."installation_source" AS ENUM('manual', 'prompt', 'banner', 'shortcut');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('chrome', 'firefox', 'safari', 'edge', 'samsung', 'other');--> statement-breakpoint
CREATE TYPE "public"."sync_status" AS ENUM('pending', 'syncing', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "account_identity" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" varchar NOT NULL,
	"provider" varchar NOT NULL,
	"subject" varchar NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "account_identity_provider_subject_unique" UNIQUE("provider","subject")
);
--> statement-breakpoint
CREATE TABLE "account_role" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" varchar NOT NULL,
	"role_id" varchar NOT NULL,
	"tenant_id" varchar,
	"granted_by" varchar,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "account_role_account_id_role_id_tenant_id_unique" UNIQUE("account_id","role_id","tenant_id")
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"password_hash" varchar,
	"status" "account_status" DEFAULT 'active' NOT NULL,
	"email_verified" boolean DEFAULT false,
	"phone_verified" boolean DEFAULT false,
	"last_login_at" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "ad_campaigns" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"advertiser_profile_id" varchar NOT NULL,
	"tenant_id" varchar,
	"name" varchar NOT NULL,
	"description" text,
	"type" "ad_campaign_type" DEFAULT 'content_promotion' NOT NULL,
	"status" "ad_campaign_status" DEFAULT 'draft' NOT NULL,
	"budget_cents" bigint NOT NULL,
	"daily_budget_cents" bigint,
	"currency" varchar DEFAULT 'USD' NOT NULL,
	"targeting" jsonb DEFAULT '{}'::jsonb,
	"schedule" jsonb DEFAULT '{}'::jsonb,
	"objectives" jsonb DEFAULT '{}'::jsonb,
	"spent_cents" bigint DEFAULT 0,
	"impressions" bigint DEFAULT 0,
	"clicks" bigint DEFAULT 0,
	"conversions" bigint DEFAULT 0,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ad_creatives" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"kind" "ad_creative_kind" NOT NULL,
	"asset_url" varchar,
	"thumbnail_url" varchar,
	"title" varchar,
	"description" text,
	"call_to_action" varchar,
	"click_url" text NOT NULL,
	"tracking_pixels" jsonb DEFAULT '[]'::jsonb,
	"status" "ad_creative_status" DEFAULT 'pending' NOT NULL,
	"policy_state" varchar,
	"review_notes" text,
	"metrics" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ad_impressions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"creative_id" varchar NOT NULL,
	"placement_id" varchar NOT NULL,
	"tenant_id" varchar NOT NULL,
	"profile_id" varchar,
	"request_id" varchar NOT NULL,
	"session_id" varchar,
	"ip_address" "inet",
	"user_agent" text,
	"device_info" jsonb DEFAULT '{}'::jsonb,
	"location" jsonb DEFAULT '{}'::jsonb,
	"price_micro" integer NOT NULL,
	"currency" varchar DEFAULT 'USD' NOT NULL,
	"bid_data" jsonb DEFAULT '{}'::jsonb,
	"consent" jsonb DEFAULT '{}'::jsonb,
	"view_time" integer,
	"clicked" boolean DEFAULT false,
	"converted" boolean DEFAULT false,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ad_placements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"slot" varchar NOT NULL,
	"type" "ad_placement_type" NOT NULL,
	"display_name" varchar NOT NULL,
	"description" text,
	"dimensions" jsonb DEFAULT '{}'::jsonb,
	"constraints" jsonb DEFAULT '{}'::jsonb,
	"pricing" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ad_placements_tenant_id_slot_unique" UNIQUE("tenant_id","slot")
);
--> statement-breakpoint
CREATE TABLE "admin_dashboard_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"is_default" boolean DEFAULT false,
	"layout" jsonb NOT NULL,
	"widgets" jsonb NOT NULL,
	"refresh_interval" integer DEFAULT 300,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_report_runs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" varchar NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"parameters" jsonb DEFAULT '{}'::jsonb,
	"output_url" varchar,
	"file_size" integer,
	"generated_by_id" varchar,
	"error_message" text,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_report_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"type" "admin_report_type" NOT NULL,
	"config" jsonb NOT NULL,
	"frequency" "report_frequency" DEFAULT 'on_demand' NOT NULL,
	"format" "report_format" DEFAULT 'pdf' NOT NULL,
	"recipients" text[] DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"created_by_id" varchar NOT NULL,
	"last_generated" timestamp,
	"next_scheduled" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "affiliate_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"affiliate_id" varchar NOT NULL,
	"status" "affiliate_status" DEFAULT 'pending_approval' NOT NULL,
	"tier" "affiliate_tier" DEFAULT 'bronze' NOT NULL,
	"total_clicks" integer DEFAULT 0,
	"total_conversions" integer DEFAULT 0,
	"total_earnings" numeric(15, 2) DEFAULT '0',
	"conversion_rate" numeric(5, 2) DEFAULT '0',
	"average_order_value" numeric(10, 2) DEFAULT '0',
	"lifetime_clicks" integer DEFAULT 0,
	"lifetime_conversions" integer DEFAULT 0,
	"lifetime_earnings" numeric(15, 2) DEFAULT '0',
	"period_start_date" timestamp,
	"period_clicks" integer DEFAULT 0,
	"period_conversions" integer DEFAULT 0,
	"period_earnings" numeric(15, 2) DEFAULT '0',
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"achievement_badges" text[] DEFAULT '{}',
	"payout_threshold" numeric(10, 2) DEFAULT '50.00',
	"preferred_payout_method" varchar DEFAULT 'paypal',
	"payout_schedule" varchar DEFAULT 'monthly',
	"notification_preferences" jsonb DEFAULT '{}'::jsonb,
	"custom_branding_enabled" boolean DEFAULT false,
	"logo_url" varchar,
	"website_url" varchar,
	"social_media_links" jsonb DEFAULT '{}'::jsonb,
	"approved_at" timestamp,
	"approved_by" varchar,
	"rejected_at" timestamp,
	"rejection_reason" text,
	"last_activity_at" timestamp,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "affiliate_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "affiliate_profiles_affiliate_id_unique" UNIQUE("affiliate_id")
);
--> statement-breakpoint
CREATE TABLE "age_verifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"method" "age_verification_method" NOT NULL,
	"verification_data" jsonb DEFAULT '{}'::jsonb,
	"is_verified" boolean DEFAULT false,
	"verified_at" timestamp,
	"expires_at" timestamp,
	"ip_address" varchar,
	"user_agent" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "alert_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"metric" varchar NOT NULL,
	"threshold" numeric(15, 2) NOT NULL,
	"comparison" varchar NOT NULL,
	"time_window" integer DEFAULT 300,
	"severity" "alert_severity" DEFAULT 'medium' NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"notification_channels" text[] DEFAULT '{"email"}',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_id" varchar NOT NULL,
	"message" text NOT NULL,
	"severity" "alert_severity" NOT NULL,
	"status" "alert_status" DEFAULT 'active' NOT NULL,
	"value" numeric(15, 2),
	"threshold" numeric(15, 2),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"triggered_at" timestamp DEFAULT now(),
	"resolved_at" timestamp,
	"acknowledged_by" varchar,
	"acknowledged_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "aml_checks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"check_type" "aml_check_type" NOT NULL,
	"provider" varchar NOT NULL,
	"provider_reference" varchar,
	"status" varchar DEFAULT 'pending',
	"result" varchar,
	"confidence" numeric(3, 2),
	"match_details" jsonb DEFAULT '{}'::jsonb,
	"raw_response" jsonb DEFAULT '{}'::jsonb,
	"cost_cents" integer DEFAULT 0,
	"processed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" "analytics_event_type" NOT NULL,
	"user_id" varchar,
	"session_id" varchar,
	"target_id" varchar,
	"target_type" varchar,
	"properties" jsonb DEFAULT '{}'::jsonb,
	"revenue" numeric(10, 2),
	"ip_address" varchar,
	"user_agent" text,
	"referrer" text,
	"timestamp" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "announcement_deliveries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"announcement_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"channel" varchar NOT NULL,
	"status" "delivery_status" DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"read_at" timestamp,
	"clicked_at" timestamp,
	"dismissed_at" timestamp,
	"error_message" text,
	"external_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"content" text NOT NULL,
	"type" "announcement_type" NOT NULL,
	"status" "announcement_status" DEFAULT 'draft' NOT NULL,
	"target_audience" "target_audience" DEFAULT 'all' NOT NULL,
	"custom_audience_filter" jsonb DEFAULT '{}'::jsonb,
	"channels" text[] DEFAULT '{"in_app"}',
	"priority" integer DEFAULT 1,
	"scheduled_for" timestamp,
	"expires_at" timestamp,
	"image_url" varchar,
	"link_url" varchar,
	"link_text" varchar,
	"impressions" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"dismissals" integer DEFAULT 0,
	"is_ab_test" boolean DEFAULT false,
	"ab_test_group" varchar,
	"ab_test_parent_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"key_hash" varchar NOT NULL,
	"scopes" jsonb DEFAULT '[]'::jsonb,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"actor_account_id" varchar,
	"actor_profile_id" varchar,
	"tenant_id" varchar,
	"action" varchar NOT NULL,
	"subject_table" varchar NOT NULL,
	"subject_id" varchar NOT NULL,
	"changes" jsonb DEFAULT '{}'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"ip_address" "inet",
	"user_agent" text,
	"session_id" varchar,
	"request_id" varchar,
	"severity" varchar DEFAULT 'info',
	"tags" text[] DEFAULT '{}',
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_email_recovery_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" varchar NOT NULL,
	"token_hash" varchar NOT NULL,
	"purpose" varchar DEFAULT 'recover_email' NOT NULL,
	"recovery_hint" jsonb,
	"expires_at" timestamp NOT NULL,
	"consumed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "auth_email_recovery_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "auth_email_verification_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" varchar NOT NULL,
	"token_hash" varchar NOT NULL,
	"purpose" varchar DEFAULT 'verify_email' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"consumed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "auth_email_verification_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "auth_login_attempts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" varchar,
	"ip_address" varchar NOT NULL,
	"email" varchar,
	"window_start" timestamp NOT NULL,
	"attempt_count" integer DEFAULT 1 NOT NULL,
	"blocked_until" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auth_password_reset_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" varchar NOT NULL,
	"token_hash" varchar NOT NULL,
	"purpose" varchar DEFAULT 'reset_password' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"consumed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "auth_password_reset_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"icon" varchar,
	"color" varchar,
	"criteria" jsonb,
	"reward_points" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "billing_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"company_name" varchar,
	"tax_id" varchar,
	"vat_number" varchar,
	"billing_address" jsonb NOT NULL,
	"payment_terms" integer DEFAULT 30,
	"preferred_currency" varchar DEFAULT 'USD',
	"billing_cycle" "billing_cycle" DEFAULT 'monthly',
	"credit_limit_cents" integer DEFAULT 0,
	"current_balance_cents" integer DEFAULT 0,
	"auto_pay_enabled" boolean DEFAULT false,
	"invoice_delivery_method" varchar DEFAULT 'email',
	"custom_fields" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"image_url" varchar,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cms_menu_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"menu_id" varchar NOT NULL,
	"parent_id" varchar,
	"title" varchar NOT NULL,
	"url" varchar NOT NULL,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "cms_menus" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"handle" varchar NOT NULL,
	"title" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "cms_menus_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "cms_page_sections" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"sort_order" integer NOT NULL,
	"props_json" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cms_pages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar NOT NULL,
	"title" varchar NOT NULL,
	"template" varchar DEFAULT 'page' NOT NULL,
	"status" "page_status" DEFAULT 'draft' NOT NULL,
	"seo_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "cms_pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cms_publishes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" varchar NOT NULL,
	"theme_version_id" varchar NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cms_theme_assets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"theme_version_id" varchar NOT NULL,
	"path" varchar NOT NULL,
	"storage_key" varchar NOT NULL,
	"mime_type" varchar,
	"size_bytes" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cms_theme_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"theme_version_id" varchar NOT NULL,
	"settings_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cms_theme_versions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"theme_id" varchar NOT NULL,
	"label" varchar DEFAULT 'v1' NOT NULL,
	"status" "version_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cms_themes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"is_active" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaboration_participants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collaboration_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar DEFAULT 'participant',
	"share_percentage" numeric(5, 2) NOT NULL,
	"minimum_payout" numeric(10, 2) DEFAULT '0',
	"bonus_eligible" boolean DEFAULT true,
	"total_earned" numeric(10, 2) DEFAULT '0',
	"joined_at" timestamp DEFAULT now(),
	CONSTRAINT "collaboration_user_unique" UNIQUE("collaboration_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "collaborations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"primary_creator_id" varchar NOT NULL,
	"type" "collaboration_type" NOT NULL,
	"status" "collaboration_status" DEFAULT 'active' NOT NULL,
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp,
	"total_earnings" numeric(12, 2) DEFAULT '0',
	"cross_promo_bonus" numeric(5, 4) DEFAULT '0.1',
	"automatic_split" boolean DEFAULT true,
	"custom_rules" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "comment_moderations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" varchar NOT NULL,
	"moderator_id" varchar,
	"status" "comment_status" NOT NULL,
	"reason" text,
	"auto_moderated" boolean DEFAULT false,
	"ai_confidence" integer DEFAULT 0,
	"sentiment_score" "sentiment",
	"toxicity_score" integer DEFAULT 0,
	"spam_score" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"parent_id" varchar,
	"likes_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "communication_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp NOT NULL,
	"type" varchar NOT NULL,
	"total_sent" integer DEFAULT 0,
	"total_delivered" integer DEFAULT 0,
	"total_opened" integer DEFAULT 0,
	"total_clicked" integer DEFAULT 0,
	"total_replied" integer DEFAULT 0,
	"total_reported" integer DEFAULT 0,
	"total_blocked" integer DEFAULT 0,
	"total_flagged" integer DEFAULT 0,
	"total_approved" integer DEFAULT 0,
	"total_rejected" integer DEFAULT 0,
	"auto_moderation_accuracy" numeric(5, 2),
	"average_engagement_rate" numeric(5, 2),
	"average_sentiment_score" numeric(5, 2),
	"toxic_content_percentage" numeric(5, 2),
	"spam_detection_rate" numeric(5, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "complaint_comments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"complaint_id" varchar NOT NULL,
	"author_id" varchar NOT NULL,
	"content" text NOT NULL,
	"is_internal" boolean DEFAULT true,
	"attachment_urls" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "complaints" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submitter_id" varchar NOT NULL,
	"subject_user_id" varchar,
	"subject_content_id" varchar,
	"category" "complaint_category" NOT NULL,
	"priority" "complaint_priority" DEFAULT 'medium' NOT NULL,
	"status" "complaint_status" DEFAULT 'open' NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"evidence_urls" text[] DEFAULT '{}',
	"assigned_to_id" varchar,
	"internal_notes" text,
	"resolution" text,
	"resolved_at" timestamp,
	"resolved_by_id" varchar,
	"escalated_at" timestamp,
	"escalated_by_id" varchar,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consent_form_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" "consent_form_type" NOT NULL,
	"version" varchar DEFAULT '1.0',
	"description" text,
	"form_data" jsonb NOT NULL,
	"legal_text" text NOT NULL,
	"requirements" jsonb DEFAULT '{}'::jsonb,
	"expiration_days" integer DEFAULT 365,
	"is_active" boolean DEFAULT true,
	"is_required" boolean DEFAULT false,
	"jurisdiction" varchar DEFAULT 'US',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consent_forms" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"costar_user_id" varchar,
	"status" "consent_form_status" DEFAULT 'pending' NOT NULL,
	"form_data" jsonb NOT NULL,
	"documents_uploaded" text[] DEFAULT '{}',
	"digital_signature" text,
	"ip_address" varchar,
	"signed_at" timestamp,
	"expires_at" timestamp,
	"withdrawn_at" timestamp,
	"withdrawal_reason" text,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"review_notes" text,
	"notifications_sent" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consent_notification_schedule" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consent_form_id" varchar NOT NULL,
	"notification_type" varchar NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"sent_at" timestamp,
	"status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_profile_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"caption" text,
	"description" text,
	"price_cents" integer DEFAULT 0,
	"visibility" "content_visibility" DEFAULT 'public' NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"canonical_tenant" varchar NOT NULL,
	"tags" text[] DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"analytics" jsonb DEFAULT '{}'::jsonb,
	"scheduled_for" timestamp,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_hashes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hash" varchar NOT NULL,
	"algorithm" "content_hash_algorithm" NOT NULL,
	"media_asset_id" varchar NOT NULL,
	"dmca_request_id" varchar,
	"blocked_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_tenant_map" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_id" varchar NOT NULL,
	"tenant_id" varchar NOT NULL,
	"status" "content_status" DEFAULT 'published' NOT NULL,
	"customization" jsonb DEFAULT '{}'::jsonb,
	"published_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "content_tenant_map_content_id_tenant_id_unique" UNIQUE("content_id","tenant_id")
);
--> statement-breakpoint
CREATE TABLE "content_verification" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_url" varchar NOT NULL,
	"content_type" varchar NOT NULL,
	"creator_id" varchar,
	"status" "verification_status" DEFAULT 'pending' NOT NULL,
	"confidence_score" numeric(5, 2),
	"ai_analysis" jsonb DEFAULT '{}'::jsonb,
	"matched_verified_content_id" varchar,
	"similarity_score" numeric(5, 2),
	"detection_method" varchar,
	"flags" jsonb DEFAULT '[]'::jsonb,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "costar_verifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_id" varchar,
	"live_stream_id" varchar,
	"primary_creator_id" varchar NOT NULL,
	"co_star_user_id" varchar,
	"co_star_email" varchar,
	"status" "costar_verification_status" DEFAULT 'pending' NOT NULL,
	"invite_token" varchar,
	"consent_document_2257_id" varchar,
	"signed_at" timestamp,
	"kyc_verification_id" varchar,
	"notes" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "costar_verifications_invite_token_unique" UNIQUE("invite_token")
);
--> statement-breakpoint
CREATE TABLE "creator_profiles" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"monthly_price_cents" integer DEFAULT 0 NOT NULL,
	"is_verified" boolean DEFAULT false,
	"verification_badge" varchar DEFAULT 'none',
	"cover_image_url" varchar,
	"social_profiles" jsonb DEFAULT '{}'::jsonb,
	"welcome_message_enabled" boolean DEFAULT false,
	"welcome_message_text" text,
	"welcome_message_price_cents" integer DEFAULT 0,
	"categories" text[] DEFAULT '{}',
	"total_earnings_cents" integer DEFAULT 0,
	"total_subscribers" integer DEFAULT 0,
	"is_online" boolean DEFAULT false,
	"last_active_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custodian_of_records" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"title" varchar NOT NULL,
	"business_name" varchar NOT NULL,
	"address" text NOT NULL,
	"phone" varchar NOT NULL,
	"email" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dashboard_charts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"chart_type" varchar NOT NULL,
	"vega_lite_spec" jsonb NOT NULL,
	"data_source" varchar NOT NULL,
	"filters" jsonb DEFAULT '{}'::jsonb,
	"refresh_interval" integer DEFAULT 60,
	"is_public" boolean DEFAULT false,
	"position" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deepfake_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reported_content_url" varchar NOT NULL,
	"reported_content_type" varchar NOT NULL,
	"impersonated_creator_id" varchar NOT NULL,
	"reported_by" varchar,
	"report_source" varchar NOT NULL,
	"status" "deepfake_report_status" DEFAULT 'reported' NOT NULL,
	"verification_id" varchar,
	"description" text,
	"evidence" jsonb DEFAULT '{}'::jsonb,
	"action_taken" varchar,
	"assigned_to" varchar,
	"resolved_by" varchar,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "delegated_permissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"granted_by" varchar NOT NULL,
	"permission" "admin_permission" NOT NULL,
	"granted" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	CONSTRAINT "unique_user_permission" UNIQUE("user_id","permission")
);
--> statement-breakpoint
CREATE TABLE "deposit_methods" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"method" "deposit_method" NOT NULL,
	"account_details" jsonb NOT NULL,
	"verification_status" varchar DEFAULT 'pending',
	"verification_documents" jsonb DEFAULT '{}'::jsonb,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"minimum_deposit_cents" integer DEFAULT 1000,
	"maximum_deposit_cents" integer DEFAULT 1000000,
	"fee_structure" jsonb DEFAULT '{}'::jsonb,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deposits" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"deposit_method_id" varchar,
	"reference_number" varchar NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" varchar DEFAULT 'USD',
	"exchange_rate" numeric(10, 6),
	"converted_amount_cents" integer,
	"fee_cents" integer DEFAULT 0,
	"net_amount_cents" integer NOT NULL,
	"status" "deposit_status" DEFAULT 'pending',
	"aml_status" "aml_status" DEFAULT 'clear',
	"risk_score" integer DEFAULT 0,
	"gateway_id" varchar,
	"external_reference" varchar,
	"processed_by" varchar,
	"processed_at" timestamp,
	"notes" text,
	"fraud_analysis" jsonb DEFAULT '{}'::jsonb,
	"compliance_checks" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "deposits_reference_number_unique" UNIQUE("reference_number")
);
--> statement-breakpoint
CREATE TABLE "dispute_cases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filed_by" varchar NOT NULL,
	"against_user" varchar,
	"dispute_type" varchar NOT NULL,
	"status" "dispute_status" DEFAULT 'open' NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"evidence_urls" text[] DEFAULT '{}',
	"related_transaction_ids" text[] DEFAULT '{}',
	"related_content_ids" text[] DEFAULT '{}',
	"assigned_to" varchar,
	"resolution" text,
	"resolved_at" timestamp,
	"ruling_in_favor_of" varchar,
	"compensation_amount_cents" bigint,
	"ai_recommended_action" varchar,
	"ai_confidence_score" integer,
	"ai_reasoning" jsonb DEFAULT '{}'::jsonb,
	"auto_resolved" boolean DEFAULT false,
	"escalated_to_human" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"filed_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dmca_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"complaint_id" varchar NOT NULL,
	"complainant_name" varchar NOT NULL,
	"complainant_email" varchar NOT NULL,
	"complainant_address" text NOT NULL,
	"copyright_owner" varchar NOT NULL,
	"work_description" text NOT NULL,
	"infringement_urls" text[] NOT NULL,
	"user_id" varchar NOT NULL,
	"media_asset_id" varchar,
	"status" "dmca_status" DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp DEFAULT now(),
	"processed_at" timestamp,
	"processor_id" varchar,
	"legal_hold_applied" boolean DEFAULT false,
	"content_hash" varchar,
	"counter_notification" jsonb,
	"counter_submitted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "dmca_requests_complaint_id_unique" UNIQUE("complaint_id")
);
--> statement-breakpoint
CREATE TABLE "earnings_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"period" varchar NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"gross_revenue" numeric(12, 2) DEFAULT '0',
	"net_earnings" numeric(12, 2) DEFAULT '0',
	"platform_fees" numeric(10, 2) DEFAULT '0',
	"processor_fees" numeric(10, 2) DEFAULT '0',
	"bonus_earnings" numeric(10, 2) DEFAULT '0',
	"tax_withholdings" numeric(10, 2) DEFAULT '0',
	"transaction_count" integer DEFAULT 0,
	"unique_customers" integer DEFAULT 0,
	"average_transaction_value" numeric(10, 2) DEFAULT '0',
	"top_content_earnings" jsonb DEFAULT '[]'::jsonb,
	"performance_tier" "performance_tier",
	"growth_rate" numeric(7, 4),
	"projected_next_period" numeric(12, 2),
	"trend_direction" varchar,
	"seasonality_factor" numeric(5, 4) DEFAULT '1.0',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"calculated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "earnings_analytics_user_period_unique" UNIQUE("user_id","period","period_start")
);
--> statement-breakpoint
CREATE TABLE "email_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"smtp_host" varchar NOT NULL,
	"smtp_port" integer DEFAULT 587,
	"smtp_security" varchar DEFAULT 'tls',
	"smtp_username" varchar,
	"smtp_password" text,
	"from_name" varchar NOT NULL,
	"from_email" varchar NOT NULL,
	"reply_to_email" varchar,
	"max_send_rate" integer DEFAULT 100,
	"enable_tracking" boolean DEFAULT true,
	"enable_bounce_handling" boolean DEFAULT true,
	"header_html" text,
	"footer_html" text,
	"unsubscribe_html" text,
	"last_tested_at" timestamp,
	"test_results" jsonb DEFAULT '{}'::jsonb,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "email_settings_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "enhanced_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" "enhanced_transaction_type" NOT NULL,
	"gross_amount" numeric(10, 2) NOT NULL,
	"platform_fee" numeric(10, 2) DEFAULT '0',
	"processor_fee" numeric(10, 2) NOT NULL,
	"fee_reduction" numeric(10, 2) DEFAULT '0',
	"net_earnings" numeric(10, 2) NOT NULL,
	"bonus_amount" numeric(10, 2) DEFAULT '0',
	"tax_withholding" numeric(10, 2) DEFAULT '0',
	"source_id" varchar,
	"content_id" varchar,
	"collaboration_id" varchar,
	"performance_tier" "performance_tier",
	"volume_discount" numeric(5, 4) DEFAULT '0',
	"quality_multiplier" numeric(3, 2) DEFAULT '1.0',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"processed_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_attendance" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"joined_at" timestamp DEFAULT now(),
	"left_at" timestamp,
	"duration_seconds" integer DEFAULT 0,
	"avatar_url" varchar,
	"position_x" numeric,
	"position_y" numeric,
	"position_z" numeric,
	"is_active" boolean DEFAULT true,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_nft_souvenirs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"token_id" varchar,
	"name" varchar NOT NULL,
	"description" text,
	"image_url" varchar NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb,
	"rarity" varchar,
	"serial_number" integer,
	"chain_id" varchar,
	"contract_address" varchar,
	"transaction_hash" varchar,
	"minted_at" timestamp DEFAULT now(),
	"claimed_at" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "event_nft_souvenirs_token_id_unique" UNIQUE("token_id"),
	CONSTRAINT "event_nft_souvenirs_event_id_user_id_unique" UNIQUE("event_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "event_tickets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" varchar NOT NULL,
	"fan_id" varchar NOT NULL,
	"price_paid_cents" bigint NOT NULL,
	"payment_method" varchar,
	"transaction_id" varchar,
	"purchased_at" timestamp DEFAULT now(),
	"used_at" timestamp,
	"refunded_at" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "event_tickets_event_id_fan_id_unique" UNIQUE("event_id","fan_id")
);
--> statement-breakpoint
CREATE TABLE "event_tips" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" varchar NOT NULL,
	"from_user_id" varchar NOT NULL,
	"to_user_id" varchar NOT NULL,
	"amount_cents" bigint NOT NULL,
	"message" text,
	"is_anonymous" boolean DEFAULT false,
	"transaction_id" varchar,
	"show_on_screen" boolean DEFAULT true,
	"highlight_color" varchar,
	"tipped_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fan_creator_loans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lender_id" varchar NOT NULL,
	"borrower_id" varchar NOT NULL,
	"principal_cents" bigint NOT NULL,
	"interest_rate_bps" integer NOT NULL,
	"term_days" integer NOT NULL,
	"total_due_cents" bigint NOT NULL,
	"status" "loan_status" DEFAULT 'pending' NOT NULL,
	"installment_count" integer DEFAULT 1,
	"installment_frequency" varchar DEFAULT 'monthly',
	"collateral_type" varchar,
	"collateral_value_cents" bigint,
	"collateral_metadata" jsonb DEFAULT '{}'::jsonb,
	"trust_score" integer DEFAULT 0,
	"risk_tier" varchar DEFAULT 'standard',
	"lender_wallet_id" varchar,
	"borrower_wallet_id" varchar,
	"requested_at" timestamp DEFAULT now(),
	"approved_at" timestamp,
	"approved_by" varchar,
	"disbursed_at" timestamp,
	"due_date" timestamp,
	"completed_at" timestamp,
	"defaulted_at" timestamp,
	"amount_paid_cents" bigint DEFAULT 0,
	"amount_outstanding_cents" bigint,
	"last_payment_at" timestamp,
	"purpose" text,
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fanz_cards" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"wallet_id" varchar NOT NULL,
	"card_number_hash" varchar NOT NULL,
	"last_4" varchar NOT NULL,
	"expiry_month" integer NOT NULL,
	"expiry_year" integer NOT NULL,
	"cvv_hash" varchar NOT NULL,
	"cardholder_name" varchar NOT NULL,
	"card_type" varchar DEFAULT 'virtual',
	"card_brand" varchar DEFAULT 'fanzcard',
	"status" "card_status" DEFAULT 'pending' NOT NULL,
	"daily_spend_limit_cents" bigint,
	"monthly_spend_limit_cents" bigint,
	"per_transaction_limit_cents" bigint,
	"total_spent_cents" bigint DEFAULT 0,
	"total_transactions" integer DEFAULT 0,
	"last_used_at" timestamp,
	"allowed_merchant_categories" text[],
	"blocked_merchant_categories" text[],
	"allowed_countries" text[],
	"provider_card_id" varchar,
	"provider_metadata" jsonb DEFAULT '{}'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"activated_at" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fanz_credit_lines" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"status" "credit_line_status" DEFAULT 'pending' NOT NULL,
	"credit_limit_cents" bigint NOT NULL,
	"available_credit_cents" bigint NOT NULL,
	"used_credit_cents" bigint DEFAULT 0,
	"interest_rate_bps" integer DEFAULT 0,
	"late_fee_percent_bps" integer DEFAULT 500,
	"trust_score" integer DEFAULT 0,
	"risk_tier" varchar DEFAULT 'standard',
	"payment_due_days" integer DEFAULT 30,
	"grace_period_days" integer DEFAULT 7,
	"collateral_type" varchar,
	"collateral_value_cents" bigint,
	"collateral_metadata" jsonb DEFAULT '{}'::jsonb,
	"approved_at" timestamp,
	"approved_by" varchar,
	"closed_at" timestamp,
	"closed_reason" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fanz_ledger" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" varchar NOT NULL,
	"parent_transaction_id" varchar,
	"wallet_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"entry_type" "ledger_entry_type" NOT NULL,
	"transaction_type" "ledger_transaction_type" NOT NULL,
	"amount_cents" bigint NOT NULL,
	"balance_after_cents" bigint NOT NULL,
	"currency" varchar DEFAULT 'USD',
	"reference_type" varchar,
	"reference_id" varchar,
	"description" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"ip_address" "inet",
	"user_agent" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "fanz_ledger_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
CREATE TABLE "fanz_revenue_shares" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference_type" varchar NOT NULL,
	"reference_id" varchar NOT NULL,
	"split_type" "revenue_split_type" NOT NULL,
	"total_revenue_cents" bigint NOT NULL,
	"splits" jsonb NOT NULL,
	"status" varchar DEFAULT 'pending',
	"processed_at" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fanz_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"token_type" "token_type" NOT NULL,
	"balance" bigint DEFAULT 0,
	"locked_balance" bigint DEFAULT 0,
	"value_cents_per_token" integer DEFAULT 100,
	"rewards_multiplier" numeric(5, 2) DEFAULT '1.00',
	"expires_at" timestamp,
	"last_transaction_at" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "fanz_tokens_user_id_token_type_unique" UNIQUE("user_id","token_type")
);
--> statement-breakpoint
CREATE TABLE "fanz_wallets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" "wallet_type" DEFAULT 'standard' NOT NULL,
	"status" "wallet_status" DEFAULT 'active' NOT NULL,
	"available_balance_cents" bigint DEFAULT 0,
	"pending_balance_cents" bigint DEFAULT 0,
	"held_balance_cents" bigint DEFAULT 0,
	"total_balance_cents" bigint DEFAULT 0,
	"currency" varchar DEFAULT 'USD',
	"daily_limit_cents" bigint DEFAULT 100000000,
	"monthly_limit_cents" bigint DEFAULT 500000000,
	"lifetime_limit_cents" bigint,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"freeze_reason" text,
	"frozen_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "faq_entries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category_id" varchar,
	"tags" text[] DEFAULT '{}',
	"sort_order" integer DEFAULT 0,
	"is_visible" boolean DEFAULT true,
	"view_count" integer DEFAULT 0,
	"helpful_votes" integer DEFAULT 0,
	"not_helpful_votes" integer DEFAULT 0,
	"author_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feed_preferences" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"personalized_enabled" boolean DEFAULT true,
	"ai_recommendations" boolean DEFAULT true,
	"content_tags" text[] DEFAULT '{}',
	"excluded_tags" text[] DEFAULT '{}',
	"followed_creators" text[] DEFAULT '{}',
	"blocked_users" text[] DEFAULT '{}',
	"age_verification_status" boolean DEFAULT false,
	"show_blurred_content" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "financial_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" "financial_report_type" NOT NULL,
	"format" "financial_report_format" DEFAULT 'pdf',
	"schedule" varchar,
	"parameters" jsonb DEFAULT '{}'::jsonb,
	"filters" jsonb DEFAULT '{}'::jsonb,
	"generated_by" varchar,
	"generated_at" timestamp,
	"file_url" varchar,
	"file_size" integer,
	"record_count" integer,
	"status" varchar DEFAULT 'pending',
	"error" text,
	"is_automated" boolean DEFAULT false,
	"retention_days" integer DEFAULT 365,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "financial_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"setting_key" varchar NOT NULL,
	"setting_value" jsonb NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"is_encrypted" boolean DEFAULT false,
	"last_modified_by" varchar,
	"validation_rules" jsonb DEFAULT '{}'::jsonb,
	"effective_from" timestamp DEFAULT now(),
	"effective_to" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "financial_settings_setting_key_unique" UNIQUE("setting_key")
);
--> statement-breakpoint
CREATE TABLE "fraud_alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" varchar,
	"deposit_id" varchar,
	"user_id" varchar NOT NULL,
	"rule_id" varchar,
	"risk_score" integer NOT NULL,
	"risk_level" "risk_level" NOT NULL,
	"status" varchar DEFAULT 'pending',
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"resolution" varchar,
	"notes" text,
	"trigger_data" jsonb NOT NULL,
	"actions_taken" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fraud_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" "fraud_rule_type" NOT NULL,
	"risk_level" "risk_level" NOT NULL,
	"is_active" boolean DEFAULT true,
	"conditions" jsonb NOT NULL,
	"actions" jsonb NOT NULL,
	"score_adjustment" integer DEFAULT 0,
	"block_transaction" boolean DEFAULT false,
	"require_manual_review" boolean DEFAULT false,
	"notify_admin" boolean DEFAULT false,
	"priority" integer DEFAULT 0,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "holographic_avatars" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"model_type" varchar DEFAULT 'humanoid',
	"model_url" varchar,
	"texture_url" varchar,
	"body_preset" varchar,
	"face_preset" varchar,
	"color_scheme" jsonb DEFAULT '{}'::jsonb,
	"accessories" jsonb DEFAULT '[]'::jsonb,
	"idle_animation" varchar DEFAULT 'standing',
	"gesture_animations" jsonb DEFAULT '{}'::jsonb,
	"emotion_animations" jsonb DEFAULT '{}'::jsonb,
	"voice_profile_url" varchar,
	"spatial_audio_settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "holographic_avatars_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "holographic_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"holographic_stream_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"device_type" varchar,
	"browser_agent" varchar,
	"webxr_mode" varchar,
	"is_active" boolean DEFAULT true,
	"render_quality" "holographic_quality" DEFAULT 'medium',
	"current_frame_rate" integer,
	"latency_ms" integer,
	"avatar_position" jsonb,
	"avatar_rotation" jsonb,
	"view_direction" jsonb,
	"hands_tracked" boolean DEFAULT false,
	"eye_gaze_tracked" boolean DEFAULT false,
	"gesture_data" jsonb DEFAULT '{}'::jsonb,
	"joined_at" timestamp DEFAULT now(),
	"last_activity_at" timestamp DEFAULT now(),
	"left_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "holographic_streams" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"live_stream_id" varchar NOT NULL,
	"mode" "holographic_mode" DEFAULT 'vr' NOT NULL,
	"quality" "holographic_quality" DEFAULT 'medium' NOT NULL,
	"webxr_session_id" varchar,
	"spatial_audio_enabled" boolean DEFAULT true,
	"hand_tracking_enabled" boolean DEFAULT false,
	"eye_tracking_enabled" boolean DEFAULT false,
	"environment_preset" varchar DEFAULT 'studio',
	"custom_environment_url" varchar,
	"lighting_preset" varchar DEFAULT 'balanced',
	"max_concurrent_viewers" integer DEFAULT 50,
	"min_frame_rate" integer DEFAULT 60,
	"adaptive_quality" boolean DEFAULT true,
	"avatar_interaction_enabled" boolean DEFAULT true,
	"gesture_controls_enabled" boolean DEFAULT true,
	"voice_commands_enabled" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "holographic_streams_live_stream_id_unique" UNIQUE("live_stream_id")
);
--> statement-breakpoint
CREATE TABLE "identity_verifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" varchar NOT NULL,
	"profile_id" varchar,
	"vendor" varchar NOT NULL,
	"check_type" "verification_check_type" NOT NULL,
	"status" "verification_status" DEFAULT 'pending' NOT NULL,
	"external_id" varchar,
	"result" jsonb DEFAULT '{}'::jsonb,
	"documents" jsonb DEFAULT '{}'::jsonb,
	"biometrics" jsonb DEFAULT '{}'::jsonb,
	"sanctions" jsonb DEFAULT '{}'::jsonb,
	"risk_score" integer,
	"failure_reason" text,
	"review_notes" text,
	"reviewed_by" varchar,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" varchar NOT NULL,
	"billing_profile_id" varchar NOT NULL,
	"customer_id" varchar NOT NULL,
	"status" "invoice_status" DEFAULT 'draft',
	"subtotal_cents" integer NOT NULL,
	"tax_cents" integer DEFAULT 0,
	"discount_cents" integer DEFAULT 0,
	"total_cents" integer NOT NULL,
	"currency" varchar DEFAULT 'USD',
	"due_date" timestamp NOT NULL,
	"paid_at" timestamp,
	"payment_reference" varchar,
	"notes" text,
	"line_items" jsonb NOT NULL,
	"tax_breakdown" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "kyc_documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"document_type" "kyc_document_type" NOT NULL,
	"front_image_url" varchar,
	"back_image_url" varchar,
	"extracted_data" jsonb DEFAULT '{}'::jsonb,
	"verification_status" varchar DEFAULT 'pending',
	"verification_provider" varchar,
	"verification_reference" varchar,
	"rejection_reason" text,
	"expiry_date" timestamp,
	"issuing_country" varchar,
	"document_number" varchar,
	"uploaded_at" timestamp DEFAULT now(),
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leaderboard_achievements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"badge_icon" varchar,
	"badge_color" varchar,
	"leaderboard_type" "leaderboard_type",
	"requirement" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leaderboard_entries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"leaderboard_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"score" numeric(15, 2) NOT NULL,
	"rank" integer NOT NULL,
	"previous_rank" integer,
	"rank_change" integer DEFAULT 0,
	"bonus" numeric(10, 2) DEFAULT '0',
	"badge" varchar,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_leaderboard_user_period" UNIQUE("leaderboard_id","user_id","period_start")
);
--> statement-breakpoint
CREATE TABLE "leaderboards" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" "leaderboard_type" NOT NULL,
	"period" "leaderboard_period" NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"is_public" boolean DEFAULT true,
	"max_entries" integer DEFAULT 100,
	"scoring_algorithm" jsonb DEFAULT '{}'::jsonb,
	"weights" jsonb DEFAULT '{}'::jsonb,
	"criteria" jsonb DEFAULT '{}'::jsonb,
	"prizes_enabled" boolean DEFAULT false,
	"prize_structure" jsonb DEFAULT '{}'::jsonb,
	"reset_frequency" varchar DEFAULT 'weekly',
	"last_reset_at" timestamp,
	"next_reset_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"post_id" varchar,
	"comment_id" varchar,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "likes_user_id_post_id_unique" UNIQUE("user_id","post_id"),
	CONSTRAINT "likes_user_id_comment_id_unique" UNIQUE("user_id","comment_id"),
	CONSTRAINT "chk_like_exactly_one" CHECK ((post_id IS NOT NULL)::int + (comment_id IS NOT NULL)::int = 1)
);
--> statement-breakpoint
CREATE TABLE "live_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"event_type" "event_type" NOT NULL,
	"status" "event_status" DEFAULT 'scheduled' NOT NULL,
	"access_type" "event_access" DEFAULT 'free' NOT NULL,
	"scheduled_start_at" timestamp NOT NULL,
	"scheduled_end_at" timestamp NOT NULL,
	"actual_start_at" timestamp,
	"actual_end_at" timestamp,
	"ticket_price_cents" bigint DEFAULT 0,
	"max_attendees" integer,
	"virtual_room_url" varchar,
	"background_asset_url" varchar,
	"avatar_enabled" boolean DEFAULT true,
	"spatial_audio_enabled" boolean DEFAULT true,
	"nft_souvenir_enabled" boolean DEFAULT false,
	"nft_souvenir_name" varchar,
	"nft_souvenir_description" text,
	"nft_souvenir_image_url" varchar,
	"total_revenue_cents" bigint DEFAULT 0,
	"total_tips_cents" bigint DEFAULT 0,
	"total_attendees" integer DEFAULT 0,
	"peak_concurrent_viewers" integer DEFAULT 0,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "live_streams" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"type" "stream_type" DEFAULT 'public' NOT NULL,
	"status" "stream_status" DEFAULT 'scheduled' NOT NULL,
	"price_cents" integer DEFAULT 0,
	"stream_key" varchar,
	"stream_url" varchar,
	"thumbnail_url" varchar,
	"getstream_call_id" varchar,
	"recording_url" varchar,
	"playback_url" varchar,
	"hls_playlist_url" varchar,
	"rtmp_ingest_url" varchar,
	"viewers_count" integer DEFAULT 0,
	"max_viewers" integer DEFAULT 0,
	"total_tips_cents" integer DEFAULT 0,
	"scheduled_for" timestamp,
	"started_at" timestamp,
	"ended_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "loan_repayments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_id" varchar NOT NULL,
	"installment_number" integer NOT NULL,
	"amount_due_cents" bigint NOT NULL,
	"amount_paid_cents" bigint DEFAULT 0,
	"due_date" timestamp NOT NULL,
	"paid_at" timestamp,
	"status" "repayment_status" DEFAULT 'pending' NOT NULL,
	"late_fee_applied_cents" bigint DEFAULT 0,
	"transaction_id" varchar,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lovense_accounts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"auth_type" varchar DEFAULT 'qr_code' NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"token_expiry" timestamp,
	"qr_code_data" jsonb DEFAULT '{}'::jsonb,
	"connection_status" varchar DEFAULT 'disconnected' NOT NULL,
	"last_connected_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "idx_lovense_accounts_user" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "lovense_device_actions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" varchar NOT NULL,
	"stream_id" varchar,
	"triggered_by_user_id" varchar,
	"action_type" "lovense_action_type" NOT NULL,
	"intensity" integer,
	"duration" integer,
	"pattern" varchar,
	"tip_amount_cents" integer,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lovense_devices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" varchar NOT NULL,
	"device_id" varchar NOT NULL,
	"device_name" varchar NOT NULL,
	"device_type" varchar NOT NULL,
	"status" "lovense_device_status" DEFAULT 'disconnected' NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"battery_level" integer,
	"last_connected" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lovense_integration_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" varchar NOT NULL,
	"is_enabled" boolean DEFAULT false,
	"connect_app_token" varchar,
	"domain_key" varchar,
	"tip_minimum_cents" integer DEFAULT 100,
	"tip_maximum_cents" integer DEFAULT 10000,
	"intensity_mapping" jsonb DEFAULT '{}'::jsonb,
	"allow_remote_control" boolean DEFAULT false,
	"allow_patterns" boolean DEFAULT true,
	"custom_patterns" jsonb DEFAULT '{}'::jsonb,
	"last_sync" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "lovense_integration_settings_creator_id_unique" UNIQUE("creator_id")
);
--> statement-breakpoint
CREATE TABLE "lovense_mappings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"event_type" varchar NOT NULL,
	"trigger_value" integer,
	"pattern" varchar NOT NULL,
	"intensity" integer DEFAULT 5 NOT NULL,
	"duration" integer DEFAULT 3 NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lovense_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"session_id" varchar NOT NULL,
	"stream_id" varchar,
	"connection_status" varchar DEFAULT 'connecting' NOT NULL,
	"client_info" jsonb DEFAULT '{}'::jsonb,
	"last_ping_at" timestamp,
	"connected_at" timestamp,
	"disconnected_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "lovense_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "maintenance_schedule" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"maintenance_type" varchar NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"timezone" varchar DEFAULT 'UTC',
	"status" varchar DEFAULT 'scheduled' NOT NULL,
	"actual_start_time" timestamp,
	"actual_end_time" timestamp,
	"enable_maintenance_mode" boolean DEFAULT true,
	"custom_message" text,
	"allow_admin_access" boolean DEFAULT true,
	"redirect_url" varchar,
	"notify_users" boolean DEFAULT true,
	"notification_channels" text[] DEFAULT ARRAY['in_app', 'email'],
	"notify_hours_before" integer DEFAULT 24,
	"last_notification_sent" timestamp,
	"affected_services" text[] DEFAULT ARRAY['all'],
	"expected_impact" varchar DEFAULT 'full_outage',
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mass_message_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"type" "message_template_type" NOT NULL,
	"subject" varchar,
	"content" text NOT NULL,
	"media_url" varchar,
	"price_cents" integer DEFAULT 0,
	"target_audience" "target_audience" DEFAULT 'all' NOT NULL,
	"custom_audience_filter" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"times_used" integer DEFAULT 0,
	"average_response_rate" numeric(5, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_2257_links" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_id" varchar NOT NULL,
	"record_2257_id" varchar NOT NULL,
	"role" varchar DEFAULT 'primary' NOT NULL,
	"user_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "idx_media_2257_media_record" UNIQUE("media_id","record_2257_id")
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_id" varchar,
	"owner_id" varchar NOT NULL,
	"title" varchar,
	"description" text,
	"storage_key" varchar NOT NULL,
	"mime_type" varchar NOT NULL,
	"file_size" bigint NOT NULL,
	"duration" integer,
	"width" integer,
	"height" integer,
	"checksum_sha256" varchar NOT NULL,
	"perceptual_hash" varchar,
	"forensic_watermark" jsonb DEFAULT '{}'::jsonb,
	"forensic_signature" text,
	"watermarked" boolean DEFAULT false,
	"watermarked_at" timestamp,
	"status" "media_status" DEFAULT 'pending' NOT NULL,
	"moderation_state" "moderation_state" DEFAULT 'pending' NOT NULL,
	"ai_analysis" jsonb DEFAULT '{}'::jsonb,
	"risk_score" integer DEFAULT 0,
	"flags" jsonb DEFAULT '{}'::jsonb,
	"content_tags" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_variants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" varchar NOT NULL,
	"tenant_id" varchar,
	"kind" "media_variant_kind" NOT NULL,
	"storage_key" varchar NOT NULL,
	"mime_type" varchar,
	"file_size" bigint,
	"quality" varchar,
	"drm_key_id" varchar,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "media_variants_asset_id_tenant_id_kind_unique" UNIQUE("asset_id","tenant_id","kind")
);
--> statement-breakpoint
CREATE TABLE "message_moderations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" varchar NOT NULL,
	"reporter_id" varchar,
	"moderator_id" varchar,
	"status" "message_status" NOT NULL,
	"flag_reason" "message_flag_reason",
	"notes" text,
	"auto_flagged" boolean DEFAULT false,
	"review_required" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender_id" varchar NOT NULL,
	"receiver_id" varchar NOT NULL,
	"type" "message_type" DEFAULT 'text' NOT NULL,
	"content" text,
	"media_url" varchar,
	"price_cents" integer DEFAULT 0,
	"is_paid" boolean DEFAULT false,
	"is_mass_message" boolean DEFAULT false,
	"read_at" timestamp,
	"delivered_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "model_releases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_id" varchar NOT NULL,
	"performer_profile_id" varchar NOT NULL,
	"creator_profile_id" varchar NOT NULL,
	"tenant_id" varchar NOT NULL,
	"status" "model_release_status" DEFAULT 'pending' NOT NULL,
	"release_type" varchar NOT NULL,
	"signed_at" timestamp,
	"expires_at" timestamp,
	"revoked_at" timestamp,
	"documents" jsonb DEFAULT '{}'::jsonb,
	"terms" jsonb DEFAULT '{}'::jsonb,
	"compensation" jsonb DEFAULT '{}'::jsonb,
	"jurisdiction" varchar,
	"ip_address" "inet",
	"user_agent" text,
	"digital_signature" text,
	"witness_info" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "moderation_queue" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_id" varchar NOT NULL,
	"reason" text,
	"status" "moderation_status" DEFAULT 'pending' NOT NULL,
	"reviewer_id" varchar,
	"notes" text,
	"decided_at" timestamp,
	"ai_recommendation" varchar,
	"ai_confidence" integer,
	"escalation_reason" text,
	"priority" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "navigation_paths" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"session_id" varchar,
	"path" varchar NOT NULL,
	"title" varchar,
	"timestamp" timestamp DEFAULT now(),
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "nft_assets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_asset_id" varchar NOT NULL,
	"creator_id" varchar NOT NULL,
	"owner_id" varchar NOT NULL,
	"token_id" varchar,
	"contract_address" varchar,
	"blockchain" "blockchain" NOT NULL,
	"metadata_uri" text,
	"ipfs_hash" varchar,
	"status" "nft_status" DEFAULT 'minting' NOT NULL,
	"mint_price_cents" integer DEFAULT 0,
	"current_price_cents" integer,
	"royalty_percentage" integer DEFAULT 1000,
	"is_exclusive" boolean DEFAULT true,
	"unlockable_content_url" varchar,
	"access_duration" integer,
	"transaction_hash" varchar,
	"forensic_signature" text,
	"minted_by" varchar DEFAULT 'crossmint',
	"total_resales" integer DEFAULT 0,
	"total_royalties_cents" integer DEFAULT 0,
	"last_sale_at" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "nft_collections" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"cover_image_url" varchar,
	"contract_address" varchar,
	"blockchain" "blockchain" NOT NULL,
	"max_supply" integer,
	"current_supply" integer DEFAULT 0,
	"default_royalty_percentage" integer DEFAULT 1000,
	"is_public" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "nft_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nft_asset_id" varchar NOT NULL,
	"type" "nft_transaction_type" NOT NULL,
	"from_user_id" varchar,
	"to_user_id" varchar,
	"price_cents" integer DEFAULT 0,
	"royalty_cents" integer DEFAULT 0,
	"platform_fee_cents" integer DEFAULT 0,
	"transaction_hash" varchar,
	"blockchain" "blockchain" NOT NULL,
	"block_number" varchar,
	"gas_fee_cents" integer,
	"fanz_wallet_transaction_id" varchar,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"kind" "notification_kind" NOT NULL,
	"type" varchar,
	"title" varchar,
	"message" text,
	"payload_json" jsonb DEFAULT '{}'::jsonb,
	"read_at" timestamp,
	"delivered_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_line_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"product_id" varchar,
	"variant_id" varchar,
	"title" varchar NOT NULL,
	"variant_title" varchar,
	"quantity" integer NOT NULL,
	"price_cents" integer NOT NULL,
	"total_cents" integer NOT NULL,
	"sku" varchar,
	"product_data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar NOT NULL,
	"customer_id" varchar NOT NULL,
	"creator_id" varchar NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"fulfillment_status" "fulfillment_status" DEFAULT 'pending' NOT NULL,
	"subtotal_cents" integer NOT NULL,
	"tax_cents" integer DEFAULT 0,
	"shipping_cents" integer DEFAULT 0,
	"discount_cents" integer DEFAULT 0,
	"total_cents" integer NOT NULL,
	"currency" varchar DEFAULT 'USD',
	"customer_email" varchar NOT NULL,
	"shipping_address" jsonb,
	"billing_address" jsonb,
	"payment_method" varchar,
	"payment_status" varchar DEFAULT 'pending',
	"payment_reference" varchar,
	"notes" text,
	"cancel_reason" text,
	"cancelled_at" timestamp,
	"processed_at" timestamp,
	"shipped_at" timestamp,
	"delivered_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "payment_gateways" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" "gateway_type" NOT NULL,
	"status" "gateway_status" DEFAULT 'inactive',
	"configuration" jsonb NOT NULL,
	"credentials" jsonb NOT NULL,
	"supported_currencies" text[] DEFAULT '{"USD"}',
	"supported_countries" text[] DEFAULT '{}',
	"fee_structure" jsonb NOT NULL,
	"minimum_amount_cents" integer DEFAULT 100,
	"maximum_amount_cents" integer,
	"processing_time_hours" integer DEFAULT 24,
	"webhook_url" varchar,
	"webhook_secret" varchar,
	"test_mode" boolean DEFAULT true,
	"priority" integer DEFAULT 0,
	"auto_retry_enabled" boolean DEFAULT true,
	"fraud_detection_settings" jsonb DEFAULT '{}'::jsonb,
	"compliance_settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payout_accounts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" varchar NOT NULL,
	"provider" varchar NOT NULL,
	"external_account_id" varchar NOT NULL,
	"status" "payout_account_status" DEFAULT 'pending_verification' NOT NULL,
	"kyc_status" varchar,
	"country" varchar(2),
	"currency" varchar DEFAULT 'USD' NOT NULL,
	"account_type" varchar,
	"last4" varchar,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" varchar NOT NULL,
	"payout_account_id" varchar NOT NULL,
	"tenant_id" varchar,
	"amount_cents" integer NOT NULL,
	"currency" varchar DEFAULT 'USD' NOT NULL,
	"status" "payout_status" DEFAULT 'pending' NOT NULL,
	"scheduled_for" timestamp,
	"provider" varchar,
	"provider_batch_id" varchar,
	"provider_ref" varchar,
	"failure_reason" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "performance_milestones" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"type" "milestone_type" NOT NULL,
	"target_value" numeric(15, 2) NOT NULL,
	"bonus_amount" numeric(10, 2) NOT NULL,
	"bonus_percentage" numeric(5, 4),
	"tier_requirement" "performance_tier",
	"is_repeatable" boolean DEFAULT false,
	"timeframe" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "performance_tiers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tier" "performance_tier" DEFAULT 'bronze' NOT NULL,
	"monthly_earnings" numeric(10, 2) DEFAULT '0',
	"total_volume" numeric(12, 2) DEFAULT '0',
	"transaction_count" integer DEFAULT 0,
	"consistency_score" integer DEFAULT 0,
	"quality_score" integer DEFAULT 0,
	"referral_count" integer DEFAULT 0,
	"fee_reduction" numeric(5, 4) DEFAULT '0',
	"bonus_eligible" boolean DEFAULT true,
	"next_tier_earnings" numeric(10, 2),
	"tier_achieved_at" timestamp DEFAULT now(),
	"period_start" timestamp DEFAULT now(),
	"period_end" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "post_media" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" varchar NOT NULL,
	"media_asset_id" varchar NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" varchar NOT NULL,
	"type" "post_type" NOT NULL,
	"visibility" "post_visibility" DEFAULT 'free' NOT NULL,
	"title" varchar,
	"content" text,
	"price_cents" integer DEFAULT 0,
	"media_urls" text[] DEFAULT '{}',
	"thumbnail_url" varchar,
	"hashtags" text[] DEFAULT '{}',
	"is_scheduled" boolean DEFAULT false,
	"scheduled_for" timestamp,
	"likes_count" integer DEFAULT 0,
	"comments_count" integer DEFAULT 0,
	"views_count" integer DEFAULT 0,
	"is_processing" boolean DEFAULT false,
	"processing_status" varchar DEFAULT 'pending',
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pricing_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_id" varchar NOT NULL,
	"previous_price_cents" integer NOT NULL,
	"new_price_cents" integer NOT NULL,
	"change_percent" numeric(5, 2) NOT NULL,
	"reason" varchar NOT NULL,
	"trigger_data" jsonb DEFAULT '{}'::jsonb,
	"ai_rationale" text,
	"sales_before" integer DEFAULT 0,
	"sales_after" integer DEFAULT 0,
	"revenue_before" bigint DEFAULT 0,
	"revenue_after" bigint DEFAULT 0,
	"impact_score" numeric(5, 2),
	"effective_from" timestamp NOT NULL,
	"effective_until" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pricing_insights" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_profile_id" varchar NOT NULL,
	"rule_id" varchar,
	"type" "insight_type" NOT NULL,
	"priority" "insight_priority" DEFAULT 'medium' NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"recommendation" text,
	"ai_model" varchar NOT NULL,
	"confidence" numeric(5, 2) NOT NULL,
	"data_points" jsonb DEFAULT '{}'::jsonb,
	"predicted_impact" jsonb DEFAULT '{}'::jsonb,
	"suggested_price_cents" integer,
	"expected_revenue_increase" numeric(5, 2),
	"action_taken" boolean DEFAULT false,
	"action_taken_at" timestamp,
	"actual_impact" jsonb DEFAULT '{}'::jsonb,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pricing_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_profile_id" varchar NOT NULL,
	"content_id" varchar,
	"plan_id" varchar,
	"name" varchar NOT NULL,
	"strategy" "pricing_strategy" DEFAULT 'dynamic' NOT NULL,
	"status" "pricing_rule_status" DEFAULT 'active' NOT NULL,
	"base_price_cents" integer NOT NULL,
	"min_price_cents" integer NOT NULL,
	"max_price_cents" integer NOT NULL,
	"current_price_cents" integer NOT NULL,
	"ai_model" varchar DEFAULT 'gpt-4o-mini',
	"optimization_goal" varchar DEFAULT 'revenue',
	"demand_elasticity" numeric(5, 2) DEFAULT '0.00',
	"triggers" jsonb DEFAULT '{}'::jsonb,
	"constraints" jsonb DEFAULT '{}'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"total_revenue_cents" bigint DEFAULT 0,
	"total_sales" integer DEFAULT 0,
	"conversion_rate" numeric(5, 2) DEFAULT '0.00',
	"avg_transaction_cents" integer DEFAULT 0,
	"last_optimized_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"image_url" varchar,
	"parent_id" varchar,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "product_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"option1" varchar,
	"option2" varchar,
	"option3" varchar,
	"price_cents" integer NOT NULL,
	"compare_price_cents" integer,
	"cost_cents" integer,
	"sku" varchar,
	"barcode" varchar,
	"inventory_quantity" integer DEFAULT 0,
	"weight" integer,
	"image_url" varchar,
	"position" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" varchar NOT NULL,
	"category_id" varchar,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"short_description" text,
	"type" "product_type" NOT NULL,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"price_cents" integer NOT NULL,
	"compare_price_cents" integer,
	"cost_cents" integer,
	"sku" varchar,
	"barcode" varchar,
	"weight" integer,
	"dimensions" jsonb,
	"images" text[] DEFAULT '{}',
	"tags" text[] DEFAULT '{}',
	"inventory" jsonb DEFAULT '{}'::jsonb,
	"shipping_required" boolean DEFAULT false,
	"shipping_settings" jsonb DEFAULT '{}'::jsonb,
	"digital_assets" text[] DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"seo_title" varchar,
	"seo_description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_creator_product_slug" UNIQUE("creator_id","slug")
);
--> statement-breakpoint
CREATE TABLE "profile_tenant" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" varchar NOT NULL,
	"tenant_id" varchar NOT NULL,
	"is_visible" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"customization" jsonb DEFAULT '{}'::jsonb,
	"stats" jsonb DEFAULT '{}'::jsonb,
	"joined_at" timestamp DEFAULT now(),
	"last_active_at" timestamp DEFAULT now(),
	CONSTRAINT "profile_tenant_profile_id_tenant_id_unique" UNIQUE("profile_id","tenant_id")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" varchar NOT NULL,
	"handle" varchar NOT NULL,
	"display_name" varchar,
	"bio" text,
	"type" "profile_type" DEFAULT 'fan' NOT NULL,
	"avatar_url" varchar,
	"banner_url" varchar,
	"location" varchar,
	"website" varchar,
	"social_links" jsonb DEFAULT '{}'::jsonb,
	"flags" jsonb DEFAULT '{}'::jsonb,
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"stats" jsonb DEFAULT '{}'::jsonb,
	"verification_level" integer DEFAULT 0,
	"kyc_status" "profile_kyc_status" DEFAULT 'pending',
	"age_verified" boolean DEFAULT false,
	"is_2257_compliant" boolean DEFAULT false,
	"last_sanctions_screening" timestamp,
	"sanctions_status" "sanctions_status" DEFAULT 'clear',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "profiles_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "promo_code_usages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"promo_code_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"subscription_id" varchar,
	"original_price_cents" integer NOT NULL,
	"discounted_price_cents" integer NOT NULL,
	"savings_cents" integer NOT NULL,
	"used_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "promo_codes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" varchar,
	"code" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"type" "promo_code_type" NOT NULL,
	"discount_percentage" integer,
	"discount_amount_cents" integer,
	"free_trial_days" integer,
	"min_purchase_cents" integer DEFAULT 0,
	"max_usage_count" integer,
	"current_usage_count" integer DEFAULT 0,
	"valid_from" timestamp DEFAULT now(),
	"valid_until" timestamp,
	"is_active" boolean DEFAULT true,
	"status" "promo_code_status" DEFAULT 'active' NOT NULL,
	"applicable_plans" text[] DEFAULT '{}',
	"first_time_only" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "promo_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fan_profile_id" varchar NOT NULL,
	"creator_profile_id" varchar NOT NULL,
	"content_id" varchar,
	"tenant_id" varchar NOT NULL,
	"type" "purchase_type" NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" varchar DEFAULT 'USD' NOT NULL,
	"status" "purchase_status" DEFAULT 'pending' NOT NULL,
	"provider" varchar,
	"provider_ref" varchar,
	"platform_fee_cents" integer DEFAULT 0,
	"creator_earnings_cents" integer NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"refunded_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "push_notification_campaigns" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"title" varchar NOT NULL,
	"body" text NOT NULL,
	"icon" varchar,
	"image" varchar,
	"badge_icon" varchar,
	"sound" varchar DEFAULT 'default',
	"click_action" varchar,
	"deep_link" varchar,
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"target_platforms" text[] DEFAULT '{"web","ios","android"}',
	"target_audience" "target_audience" DEFAULT 'all' NOT NULL,
	"custom_audience_filter" jsonb DEFAULT '{}'::jsonb,
	"scheduled_for" timestamp,
	"time_zone" varchar DEFAULT 'UTC',
	"send_immediately" boolean DEFAULT false,
	"total_targeted" integer DEFAULT 0,
	"total_sent" integer DEFAULT 0,
	"total_delivered" integer DEFAULT 0,
	"total_clicked" integer DEFAULT 0,
	"total_failed" integer DEFAULT 0,
	"is_ab_test" boolean DEFAULT false,
	"ab_test_group" varchar,
	"ab_test_parent_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "push_notification_deliveries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"platform" "notification_platform" NOT NULL,
	"device_token" varchar,
	"status" "push_delivery_status" DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"clicked_at" timestamp,
	"error_message" text,
	"fcm_message_id" varchar,
	"apns_message_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quest_milestones" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quest_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"target_amount_cents" bigint NOT NULL,
	"unlock_type" varchar,
	"unlock_data" jsonb DEFAULT '{}'::jsonb,
	"is_reached" boolean DEFAULT false,
	"reached_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quest_participants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quest_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"contributed_amount_cents" bigint NOT NULL,
	"share_percentage" numeric(5, 2),
	"earned_amount_cents" bigint DEFAULT 0,
	"is_underwriter" boolean DEFAULT false,
	"underwriter_bonus_percentage" integer DEFAULT 0,
	"transaction_id" varchar,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"contributed_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "quest_participants_quest_id_user_id_unique" UNIQUE("quest_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "records_2257" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_id" varchar NOT NULL,
	"performer_profile_id" varchar NOT NULL,
	"custodian_account_id" varchar NOT NULL,
	"doc_type" "record_2257_type" NOT NULL,
	"location_uri" text NOT NULL,
	"index_metadata" jsonb DEFAULT '{}'::jsonb,
	"custodian_contact" jsonb DEFAULT '{}'::jsonb,
	"jurisdiction" varchar NOT NULL,
	"retention_period" integer DEFAULT 7,
	"is_digital" boolean DEFAULT true,
	"physical_location" text,
	"access_log" jsonb DEFAULT '[]'::jsonb,
	"verification_checksum" varchar,
	"encryption_key_id" varchar,
	"compliance_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "referral_achievements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"achievement_type" "achievement_type" NOT NULL,
	"achievement_id" varchar NOT NULL,
	"status" "achievement_status" DEFAULT 'locked' NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"icon_url" varchar,
	"badge_url" varchar,
	"requirement" jsonb NOT NULL,
	"current_progress" numeric(10, 2) DEFAULT '0',
	"target_progress" numeric(10, 2) NOT NULL,
	"progress_percentage" numeric(5, 2) DEFAULT '0',
	"reward_type" varchar,
	"reward_value" numeric(10, 2),
	"reward_metadata" jsonb DEFAULT '{}'::jsonb,
	"unlocked_at" timestamp,
	"claimed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "referral_achievements_user_id_achievement_id_unique" UNIQUE("user_id","achievement_id")
);
--> statement-breakpoint
CREATE TABLE "referral_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timeframe" "analytics_timeframe" NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"referrer_id" varchar,
	"campaign_id" varchar,
	"referral_code_id" varchar,
	"country" varchar,
	"region" varchar,
	"city" varchar,
	"device_type" varchar,
	"browser_type" varchar,
	"source_type" varchar,
	"metric_type" "analytics_metric_type" NOT NULL,
	"metric_value" numeric(15, 4) NOT NULL,
	"metric_count" integer DEFAULT 0,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "referral_campaigns" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"slug" varchar NOT NULL,
	"status" "referral_campaign_status" DEFAULT 'draft' NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"target_audience" varchar DEFAULT 'all',
	"eligible_user_types" text[] DEFAULT '{}',
	"min_account_age" integer,
	"exclude_existing_referrers" boolean DEFAULT false,
	"reward_structure" jsonb DEFAULT '{}'::jsonb,
	"tier_rewards" jsonb DEFAULT '{}'::jsonb,
	"bonus_milestones" jsonb DEFAULT '{}'::jsonb,
	"max_participants" integer,
	"max_rewards" numeric(15, 2),
	"max_rewards_per_user" numeric(10, 2),
	"participant_count" integer DEFAULT 0,
	"total_rewards_issued" numeric(15, 2) DEFAULT '0',
	"conversion_rate" numeric(5, 2) DEFAULT '0',
	"auto_approve" boolean DEFAULT true,
	"require_manual_review" boolean DEFAULT false,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "referral_campaigns_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "referral_codes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"code" varchar NOT NULL,
	"type" varchar DEFAULT 'standard' NOT NULL,
	"status" "referral_code_status" DEFAULT 'active' NOT NULL,
	"description" text,
	"max_uses" integer,
	"current_uses" integer DEFAULT 0,
	"expires_at" timestamp,
	"reward_type" varchar DEFAULT 'percentage' NOT NULL,
	"reward_value" numeric(10, 2) NOT NULL,
	"referee_reward_type" varchar DEFAULT 'credits',
	"referee_reward_value" numeric(10, 2) DEFAULT '0',
	"campaign_id" varchar,
	"click_count" integer DEFAULT 0,
	"conversion_count" integer DEFAULT 0,
	"total_earnings" numeric(15, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "referral_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "referral_earnings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_id" varchar NOT NULL,
	"referee_id" varchar,
	"type" "earnings_type" NOT NULL,
	"status" "earnings_status" DEFAULT 'pending' NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"currency" varchar DEFAULT 'USD' NOT NULL,
	"referral_code_id" varchar,
	"campaign_id" varchar,
	"relationship_id" varchar,
	"tracking_id" varchar,
	"source_transaction_id" varchar,
	"commission_rate" numeric(5, 4),
	"source_amount" numeric(15, 2),
	"payout_id" varchar,
	"payout_method" varchar,
	"payout_details" jsonb DEFAULT '{}'::jsonb,
	"paid_at" timestamp,
	"processed_at" timestamp,
	"processed_by" varchar,
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "referral_fraud_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" "fraud_event_type" NOT NULL,
	"status" "fraud_status" DEFAULT 'flagged' NOT NULL,
	"severity" varchar DEFAULT 'medium' NOT NULL,
	"referrer_id" varchar,
	"referee_id" varchar,
	"referral_code_id" varchar,
	"tracking_id" varchar,
	"detection_reason" text NOT NULL,
	"evidence_data" jsonb DEFAULT '{}'::jsonb,
	"risk_score" numeric(5, 2) NOT NULL,
	"automatic_action" varchar,
	"investigated_by" varchar,
	"investigated_at" timestamp,
	"investigation_notes" text,
	"resolution" text,
	"resolved_at" timestamp,
	"action_taken" text,
	"appeals_allowed" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "referral_relationships" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_id" varchar NOT NULL,
	"referee_id" varchar NOT NULL,
	"type" "relationship_type" DEFAULT 'direct' NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"status" "relationship_status" DEFAULT 'active' NOT NULL,
	"referral_code_id" varchar,
	"campaign_id" varchar,
	"tracking_id" varchar,
	"total_earnings" numeric(15, 2) DEFAULT '0',
	"lifetime_value" numeric(15, 2) DEFAULT '0',
	"last_activity_at" timestamp,
	"fraud_score" numeric(3, 2) DEFAULT '0',
	"is_verified" boolean DEFAULT false,
	"verified_at" timestamp,
	"verified_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "referral_relationships_referrer_id_referee_id_unique" UNIQUE("referrer_id","referee_id")
);
--> statement-breakpoint
CREATE TABLE "referral_tracking" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referral_code_id" varchar NOT NULL,
	"referrer_id" varchar NOT NULL,
	"click_id" varchar,
	"source_url" text,
	"landing_url" text,
	"user_agent" text,
	"ip_address" "inet",
	"device_fingerprint" varchar,
	"attribution_type" "attribution_type" DEFAULT 'last_click',
	"attribution_weight" numeric(3, 2) DEFAULT '1.00',
	"converted_user_id" varchar,
	"conversion_type" "conversion_type",
	"conversion_value" numeric(15, 2),
	"conversion_metadata" jsonb DEFAULT '{}'::jsonb,
	"converted_at" timestamp,
	"country" varchar,
	"region" varchar,
	"city" varchar,
	"session_id" varchar,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "referral_tracking_click_id_unique" UNIQUE("click_id")
);
--> statement-breakpoint
CREATE TABLE "repeat_infringers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"infringement_count" integer DEFAULT 0,
	"first_infringement" timestamp DEFAULT now(),
	"last_infringement" timestamp DEFAULT now(),
	"status" "repeat_infringer_status" DEFAULT 'warning' NOT NULL,
	"strike_history" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "repeat_infringers_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" varchar NOT NULL,
	"reported_user_id" varchar,
	"reported_post_id" varchar,
	"type" "report_type" NOT NULL,
	"reason" text NOT NULL,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"reviewer_id" varchar,
	"review_notes" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "revenue_quests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"quest_type" "quest_type" NOT NULL,
	"status" "quest_status" DEFAULT 'draft' NOT NULL,
	"goal_amount_cents" bigint NOT NULL,
	"current_amount_cents" bigint DEFAULT 0,
	"min_contribution_cents" bigint DEFAULT 100,
	"start_date" timestamp,
	"end_date" timestamp,
	"reward_type" varchar,
	"reward_metadata" jsonb DEFAULT '{}'::jsonb,
	"content_unlock_id" varchar,
	"contributor_share_percentage" integer DEFAULT 0,
	"ai_suggested_goal" bigint,
	"ai_confidence_score" integer,
	"ai_insights" jsonb DEFAULT '{}'::jsonb,
	"total_contributors" integer DEFAULT 0,
	"completion_percentage" integer DEFAULT 0,
	"rewards_distributed" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"scope" "role_scope" DEFAULT 'tenant' NOT NULL,
	"permissions" text[] DEFAULT '{}',
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "roles_name_scope_unique" UNIQUE("name","scope")
);
--> statement-breakpoint
CREATE TABLE "search_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"session_id" varchar,
	"query" text NOT NULL,
	"results_count" integer DEFAULT 0,
	"clicked_result_id" varchar,
	"clicked_result_type" varchar,
	"search_context" varchar,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_accounts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"provider" varchar NOT NULL,
	"provider_id" varchar NOT NULL,
	"email" varchar,
	"display_name" varchar,
	"profile_url" varchar,
	"profile_image_url" varchar,
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "social_accounts_provider_provider_id_unique" UNIQUE("provider","provider_id")
);
--> statement-breakpoint
CREATE TABLE "storage_provider_alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar NOT NULL,
	"alert_type" varchar NOT NULL,
	"severity" varchar NOT NULL,
	"title" varchar NOT NULL,
	"message" text NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb,
	"is_acknowledged" boolean DEFAULT false,
	"acknowledged_by" varchar,
	"acknowledged_at" timestamp,
	"is_resolved" boolean DEFAULT false,
	"resolved_by" varchar,
	"resolved_at" timestamp,
	"resolution_notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "storage_provider_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "storage_provider" NOT NULL,
	"name" varchar NOT NULL,
	"is_active" boolean DEFAULT false,
	"is_primary" boolean DEFAULT false,
	"status" "storage_config_status" DEFAULT 'inactive',
	"config_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"region" varchar,
	"bucket" varchar,
	"endpoint" varchar,
	"cdn_hostname" varchar,
	"cost_per_gb" numeric(10, 6),
	"bandwidth_cost_per_gb" numeric(10, 6),
	"max_storage_gb" integer,
	"max_bandwidth_gb" integer,
	"cdn_enabled" boolean DEFAULT false,
	"versioning" boolean DEFAULT false,
	"encryption" boolean DEFAULT true,
	"public_read" boolean DEFAULT false,
	"health_check_enabled" boolean DEFAULT true,
	"health_check_interval_minutes" integer DEFAULT 5,
	"alert_thresholds" jsonb DEFAULT '{}'::jsonb,
	"description" text,
	"tags" text[] DEFAULT '{}',
	"configured_by" varchar NOT NULL,
	"last_configured_by" varchar,
	"last_test_result" jsonb DEFAULT '{}'::jsonb,
	"last_tested_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_provider_name" UNIQUE("provider","name")
);
--> statement-breakpoint
CREATE TABLE "storage_provider_costs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"storage_cost" numeric(10, 4) DEFAULT '0',
	"bandwidth_cost" numeric(10, 4) DEFAULT '0',
	"request_cost" numeric(10, 4) DEFAULT '0',
	"total_cost" numeric(10, 4) DEFAULT '0',
	"average_storage_gb" numeric(15, 6),
	"total_bandwidth_gb" numeric(15, 6),
	"total_requests" integer,
	"recommendations" jsonb DEFAULT '[]'::jsonb,
	"potential_savings" numeric(10, 4) DEFAULT '0',
	"calculated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "storage_provider_failover" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"primary_provider_id" varchar NOT NULL,
	"backup_provider_id" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"failover_threshold" integer DEFAULT 3,
	"health_check_interval_seconds" integer DEFAULT 30,
	"automatic_failback" boolean DEFAULT false,
	"last_failover_at" timestamp,
	"failover_count" integer DEFAULT 0,
	"last_failback_at" timestamp,
	"failback_count" integer DEFAULT 0,
	"sync_enabled" boolean DEFAULT false,
	"sync_interval_hours" integer DEFAULT 24,
	"last_sync_at" timestamp,
	"configured_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_primary_backup" UNIQUE("primary_provider_id","backup_provider_id")
);
--> statement-breakpoint
CREATE TABLE "storage_provider_health" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar NOT NULL,
	"health_status" "storage_health_status" NOT NULL,
	"response_time_ms" integer,
	"availability" numeric(5, 2),
	"error_rate" numeric(5, 2),
	"last_error" text,
	"error_details" jsonb DEFAULT '{}'::jsonb,
	"upload_speed_mbps" numeric(10, 2),
	"download_speed_mbps" numeric(10, 2),
	"total_storage_gb" numeric(15, 6),
	"used_storage_gb" numeric(15, 6),
	"file_count" integer,
	"checked_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" varchar NOT NULL,
	"type" "story_type" NOT NULL,
	"status" "story_status" DEFAULT 'active' NOT NULL,
	"media_url" varchar,
	"thumbnail_url" varchar,
	"text" text,
	"duration" integer,
	"views_count" integer DEFAULT 0,
	"likes_count" integer DEFAULT 0,
	"replies_count" integer DEFAULT 0,
	"is_highlighted" boolean DEFAULT false,
	"is_promoted" boolean DEFAULT false,
	"poll_data" jsonb,
	"question_data" jsonb,
	"viewer_list" jsonb DEFAULT '[]'::jsonb,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "story_replies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" varchar NOT NULL,
	"from_user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"media_url" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "story_views" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" varchar NOT NULL,
	"viewer_id" varchar NOT NULL,
	"viewed_at" timestamp DEFAULT now(),
	"view_duration" integer,
	CONSTRAINT "unique_story_viewer" UNIQUE("story_id","viewer_id")
);
--> statement-breakpoint
CREATE TABLE "stream_viewers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stream_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"joined_at" timestamp DEFAULT now(),
	"left_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_profile_id" varchar NOT NULL,
	"tenant_id" varchar,
	"name" varchar NOT NULL,
	"description" text,
	"price_cents" integer NOT NULL,
	"currency" varchar DEFAULT 'USD' NOT NULL,
	"interval" "subscription_interval" DEFAULT 'monthly' NOT NULL,
	"features" jsonb DEFAULT '{}'::jsonb,
	"trial_days" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fan_profile_id" varchar NOT NULL,
	"plan_id" varchar NOT NULL,
	"tenant_id" varchar,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false,
	"canceled_at" timestamp,
	"trial_start" timestamp,
	"trial_end" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions_enhanced" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fan_id" varchar NOT NULL,
	"creator_id" varchar NOT NULL,
	"subscription_plan_id" varchar NOT NULL,
	"promo_code_id" varchar,
	"stripe_subscription_id" varchar,
	"status" "subscription_status" DEFAULT 'pending' NOT NULL,
	"original_price_cents" integer NOT NULL,
	"final_price_cents" integer NOT NULL,
	"discount_applied_cents" integer DEFAULT 0,
	"next_billing_date" timestamp NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"trial_end_date" timestamp,
	"auto_renew" boolean DEFAULT true,
	"cancelled_at" timestamp,
	"cancel_reason" text,
	"renewal_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "subscriptions_enhanced_fan_id_creator_id_unique" UNIQUE("fan_id","creator_id")
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_number" varchar NOT NULL,
	"subject" varchar NOT NULL,
	"description" text NOT NULL,
	"category" "ticket_category" NOT NULL,
	"priority" "ticket_priority" DEFAULT 'normal' NOT NULL,
	"status" "ticket_status" DEFAULT 'open' NOT NULL,
	"channel" "ticket_channel" DEFAULT 'in_app' NOT NULL,
	"user_id" varchar,
	"user_email" varchar,
	"user_name" varchar,
	"assigned_to" varchar,
	"assigned_at" timestamp,
	"tags" text[] DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"customer_satisfaction" integer,
	"first_response_at" timestamp,
	"resolved_at" timestamp,
	"closed_at" timestamp,
	"sla_breach_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "support_tickets_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE "system_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metric_name" varchar NOT NULL,
	"metric_value" numeric(15, 6) NOT NULL,
	"metric_unit" varchar,
	"category" varchar NOT NULL,
	"tags" jsonb DEFAULT '{}'::jsonb,
	"collected_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_setting_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"setting_id" varchar NOT NULL,
	"old_value" text,
	"new_value" text,
	"change_type" varchar NOT NULL,
	"changed_by" varchar,
	"change_reason" text,
	"rollback_data" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar NOT NULL,
	"value" text,
	"encrypted_value" text,
	"type" "system_setting_type" DEFAULT 'string' NOT NULL,
	"category" "system_setting_category" DEFAULT 'general' NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"default_value" text,
	"validation_rules" jsonb DEFAULT '{}'::jsonb,
	"is_public" boolean DEFAULT false,
	"is_read_only" boolean DEFAULT false,
	"requires_restart" boolean DEFAULT false,
	"environment" varchar DEFAULT 'production',
	"can_override_in_env" boolean DEFAULT true,
	"env_var_name" varchar,
	"last_modified_by" varchar,
	"last_modified_at" timestamp DEFAULT now(),
	"change_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "tax_rates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"code" varchar NOT NULL,
	"tax_type" "tax_type" NOT NULL,
	"rate" numeric(5, 4) NOT NULL,
	"jurisdiction" varchar NOT NULL,
	"region" varchar,
	"calculation_method" "tax_calculation_method" DEFAULT 'exclusive',
	"is_active" boolean DEFAULT true,
	"effective_from" timestamp NOT NULL,
	"effective_to" timestamp,
	"description" text,
	"applicable_business_types" text[] DEFAULT '{}',
	"threshold_cents" integer DEFAULT 0,
	"exemptions" jsonb DEFAULT '{}'::jsonb,
	"api_integration" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_tax_rate_code" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "tax_records" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tax_year" integer NOT NULL,
	"jurisdiction" "tax_jurisdiction" NOT NULL,
	"gross_income" numeric(12, 2) DEFAULT '0',
	"withheld_amount" numeric(10, 2) DEFAULT '0',
	"deductible_expenses" numeric(10, 2) DEFAULT '0',
	"net_taxable_income" numeric(12, 2) DEFAULT '0',
	"estimated_tax_rate" numeric(5, 4) DEFAULT '0',
	"document_urls" text[] DEFAULT '{}',
	"is_finalized" boolean DEFAULT false,
	"submitted_to_authorities" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tax_records_user_year_jurisdiction_unique" UNIQUE("user_id","tax_year","jurisdiction")
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar NOT NULL,
	"name" varchar NOT NULL,
	"domain" varchar,
	"status" "tenant_status" DEFAULT 'active' NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"branding" jsonb DEFAULT '{}'::jsonb,
	"features" jsonb DEFAULT '{}'::jsonb,
	"compliance" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "theme_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"is_active" boolean DEFAULT false,
	"colors" jsonb DEFAULT '{"primary":"hsl(0, 100%, 50%)","primaryForeground":"hsl(0, 0%, 100%)","secondary":"hsl(45, 80%, 60%)","secondaryForeground":"hsl(0, 0%, 0%)","background":"hsl(0, 0%, 1%)","foreground":"hsl(0, 0%, 100%)","card":"hsl(15, 15%, 4%)","cardForeground":"hsl(0, 0%, 100%)","accent":"hsl(50, 100%, 65%)","accentForeground":"hsl(0, 0%, 0%)","border":"hsl(15, 15%, 15%)","input":"hsl(15, 15%, 18%)","muted":"hsl(0, 0%, 10%)","mutedForeground":"hsl(0, 0%, 60%)","destructive":"hsl(0, 84%, 60%)","destructiveForeground":"hsl(0, 0%, 100%)"}'::jsonb NOT NULL,
	"typography" jsonb DEFAULT '{"fontDisplay":"Orbitron","fontHeading":"Rajdhani","fontBody":"Inter"}'::jsonb NOT NULL,
	"effects" jsonb DEFAULT '{"neonIntensity":1,"glowEnabled":true,"smokyBackground":true,"flickerEnabled":true}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" varchar NOT NULL,
	"author_id" varchar,
	"type" "ticket_message_type" NOT NULL,
	"content" text NOT NULL,
	"is_internal" boolean DEFAULT false,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_user_id" varchar NOT NULL,
	"to_user_id" varchar NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount_cents" integer NOT NULL,
	"platform_fee_cents" integer DEFAULT 0,
	"creator_earnings_cents" integer NOT NULL,
	"stripe_payment_intent_id" varchar,
	"status" "transaction_status" DEFAULT 'pending' NOT NULL,
	"reference_id" varchar,
	"reference_type" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trust_proofs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"proof_type" varchar NOT NULL,
	"status" "proof_status" DEFAULT 'pending' NOT NULL,
	"document_urls" text[] DEFAULT '{}',
	"document_hashes" text[] DEFAULT '{}',
	"verified_by" varchar,
	"verified_at" timestamp,
	"rejection_reason" text,
	"expires_at" timestamp,
	"score_points_awarded" integer DEFAULT 0,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"submitted_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trust_scores" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"current_tier" "trust_tier" DEFAULT 'unverified' NOT NULL,
	"score_points" integer DEFAULT 0 NOT NULL,
	"proofs_submitted" integer DEFAULT 0,
	"proofs_approved" integer DEFAULT 0,
	"proofs_rejected" integer DEFAULT 0,
	"transaction_count" integer DEFAULT 0,
	"total_transaction_volume_cents" bigint DEFAULT 0,
	"successful_disputes_won" integer DEFAULT 0,
	"disputes_lost" integer DEFAULT 0,
	"account_age_days" integer DEFAULT 0,
	"consecutive_good_standing_days" integer DEFAULT 0,
	"bonus_points" integer DEFAULT 0,
	"penalty_points" integer DEFAULT 0,
	"last_calculated_at" timestamp,
	"next_review_at" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "trust_scores_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "tutorial_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"icon" varchar,
	"color" varchar,
	"sort_order" integer DEFAULT 0,
	"is_visible" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tutorial_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tutorials" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"status" "tutorial_status" DEFAULT 'draft' NOT NULL,
	"difficulty" "tutorial_difficulty" DEFAULT 'beginner' NOT NULL,
	"steps" jsonb NOT NULL,
	"estimated_duration" integer,
	"prerequisites" text[] DEFAULT '{}',
	"author_id" varchar NOT NULL,
	"category_id" varchar,
	"tags" text[] DEFAULT '{}',
	"completion_count" integer DEFAULT 0,
	"average_completion_time" integer,
	"success_rate" numeric(5, 2),
	"rating" numeric(3, 2),
	"reward_points" integer DEFAULT 0,
	"badge_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tutorials_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"achievement_id" varchar NOT NULL,
	"unlocked_at" timestamp DEFAULT now(),
	"is_visible" boolean DEFAULT true,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	CONSTRAINT "unique_user_achievement" UNIQUE("user_id","achievement_id")
);
--> statement-breakpoint
CREATE TABLE "user_activity_log" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"activity" varchar NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb,
	"ip_address" varchar,
	"user_agent" text,
	"session_id" varchar,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"badge_id" varchar NOT NULL,
	"earned_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_badges_user_id_badge_id_unique" UNIQUE("user_id","badge_id")
);
--> statement-breakpoint
CREATE TABLE "user_communication_preferences" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"email_marketing" "consent_status" DEFAULT 'pending' NOT NULL,
	"email_transactional" "consent_status" DEFAULT 'granted' NOT NULL,
	"email_system" "consent_status" DEFAULT 'granted' NOT NULL,
	"push_marketing" "consent_status" DEFAULT 'pending' NOT NULL,
	"push_transactional" "consent_status" DEFAULT 'granted' NOT NULL,
	"push_system" "consent_status" DEFAULT 'granted' NOT NULL,
	"sms_marketing" "consent_status" DEFAULT 'denied' NOT NULL,
	"sms_transactional" "consent_status" DEFAULT 'denied' NOT NULL,
	"in_app_announcements" boolean DEFAULT true,
	"in_app_notifications" boolean DEFAULT true,
	"max_daily_emails" integer DEFAULT 5,
	"max_daily_push" integer DEFAULT 10,
	"max_weekly_sms" integer DEFAULT 2,
	"web_push_token" varchar,
	"ios_push_token" varchar,
	"android_push_token" varchar,
	"desktop_push_token" varchar,
	"last_updated" timestamp DEFAULT now(),
	"consent_date" timestamp DEFAULT now(),
	"ip_address" varchar,
	"user_agent" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_milestones" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"milestone_id" varchar NOT NULL,
	"current_value" numeric(15, 2) DEFAULT '0',
	"target_value" numeric(15, 2) NOT NULL,
	"progress" numeric(5, 2) DEFAULT '0',
	"status" "bonus_status" DEFAULT 'pending' NOT NULL,
	"bonus_amount" numeric(10, 2),
	"achieved_at" timestamp,
	"claimed_at" timestamp,
	"expires_at" timestamp,
	"period_start" timestamp DEFAULT now(),
	"period_end" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_suspensions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"reason" "suspension_reason" NOT NULL,
	"ban_type" "ban_type" NOT NULL,
	"description" text NOT NULL,
	"violation_details" jsonb DEFAULT '{}'::jsonb,
	"suspended_by" varchar NOT NULL,
	"duration" integer,
	"started_at" timestamp DEFAULT now(),
	"ends_at" timestamp,
	"lifted_at" timestamp,
	"lifted_by" varchar,
	"lift_reason" text,
	"appeal_submitted" boolean DEFAULT false,
	"appeal_text" text,
	"appealed_at" timestamp,
	"appeal_decision" varchar,
	"appeal_decided_by" varchar,
	"appeal_decided_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_tutorial_progress" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tutorial_id" varchar NOT NULL,
	"status" "tutorial_progress_status" DEFAULT 'not_started' NOT NULL,
	"current_step" integer DEFAULT 0,
	"total_steps" integer NOT NULL,
	"completed_steps" integer DEFAULT 0,
	"progress_percentage" numeric(5, 2) DEFAULT '0',
	"started_at" timestamp,
	"completed_at" timestamp,
	"last_accessed_at" timestamp,
	"total_time_spent" integer DEFAULT 0,
	"rating" integer,
	"feedback" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_tutorial_progress_user_id_tutorial_id_unique" UNIQUE("user_id","tutorial_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar,
	"email" varchar,
	"password" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"role" "user_role" DEFAULT 'fan' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"auth_provider" varchar DEFAULT 'replit' NOT NULL,
	"online_status" boolean DEFAULT false,
	"last_seen_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verified_content" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" varchar NOT NULL,
	"media_url" varchar NOT NULL,
	"media_type" varchar NOT NULL,
	"content_hash" varchar NOT NULL,
	"perceptual_hash" varchar,
	"ai_fingerprint" jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"verified_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "verified_content_content_hash_unique" UNIQUE("content_hash")
);
--> statement-breakpoint
CREATE TABLE "voice_message_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"text" text NOT NULL,
	"category" varchar,
	"use_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "voice_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"voice_profile_id" varchar NOT NULL,
	"sender_id" varchar NOT NULL,
	"recipient_id" varchar,
	"text" text NOT NULL,
	"audio_url" varchar,
	"duration" integer,
	"status" "voice_message_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"model" varchar DEFAULT 'eleven_multilingual_v2',
	"listen_count" integer DEFAULT 0,
	"last_listened_at" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "voice_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"voice_id" varchar,
	"provider" varchar DEFAULT 'elevenlabs' NOT NULL,
	"audio_sample_urls" text[] DEFAULT '{}',
	"sample_duration" integer,
	"status" "voice_profile_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"quality" integer,
	"stability" numeric(3, 2) DEFAULT '0.75',
	"similarity_boost" numeric(3, 2) DEFAULT '0.75',
	"style" numeric(3, 2) DEFAULT '0.0',
	"use_speaker_boost" boolean DEFAULT true,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "volume_tiers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier_name" varchar NOT NULL,
	"minimum_volume" numeric(12, 2) NOT NULL,
	"maximum_volume" numeric(12, 2),
	"fee_reduction" numeric(5, 4) NOT NULL,
	"bonus_percentage" numeric(5, 4) DEFAULT '0',
	"is_active" boolean DEFAULT true,
	"effective_date" timestamp DEFAULT now(),
	"expiration_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"url" varchar NOT NULL,
	"secret" varchar NOT NULL,
	"events_json" jsonb DEFAULT '[]'::jsonb,
	"status" "webhook_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wiki_articles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar NOT NULL,
	"title" varchar NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"type" "article_type" NOT NULL,
	"status" "article_status" DEFAULT 'draft' NOT NULL,
	"author_id" varchar NOT NULL,
	"last_edited_by" varchar,
	"reviewed_by" varchar,
	"category_id" varchar,
	"tags" text[] DEFAULT '{}',
	"meta_title" varchar,
	"meta_description" text,
	"keywords" text[] DEFAULT '{}',
	"search_vector" text,
	"view_count" integer DEFAULT 0,
	"helpful_votes" integer DEFAULT 0,
	"not_helpful_votes" integer DEFAULT 0,
	"average_rating" numeric(3, 2),
	"published_at" timestamp,
	"featured_until" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wiki_articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "wiki_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"parent_id" varchar,
	"icon" varchar,
	"color" varchar,
	"sort_order" integer DEFAULT 0,
	"is_visible" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wiki_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "pwa_device_subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"device_id" varchar NOT NULL,
	"device_type" "device_type" NOT NULL,
	"platform" "platform" NOT NULL,
	"user_agent" text,
	"push_subscription" jsonb,
	"push_endpoint" text,
	"push_auth" text,
	"push_p256dh" text,
	"device_name" varchar,
	"os_version" varchar,
	"app_version" varchar,
	"screen_resolution" varchar,
	"timezone" varchar,
	"language" varchar,
	"notifications_enabled" boolean DEFAULT true,
	"badge_enabled" boolean DEFAULT true,
	"sound_enabled" boolean DEFAULT true,
	"vibration_enabled" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"last_used" timestamp DEFAULT now(),
	"subscription_expiry" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pwa_device_subscriptions_user_id_device_id_unique" UNIQUE("user_id","device_id")
);
--> statement-breakpoint
CREATE TABLE "pwa_feature_flags" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"is_enabled" boolean DEFAULT false,
	"target_platforms" text[] DEFAULT '{}',
	"target_device_types" text[] DEFAULT '{}',
	"target_user_ids" text[] DEFAULT '{}',
	"config" jsonb DEFAULT '{}'::jsonb,
	"rollout_percentage" integer DEFAULT 0,
	"created_by" varchar,
	"valid_from" timestamp DEFAULT now(),
	"valid_until" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pwa_feature_flags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "pwa_installation_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"installation_source" "installation_source" NOT NULL,
	"device_type" "device_type" NOT NULL,
	"platform" "platform" NOT NULL,
	"user_agent" text,
	"screen_width" integer,
	"screen_height" integer,
	"device_pixel_ratio" integer,
	"timezone" varchar,
	"language" varchar,
	"referrer" text,
	"landing_page" varchar,
	"session_duration" integer,
	"page_views" integer,
	"prompt_shown" boolean DEFAULT false,
	"prompt_accepted" boolean DEFAULT false,
	"prompt_dismissed" boolean DEFAULT false,
	"time_to_install" integer,
	"ip_address" varchar,
	"country" varchar,
	"city" varchar,
	"installed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pwa_offline_sync_queue" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"device_id" varchar NOT NULL,
	"action_type" varchar NOT NULL,
	"endpoint" varchar NOT NULL,
	"method" varchar NOT NULL,
	"payload" jsonb NOT NULL,
	"headers" jsonb DEFAULT '{}'::jsonb,
	"client_timestamp" timestamp NOT NULL,
	"priority" integer DEFAULT 5,
	"retry_count" integer DEFAULT 0,
	"max_retries" integer DEFAULT 5,
	"next_retry_at" timestamp,
	"status" "sync_status" DEFAULT 'pending',
	"synced_at" timestamp,
	"error_message" text,
	"response_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pwa_push_notification_queue" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"device_subscription_id" varchar,
	"title" varchar NOT NULL,
	"body" text NOT NULL,
	"icon" varchar,
	"badge" varchar,
	"image" varchar,
	"tag" varchar,
	"require_interaction" boolean DEFAULT false,
	"silent" boolean DEFAULT false,
	"vibrate" text[],
	"actions" jsonb DEFAULT '[]'::jsonb,
	"data" jsonb DEFAULT '{}'::jsonb,
	"click_action" varchar,
	"deep_link" varchar,
	"scheduled_for" timestamp,
	"retry_count" integer DEFAULT 0,
	"max_retries" integer DEFAULT 3,
	"status" "sync_status" DEFAULT 'pending',
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"clicked_at" timestamp,
	"error_message" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pwa_usage_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"device_id" varchar NOT NULL,
	"session_id" varchar NOT NULL,
	"session_start" timestamp NOT NULL,
	"session_end" timestamp,
	"session_duration" integer,
	"page_views" integer DEFAULT 0,
	"features_used" text[] DEFAULT '{}',
	"offline_time" integer DEFAULT 0,
	"load_time" integer,
	"time_to_interactive" integer,
	"cache_hit_rate" integer,
	"connection_type" varchar,
	"online_status" boolean DEFAULT true,
	"push_notifications_received" integer DEFAULT 0,
	"push_notifications_clicked" integer DEFAULT 0,
	"background_syncs" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account_identity" ADD CONSTRAINT "account_identity_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_role" ADD CONSTRAINT "account_role_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_role" ADD CONSTRAINT "account_role_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_role" ADD CONSTRAINT "account_role_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_role" ADD CONSTRAINT "account_role_granted_by_accounts_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_campaigns" ADD CONSTRAINT "ad_campaigns_advertiser_profile_id_profiles_id_fk" FOREIGN KEY ("advertiser_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_campaigns" ADD CONSTRAINT "ad_campaigns_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_creatives" ADD CONSTRAINT "ad_creatives_campaign_id_ad_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."ad_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_impressions" ADD CONSTRAINT "ad_impressions_creative_id_ad_creatives_id_fk" FOREIGN KEY ("creative_id") REFERENCES "public"."ad_creatives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_impressions" ADD CONSTRAINT "ad_impressions_placement_id_ad_placements_id_fk" FOREIGN KEY ("placement_id") REFERENCES "public"."ad_placements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_impressions" ADD CONSTRAINT "ad_impressions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_impressions" ADD CONSTRAINT "ad_impressions_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_placements" ADD CONSTRAINT "ad_placements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_dashboard_configs" ADD CONSTRAINT "admin_dashboard_configs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_report_runs" ADD CONSTRAINT "admin_report_runs_template_id_admin_report_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."admin_report_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_report_runs" ADD CONSTRAINT "admin_report_runs_generated_by_id_users_id_fk" FOREIGN KEY ("generated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_report_templates" ADD CONSTRAINT "admin_report_templates_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_profiles" ADD CONSTRAINT "affiliate_profiles_user_id_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_profiles" ADD CONSTRAINT "affiliate_profiles_approved_by_accounts_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "age_verifications" ADD CONSTRAINT "age_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_rule_id_alert_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."alert_rules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_acknowledged_by_users_id_fk" FOREIGN KEY ("acknowledged_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aml_checks" ADD CONSTRAINT "aml_checks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_deliveries" ADD CONSTRAINT "announcement_deliveries_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_deliveries" ADD CONSTRAINT "announcement_deliveries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_ab_test_parent_id_announcements_id_fk" FOREIGN KEY ("ab_test_parent_id") REFERENCES "public"."announcements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_account_id_accounts_id_fk" FOREIGN KEY ("actor_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_profile_id_profiles_id_fk" FOREIGN KEY ("actor_profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_email_recovery_tokens" ADD CONSTRAINT "auth_email_recovery_tokens_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_email_verification_tokens" ADD CONSTRAINT "auth_email_verification_tokens_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_password_reset_tokens" ADD CONSTRAINT "auth_password_reset_tokens_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_profiles" ADD CONSTRAINT "billing_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_menu_items" ADD CONSTRAINT "cms_menu_items_menu_id_cms_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."cms_menus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_page_sections" ADD CONSTRAINT "cms_page_sections_page_id_cms_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."cms_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_publishes" ADD CONSTRAINT "cms_publishes_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_publishes" ADD CONSTRAINT "cms_publishes_theme_version_id_cms_theme_versions_id_fk" FOREIGN KEY ("theme_version_id") REFERENCES "public"."cms_theme_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_theme_assets" ADD CONSTRAINT "cms_theme_assets_theme_version_id_cms_theme_versions_id_fk" FOREIGN KEY ("theme_version_id") REFERENCES "public"."cms_theme_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_theme_settings" ADD CONSTRAINT "cms_theme_settings_theme_version_id_cms_theme_versions_id_fk" FOREIGN KEY ("theme_version_id") REFERENCES "public"."cms_theme_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_theme_versions" ADD CONSTRAINT "cms_theme_versions_theme_id_cms_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."cms_themes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_participants" ADD CONSTRAINT "collaboration_participants_collaboration_id_collaborations_id_fk" FOREIGN KEY ("collaboration_id") REFERENCES "public"."collaborations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_participants" ADD CONSTRAINT "collaboration_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborations" ADD CONSTRAINT "collaborations_primary_creator_id_users_id_fk" FOREIGN KEY ("primary_creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_moderations" ADD CONSTRAINT "comment_moderations_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_moderations" ADD CONSTRAINT "comment_moderations_moderator_id_users_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaint_comments" ADD CONSTRAINT "complaint_comments_complaint_id_complaints_id_fk" FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaint_comments" ADD CONSTRAINT "complaint_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_submitter_id_users_id_fk" FOREIGN KEY ("submitter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_subject_user_id_users_id_fk" FOREIGN KEY ("subject_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_resolved_by_id_users_id_fk" FOREIGN KEY ("resolved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_escalated_by_id_users_id_fk" FOREIGN KEY ("escalated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_form_templates" ADD CONSTRAINT "consent_form_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_forms" ADD CONSTRAINT "consent_forms_template_id_consent_form_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."consent_form_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_forms" ADD CONSTRAINT "consent_forms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_forms" ADD CONSTRAINT "consent_forms_costar_user_id_users_id_fk" FOREIGN KEY ("costar_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_forms" ADD CONSTRAINT "consent_forms_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_notification_schedule" ADD CONSTRAINT "consent_notification_schedule_consent_form_id_consent_forms_id_fk" FOREIGN KEY ("consent_form_id") REFERENCES "public"."consent_forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content" ADD CONSTRAINT "content_creator_profile_id_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content" ADD CONSTRAINT "content_canonical_tenant_tenants_id_fk" FOREIGN KEY ("canonical_tenant") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_hashes" ADD CONSTRAINT "content_hashes_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_hashes" ADD CONSTRAINT "content_hashes_dmca_request_id_dmca_requests_id_fk" FOREIGN KEY ("dmca_request_id") REFERENCES "public"."dmca_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_tenant_map" ADD CONSTRAINT "content_tenant_map_content_id_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_tenant_map" ADD CONSTRAINT "content_tenant_map_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_verification" ADD CONSTRAINT "content_verification_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_verification" ADD CONSTRAINT "content_verification_matched_verified_content_id_verified_content_id_fk" FOREIGN KEY ("matched_verified_content_id") REFERENCES "public"."verified_content"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_verification" ADD CONSTRAINT "content_verification_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "costar_verifications" ADD CONSTRAINT "costar_verifications_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "costar_verifications" ADD CONSTRAINT "costar_verifications_live_stream_id_live_streams_id_fk" FOREIGN KEY ("live_stream_id") REFERENCES "public"."live_streams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "costar_verifications" ADD CONSTRAINT "costar_verifications_primary_creator_id_users_id_fk" FOREIGN KEY ("primary_creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "costar_verifications" ADD CONSTRAINT "costar_verifications_co_star_user_id_users_id_fk" FOREIGN KEY ("co_star_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "costar_verifications" ADD CONSTRAINT "costar_verifications_consent_document_2257_id_records_2257_id_fk" FOREIGN KEY ("consent_document_2257_id") REFERENCES "public"."records_2257"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "costar_verifications" ADD CONSTRAINT "costar_verifications_kyc_verification_id_identity_verifications_id_fk" FOREIGN KEY ("kyc_verification_id") REFERENCES "public"."identity_verifications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_charts" ADD CONSTRAINT "dashboard_charts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deepfake_reports" ADD CONSTRAINT "deepfake_reports_impersonated_creator_id_users_id_fk" FOREIGN KEY ("impersonated_creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deepfake_reports" ADD CONSTRAINT "deepfake_reports_reported_by_users_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deepfake_reports" ADD CONSTRAINT "deepfake_reports_verification_id_content_verification_id_fk" FOREIGN KEY ("verification_id") REFERENCES "public"."content_verification"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deepfake_reports" ADD CONSTRAINT "deepfake_reports_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deepfake_reports" ADD CONSTRAINT "deepfake_reports_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delegated_permissions" ADD CONSTRAINT "delegated_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delegated_permissions" ADD CONSTRAINT "delegated_permissions_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposit_methods" ADD CONSTRAINT "deposit_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_deposit_method_id_deposit_methods_id_fk" FOREIGN KEY ("deposit_method_id") REFERENCES "public"."deposit_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_gateway_id_payment_gateways_id_fk" FOREIGN KEY ("gateway_id") REFERENCES "public"."payment_gateways"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute_cases" ADD CONSTRAINT "dispute_cases_filed_by_users_id_fk" FOREIGN KEY ("filed_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute_cases" ADD CONSTRAINT "dispute_cases_against_user_users_id_fk" FOREIGN KEY ("against_user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute_cases" ADD CONSTRAINT "dispute_cases_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute_cases" ADD CONSTRAINT "dispute_cases_ruling_in_favor_of_users_id_fk" FOREIGN KEY ("ruling_in_favor_of") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dmca_requests" ADD CONSTRAINT "dmca_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dmca_requests" ADD CONSTRAINT "dmca_requests_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dmca_requests" ADD CONSTRAINT "dmca_requests_processor_id_users_id_fk" FOREIGN KEY ("processor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "earnings_analytics" ADD CONSTRAINT "earnings_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_settings" ADD CONSTRAINT "email_settings_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enhanced_transactions" ADD CONSTRAINT "enhanced_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendance" ADD CONSTRAINT "event_attendance_event_id_live_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."live_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendance" ADD CONSTRAINT "event_attendance_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_nft_souvenirs" ADD CONSTRAINT "event_nft_souvenirs_event_id_live_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."live_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_nft_souvenirs" ADD CONSTRAINT "event_nft_souvenirs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_event_id_live_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."live_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_fan_id_users_id_fk" FOREIGN KEY ("fan_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_transaction_id_fanz_ledger_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."fanz_ledger"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_tips" ADD CONSTRAINT "event_tips_event_id_live_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."live_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_tips" ADD CONSTRAINT "event_tips_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_tips" ADD CONSTRAINT "event_tips_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_tips" ADD CONSTRAINT "event_tips_transaction_id_fanz_ledger_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."fanz_ledger"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fan_creator_loans" ADD CONSTRAINT "fan_creator_loans_lender_id_users_id_fk" FOREIGN KEY ("lender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fan_creator_loans" ADD CONSTRAINT "fan_creator_loans_borrower_id_users_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fanz_cards" ADD CONSTRAINT "fanz_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fanz_cards" ADD CONSTRAINT "fanz_cards_wallet_id_fanz_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."fanz_wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fanz_credit_lines" ADD CONSTRAINT "fanz_credit_lines_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fanz_credit_lines" ADD CONSTRAINT "fanz_credit_lines_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fanz_ledger" ADD CONSTRAINT "fanz_ledger_wallet_id_fanz_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."fanz_wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fanz_ledger" ADD CONSTRAINT "fanz_ledger_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fanz_tokens" ADD CONSTRAINT "fanz_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fanz_wallets" ADD CONSTRAINT "fanz_wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faq_entries" ADD CONSTRAINT "faq_entries_category_id_wiki_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."wiki_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faq_entries" ADD CONSTRAINT "faq_entries_author_id_accounts_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_preferences" ADD CONSTRAINT "feed_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_reports" ADD CONSTRAINT "financial_reports_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_settings" ADD CONSTRAINT "financial_settings_last_modified_by_users_id_fk" FOREIGN KEY ("last_modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_alerts" ADD CONSTRAINT "fraud_alerts_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_alerts" ADD CONSTRAINT "fraud_alerts_deposit_id_deposits_id_fk" FOREIGN KEY ("deposit_id") REFERENCES "public"."deposits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_alerts" ADD CONSTRAINT "fraud_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_alerts" ADD CONSTRAINT "fraud_alerts_rule_id_fraud_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."fraud_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_alerts" ADD CONSTRAINT "fraud_alerts_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holographic_avatars" ADD CONSTRAINT "holographic_avatars_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holographic_sessions" ADD CONSTRAINT "holographic_sessions_holographic_stream_id_holographic_streams_id_fk" FOREIGN KEY ("holographic_stream_id") REFERENCES "public"."holographic_streams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holographic_sessions" ADD CONSTRAINT "holographic_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holographic_streams" ADD CONSTRAINT "holographic_streams_live_stream_id_live_streams_id_fk" FOREIGN KEY ("live_stream_id") REFERENCES "public"."live_streams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity_verifications" ADD CONSTRAINT "identity_verifications_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity_verifications" ADD CONSTRAINT "identity_verifications_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity_verifications" ADD CONSTRAINT "identity_verifications_reviewed_by_accounts_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_billing_profile_id_billing_profiles_id_fk" FOREIGN KEY ("billing_profile_id") REFERENCES "public"."billing_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_leaderboard_id_leaderboards_id_fk" FOREIGN KEY ("leaderboard_id") REFERENCES "public"."leaderboards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_events" ADD CONSTRAINT "live_events_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_streams" ADD CONSTRAINT "live_streams_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_repayments" ADD CONSTRAINT "loan_repayments_loan_id_fan_creator_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."fan_creator_loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lovense_accounts" ADD CONSTRAINT "lovense_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lovense_device_actions" ADD CONSTRAINT "lovense_device_actions_device_id_lovense_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."lovense_devices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lovense_device_actions" ADD CONSTRAINT "lovense_device_actions_stream_id_live_streams_id_fk" FOREIGN KEY ("stream_id") REFERENCES "public"."live_streams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lovense_device_actions" ADD CONSTRAINT "lovense_device_actions_triggered_by_user_id_users_id_fk" FOREIGN KEY ("triggered_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lovense_devices" ADD CONSTRAINT "lovense_devices_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lovense_integration_settings" ADD CONSTRAINT "lovense_integration_settings_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lovense_mappings" ADD CONSTRAINT "lovense_mappings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lovense_sessions" ADD CONSTRAINT "lovense_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lovense_sessions" ADD CONSTRAINT "lovense_sessions_stream_id_live_streams_id_fk" FOREIGN KEY ("stream_id") REFERENCES "public"."live_streams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_schedule" ADD CONSTRAINT "maintenance_schedule_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mass_message_templates" ADD CONSTRAINT "mass_message_templates_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_2257_links" ADD CONSTRAINT "media_2257_links_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_2257_links" ADD CONSTRAINT "media_2257_links_record_2257_id_records_2257_id_fk" FOREIGN KEY ("record_2257_id") REFERENCES "public"."records_2257"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_2257_links" ADD CONSTRAINT "media_2257_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_content_id_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_owner_id_profiles_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_variants" ADD CONSTRAINT "media_variants_asset_id_media_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_variants" ADD CONSTRAINT "media_variants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_moderations" ADD CONSTRAINT "message_moderations_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_moderations" ADD CONSTRAINT "message_moderations_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_moderations" ADD CONSTRAINT "message_moderations_moderator_id_users_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_releases" ADD CONSTRAINT "model_releases_content_id_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_releases" ADD CONSTRAINT "model_releases_performer_profile_id_profiles_id_fk" FOREIGN KEY ("performer_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_releases" ADD CONSTRAINT "model_releases_creator_profile_id_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_releases" ADD CONSTRAINT "model_releases_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_queue" ADD CONSTRAINT "moderation_queue_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_queue" ADD CONSTRAINT "moderation_queue_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "navigation_paths" ADD CONSTRAINT "navigation_paths_user_id_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_assets" ADD CONSTRAINT "nft_assets_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_assets" ADD CONSTRAINT "nft_assets_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_assets" ADD CONSTRAINT "nft_assets_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_collections" ADD CONSTRAINT "nft_collections_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_transactions" ADD CONSTRAINT "nft_transactions_nft_asset_id_nft_assets_id_fk" FOREIGN KEY ("nft_asset_id") REFERENCES "public"."nft_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_transactions" ADD CONSTRAINT "nft_transactions_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_transactions" ADD CONSTRAINT "nft_transactions_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_line_items" ADD CONSTRAINT "order_line_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_line_items" ADD CONSTRAINT "order_line_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_line_items" ADD CONSTRAINT "order_line_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_accounts" ADD CONSTRAINT "payout_accounts_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_payout_account_id_payout_accounts_id_fk" FOREIGN KEY ("payout_account_id") REFERENCES "public"."payout_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_tiers" ADD CONSTRAINT "performance_tiers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_media" ADD CONSTRAINT "post_media_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_media" ADD CONSTRAINT "post_media_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_history" ADD CONSTRAINT "pricing_history_rule_id_pricing_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."pricing_rules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_insights" ADD CONSTRAINT "pricing_insights_creator_profile_id_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_insights" ADD CONSTRAINT "pricing_insights_rule_id_pricing_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."pricing_rules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_creator_profile_id_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_content_id_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_product_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_tenant" ADD CONSTRAINT "profile_tenant_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_tenant" ADD CONSTRAINT "profile_tenant_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_code_usages" ADD CONSTRAINT "promo_code_usages_promo_code_id_promo_codes_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_code_usages" ADD CONSTRAINT "promo_code_usages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_code_usages" ADD CONSTRAINT "promo_code_usages_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_fan_profile_id_profiles_id_fk" FOREIGN KEY ("fan_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_creator_profile_id_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_content_id_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_notification_campaigns" ADD CONSTRAINT "push_notification_campaigns_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_notification_campaigns" ADD CONSTRAINT "push_notification_campaigns_ab_test_parent_id_push_notification_campaigns_id_fk" FOREIGN KEY ("ab_test_parent_id") REFERENCES "public"."push_notification_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_notification_deliveries" ADD CONSTRAINT "push_notification_deliveries_campaign_id_push_notification_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."push_notification_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_notification_deliveries" ADD CONSTRAINT "push_notification_deliveries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quest_milestones" ADD CONSTRAINT "quest_milestones_quest_id_revenue_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."revenue_quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quest_participants" ADD CONSTRAINT "quest_participants_quest_id_revenue_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."revenue_quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quest_participants" ADD CONSTRAINT "quest_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "records_2257" ADD CONSTRAINT "records_2257_content_id_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "records_2257" ADD CONSTRAINT "records_2257_performer_profile_id_profiles_id_fk" FOREIGN KEY ("performer_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "records_2257" ADD CONSTRAINT "records_2257_custodian_account_id_accounts_id_fk" FOREIGN KEY ("custodian_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_achievements" ADD CONSTRAINT "referral_achievements_user_id_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_analytics" ADD CONSTRAINT "referral_analytics_referrer_id_accounts_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_analytics" ADD CONSTRAINT "referral_analytics_campaign_id_referral_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."referral_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_analytics" ADD CONSTRAINT "referral_analytics_referral_code_id_referral_codes_id_fk" FOREIGN KEY ("referral_code_id") REFERENCES "public"."referral_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_campaigns" ADD CONSTRAINT "referral_campaigns_created_by_accounts_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_user_id_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_campaign_id_referral_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."referral_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_earnings" ADD CONSTRAINT "referral_earnings_referrer_id_accounts_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_earnings" ADD CONSTRAINT "referral_earnings_referee_id_accounts_id_fk" FOREIGN KEY ("referee_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_earnings" ADD CONSTRAINT "referral_earnings_referral_code_id_referral_codes_id_fk" FOREIGN KEY ("referral_code_id") REFERENCES "public"."referral_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_earnings" ADD CONSTRAINT "referral_earnings_campaign_id_referral_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."referral_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_earnings" ADD CONSTRAINT "referral_earnings_relationship_id_referral_relationships_id_fk" FOREIGN KEY ("relationship_id") REFERENCES "public"."referral_relationships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_earnings" ADD CONSTRAINT "referral_earnings_tracking_id_referral_tracking_id_fk" FOREIGN KEY ("tracking_id") REFERENCES "public"."referral_tracking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_earnings" ADD CONSTRAINT "referral_earnings_processed_by_accounts_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_fraud_events" ADD CONSTRAINT "referral_fraud_events_referrer_id_accounts_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_fraud_events" ADD CONSTRAINT "referral_fraud_events_referee_id_accounts_id_fk" FOREIGN KEY ("referee_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_fraud_events" ADD CONSTRAINT "referral_fraud_events_referral_code_id_referral_codes_id_fk" FOREIGN KEY ("referral_code_id") REFERENCES "public"."referral_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_fraud_events" ADD CONSTRAINT "referral_fraud_events_tracking_id_referral_tracking_id_fk" FOREIGN KEY ("tracking_id") REFERENCES "public"."referral_tracking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_fraud_events" ADD CONSTRAINT "referral_fraud_events_investigated_by_accounts_id_fk" FOREIGN KEY ("investigated_by") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_relationships" ADD CONSTRAINT "referral_relationships_referrer_id_accounts_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_relationships" ADD CONSTRAINT "referral_relationships_referee_id_accounts_id_fk" FOREIGN KEY ("referee_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_relationships" ADD CONSTRAINT "referral_relationships_referral_code_id_referral_codes_id_fk" FOREIGN KEY ("referral_code_id") REFERENCES "public"."referral_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_relationships" ADD CONSTRAINT "referral_relationships_campaign_id_referral_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."referral_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_relationships" ADD CONSTRAINT "referral_relationships_tracking_id_referral_tracking_id_fk" FOREIGN KEY ("tracking_id") REFERENCES "public"."referral_tracking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_relationships" ADD CONSTRAINT "referral_relationships_verified_by_accounts_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_tracking" ADD CONSTRAINT "referral_tracking_referral_code_id_referral_codes_id_fk" FOREIGN KEY ("referral_code_id") REFERENCES "public"."referral_codes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_tracking" ADD CONSTRAINT "referral_tracking_referrer_id_accounts_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_tracking" ADD CONSTRAINT "referral_tracking_converted_user_id_accounts_id_fk" FOREIGN KEY ("converted_user_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repeat_infringers" ADD CONSTRAINT "repeat_infringers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_user_id_users_id_fk" FOREIGN KEY ("reported_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_post_id_posts_id_fk" FOREIGN KEY ("reported_post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_quests" ADD CONSTRAINT "revenue_quests_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_analytics" ADD CONSTRAINT "search_analytics_user_id_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_provider_alerts" ADD CONSTRAINT "storage_provider_alerts_provider_id_storage_provider_configs_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."storage_provider_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_provider_alerts" ADD CONSTRAINT "storage_provider_alerts_acknowledged_by_users_id_fk" FOREIGN KEY ("acknowledged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_provider_alerts" ADD CONSTRAINT "storage_provider_alerts_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_provider_configs" ADD CONSTRAINT "storage_provider_configs_configured_by_users_id_fk" FOREIGN KEY ("configured_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_provider_configs" ADD CONSTRAINT "storage_provider_configs_last_configured_by_users_id_fk" FOREIGN KEY ("last_configured_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_provider_costs" ADD CONSTRAINT "storage_provider_costs_provider_id_storage_provider_configs_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."storage_provider_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_provider_failover" ADD CONSTRAINT "storage_provider_failover_primary_provider_id_storage_provider_configs_id_fk" FOREIGN KEY ("primary_provider_id") REFERENCES "public"."storage_provider_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_provider_failover" ADD CONSTRAINT "storage_provider_failover_backup_provider_id_storage_provider_configs_id_fk" FOREIGN KEY ("backup_provider_id") REFERENCES "public"."storage_provider_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_provider_failover" ADD CONSTRAINT "storage_provider_failover_configured_by_users_id_fk" FOREIGN KEY ("configured_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_provider_health" ADD CONSTRAINT "storage_provider_health_provider_id_storage_provider_configs_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."storage_provider_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_replies" ADD CONSTRAINT "story_replies_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_replies" ADD CONSTRAINT "story_replies_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_views" ADD CONSTRAINT "story_views_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_views" ADD CONSTRAINT "story_views_viewer_id_users_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stream_viewers" ADD CONSTRAINT "stream_viewers_stream_id_live_streams_id_fk" FOREIGN KEY ("stream_id") REFERENCES "public"."live_streams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stream_viewers" ADD CONSTRAINT "stream_viewers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD CONSTRAINT "subscription_plans_creator_profile_id_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD CONSTRAINT "subscription_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_fan_profile_id_profiles_id_fk" FOREIGN KEY ("fan_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions_enhanced" ADD CONSTRAINT "subscriptions_enhanced_fan_id_users_id_fk" FOREIGN KEY ("fan_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions_enhanced" ADD CONSTRAINT "subscriptions_enhanced_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions_enhanced" ADD CONSTRAINT "subscriptions_enhanced_subscription_plan_id_subscription_plans_id_fk" FOREIGN KEY ("subscription_plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions_enhanced" ADD CONSTRAINT "subscriptions_enhanced_promo_code_id_promo_codes_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_accounts_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_setting_history" ADD CONSTRAINT "system_setting_history_setting_id_system_settings_id_fk" FOREIGN KEY ("setting_id") REFERENCES "public"."system_settings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_setting_history" ADD CONSTRAINT "system_setting_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_last_modified_by_users_id_fk" FOREIGN KEY ("last_modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_records" ADD CONSTRAINT "tax_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_author_id_accounts_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_proofs" ADD CONSTRAINT "trust_proofs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_proofs" ADD CONSTRAINT "trust_proofs_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_scores" ADD CONSTRAINT "trust_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutorials" ADD CONSTRAINT "tutorials_author_id_accounts_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutorials" ADD CONSTRAINT "tutorials_category_id_tutorial_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."tutorial_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutorials" ADD CONSTRAINT "tutorials_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_leaderboard_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."leaderboard_achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity_log" ADD CONSTRAINT "user_activity_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_communication_preferences" ADD CONSTRAINT "user_communication_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_milestones" ADD CONSTRAINT "user_milestones_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_milestones" ADD CONSTRAINT "user_milestones_milestone_id_performance_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."performance_milestones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_suspensions" ADD CONSTRAINT "user_suspensions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_suspensions" ADD CONSTRAINT "user_suspensions_suspended_by_users_id_fk" FOREIGN KEY ("suspended_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_suspensions" ADD CONSTRAINT "user_suspensions_lifted_by_users_id_fk" FOREIGN KEY ("lifted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_suspensions" ADD CONSTRAINT "user_suspensions_appeal_decided_by_users_id_fk" FOREIGN KEY ("appeal_decided_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tutorial_progress" ADD CONSTRAINT "user_tutorial_progress_user_id_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tutorial_progress" ADD CONSTRAINT "user_tutorial_progress_tutorial_id_tutorials_id_fk" FOREIGN KEY ("tutorial_id") REFERENCES "public"."tutorials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verified_content" ADD CONSTRAINT "verified_content_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_message_templates" ADD CONSTRAINT "voice_message_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_messages" ADD CONSTRAINT "voice_messages_voice_profile_id_voice_profiles_id_fk" FOREIGN KEY ("voice_profile_id") REFERENCES "public"."voice_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_messages" ADD CONSTRAINT "voice_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_messages" ADD CONSTRAINT "voice_messages_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_profiles" ADD CONSTRAINT "voice_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wiki_articles" ADD CONSTRAINT "wiki_articles_author_id_accounts_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wiki_articles" ADD CONSTRAINT "wiki_articles_last_edited_by_accounts_id_fk" FOREIGN KEY ("last_edited_by") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wiki_articles" ADD CONSTRAINT "wiki_articles_reviewed_by_accounts_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wiki_articles" ADD CONSTRAINT "wiki_articles_category_id_wiki_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."wiki_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wiki_categories" ADD CONSTRAINT "wiki_categories_parent_id_wiki_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."wiki_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pwa_device_subscriptions" ADD CONSTRAINT "pwa_device_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pwa_feature_flags" ADD CONSTRAINT "pwa_feature_flags_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pwa_installation_analytics" ADD CONSTRAINT "pwa_installation_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pwa_offline_sync_queue" ADD CONSTRAINT "pwa_offline_sync_queue_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pwa_push_notification_queue" ADD CONSTRAINT "pwa_push_notification_queue_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pwa_push_notification_queue" ADD CONSTRAINT "pwa_push_notification_queue_device_subscription_id_pwa_device_subscriptions_id_fk" FOREIGN KEY ("device_subscription_id") REFERENCES "public"."pwa_device_subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pwa_usage_analytics" ADD CONSTRAINT "pwa_usage_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_account_identity_account" ON "account_identity" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_account_role_account" ON "account_role" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_account_role_tenant" ON "account_role" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_accounts_email" ON "accounts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_accounts_status" ON "accounts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_ad_campaigns_advertiser" ON "ad_campaigns" USING btree ("advertiser_profile_id");--> statement-breakpoint
CREATE INDEX "idx_ad_campaigns_tenant" ON "ad_campaigns" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_ad_campaigns_status" ON "ad_campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_ad_campaigns_type" ON "ad_campaigns" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_ad_creatives_campaign" ON "ad_creatives" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "idx_ad_creatives_status" ON "ad_creatives" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_ad_creatives_kind" ON "ad_creatives" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "idx_ad_impressions_creative" ON "ad_impressions" USING btree ("creative_id");--> statement-breakpoint
CREATE INDEX "idx_ad_impressions_placement" ON "ad_impressions" USING btree ("placement_id");--> statement-breakpoint
CREATE INDEX "idx_ad_impressions_tenant" ON "ad_impressions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_ad_impressions_profile" ON "ad_impressions" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_ad_impressions_timestamp" ON "ad_impressions" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_ad_impressions_clicked" ON "ad_impressions" USING btree ("clicked");--> statement-breakpoint
CREATE INDEX "idx_ad_placements_tenant" ON "ad_placements" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_ad_placements_type" ON "ad_placements" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_admin_dashboard_user" ON "admin_dashboard_configs" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_admin_report_runs_template" ON "admin_report_runs" USING btree ("template_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_admin_report_runs_status" ON "admin_report_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_admin_reports_type_active" ON "admin_report_templates" USING btree ("type","is_active");--> statement-breakpoint
CREATE INDEX "idx_admin_reports_next_scheduled" ON "admin_report_templates" USING btree ("next_scheduled");--> statement-breakpoint
CREATE INDEX "idx_affiliate_profiles_user" ON "affiliate_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_affiliate_profiles_affiliate_id" ON "affiliate_profiles" USING btree ("affiliate_id");--> statement-breakpoint
CREATE INDEX "idx_affiliate_profiles_status" ON "affiliate_profiles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_affiliate_profiles_tier" ON "affiliate_profiles" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "idx_affiliate_profiles_performance" ON "affiliate_profiles" USING btree ("total_earnings","conversion_rate");--> statement-breakpoint
CREATE INDEX "idx_aml_checks_user" ON "aml_checks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_aml_checks_type" ON "aml_checks" USING btree ("check_type");--> statement-breakpoint
CREATE INDEX "idx_aml_checks_status" ON "aml_checks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_aml_checks_expires_at" ON "aml_checks" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_analytics_events_timestamp" ON "analytics_events" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_analytics_events_user_id" ON "analytics_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_analytics_events_type" ON "analytics_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_announcement_deliveries_user" ON "announcement_deliveries" USING btree ("announcement_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_announcement_deliveries_status" ON "announcement_deliveries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_announcement_deliveries_channel" ON "announcement_deliveries" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "idx_announcements_status" ON "announcements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_announcements_creator" ON "announcements" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "idx_announcements_scheduled" ON "announcements" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "idx_announcements_type" ON "announcements" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_actor_account" ON "audit_logs" USING btree ("actor_account_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_actor_profile" ON "audit_logs" USING btree ("actor_profile_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_tenant" ON "audit_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_subject" ON "audit_logs" USING btree ("subject_table","subject_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_timestamp" ON "audit_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_severity" ON "audit_logs" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_email_recovery_token" ON "auth_email_recovery_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "idx_email_recovery_account" ON "auth_email_recovery_tokens" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_email_recovery_expires" ON "auth_email_recovery_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_email_verify_token" ON "auth_email_verification_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "idx_email_verify_account" ON "auth_email_verification_tokens" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_email_verify_expires" ON "auth_email_verification_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_login_attempts_ip" ON "auth_login_attempts" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "idx_login_attempts_account" ON "auth_login_attempts" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_login_attempts_email" ON "auth_login_attempts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_login_attempts_blocked" ON "auth_login_attempts" USING btree ("blocked_until");--> statement-breakpoint
CREATE INDEX "idx_password_reset_token" ON "auth_password_reset_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "idx_password_reset_account" ON "auth_password_reset_tokens" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_password_reset_expires" ON "auth_password_reset_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_billing_profiles_user" ON "billing_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_billing_profiles_tax_id" ON "billing_profiles" USING btree ("tax_id");--> statement-breakpoint
CREATE INDEX "idx_comment_mods_comment" ON "comment_moderations" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "idx_comment_mods_status" ON "comment_moderations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_comment_mods_moderator" ON "comment_moderations" USING btree ("moderator_id");--> statement-breakpoint
CREATE INDEX "idx_comments_post_created_at" ON "comments" USING btree ("post_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_comments_user_id" ON "comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_comm_analytics_date_type" ON "communication_analytics" USING btree ("date","type");--> statement-breakpoint
CREATE INDEX "idx_comm_analytics_type" ON "communication_analytics" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_complaint_comments_complaint" ON "complaint_comments" USING btree ("complaint_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_complaints_status_priority" ON "complaints" USING btree ("status","priority");--> statement-breakpoint
CREATE INDEX "idx_complaints_assigned_status" ON "complaints" USING btree ("assigned_to_id","status");--> statement-breakpoint
CREATE INDEX "idx_complaints_category_created" ON "complaints" USING btree ("category","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_consent_forms_user" ON "consent_forms" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_consent_forms_status" ON "consent_forms" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_consent_forms_expires" ON "consent_forms" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_consent_forms_costar" ON "consent_forms" USING btree ("costar_user_id");--> statement-breakpoint
CREATE INDEX "idx_consent_notifications_scheduled" ON "consent_notification_schedule" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "idx_consent_notifications_status" ON "consent_notification_schedule" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_content_creator" ON "content" USING btree ("creator_profile_id");--> statement-breakpoint
CREATE INDEX "idx_content_tenant" ON "content" USING btree ("canonical_tenant");--> statement-breakpoint
CREATE INDEX "idx_content_status" ON "content" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_content_published" ON "content" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "idx_content_hash" ON "content_hashes" USING btree ("hash");--> statement-breakpoint
CREATE INDEX "idx_content_hash_algorithm" ON "content_hashes" USING btree ("algorithm");--> statement-breakpoint
CREATE INDEX "idx_content_tenant_map_content" ON "content_tenant_map" USING btree ("content_id");--> statement-breakpoint
CREATE INDEX "idx_content_tenant_map_tenant" ON "content_tenant_map" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_verification_content_url" ON "content_verification" USING btree ("content_url");--> statement-breakpoint
CREATE INDEX "idx_verification_status" ON "content_verification" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_verification_creator" ON "content_verification" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "idx_costar_media_creator" ON "costar_verifications" USING btree ("media_id","primary_creator_id");--> statement-breakpoint
CREATE INDEX "idx_costar_stream_creator" ON "costar_verifications" USING btree ("live_stream_id","primary_creator_id");--> statement-breakpoint
CREATE INDEX "idx_costar_status" ON "costar_verifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_costar_invite_token" ON "costar_verifications" USING btree ("invite_token");--> statement-breakpoint
CREATE INDEX "idx_custodian_active" ON "custodian_of_records" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_deepfake_reports_creator" ON "deepfake_reports" USING btree ("impersonated_creator_id");--> statement-breakpoint
CREATE INDEX "idx_deepfake_reports_status" ON "deepfake_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_deepfake_reports_source" ON "deepfake_reports" USING btree ("report_source");--> statement-breakpoint
CREATE INDEX "idx_deposit_methods_user" ON "deposit_methods" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_deposit_methods_method" ON "deposit_methods" USING btree ("method");--> statement-breakpoint
CREATE INDEX "idx_deposit_methods_verification" ON "deposit_methods" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "idx_deposits_user" ON "deposits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_deposits_status" ON "deposits" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_deposits_aml_status" ON "deposits" USING btree ("aml_status");--> statement-breakpoint
CREATE INDEX "idx_deposits_created_at" ON "deposits" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_deposits_reference" ON "deposits" USING btree ("reference_number");--> statement-breakpoint
CREATE INDEX "idx_dispute_cases_filed_by" ON "dispute_cases" USING btree ("filed_by");--> statement-breakpoint
CREATE INDEX "idx_dispute_cases_against" ON "dispute_cases" USING btree ("against_user");--> statement-breakpoint
CREATE INDEX "idx_dispute_cases_status" ON "dispute_cases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_dispute_cases_type" ON "dispute_cases" USING btree ("dispute_type");--> statement-breakpoint
CREATE INDEX "idx_dispute_cases_assigned" ON "dispute_cases" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "idx_earnings_analytics_user_period" ON "earnings_analytics" USING btree ("user_id","period","period_start");--> statement-breakpoint
CREATE INDEX "idx_email_settings_default" ON "email_settings" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "idx_email_settings_active" ON "email_settings" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_enhanced_transactions_user_date" ON "enhanced_transactions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_enhanced_transactions_type" ON "enhanced_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_enhanced_transactions_tier" ON "enhanced_transactions" USING btree ("performance_tier");--> statement-breakpoint
CREATE INDEX "idx_event_attendance_event" ON "event_attendance" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_event_attendance_user" ON "event_attendance" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_event_attendance_active" ON "event_attendance" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_event_nft_event" ON "event_nft_souvenirs" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_event_nft_user" ON "event_nft_souvenirs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_event_nft_token" ON "event_nft_souvenirs" USING btree ("token_id");--> statement-breakpoint
CREATE INDEX "idx_event_tickets_event" ON "event_tickets" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_event_tickets_fan" ON "event_tickets" USING btree ("fan_id");--> statement-breakpoint
CREATE INDEX "idx_event_tips_event" ON "event_tips" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_event_tips_from" ON "event_tips" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "idx_event_tips_to" ON "event_tips" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "idx_fan_creator_loans_lender" ON "fan_creator_loans" USING btree ("lender_id");--> statement-breakpoint
CREATE INDEX "idx_fan_creator_loans_borrower" ON "fan_creator_loans" USING btree ("borrower_id");--> statement-breakpoint
CREATE INDEX "idx_fan_creator_loans_status" ON "fan_creator_loans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_fan_creator_loans_trust_score" ON "fan_creator_loans" USING btree ("trust_score");--> statement-breakpoint
CREATE INDEX "idx_fan_creator_loans_due_date" ON "fan_creator_loans" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "idx_fanz_cards_user" ON "fanz_cards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_fanz_cards_wallet" ON "fanz_cards" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "idx_fanz_cards_status" ON "fanz_cards" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_fanz_cards_last4" ON "fanz_cards" USING btree ("last_4");--> statement-breakpoint
CREATE INDEX "idx_fanz_credit_lines_user" ON "fanz_credit_lines" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_fanz_credit_lines_status" ON "fanz_credit_lines" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_fanz_credit_lines_trust_score" ON "fanz_credit_lines" USING btree ("trust_score");--> statement-breakpoint
CREATE INDEX "idx_fanz_ledger_wallet" ON "fanz_ledger" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "idx_fanz_ledger_user" ON "fanz_ledger" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_fanz_ledger_transaction" ON "fanz_ledger" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "idx_fanz_ledger_type" ON "fanz_ledger" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "idx_fanz_ledger_created" ON "fanz_ledger" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_fanz_revenue_shares_reference" ON "fanz_revenue_shares" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE INDEX "idx_fanz_revenue_shares_type" ON "fanz_revenue_shares" USING btree ("split_type");--> statement-breakpoint
CREATE INDEX "idx_fanz_revenue_shares_status" ON "fanz_revenue_shares" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_fanz_tokens_user" ON "fanz_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_fanz_tokens_type" ON "fanz_tokens" USING btree ("token_type");--> statement-breakpoint
CREATE INDEX "idx_fanz_wallets_user" ON "fanz_wallets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_fanz_wallets_status" ON "fanz_wallets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_fanz_wallets_type" ON "fanz_wallets" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_faq_entries_category" ON "faq_entries" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_faq_entries_author" ON "faq_entries" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_faq_entries_sort" ON "faq_entries" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_financial_reports_type" ON "financial_reports" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_financial_reports_generated_by" ON "financial_reports" USING btree ("generated_by");--> statement-breakpoint
CREATE INDEX "idx_financial_reports_generated_at" ON "financial_reports" USING btree ("generated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_financial_settings_category" ON "financial_settings" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_financial_settings_effective" ON "financial_settings" USING btree ("effective_from","effective_to");--> statement-breakpoint
CREATE INDEX "idx_fraud_alerts_user" ON "fraud_alerts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_fraud_alerts_status" ON "fraud_alerts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_fraud_alerts_risk_level" ON "fraud_alerts" USING btree ("risk_level");--> statement-breakpoint
CREATE INDEX "idx_fraud_alerts_created_at" ON "fraud_alerts" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_fraud_rules_type" ON "fraud_rules" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_fraud_rules_active" ON "fraud_rules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_fraud_rules_priority" ON "fraud_rules" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_holographic_avatars_user" ON "holographic_avatars" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_holographic_sessions_stream_user" ON "holographic_sessions" USING btree ("holographic_stream_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_holographic_active_sessions" ON "holographic_sessions" USING btree ("holographic_stream_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_holographic_live_stream" ON "holographic_streams" USING btree ("live_stream_id");--> statement-breakpoint
CREATE INDEX "idx_holographic_mode" ON "holographic_streams" USING btree ("mode");--> statement-breakpoint
CREATE INDEX "idx_identity_verifications_account" ON "identity_verifications" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_identity_verifications_profile" ON "identity_verifications" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_identity_verifications_status" ON "identity_verifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_identity_verifications_vendor" ON "identity_verifications" USING btree ("vendor");--> statement-breakpoint
CREATE INDEX "idx_invoices_billing_profile" ON "invoices" USING btree ("billing_profile_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_customer" ON "invoices" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_status" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_invoices_due_date" ON "invoices" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "idx_kyc_documents_user" ON "kyc_documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_kyc_documents_type" ON "kyc_documents" USING btree ("document_type");--> statement-breakpoint
CREATE INDEX "idx_kyc_documents_status" ON "kyc_documents" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "idx_leaderboard_entries_rank" ON "leaderboard_entries" USING btree ("leaderboard_id","rank");--> statement-breakpoint
CREATE INDEX "idx_leaderboard_entries_score" ON "leaderboard_entries" USING btree ("leaderboard_id","score" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_leaderboard_entries_user" ON "leaderboard_entries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_leaderboards_type_period" ON "leaderboards" USING btree ("type","period");--> statement-breakpoint
CREATE INDEX "idx_leaderboards_active" ON "leaderboards" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_likes_post_id" ON "likes" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_likes_comment_id" ON "likes" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "idx_live_events_creator" ON "live_events" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "idx_live_events_status" ON "live_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_live_events_type" ON "live_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_live_events_scheduled_start" ON "live_events" USING btree ("scheduled_start_at");--> statement-breakpoint
CREATE INDEX "idx_loan_repayments_loan" ON "loan_repayments" USING btree ("loan_id");--> statement-breakpoint
CREATE INDEX "idx_loan_repayments_due_date" ON "loan_repayments" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "idx_loan_repayments_status" ON "loan_repayments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_lovense_actions_device_created" ON "lovense_device_actions" USING btree ("device_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_lovense_actions_stream_created" ON "lovense_device_actions" USING btree ("stream_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_lovense_creator_device" ON "lovense_devices" USING btree ("creator_id","device_id");--> statement-breakpoint
CREATE INDEX "idx_lovense_mappings_user_event" ON "lovense_mappings" USING btree ("user_id","event_type");--> statement-breakpoint
CREATE INDEX "idx_lovense_sessions_user_session" ON "lovense_sessions" USING btree ("user_id","session_id");--> statement-breakpoint
CREATE INDEX "idx_lovense_sessions_stream" ON "lovense_sessions" USING btree ("stream_id","connected_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_lovense_sessions_status" ON "lovense_sessions" USING btree ("connection_status");--> statement-breakpoint
CREATE INDEX "idx_maintenance_schedule_start" ON "maintenance_schedule" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "idx_maintenance_schedule_status" ON "maintenance_schedule" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_maintenance_schedule_type" ON "maintenance_schedule" USING btree ("maintenance_type");--> statement-breakpoint
CREATE INDEX "idx_msg_templates_creator_type" ON "mass_message_templates" USING btree ("creator_id","type");--> statement-breakpoint
CREATE INDEX "idx_msg_templates_active" ON "mass_message_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_media_2257_media_user_role" ON "media_2257_links" USING btree ("media_id","user_id","role");--> statement-breakpoint
CREATE INDEX "idx_media_assets_content" ON "media_assets" USING btree ("content_id");--> statement-breakpoint
CREATE INDEX "idx_media_assets_owner" ON "media_assets" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_media_assets_status" ON "media_assets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_media_assets_checksum" ON "media_assets" USING btree ("checksum_sha256");--> statement-breakpoint
CREATE INDEX "idx_media_assets_perceptual" ON "media_assets" USING btree ("perceptual_hash");--> statement-breakpoint
CREATE INDEX "idx_media_variants_asset" ON "media_variants" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "idx_media_variants_tenant" ON "media_variants" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_msg_mods_message" ON "message_moderations" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "idx_msg_mods_status" ON "message_moderations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_msg_mods_moderator" ON "message_moderations" USING btree ("moderator_id");--> statement-breakpoint
CREATE INDEX "idx_messages_receiver_created_at" ON "messages" USING btree ("receiver_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_messages_sender_created_at" ON "messages" USING btree ("sender_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_messages_sender_receiver" ON "messages" USING btree ("sender_id","receiver_id");--> statement-breakpoint
CREATE INDEX "idx_messages_read_at" ON "messages" USING btree ("read_at");--> statement-breakpoint
CREATE INDEX "idx_model_releases_content" ON "model_releases" USING btree ("content_id");--> statement-breakpoint
CREATE INDEX "idx_model_releases_performer" ON "model_releases" USING btree ("performer_profile_id");--> statement-breakpoint
CREATE INDEX "idx_model_releases_creator" ON "model_releases" USING btree ("creator_profile_id");--> statement-breakpoint
CREATE INDEX "idx_model_releases_tenant" ON "model_releases" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_model_releases_status" ON "model_releases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_navigation_paths_user" ON "navigation_paths" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_navigation_paths_session" ON "navigation_paths" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_navigation_paths_timestamp" ON "navigation_paths" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_nft_assets_creator" ON "nft_assets" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "idx_nft_assets_owner" ON "nft_assets" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_nft_assets_media" ON "nft_assets" USING btree ("media_asset_id");--> statement-breakpoint
CREATE INDEX "idx_nft_assets_status" ON "nft_assets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_nft_collections_creator" ON "nft_collections" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "idx_nft_transactions_asset" ON "nft_transactions" USING btree ("nft_asset_id");--> statement-breakpoint
CREATE INDEX "idx_nft_transactions_from" ON "nft_transactions" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "idx_nft_transactions_to" ON "nft_transactions" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "idx_nft_transactions_type" ON "nft_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_order_line_items_order" ON "order_line_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_line_items_product" ON "order_line_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_orders_customer" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_orders_creator" ON "orders" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "idx_orders_status" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_orders_number" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "idx_payment_gateways_type" ON "payment_gateways" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_payment_gateways_status" ON "payment_gateways" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payment_gateways_priority" ON "payment_gateways" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_payout_accounts_profile" ON "payout_accounts" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_payout_accounts_status" ON "payout_accounts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payouts_profile" ON "payouts" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_payouts_account" ON "payouts" USING btree ("payout_account_id");--> statement-breakpoint
CREATE INDEX "idx_payouts_tenant" ON "payouts" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_payouts_status" ON "payouts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payouts_scheduled" ON "payouts" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "idx_performance_tiers_user_period" ON "performance_tiers" USING btree ("user_id","period_start");--> statement-breakpoint
CREATE INDEX "idx_performance_tiers_tier" ON "performance_tiers" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "idx_posts_creator_created_at" ON "posts" USING btree ("creator_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_posts_visibility" ON "posts" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "idx_posts_scheduled_for" ON "posts" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "idx_pricing_history_rule" ON "pricing_history" USING btree ("rule_id");--> statement-breakpoint
CREATE INDEX "idx_pricing_history_effective" ON "pricing_history" USING btree ("effective_from");--> statement-breakpoint
CREATE INDEX "idx_pricing_insights_creator" ON "pricing_insights" USING btree ("creator_profile_id");--> statement-breakpoint
CREATE INDEX "idx_pricing_insights_rule" ON "pricing_insights" USING btree ("rule_id");--> statement-breakpoint
CREATE INDEX "idx_pricing_insights_type" ON "pricing_insights" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_pricing_insights_priority" ON "pricing_insights" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_pricing_rules_creator" ON "pricing_rules" USING btree ("creator_profile_id");--> statement-breakpoint
CREATE INDEX "idx_pricing_rules_content" ON "pricing_rules" USING btree ("content_id");--> statement-breakpoint
CREATE INDEX "idx_pricing_rules_plan" ON "pricing_rules" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "idx_pricing_rules_status" ON "pricing_rules" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_product_categories_parent" ON "product_categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_product_categories_active" ON "product_categories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_product_variants_product" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_product_variants_sku" ON "product_variants" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "idx_products_creator_status" ON "products" USING btree ("creator_id","status");--> statement-breakpoint
CREATE INDEX "idx_products_category" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_products_status" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_profile_tenant_profile" ON "profile_tenant" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_profile_tenant_tenant" ON "profile_tenant" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_profiles_handle" ON "profiles" USING btree ("handle");--> statement-breakpoint
CREATE INDEX "idx_profiles_account" ON "profiles" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_profiles_type" ON "profiles" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_profiles_kyc_status" ON "profiles" USING btree ("kyc_status");--> statement-breakpoint
CREATE INDEX "idx_profiles_sanctions_status" ON "profiles" USING btree ("sanctions_status");--> statement-breakpoint
CREATE INDEX "idx_promo_usage_code" ON "promo_code_usages" USING btree ("promo_code_id");--> statement-breakpoint
CREATE INDEX "idx_promo_usage_user" ON "promo_code_usages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_promo_codes_code" ON "promo_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_promo_codes_creator_active" ON "promo_codes" USING btree ("creator_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_promo_codes_status" ON "promo_codes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_purchases_fan" ON "purchases" USING btree ("fan_profile_id");--> statement-breakpoint
CREATE INDEX "idx_purchases_creator" ON "purchases" USING btree ("creator_profile_id");--> statement-breakpoint
CREATE INDEX "idx_purchases_content" ON "purchases" USING btree ("content_id");--> statement-breakpoint
CREATE INDEX "idx_purchases_tenant" ON "purchases" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_purchases_status" ON "purchases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_push_campaigns_status" ON "push_notification_campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_push_campaigns_creator" ON "push_notification_campaigns" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "idx_push_campaigns_scheduled" ON "push_notification_campaigns" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "idx_push_deliveries_campaign_user" ON "push_notification_deliveries" USING btree ("campaign_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_push_deliveries_status" ON "push_notification_deliveries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_push_deliveries_platform" ON "push_notification_deliveries" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "idx_quest_milestones_quest" ON "quest_milestones" USING btree ("quest_id");--> statement-breakpoint
CREATE INDEX "idx_quest_participants_quest" ON "quest_participants" USING btree ("quest_id");--> statement-breakpoint
CREATE INDEX "idx_quest_participants_user" ON "quest_participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_records_2257_content" ON "records_2257" USING btree ("content_id");--> statement-breakpoint
CREATE INDEX "idx_records_2257_performer" ON "records_2257" USING btree ("performer_profile_id");--> statement-breakpoint
CREATE INDEX "idx_records_2257_custodian" ON "records_2257" USING btree ("custodian_account_id");--> statement-breakpoint
CREATE INDEX "idx_records_2257_type" ON "records_2257" USING btree ("doc_type");--> statement-breakpoint
CREATE INDEX "idx_records_2257_jurisdiction" ON "records_2257" USING btree ("jurisdiction");--> statement-breakpoint
CREATE INDEX "idx_referral_achievements_user" ON "referral_achievements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_referral_achievements_type" ON "referral_achievements" USING btree ("achievement_type");--> statement-breakpoint
CREATE INDEX "idx_referral_achievements_status" ON "referral_achievements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_referral_analytics_timeframe" ON "referral_analytics" USING btree ("timeframe","period_start");--> statement-breakpoint
CREATE INDEX "idx_referral_analytics_referrer" ON "referral_analytics" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "idx_referral_analytics_campaign" ON "referral_analytics" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "idx_referral_analytics_metric" ON "referral_analytics" USING btree ("metric_type");--> statement-breakpoint
CREATE INDEX "idx_referral_analytics_geography" ON "referral_analytics" USING btree ("country","region");--> statement-breakpoint
CREATE INDEX "idx_referral_analytics_device" ON "referral_analytics" USING btree ("device_type");--> statement-breakpoint
CREATE INDEX "idx_referral_campaigns_status" ON "referral_campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_referral_campaigns_dates" ON "referral_campaigns" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "idx_referral_campaigns_creator" ON "referral_campaigns" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_referral_codes_user" ON "referral_codes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_referral_codes_status" ON "referral_codes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_referral_codes_campaign" ON "referral_codes" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "idx_referral_codes_expires" ON "referral_codes" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_referral_earnings_referrer" ON "referral_earnings" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "idx_referral_earnings_referee" ON "referral_earnings" USING btree ("referee_id");--> statement-breakpoint
CREATE INDEX "idx_referral_earnings_status" ON "referral_earnings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_referral_earnings_type" ON "referral_earnings" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_referral_earnings_campaign" ON "referral_earnings" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "idx_referral_earnings_payout" ON "referral_earnings" USING btree ("payout_id");--> statement-breakpoint
CREATE INDEX "idx_referral_earnings_created" ON "referral_earnings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_referral_fraud_events_referrer" ON "referral_fraud_events" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "idx_referral_fraud_events_referee" ON "referral_fraud_events" USING btree ("referee_id");--> statement-breakpoint
CREATE INDEX "idx_referral_fraud_events_type" ON "referral_fraud_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_referral_fraud_events_status" ON "referral_fraud_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_referral_fraud_events_severity" ON "referral_fraud_events" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_referral_fraud_events_risk" ON "referral_fraud_events" USING btree ("risk_score");--> statement-breakpoint
CREATE INDEX "idx_referral_relationships_referrer" ON "referral_relationships" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "idx_referral_relationships_referee" ON "referral_relationships" USING btree ("referee_id");--> statement-breakpoint
CREATE INDEX "idx_referral_relationships_level" ON "referral_relationships" USING btree ("level");--> statement-breakpoint
CREATE INDEX "idx_referral_relationships_status" ON "referral_relationships" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_referral_relationships_fraud" ON "referral_relationships" USING btree ("fraud_score");--> statement-breakpoint
CREATE INDEX "idx_referral_tracking_code" ON "referral_tracking" USING btree ("referral_code_id");--> statement-breakpoint
CREATE INDEX "idx_referral_tracking_referrer" ON "referral_tracking" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "idx_referral_tracking_converted" ON "referral_tracking" USING btree ("converted_user_id");--> statement-breakpoint
CREATE INDEX "idx_referral_tracking_conversion" ON "referral_tracking" USING btree ("conversion_type","converted_at");--> statement-breakpoint
CREATE INDEX "idx_referral_tracking_attribution" ON "referral_tracking" USING btree ("attribution_type");--> statement-breakpoint
CREATE INDEX "idx_referral_tracking_ip" ON "referral_tracking" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "idx_referral_tracking_fingerprint" ON "referral_tracking" USING btree ("device_fingerprint");--> statement-breakpoint
CREATE INDEX "idx_revenue_quests_creator" ON "revenue_quests" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "idx_revenue_quests_status" ON "revenue_quests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_revenue_quests_type" ON "revenue_quests" USING btree ("quest_type");--> statement-breakpoint
CREATE INDEX "idx_revenue_quests_end_date" ON "revenue_quests" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "idx_search_analytics_user" ON "search_analytics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_search_analytics_query" ON "search_analytics" USING btree ("query");--> statement-breakpoint
CREATE INDEX "idx_search_analytics_timestamp" ON "search_analytics" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "idx_social_accounts_user" ON "social_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_social_accounts_provider" ON "social_accounts" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "idx_storage_alerts_provider" ON "storage_provider_alerts" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "idx_storage_alerts_severity" ON "storage_provider_alerts" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_storage_alerts_unresolved" ON "storage_provider_alerts" USING btree ("is_resolved","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_storage_provider_active" ON "storage_provider_configs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_storage_provider_primary" ON "storage_provider_configs" USING btree ("is_primary");--> statement-breakpoint
CREATE INDEX "idx_storage_provider_status" ON "storage_provider_configs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_storage_costs_provider_period" ON "storage_provider_costs" USING btree ("provider_id","period_start" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_storage_costs_period" ON "storage_provider_costs" USING btree ("period_start","period_end");--> statement-breakpoint
CREATE INDEX "idx_failover_active" ON "storage_provider_failover" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_failover_primary" ON "storage_provider_failover" USING btree ("primary_provider_id");--> statement-breakpoint
CREATE INDEX "idx_storage_health_provider_time" ON "storage_provider_health" USING btree ("provider_id","checked_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_storage_health_status" ON "storage_provider_health" USING btree ("health_status");--> statement-breakpoint
CREATE INDEX "idx_stories_creator_created" ON "stories" USING btree ("creator_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_stories_status_expires" ON "stories" USING btree ("status","expires_at");--> statement-breakpoint
CREATE INDEX "idx_stories_promoted" ON "stories" USING btree ("is_promoted");--> statement-breakpoint
CREATE INDEX "idx_story_replies_story" ON "story_replies" USING btree ("story_id");--> statement-breakpoint
CREATE INDEX "idx_story_replies_from" ON "story_replies" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "idx_story_views_story" ON "story_views" USING btree ("story_id");--> statement-breakpoint
CREATE INDEX "idx_story_views_viewer" ON "story_views" USING btree ("viewer_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_plans_creator" ON "subscription_plans" USING btree ("creator_profile_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_plans_tenant" ON "subscription_plans" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_fan" ON "subscriptions" USING btree ("fan_profile_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_plan" ON "subscriptions" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_tenant" ON "subscriptions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_status" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_subs_enh_creator_status" ON "subscriptions_enhanced" USING btree ("creator_id","status");--> statement-breakpoint
CREATE INDEX "idx_subs_enh_fan_status" ON "subscriptions_enhanced" USING btree ("fan_id","status");--> statement-breakpoint
CREATE INDEX "idx_subs_enh_next_billing" ON "subscriptions_enhanced" USING btree ("next_billing_date");--> statement-breakpoint
CREATE INDEX "idx_subs_enh_plan" ON "subscriptions_enhanced" USING btree ("subscription_plan_id");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_user" ON "support_tickets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_status" ON "support_tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_category" ON "support_tickets" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_priority" ON "support_tickets" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_assigned" ON "support_tickets" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_created" ON "support_tickets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_system_metrics_name_time" ON "system_metrics" USING btree ("metric_name","collected_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_system_metrics_category" ON "system_metrics" USING btree ("category","collected_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_system_setting_history_setting" ON "system_setting_history" USING btree ("setting_id");--> statement-breakpoint
CREATE INDEX "idx_system_setting_history_changed_by" ON "system_setting_history" USING btree ("changed_by");--> statement-breakpoint
CREATE INDEX "idx_system_setting_history_created" ON "system_setting_history" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_system_settings_category" ON "system_settings" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_system_settings_environment" ON "system_settings" USING btree ("environment");--> statement-breakpoint
CREATE INDEX "idx_system_settings_public" ON "system_settings" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "idx_tax_rates_jurisdiction" ON "tax_rates" USING btree ("jurisdiction");--> statement-breakpoint
CREATE INDEX "idx_tax_rates_active" ON "tax_rates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_tax_rates_effective" ON "tax_rates" USING btree ("effective_from","effective_to");--> statement-breakpoint
CREATE INDEX "idx_tax_records_user_year" ON "tax_records" USING btree ("user_id","tax_year");--> statement-breakpoint
CREATE INDEX "idx_ticket_messages_ticket" ON "ticket_messages" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "idx_ticket_messages_author" ON "ticket_messages" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_ticket_messages_created" ON "ticket_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_tx_to_created_at" ON "transactions" USING btree ("to_user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_tx_from_created_at" ON "transactions" USING btree ("from_user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_tx_status" ON "transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_tx_type" ON "transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_tx_to_status" ON "transactions" USING btree ("to_user_id","status");--> statement-breakpoint
CREATE INDEX "idx_trust_proofs_user" ON "trust_proofs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_trust_proofs_status" ON "trust_proofs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_trust_proofs_type" ON "trust_proofs" USING btree ("proof_type");--> statement-breakpoint
CREATE INDEX "idx_trust_proofs_verified_by" ON "trust_proofs" USING btree ("verified_by");--> statement-breakpoint
CREATE INDEX "idx_trust_scores_user" ON "trust_scores" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_trust_scores_tier" ON "trust_scores" USING btree ("current_tier");--> statement-breakpoint
CREATE INDEX "idx_trust_scores_points" ON "trust_scores" USING btree ("score_points");--> statement-breakpoint
CREATE INDEX "idx_tutorial_categories_sort" ON "tutorial_categories" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_tutorials_slug" ON "tutorials" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_tutorials_status" ON "tutorials" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_tutorials_difficulty" ON "tutorials" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "idx_tutorials_category" ON "tutorials" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_tutorials_author" ON "tutorials" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_user_achievements_user" ON "user_achievements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_activity_user_time" ON "user_activity_log" USING btree ("user_id","timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_user_activity_activity" ON "user_activity_log" USING btree ("activity");--> statement-breakpoint
CREATE INDEX "idx_user_badges_user" ON "user_badges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_badges_badge" ON "user_badges" USING btree ("badge_id");--> statement-breakpoint
CREATE INDEX "idx_user_comm_prefs_user" ON "user_communication_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_milestones_user_status" ON "user_milestones" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_user_milestones_achievement" ON "user_milestones" USING btree ("achieved_at");--> statement-breakpoint
CREATE INDEX "idx_user_suspensions_user" ON "user_suspensions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_suspensions_active" ON "user_suspensions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_user_suspensions_ends" ON "user_suspensions" USING btree ("ends_at");--> statement-breakpoint
CREATE INDEX "idx_user_tutorial_progress_user" ON "user_tutorial_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_tutorial_progress_tutorial" ON "user_tutorial_progress" USING btree ("tutorial_id");--> statement-breakpoint
CREATE INDEX "idx_user_tutorial_progress_status" ON "user_tutorial_progress" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_verified_content_creator" ON "verified_content" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "idx_verified_content_hash" ON "verified_content" USING btree ("content_hash");--> statement-breakpoint
CREATE INDEX "idx_voice_templates_user" ON "voice_message_templates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_voice_messages_profile" ON "voice_messages" USING btree ("voice_profile_id");--> statement-breakpoint
CREATE INDEX "idx_voice_messages_sender" ON "voice_messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "idx_voice_messages_recipient" ON "voice_messages" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "idx_voice_messages_status" ON "voice_messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_voice_profiles_user" ON "voice_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_voice_profiles_status" ON "voice_profiles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_voice_profiles_voice_id" ON "voice_profiles" USING btree ("voice_id");--> statement-breakpoint
CREATE INDEX "idx_volume_tiers_range" ON "volume_tiers" USING btree ("minimum_volume","maximum_volume");--> statement-breakpoint
CREATE INDEX "idx_wiki_articles_slug" ON "wiki_articles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_wiki_articles_status" ON "wiki_articles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wiki_articles_type" ON "wiki_articles" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_wiki_articles_category" ON "wiki_articles" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_wiki_articles_author" ON "wiki_articles" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_wiki_articles_published" ON "wiki_articles" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "idx_wiki_categories_parent" ON "wiki_categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_wiki_categories_sort" ON "wiki_categories" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_pwa_devices_user" ON "pwa_device_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_pwa_devices_active" ON "pwa_device_subscriptions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_pwa_devices_endpoint" ON "pwa_device_subscriptions" USING btree ("push_endpoint");--> statement-breakpoint
CREATE INDEX "idx_pwa_flags_enabled" ON "pwa_feature_flags" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "idx_pwa_flags_rollout" ON "pwa_feature_flags" USING btree ("rollout_percentage");--> statement-breakpoint
CREATE INDEX "idx_pwa_install_user" ON "pwa_installation_analytics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_pwa_install_source" ON "pwa_installation_analytics" USING btree ("installation_source");--> statement-breakpoint
CREATE INDEX "idx_pwa_install_platform" ON "pwa_installation_analytics" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "idx_pwa_install_date" ON "pwa_installation_analytics" USING btree ("installed_at");--> statement-breakpoint
CREATE INDEX "idx_pwa_sync_queue_user" ON "pwa_offline_sync_queue" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_pwa_sync_queue_device" ON "pwa_offline_sync_queue" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX "idx_pwa_sync_queue_status" ON "pwa_offline_sync_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_pwa_sync_queue_priority" ON "pwa_offline_sync_queue" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_pwa_sync_queue_retry" ON "pwa_offline_sync_queue" USING btree ("next_retry_at");--> statement-breakpoint
CREATE INDEX "idx_pwa_push_queue_user" ON "pwa_push_notification_queue" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_pwa_push_queue_device" ON "pwa_push_notification_queue" USING btree ("device_subscription_id");--> statement-breakpoint
CREATE INDEX "idx_pwa_push_queue_status" ON "pwa_push_notification_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_pwa_push_queue_scheduled" ON "pwa_push_notification_queue" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "idx_pwa_usage_user" ON "pwa_usage_analytics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_pwa_usage_device" ON "pwa_usage_analytics" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX "idx_pwa_usage_session" ON "pwa_usage_analytics" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_pwa_usage_date" ON "pwa_usage_analytics" USING btree ("created_at");