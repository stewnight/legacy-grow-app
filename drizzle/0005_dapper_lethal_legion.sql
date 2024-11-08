ALTER TABLE "notes" RENAME TO "legacy-grow-app_note";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_note" DROP CONSTRAINT "notes_parent_id_notes_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_note" DROP CONSTRAINT "notes_created_by_legacy-grow-app_user_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_note" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "legacy-grow-app_note" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_note" ADD CONSTRAINT "legacy-grow-app_note_parent_id_legacy-grow-app_note_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."legacy-grow-app_note"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_note" ADD CONSTRAINT "legacy-grow-app_note_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_entity_type_idx" ON "legacy-grow-app_note" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_entity_id_idx" ON "legacy-grow-app_note" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_created_by_idx" ON "legacy-grow-app_note" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_created_at_idx" ON "legacy-grow-app_note" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_parent_id_idx" ON "legacy-grow-app_note" USING btree ("parent_id");