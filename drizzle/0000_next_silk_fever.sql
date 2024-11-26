DO $$ BEGIN
 CREATE TYPE "public"."batch_status" AS ENUM('active', 'completed', 'pending', 'cancelled', 'archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."building_type" AS ENUM('indoor', 'outdoor', 'greenhouse', 'hybrid');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."destroy_reason" AS ENUM('died', 'pest', 'disease', 'male', 'hermaphrodite', 'quality', 'regulatory', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."genetic_type" AS ENUM('sativa', 'indica', 'hybrid', 'ruderalis');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."harvest_quality" AS ENUM('A', 'B', 'C', 'D', 'F');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."health_status" AS ENUM('healthy', 'sick', 'pest', 'nutrient', 'dead', 'quarantine');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."location_type" AS ENUM('room', 'section', 'bench', 'shelf', 'tray', 'pot');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."log_level" AS ENUM('debug', 'info', 'warn', 'error', 'fatal');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."note_type" AS ENUM('text', 'voice', 'image', 'file', 'checklist', 'measurement');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."plant_sex" AS ENUM('unknown', 'male', 'female', 'hermaphrodite');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."plant_source" AS ENUM('seed', 'clone', 'mother', 'tissue_culture');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."plant_stage" AS ENUM('germination', 'seedling', 'vegetative', 'flowering', 'harvested', 'mother', 'clone');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."room_type" AS ENUM('vegetation', 'flowering', 'drying', 'storage', 'processing', 'mother', 'clone', 'quarantine');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."sensor_type" AS ENUM('temperature', 'humidity', 'co2', 'light', 'ph', 'ec', 'moisture', 'pressure', 'airflow');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."status" AS ENUM('active', 'inactive', 'archived', 'maintenance');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."system_log_source" AS ENUM('plants', 'harvests', 'tasks', 'system', 'auth', 'sensors', 'compliance', 'facility');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."task_category" AS ENUM('maintenance', 'transplanting', 'cloning', 'feeding', 'environmental', 'harvest', 'drying', 'trimming', 'packing', 'cleaning', 'inspection');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."task_entity_type" AS ENUM('plant', 'batch', 'location', 'genetics', 'sensors', 'processing', 'harvest', 'none');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high', 'urgent', 'critical');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."task_status" AS ENUM('pending', 'in_progress', 'completed', 'cancelled', 'blocked', 'deferred');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'manager', 'viewer');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_batch" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" varchar(100) NOT NULL,
	"genetic_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"stage" "plant_stage" NOT NULL,
	"batch_status" "batch_status" DEFAULT 'active' NOT NULL,
	"start_date" date,
	"expected_end_date" date,
	"actual_end_date" date,
	"plant_count" integer DEFAULT 0,
	"properties" json,
	"metadata" json,
	"notes" text,
	"status" "status" DEFAULT 'active' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "legacy-grow-app_batch_identifier_unique" UNIQUE("identifier")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_building" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "building_type" NOT NULL,
	"address" json,
	"properties" json,
	"license_number" varchar(100),
	"description" text,
	"status" "status" DEFAULT 'active' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_account" (
	"user_id" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "legacy-grow-app_account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_session" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_system_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level" "log_level" NOT NULL,
	"source" "system_log_source" NOT NULL,
	"message" text NOT NULL,
	"metadata" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp with time zone,
	"image" varchar(255),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"active" boolean DEFAULT true,
	"permissions" json DEFAULT '[]'::json,
	"preferences" json DEFAULT '{}'::json,
	"last_login" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "legacy-grow-app_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "legacy-grow-app_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_genetic" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "genetic_type" NOT NULL,
	"breeder" varchar(255),
	"description" text,
	"properties" json,
	"grow_properties" json,
	"lineage" json,
	"in_house" boolean DEFAULT false,
	"status" "status" DEFAULT 'active' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_harvest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" varchar(100) NOT NULL,
	"batch_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"harvest_date" date NOT NULL,
	"wet_weight" numeric(10, 3),
	"dry_weight" numeric(10, 3),
	"trim_weight" numeric(10, 3),
	"waste_weight" numeric(10, 3),
	"quality" "harvest_quality",
	"harvest_status" "batch_status" DEFAULT 'active' NOT NULL,
	"properties" json,
	"lab_results" json,
	"metadata" json,
	"notes" text,
	"status" "status" DEFAULT 'active' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "legacy-grow-app_harvest_identifier_unique" UNIQUE("identifier")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_plant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" varchar(100) NOT NULL,
	"genetic_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"batch_id" uuid,
	"mother_id" uuid,
	"source" "plant_source" NOT NULL,
	"stage" "plant_stage" NOT NULL,
	"sex" "plant_sex" DEFAULT 'unknown' NOT NULL,
	"health" "health_status" DEFAULT 'healthy' NOT NULL,
	"planted_date" date NOT NULL,
	"properties" json,
	"metadata" json,
	"notes" text,
	"status" "status" DEFAULT 'active' NOT NULL,
	"destroyed_at" timestamp with time zone,
	"destroy_reason" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "legacy-grow-app_plant_identifier_unique" UNIQUE("identifier")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_room" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_id" uuid NOT NULL,
	"parent_id" uuid,
	"name" varchar(255) NOT NULL,
	"type" "room_type" NOT NULL,
	"properties" json,
	"dimensions" json,
	"capacity" integer DEFAULT 0,
	"status" "status" DEFAULT 'active' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_location" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "location_type" NOT NULL,
	"coordinates" json,
	"properties" json,
	"dimensions" json,
	"capacity" integer DEFAULT 0,
	"status" "status" DEFAULT 'active' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_sensor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" varchar(100) NOT NULL,
	"type" "sensor_type" NOT NULL,
	"manufacturer" varchar(255),
	"model" varchar(255),
	"serial_number" varchar(100),
	"last_calibration" timestamp with time zone,
	"next_calibration" timestamp with time zone,
	"calibration_interval" numeric(5, 2),
	"specifications" json,
	"metadata" json,
	"location_id" uuid NOT NULL,
	"notes" text,
	"status" "status" DEFAULT 'active' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "legacy-grow-app_sensor_identifier_unique" UNIQUE("identifier")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"entity_id" uuid,
	"entity_type" "task_entity_type" NOT NULL,
	"assigned_to_id" uuid,
	"category" "task_category" NOT NULL,
	"priority" "task_priority" NOT NULL,
	"task_status" "task_status" NOT NULL,
	"status" "status" DEFAULT 'active' NOT NULL,
	"due_date" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"properties" json DEFAULT '{"recurring":null,"checklist":[],"instructions":[],"requirements":{"tools":[],"supplies":[],"ppe":[]}}'::json,
	"metadata" json DEFAULT '{"previousTasks":[],"nextTasks":[],"estimatedDuration":null,"actualDuration":null,"location":null}'::json,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_processing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" varchar(100) NOT NULL,
	"harvest_id" uuid NOT NULL,
	"batch_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"method" varchar(100) NOT NULL,
	"input_weight" numeric(10, 3) NOT NULL,
	"output_weight" numeric(10, 3),
	"yield_percentage" numeric(5, 2),
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"duration" numeric(10, 2),
	"process_status" "batch_status" DEFAULT 'active' NOT NULL,
	"quality" "harvest_quality",
	"properties" json,
	"lab_results" json,
	"metadata" json,
	"notes" text,
	"status" "status" DEFAULT 'active' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "legacy-grow-app_processing_identifier_unique" UNIQUE("identifier")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_note" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "note_type" DEFAULT 'text' NOT NULL,
	"title" varchar(255),
	"content" text,
	"entity_id" uuid NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"parent_id" uuid,
	"properties" json,
	"metadata" json,
	"status" "status" DEFAULT 'active' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_sensor_reading" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sensor_id" uuid NOT NULL,
	"reading_value" numeric(10, 2) NOT NULL,
	"unit" varchar(50) NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_batch" ADD CONSTRAINT "legacy-grow-app_batch_genetic_id_legacy-grow-app_genetic_id_fk" FOREIGN KEY ("genetic_id") REFERENCES "public"."legacy-grow-app_genetic"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_batch" ADD CONSTRAINT "legacy-grow-app_batch_location_id_legacy-grow-app_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."legacy-grow-app_location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_batch" ADD CONSTRAINT "legacy-grow-app_batch_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_building" ADD CONSTRAINT "legacy-grow-app_building_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_account" ADD CONSTRAINT "legacy-grow-app_account_user_id_legacy-grow-app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_session" ADD CONSTRAINT "legacy-grow-app_session_user_id_legacy-grow-app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_genetic" ADD CONSTRAINT "legacy-grow-app_genetic_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_harvest" ADD CONSTRAINT "legacy-grow-app_harvest_batch_id_legacy-grow-app_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."legacy-grow-app_batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_harvest" ADD CONSTRAINT "legacy-grow-app_harvest_location_id_legacy-grow-app_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."legacy-grow-app_location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_harvest" ADD CONSTRAINT "legacy-grow-app_harvest_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_plant" ADD CONSTRAINT "legacy-grow-app_plant_genetic_id_legacy-grow-app_genetic_id_fk" FOREIGN KEY ("genetic_id") REFERENCES "public"."legacy-grow-app_genetic"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_plant" ADD CONSTRAINT "legacy-grow-app_plant_location_id_legacy-grow-app_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."legacy-grow-app_location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_plant" ADD CONSTRAINT "legacy-grow-app_plant_batch_id_legacy-grow-app_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."legacy-grow-app_batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_plant" ADD CONSTRAINT "legacy-grow-app_plant_mother_id_legacy-grow-app_plant_id_fk" FOREIGN KEY ("mother_id") REFERENCES "public"."legacy-grow-app_plant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_plant" ADD CONSTRAINT "legacy-grow-app_plant_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_room" ADD CONSTRAINT "legacy-grow-app_room_building_id_legacy-grow-app_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."legacy-grow-app_building"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_room" ADD CONSTRAINT "legacy-grow-app_room_parent_id_legacy-grow-app_room_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."legacy-grow-app_room"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_room" ADD CONSTRAINT "legacy-grow-app_room_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_location" ADD CONSTRAINT "legacy-grow-app_location_room_id_legacy-grow-app_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."legacy-grow-app_room"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_location" ADD CONSTRAINT "legacy-grow-app_location_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_sensor" ADD CONSTRAINT "legacy-grow-app_sensor_location_id_legacy-grow-app_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."legacy-grow-app_location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_sensor" ADD CONSTRAINT "legacy-grow-app_sensor_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_task" ADD CONSTRAINT "legacy-grow-app_task_assigned_to_id_legacy-grow-app_user_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_task" ADD CONSTRAINT "legacy-grow-app_task_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_processing" ADD CONSTRAINT "legacy-grow-app_processing_harvest_id_legacy-grow-app_harvest_id_fk" FOREIGN KEY ("harvest_id") REFERENCES "public"."legacy-grow-app_harvest"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_processing" ADD CONSTRAINT "legacy-grow-app_processing_batch_id_legacy-grow-app_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."legacy-grow-app_batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_processing" ADD CONSTRAINT "legacy-grow-app_processing_location_id_legacy-grow-app_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."legacy-grow-app_location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_processing" ADD CONSTRAINT "legacy-grow-app_processing_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_note" ADD CONSTRAINT "legacy-grow-app_note_parent_id_legacy-grow-app_note_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."legacy-grow-app_note"("id") ON DELETE cascade ON UPDATE no action;
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
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_sensor_reading" ADD CONSTRAINT "legacy-grow-app_sensor_reading_sensor_id_legacy-grow-app_sensor_id_fk" FOREIGN KEY ("sensor_id") REFERENCES "public"."legacy-grow-app_sensor"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "batch_identifier_idx" ON "legacy-grow-app_batch" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "batch_genetic_id_idx" ON "legacy-grow-app_batch" USING btree ("genetic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "batch_location_id_idx" ON "legacy-grow-app_batch" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "batch_stage_idx" ON "legacy-grow-app_batch" USING btree ("stage");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "batch_status_idx" ON "legacy-grow-app_batch" USING btree ("batch_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "batch_start_date_idx" ON "legacy-grow-app_batch" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "batch_general_status_idx" ON "legacy-grow-app_batch" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "building_name_idx" ON "legacy-grow-app_building" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "building_type_idx" ON "legacy-grow-app_building" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "building_status_idx" ON "legacy-grow-app_building" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "building_license_idx" ON "legacy-grow-app_building" USING btree ("license_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "legacy-grow-app_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "legacy-grow-app_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "system_log_level_idx" ON "legacy-grow-app_system_log" USING btree ("level");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "system_log_source_idx" ON "legacy-grow-app_system_log" USING btree ("source");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "system_log_created_at_idx" ON "legacy-grow-app_system_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_email_idx" ON "legacy-grow-app_user" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_role_idx" ON "legacy-grow-app_user" USING btree ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_active_idx" ON "legacy-grow-app_user" USING btree ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verification_token_expires_idx" ON "legacy-grow-app_verification_token" USING btree ("expires");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "genetic_name_idx" ON "legacy-grow-app_genetic" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "genetic_type_idx" ON "legacy-grow-app_genetic" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "genetic_breeder_idx" ON "legacy-grow-app_genetic" USING btree ("breeder");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "genetic_status_idx" ON "legacy-grow-app_genetic" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "genetic_in_house_idx" ON "legacy-grow-app_genetic" USING btree ("in_house");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "harvest_identifier_idx" ON "legacy-grow-app_harvest" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "harvest_batch_id_idx" ON "legacy-grow-app_harvest" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "harvest_location_id_idx" ON "legacy-grow-app_harvest" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "harvest_date_idx" ON "legacy-grow-app_harvest" USING btree ("harvest_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "harvest_quality_idx" ON "legacy-grow-app_harvest" USING btree ("quality");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "harvest_status_idx" ON "legacy-grow-app_harvest" USING btree ("harvest_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "harvest_general_status_idx" ON "legacy-grow-app_harvest" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plant_identifier_idx" ON "legacy-grow-app_plant" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plant_genetic_id_idx" ON "legacy-grow-app_plant" USING btree ("genetic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plant_location_id_idx" ON "legacy-grow-app_plant" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plant_batch_id_idx" ON "legacy-grow-app_plant" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plant_mother_id_idx" ON "legacy-grow-app_plant" USING btree ("mother_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plant_stage_idx" ON "legacy-grow-app_plant" USING btree ("stage");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plant_health_idx" ON "legacy-grow-app_plant" USING btree ("health");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plant_status_idx" ON "legacy-grow-app_plant" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plant_planted_date_idx" ON "legacy-grow-app_plant" USING btree ("planted_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "room_name_idx" ON "legacy-grow-app_room" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "room_type_idx" ON "legacy-grow-app_room" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "room_building_id_idx" ON "legacy-grow-app_room" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "room_status_idx" ON "legacy-grow-app_room" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "room_parent_id_idx" ON "legacy-grow-app_room" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "location_name_idx" ON "legacy-grow-app_location" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "location_type_idx" ON "legacy-grow-app_location" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "location_room_id_idx" ON "legacy-grow-app_location" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "location_status_idx" ON "legacy-grow-app_location" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensor_identifier_idx" ON "legacy-grow-app_sensor" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensor_type_idx" ON "legacy-grow-app_sensor" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensor_status_idx" ON "legacy-grow-app_sensor" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensor_calibration_idx" ON "legacy-grow-app_sensor" USING btree ("next_calibration");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensor_manufacturer_model_idx" ON "legacy-grow-app_sensor" USING btree ("manufacturer","model");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensor_location_idx" ON "legacy-grow-app_sensor" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_title_idx" ON "legacy-grow-app_task" USING btree ("title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_category_idx" ON "legacy-grow-app_task" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_priority_idx" ON "legacy-grow-app_task" USING btree ("priority");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_status_idx" ON "legacy-grow-app_task" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_assigned_to_idx" ON "legacy-grow-app_task" USING btree ("assigned_to_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_entity_idx" ON "legacy-grow-app_task" USING btree ("entity_id","entity_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_due_date_idx" ON "legacy-grow-app_task" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "processing_identifier_idx" ON "legacy-grow-app_processing" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "processing_harvest_id_idx" ON "legacy-grow-app_processing" USING btree ("harvest_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "processing_batch_id_idx" ON "legacy-grow-app_processing" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "processing_location_id_idx" ON "legacy-grow-app_processing" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "processing_type_method_idx" ON "legacy-grow-app_processing" USING btree ("type","method");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "processing_status_idx" ON "legacy-grow-app_processing" USING btree ("process_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "processing_started_at_idx" ON "legacy-grow-app_processing" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "processing_general_status_idx" ON "legacy-grow-app_processing" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_entity_idx" ON "legacy-grow-app_note" USING btree ("entity_id","entity_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_type_idx" ON "legacy-grow-app_note" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_created_by_idx" ON "legacy-grow-app_note" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_status_idx" ON "legacy-grow-app_note" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_created_at_idx" ON "legacy-grow-app_note" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensor_reading_sensor_idx" ON "legacy-grow-app_sensor_reading" USING btree ("sensor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensor_reading_timestamp_idx" ON "legacy-grow-app_sensor_reading" USING btree ("timestamp");