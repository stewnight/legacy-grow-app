ALTER TABLE "legacy-grow-app_batches" ADD COLUMN "code" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "legacy-grow-app_plant" ADD COLUMN "code" varchar(255) NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "batch_code_idx" ON "legacy-grow-app_batches" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plant_code_idx" ON "legacy-grow-app_plant" USING btree ("code");