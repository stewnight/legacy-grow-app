ALTER TYPE "public"."task_category" RENAME TO "job_category";--> statement-breakpoint
ALTER TYPE "public"."task_entity_type" RENAME TO "job_entity_type";--> statement-breakpoint
ALTER TYPE "public"."task_priority" RENAME TO "job_priority";--> statement-breakpoint
ALTER TYPE "public"."task_status" RENAME TO "job_status";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_task" RENAME TO "legacy-grow-app_job";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_job" RENAME COLUMN "task_status" TO "job_status";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_job" DROP CONSTRAINT "legacy-grow-app_task_assigned_to_id_legacy-grow-app_user_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_job" DROP CONSTRAINT "legacy-grow-app_task_created_by_legacy-grow-app_user_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "task_title_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "task_category_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "task_priority_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "task_status_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "task_assigned_to_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "task_entity_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "task_due_date_idx";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_job" ALTER COLUMN "properties" SET DEFAULT '{"recurring":null,"tasks":[],"instructions":[],"requirements":{"tools":[],"supplies":[],"ppe":[]}}'::json;--> statement-breakpoint
ALTER TABLE "legacy-grow-app_job" ALTER COLUMN "metadata" SET DEFAULT '{"previousJobs":[],"nextJobs":[],"estimatedDuration":null,"actualDuration":null,"location":null}'::json;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_job" ADD CONSTRAINT "legacy-grow-app_job_assigned_to_id_legacy-grow-app_user_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_job" ADD CONSTRAINT "legacy-grow-app_job_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_title_idx" ON "legacy-grow-app_job" USING btree ("title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_category_idx" ON "legacy-grow-app_job" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_priority_idx" ON "legacy-grow-app_job" USING btree ("priority");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_status_idx" ON "legacy-grow-app_job" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_assigned_to_idx" ON "legacy-grow-app_job" USING btree ("assigned_to_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_entity_idx" ON "legacy-grow-app_job" USING btree ("entity_id","entity_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_due_date_idx" ON "legacy-grow-app_job" USING btree ("due_date");--> statement-breakpoint
ALTER TABLE "public"."legacy-grow-app_system_log" ALTER COLUMN "source" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."system_log_source";--> statement-breakpoint
CREATE TYPE "public"."system_log_source" AS ENUM('plants', 'harvests', 'jobs', 'system', 'auth', 'sensors', 'compliance', 'facility');--> statement-breakpoint
ALTER TABLE "public"."legacy-grow-app_system_log" ALTER COLUMN "source" SET DATA TYPE "public"."system_log_source" USING "source"::"public"."system_log_source";