CREATE EXTENSION IF NOT EXISTS "pgcrypto";--> statement-breakpoint
CREATE TYPE "public"."analysis_mode" AS ENUM('constructive', 'roast');--> statement-breakpoint
CREATE TYPE "public"."diff_line_kind" AS ENUM('context', 'add', 'remove');--> statement-breakpoint
CREATE TYPE "public"."finding_kind" AS ENUM('issue', 'strength');--> statement-breakpoint
CREATE TYPE "public"."finding_tone" AS ENUM('critical', 'warning', 'good');--> statement-breakpoint
CREATE TYPE "public"."result_visibility" AS ENUM('private', 'unlisted', 'public');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "roast_diff_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"result_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"kind" "diff_line_kind" NOT NULL,
	"content" text NOT NULL,
	"old_line_number" integer,
	"new_line_number" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roast_diff_lines_result_id_position_unique" UNIQUE("result_id","position")
);
--> statement-breakpoint
CREATE TABLE "roast_findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"result_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"kind" "finding_kind" NOT NULL,
	"tone" "finding_tone" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"start_line" integer,
	"end_line" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roast_findings_result_id_position_unique" UNIQUE("result_id","position")
);
--> statement-breakpoint
CREATE TABLE "roast_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"score" numeric(3, 1) NOT NULL,
	"verdict" text NOT NULL,
	"verdict_tone" "finding_tone",
	"headline" text NOT NULL,
	"summary" text,
	"improved_code" text,
	"visibility" "result_visibility" DEFAULT 'private' NOT NULL,
	"share_slug" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roast_results_submission_id_unique" UNIQUE("submission_id"),
	CONSTRAINT "roast_results_share_slug_unique" UNIQUE("share_slug")
);
--> statement-breakpoint
CREATE TABLE "roast_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_id" text NOT NULL,
	"source_kind" text DEFAULT 'paste' NOT NULL,
	"source_label" text,
	"raw_code" text NOT NULL,
	"detected_language" text,
	"selected_language" text,
	"active_language" text,
	"line_count" integer NOT NULL,
	"char_count" integer NOT NULL,
	"analysis_mode" "analysis_mode" NOT NULL,
	"status" "submission_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roast_submissions_publicId_unique" UNIQUE("public_id")
);
--> statement-breakpoint
ALTER TABLE "roast_diff_lines" ADD CONSTRAINT "roast_diff_lines_result_id_roast_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."roast_results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roast_findings" ADD CONSTRAINT "roast_findings_result_id_roast_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."roast_results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roast_results" ADD CONSTRAINT "roast_results_submission_id_roast_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."roast_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "roast_results_leaderboard_idx" ON "roast_results" USING btree ("visibility","score","published_at");
