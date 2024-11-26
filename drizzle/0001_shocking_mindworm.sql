ALTER TABLE "legacy-grow-app_batch" ALTER COLUMN "start_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "legacy-grow-app_batch" ALTER COLUMN "expected_end_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "legacy-grow-app_batch" ALTER COLUMN "actual_end_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "legacy-grow-app_plant" ALTER COLUMN "planted_date" SET DATA TYPE timestamp with time zone;