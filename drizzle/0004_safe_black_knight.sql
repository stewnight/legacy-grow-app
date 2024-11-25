ALTER TABLE "legacy-grow-app_area" RENAME COLUMN "facility_id" TO "building_id";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_area" DROP CONSTRAINT "legacy-grow-app_area_facility_id_legacy-grow-app_building_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "area_facility_id_idx";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_area" ADD CONSTRAINT "legacy-grow-app_area_building_id_legacy-grow-app_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."legacy-grow-app_building"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "area_building_id_idx" ON "legacy-grow-app_area" USING btree ("building_id");