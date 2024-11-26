CREATE TYPE "public"."task_entity_type" AS ENUM('plant', 'batch', 'location', 'genetics', 'sensors', 'processing', 'harvest', 'none');--> statement-breakpoint
ALTER TABLE "legacy-grow-app_task" ALTER COLUMN "entity_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "legacy-grow-app_task" ALTER COLUMN "entity_type" SET DATA TYPE task_entity_type;