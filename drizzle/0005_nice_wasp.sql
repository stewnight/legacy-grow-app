ALTER TYPE "public"."area_type" RENAME TO "room_type";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_area" RENAME TO "legacy-grow-app_room";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_location" RENAME COLUMN "area_id" TO "room_id";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_room" DROP CONSTRAINT "legacy-grow-app_area_building_id_legacy-grow-app_building_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_room" DROP CONSTRAINT "legacy-grow-app_area_parent_id_legacy-grow-app_area_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_room" DROP CONSTRAINT "legacy-grow-app_area_created_by_legacy-grow-app_user_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_location" DROP CONSTRAINT "legacy-grow-app_location_area_id_legacy-grow-app_area_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "area_type_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "area_building_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "area_status_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "area_parent_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "location_area_id_idx";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_room" ADD CONSTRAINT "legacy-grow-app_room_building_id_legacy-grow-app_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."legacy-grow-app_building"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_room" ADD CONSTRAINT "legacy-grow-app_room_parent_id_legacy-grow-app_room_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."legacy-grow-app_room"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_room" ADD CONSTRAINT "legacy-grow-app_room_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_location" ADD CONSTRAINT "legacy-grow-app_location_room_id_legacy-grow-app_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."legacy-grow-app_room"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "room_type_idx" ON "legacy-grow-app_room" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "room_building_id_idx" ON "legacy-grow-app_room" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "room_status_idx" ON "legacy-grow-app_room" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "room_parent_id_idx" ON "legacy-grow-app_room" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "location_room_id_idx" ON "legacy-grow-app_location" USING btree ("room_id");