CREATE TYPE "public"."data_export_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'expired', 'downloaded');--> statement-breakpoint
CREATE TYPE "public"."deletion_request_status" AS ENUM('pending', 'grace_period', 'processing', 'completed', 'cancelled', 'failed', 'held', 'partial');--> statement-breakpoint
CREATE TYPE "public"."deletion_request_type" AS ENUM('full_account', 'platform_only', 'content_only', 'messages_only', 'financial_anonymize');--> statement-breakpoint
CREATE TABLE "account_deletion_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"platform_id" varchar NOT NULL,
	"request_type" "deletion_request_type" DEFAULT 'full_account' NOT NULL,
	"status" "deletion_request_status" DEFAULT 'pending' NOT NULL,
	"reason" text,
	"grace_period_days" integer DEFAULT 30,
	"grace_period_ends_at" timestamp,
	"can_cancel_until" timestamp,
	"retain_financial_records" boolean DEFAULT true,
	"retain_fraud_data" boolean DEFAULT true,
	"legal_hold_id" varchar,
	"legal_hold_reason" text,
	"scheduled_deletion_at" timestamp,
	"processing_started_at" timestamp,
	"processing_completed_at" timestamp,
	"deletion_manifest" jsonb DEFAULT '{}'::jsonb,
	"records_deleted" integer DEFAULT 0,
	"content_files_deleted" integer DEFAULT 0,
	"storage_freed_bytes" integer DEFAULT 0,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"requested_ip" varchar,
	"requested_user_agent" text,
	"confirmed_at" timestamp,
	"confirmation_method" varchar,
	"processed_by" varchar,
	"deleted_user_email" varchar,
	"deleted_user_hash" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_access_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"accessor_id" varchar,
	"accessor_type" varchar NOT NULL,
	"accessor_ip" varchar,
	"accessor_user_agent" text,
	"target_user_id" varchar NOT NULL,
	"platform_id" varchar NOT NULL,
	"data_category" varchar NOT NULL,
	"data_ids" jsonb DEFAULT '[]'::jsonb,
	"action" varchar NOT NULL,
	"action_details" jsonb DEFAULT '{}'::jsonb,
	"legal_basis" varchar,
	"consent_id" varchar,
	"request_id" varchar,
	"session_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_export_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"platform_id" varchar NOT NULL,
	"status" "data_export_status" DEFAULT 'pending' NOT NULL,
	"include_profile" boolean DEFAULT true,
	"include_content" boolean DEFAULT true,
	"include_messages" boolean DEFAULT true,
	"include_transactions" boolean DEFAULT true,
	"include_subscriptions" boolean DEFAULT true,
	"include_purchases" boolean DEFAULT true,
	"include_earnings" boolean DEFAULT true,
	"include_activity_logs" boolean DEFAULT false,
	"format" varchar DEFAULT 'json' NOT NULL,
	"archive_url" text,
	"archive_size_bytes" integer,
	"archive_checksum" varchar,
	"expires_at" timestamp,
	"downloaded_at" timestamp,
	"download_count" integer DEFAULT 0,
	"processing_started_at" timestamp,
	"processing_completed_at" timestamp,
	"error_message" text,
	"requested_ip" varchar,
	"requested_user_agent" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legal_holds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"case_reference" varchar,
	"affected_user_ids" jsonb DEFAULT '[]'::jsonb,
	"affected_platform_ids" jsonb DEFAULT '[]'::jsonb,
	"data_categories" jsonb DEFAULT '[]'::jsonb,
	"hold_start_date" timestamp NOT NULL,
	"hold_end_date" timestamp,
	"created_by" varchar NOT NULL,
	"approved_by" varchar,
	"is_active" boolean DEFAULT true,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retention_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform_id" varchar,
	"name" varchar NOT NULL,
	"description" text,
	"data_category" varchar NOT NULL,
	"retention_days" integer NOT NULL,
	"retention_trigger" varchar NOT NULL,
	"action_on_expiry" varchar DEFAULT 'delete' NOT NULL,
	"requires_manual_review" boolean DEFAULT false,
	"legal_basis" varchar,
	"jurisdiction" varchar,
	"exception_rules" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"platform_id" varchar NOT NULL,
	"consent_type" varchar NOT NULL,
	"status" "consent_status" DEFAULT 'pending' NOT NULL,
	"version" varchar NOT NULL,
	"consent_text" text,
	"granted_at" timestamp,
	"withdrawn_at" timestamp,
	"expires_at" timestamp,
	"consent_method" varchar,
	"ip_address" varchar,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account_deletion_requests" ADD CONSTRAINT "account_deletion_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_export_requests" ADD CONSTRAINT "data_export_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "deletion_user_idx" ON "account_deletion_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "deletion_platform_idx" ON "account_deletion_requests" USING btree ("platform_id");--> statement-breakpoint
CREATE INDEX "deletion_status_idx" ON "account_deletion_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "deletion_scheduled_idx" ON "account_deletion_requests" USING btree ("scheduled_deletion_at");--> statement-breakpoint
CREATE INDEX "deletion_grace_period_idx" ON "account_deletion_requests" USING btree ("grace_period_ends_at");--> statement-breakpoint
CREATE INDEX "data_audit_accessor_idx" ON "data_access_audit_log" USING btree ("accessor_id");--> statement-breakpoint
CREATE INDEX "data_audit_target_idx" ON "data_access_audit_log" USING btree ("target_user_id");--> statement-breakpoint
CREATE INDEX "data_audit_platform_idx" ON "data_access_audit_log" USING btree ("platform_id");--> statement-breakpoint
CREATE INDEX "data_audit_action_idx" ON "data_access_audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "data_audit_created_idx" ON "data_access_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "data_export_user_idx" ON "data_export_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "data_export_platform_idx" ON "data_export_requests" USING btree ("platform_id");--> statement-breakpoint
CREATE INDEX "data_export_status_idx" ON "data_export_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "data_export_expires_idx" ON "data_export_requests" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "legal_hold_active_idx" ON "legal_holds" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "legal_hold_case_idx" ON "legal_holds" USING btree ("case_reference");--> statement-breakpoint
CREATE INDEX "retention_policy_platform_idx" ON "retention_policies" USING btree ("platform_id");--> statement-breakpoint
CREATE INDEX "retention_policy_category_idx" ON "retention_policies" USING btree ("data_category");--> statement-breakpoint
CREATE INDEX "retention_policy_active_idx" ON "retention_policies" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "consent_user_idx" ON "user_consents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "consent_platform_idx" ON "user_consents" USING btree ("platform_id");--> statement-breakpoint
CREATE INDEX "consent_type_idx" ON "user_consents" USING btree ("consent_type");--> statement-breakpoint
CREATE INDEX "consent_status_idx" ON "user_consents" USING btree ("status");