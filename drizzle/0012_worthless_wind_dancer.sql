ALTER TABLE "legacy-grow-app_sensor" DROP CONSTRAINT "legacy-grow-app_sensor_identifier_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "sensor_identifier_idx";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_sensor" DROP COLUMN IF EXISTS "identifier";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_sensor" DROP COLUMN IF EXISTS "notes";