ALTER TYPE "public"."facility_type" RENAME TO "building_type";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_facility" RENAME TO "legacy-grow-app_building";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_area" DROP CONSTRAINT "legacy-grow-app_area_facility_id_legacy-grow-app_facility_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_building" DROP CONSTRAINT "legacy-grow-app_facility_created_by_legacy-grow-app_user_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "facility_name_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "facility_type_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "facility_status_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "facility_license_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "task_due_date_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "task_created_by_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "task_general_status_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "task_status_idx";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_task" ALTER COLUMN "entity_type" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "legacy-grow-app_task" ALTER COLUMN "priority" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "legacy-grow-app_task" ALTER COLUMN "task_status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "legacy-grow-app_task" ALTER COLUMN "due_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_area" ADD CONSTRAINT "legacy-grow-app_area_facility_id_legacy-grow-app_building_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."legacy-grow-app_building"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_building" ADD CONSTRAINT "legacy-grow-app_building_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "building_name_idx" ON "legacy-grow-app_building" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "building_type_idx" ON "legacy-grow-app_building" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "building_status_idx" ON "legacy-grow-app_building" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "building_license_idx" ON "legacy-grow-app_building" USING btree ("license_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_title_idx" ON "legacy-grow-app_task" USING btree ("title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_status_idx" ON "legacy-grow-app_task" USING btree ("status");