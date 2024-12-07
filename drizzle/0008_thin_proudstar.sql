ALTER TABLE "legacy-grow-app_equipment_room_assignment" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "legacy-grow-app_maintenance_record" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "legacy-grow-app_equipment_room_assignment" CASCADE;--> statement-breakpoint
DROP TABLE "legacy-grow-app_maintenance_record" CASCADE;--> statement-breakpoint
ALTER TABLE "legacy-grow-app_equipment" ADD COLUMN "room_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_equipment" ADD CONSTRAINT "legacy-grow-app_equipment_room_id_legacy-grow-app_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."legacy-grow-app_room"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "equipment_room_idx" ON "legacy-grow-app_equipment" USING btree ("room_id");