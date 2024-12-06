DROP INDEX IF EXISTS "equipment_maintenance_idx";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_equipment" ADD COLUMN "location_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_equipment" ADD CONSTRAINT "legacy-grow-app_equipment_location_id_legacy-grow-app_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."legacy-grow-app_location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "equipment_next_maintenance_idx" ON "legacy-grow-app_equipment" USING btree ("next_maintenance_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "equipment_location_idx" ON "legacy-grow-app_equipment" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "maintenance_record_date_idx" ON "legacy-grow-app_maintenance_record" USING btree ("equipment_id","maintenance_date");