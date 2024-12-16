ALTER TABLE "legacy-grow-app_note" DROP CONSTRAINT "legacy-grow-app_note_parent_id_legacy-grow-app_note_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "note_status_idx";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_note" DROP COLUMN IF EXISTS "parent_id";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_note" DROP COLUMN IF EXISTS "metadata";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_note" DROP COLUMN IF EXISTS "status";