ALTER TYPE "public"."batch_status" ADD VALUE 'pending' BEFORE 'cancelled';--> statement-breakpoint
ALTER TABLE "legacy-grow-app_batch" ALTER COLUMN "start_date" DROP NOT NULL;