CREATE TYPE "public"."clip_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('draft', 'scheduled', 'posting', 'posted', 'failed');--> statement-breakpoint
CREATE TYPE "public"."reel_status" AS ENUM('active', 'hidden', 'deleted', 'flagged');--> statement-breakpoint
CREATE TYPE "public"."social_platform" AS ENUM('twitter', 'tiktok', 'instagram', 'facebook', 'youtube');--> statement-breakpoint
CREATE TABLE "reel_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"reel_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"parent_comment_id" integer,
	"comment_text" text NOT NULL,
	"likes" integer DEFAULT 0,
	"is_edited" boolean DEFAULT false,
	"is_deleted" boolean DEFAULT false,
	"platform" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reel_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"reel_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"interaction_type" varchar(20) NOT NULL,
	"platform" varchar(50),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reels" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" text NOT NULL,
	"video_url" text NOT NULL,
	"thumbnail_url" text,
	"caption" text,
	"duration" integer,
	"width" integer,
	"height" integer,
	"aspect_ratio" varchar(10),
	"file_size" integer,
	"views" integer DEFAULT 0,
	"likes" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"shares" integer DEFAULT 0,
	"status" "reel_status" DEFAULT 'active' NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"allow_comments" boolean DEFAULT true NOT NULL,
	"allow_duets" boolean DEFAULT true NOT NULL,
	"home_platform" varchar(50) DEFAULT 'boyfanz' NOT NULL,
	"visible_on_platforms" jsonb DEFAULT '["boyfanz"]'::jsonb,
	"tags" jsonb,
	"mentions" jsonb,
	"trending_score" integer DEFAULT 0,
	"last_trending_update" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_social_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"media_id" text,
	"platforms" jsonb NOT NULL,
	"caption" text,
	"hashtags" jsonb,
	"scheduled_for" timestamp,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"posted_at" timestamp,
	"platform_post_ids" jsonb,
	"engagement" jsonb,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_platform_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"platform" "social_platform" NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_type" varchar(50) DEFAULT 'Bearer',
	"expires_at" timestamp,
	"scope" text,
	"platform_user_id" text,
	"platform_username" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_post_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"campaign_name" text NOT NULL,
	"description" text,
	"media_ids" jsonb,
	"target_platforms" jsonb,
	"schedule" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"total_posts" integer DEFAULT 0,
	"successful_posts" integer DEFAULT 0,
	"failed_posts" integer DEFAULT 0,
	"total_engagement" jsonb,
	"last_post_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_clips" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"original_media_id" text NOT NULL,
	"clip_name" text NOT NULL,
	"start_time" integer NOT NULL,
	"end_time" integer NOT NULL,
	"duration" integer NOT NULL,
	"source_url" text NOT NULL,
	"clip_url" text,
	"thumbnail_url" text,
	"status" "clip_status" DEFAULT 'pending' NOT NULL,
	"aspect_ratio" varchar(10),
	"resolution" varchar(20),
	"file_size" integer,
	"format" varchar(20),
	"processing_metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reel_comments" ADD CONSTRAINT "reel_comments_reel_id_reels_id_fk" FOREIGN KEY ("reel_id") REFERENCES "public"."reels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reel_interactions" ADD CONSTRAINT "reel_interactions_reel_id_reels_id_fk" FOREIGN KEY ("reel_id") REFERENCES "public"."reels"("id") ON DELETE cascade ON UPDATE no action;