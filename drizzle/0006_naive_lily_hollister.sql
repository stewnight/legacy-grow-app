ALTER TABLE "legacy-grow-app_genetic" ADD COLUMN "slug" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "legacy-grow-app_plant" ADD COLUMN "status" varchar(50) DEFAULT 'active' NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "genetic_slug_idx" ON "legacy-grow-app_genetic" USING btree ("slug");