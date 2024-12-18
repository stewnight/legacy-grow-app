CREATE TYPE "public"."processing_method" AS ENUM('hang_dry', 'rack_dry', 'freeze_dry', 'jar_cure', 'bulk_cure', 'co2', 'ethanol', 'hydrocarbon', 'solventless', 'hand_trim', 'machine_trim');--> statement-breakpoint
CREATE TYPE "public"."processing_status" AS ENUM('pending', 'in_progress', 'completed', 'cancelled', 'failed', 'on_hold');--> statement-breakpoint
CREATE TYPE "public"."processing_type" AS ENUM('drying', 'curing', 'extraction', 'trimming', 'packaging', 'testing');--> statement-breakpoint
ALTER TABLE "legacy-grow-app_processing" DROP CONSTRAINT "legacy-grow-app_processing_identifier_unique";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_processing" DROP CONSTRAINT "legacy-grow-app_processing_harvest_id_legacy-grow-app_harvest_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_processing" DROP CONSTRAINT "legacy-grow-app_processing_batch_id_legacy-grow-app_batch_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "processing_identifier_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "processing_started_at_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "processing_general_status_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "processing_status_idx";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_sensor" ALTER COLUMN "calibration_interval" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "legacy-grow-app_processing" ALTER COLUMN "type" SET DATA TYPE processing_type;--> statement-breakpoint
ALTER TABLE "legacy-grow-app_processing" ALTER COLUMN "method" SET DATA TYPE processing_method;--> statement-breakpoint
ALTER TABLE "legacy-grow-app_processing" ALTER COLUMN "started_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "legacy-grow-app_processing" ALTER COLUMN "status" SET DATA TYPE processing_status;--> statement-breakpoint
ALTER TABLE "legacy-grow-app_processing" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "legacy-grow-app_processing" ADD COLUMN "estimated_duration" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "legacy-grow-app_processing" ADD COLUMN "actual_duration" numeric(10, 2);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_processing" ADD CONSTRAINT "legacy-grow-app_processing_harvest_id_legacy-grow-app_harvest_id_fk" FOREIGN KEY ("harvest_id") REFERENCES "public"."legacy-grow-app_harvest"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_processing" ADD CONSTRAINT "legacy-grow-app_processing_batch_id_legacy-grow-app_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."legacy-grow-app_batch"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "processing_status_idx" ON "legacy-grow-app_processing" USING btree ("status");--> statement-breakpoint
ALTER TABLE "legacy-grow-app_processing" DROP COLUMN IF EXISTS "identifier";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_processing" DROP COLUMN IF EXISTS "duration";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_processing" DROP COLUMN IF EXISTS "process_status";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_processing" DROP COLUMN IF EXISTS "metadata";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_processing" DROP COLUMN IF EXISTS "notes";