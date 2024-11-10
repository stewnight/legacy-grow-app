DROP TABLE "legacy-grow-app_strain";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_batch" ADD COLUMN "genetic_id" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_batch" ADD CONSTRAINT "legacy-grow-app_batch_genetic_id_legacy-grow-app_genetic_id_fk" FOREIGN KEY ("genetic_id") REFERENCES "public"."legacy-grow-app_genetic"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
