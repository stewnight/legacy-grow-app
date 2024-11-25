DROP INDEX IF EXISTS "area_name_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "room_name_idx" ON "legacy-grow-app_room" USING btree ("name");