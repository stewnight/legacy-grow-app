CREATE INDEX IF NOT EXISTS "batch_name_idx" ON "legacy-grow-app_batches" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "batch_status_idx" ON "legacy-grow-app_batches" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "batch_user_id_idx" ON "legacy-grow-app_batches" USING btree ("user_id");