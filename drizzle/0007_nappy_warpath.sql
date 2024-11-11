ALTER TABLE "legacy-grow-app_batch" RENAME COLUMN "start_date" TO "plant_date";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_batch" ALTER COLUMN "genetic_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "legacy-grow-app_batch" ALTER COLUMN "plant_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "legacy-grow-app_batch" ALTER COLUMN "status" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "legacy-grow-app_batch" ADD COLUMN "source" varchar(255);--> statement-breakpoint
ALTER TABLE "legacy-grow-app_batch" ADD COLUMN "stage" varchar(255);--> statement-breakpoint
ALTER TABLE "legacy-grow-app_batch" ADD COLUMN "health_status" varchar(255);--> statement-breakpoint
ALTER TABLE "legacy-grow-app_batch" ADD COLUMN "mother_id" integer;--> statement-breakpoint
ALTER TABLE "legacy-grow-app_batch" ADD COLUMN "generation" integer;--> statement-breakpoint
ALTER TABLE "legacy-grow-app_batch" ADD COLUMN "sex" varchar(255);--> statement-breakpoint
ALTER TABLE "legacy-grow-app_batch" ADD COLUMN "phenotype" varchar(255);--> statement-breakpoint
ALTER TABLE "legacy-grow-app_batch" ADD COLUMN "location_id" integer;--> statement-breakpoint
ALTER TABLE "legacy-grow-app_batch" DROP COLUMN IF EXISTS "end_date";