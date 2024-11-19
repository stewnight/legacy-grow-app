ALTER TABLE "legacy-grow-app_sensor" ADD COLUMN "location_id" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_sensor" ADD CONSTRAINT "legacy-grow-app_sensor_location_id_legacy-grow-app_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."legacy-grow-app_location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensor_location_idx" ON "legacy-grow-app_sensor" USING btree ("location_id");