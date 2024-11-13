DO $$ BEGIN
 CREATE TYPE "public"."batch_status" AS ENUM('active', 'completed', 'cancelled', 'archived');
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
 CREATE TYPE "public"."sensor_type" AS ENUM('temperature', 'humidity', 'co2', 'light', 'ph', 'ec', 'moisture', 'pressure', 'airflow');
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
CREATE TABLE IF NOT EXISTS "legacy-grow-app_batch" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"genetic_id" uuid,
	"plant_count" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"status" "batch_status" DEFAULT 'active' NOT NULL,
	"user_id" uuid NOT NULL,
	"source" varchar(255),
	"stage" "plant_stage",
	"plant_date" timestamp with time zone,
	"health_status" "health_status" DEFAULT 'healthy',
	"mother_id" integer,
	"generation" integer,
	"sex" "plant_sex",
	"phenotype" varchar(255),
	"location_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "legacy-grow-app_batch_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_genetic" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"type" "genetic_type" NOT NULL,
	"breeder" varchar(255),
	"description" text,
	"flowering_time" integer,
	"thc_potential" numeric(4, 2),
	"cbd_potential" numeric(4, 2),
	"terpene_profile" json,
	"growth_characteristics" json,
	"lineage" json,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "legacy-grow-app_genetic_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_plant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"genetic_id" uuid,
	"batch_id" uuid,
	"source" "plant_source" NOT NULL,
	"stage" "plant_stage" NOT NULL,
	"plant_date" date,
	"harvest_date" date,
	"mother_id" uuid,
	"generation" integer,
	"sex" "plant_sex",
	"phenotype" text,
	"health_status" "health_status" DEFAULT 'healthy' NOT NULL,
	"quarantine" boolean DEFAULT false,
	"destroy_reason" text,
	"location_id" uuid,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	CONSTRAINT "legacy-grow-app_plant_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_area" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"parent_id" uuid,
	"dimensions" json,
	"capacity" json,
	"environment" json,
	"status" varchar(50) DEFAULT 'active',
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_facility" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"address" json,
	"license" json,
	"capacity" json,
	"properties" json,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_location" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"area_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "location_type" NOT NULL,
	"coordinates" json,
	"properties" json,
	"capacity" integer,
	"status" varchar(50) DEFAULT 'active',
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_sensor_reading" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sensor_id" uuid NOT NULL,
	"value" numeric(10, 4) NOT NULL,
	"unit" varchar(50) NOT NULL,
	"quality" numeric(5, 2),
	"metadata" json,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_sensor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "sensor_type" NOT NULL,
	"model" varchar(255),
	"location_id" uuid,
	"calibration_date" date,
	"calibration_due" date,
	"accuracy" numeric(10, 4),
	"range" json,
	"metadata" json,
	"status" varchar(50) DEFAULT 'active',
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_task_template" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" "task_category" NOT NULL,
	"description" text,
	"instructions" json,
	"estimated_duration" integer,
	"required_skills" json,
	"checklist" json,
	"metadata" json,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid,
	"assigned_to" uuid,
	"status" "task_status" DEFAULT 'pending' NOT NULL,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"due_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"notes" text,
	"checklist" json,
	"metadata" json,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_compliance_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(50) NOT NULL,
	"category" varchar(50) NOT NULL,
	"details" json,
	"attachments" json,
	"status" varchar(50) DEFAULT 'pending',
	"verified_by" uuid,
	"verified_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_harvest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plant_id" uuid,
	"batch_id" varchar(255) NOT NULL,
	"date" date NOT NULL,
	"wet_weight" numeric(10, 2),
	"dry_weight" numeric(10, 2),
	"trim_weight" numeric(10, 2),
	"waste_weight" numeric(10, 2),
	"location" varchar(255),
	"quality" "harvest_quality",
	"notes" text,
	"lab_results" json,
	"status" varchar(50) DEFAULT 'active',
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_processing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"harvest_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"input_weight" numeric(10, 2),
	"output_weight" numeric(10, 2),
	"yield" numeric(5, 2),
	"method" varchar(255),
	"equipment" json,
	"parameters" json,
	"notes" text,
	"lab_results" json,
	"status" varchar(50) DEFAULT 'active',
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_note" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"type" "note_type" DEFAULT 'text' NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"parent_id" uuid,
	"metadata" json,
	"pinned" boolean DEFAULT false,
	"archived" boolean DEFAULT false,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
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
 ALTER TABLE "legacy-grow-app_batch" ADD CONSTRAINT "legacy-grow-app_batch_genetic_id_legacy-grow-app_genetic_id_fk" FOREIGN KEY ("genetic_id") REFERENCES "public"."legacy-grow-app_genetic"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_batch" ADD CONSTRAINT "legacy-grow-app_batch_user_id_legacy-grow-app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_batch" ADD CONSTRAINT "legacy-grow-app_batch_location_id_legacy-grow-app_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."legacy-grow-app_location"("id") ON DELETE set null ON UPDATE no action;
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
 ALTER TABLE "legacy-grow-app_plant" ADD CONSTRAINT "legacy-grow-app_plant_genetic_id_legacy-grow-app_genetic_id_fk" FOREIGN KEY ("genetic_id") REFERENCES "public"."legacy-grow-app_genetic"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "legacy-grow-app_plant" ADD CONSTRAINT "legacy-grow-app_plant_location_id_legacy-grow-app_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."legacy-grow-app_location"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "legacy-grow-app_area" ADD CONSTRAINT "legacy-grow-app_area_facility_id_legacy-grow-app_facility_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."legacy-grow-app_facility"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_area" ADD CONSTRAINT "legacy-grow-app_area_parent_id_legacy-grow-app_area_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."legacy-grow-app_area"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_area" ADD CONSTRAINT "legacy-grow-app_area_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_facility" ADD CONSTRAINT "legacy-grow-app_facility_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_location" ADD CONSTRAINT "legacy-grow-app_location_area_id_legacy-grow-app_area_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."legacy-grow-app_area"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "legacy-grow-app_sensor_reading" ADD CONSTRAINT "legacy-grow-app_sensor_reading_sensor_id_legacy-grow-app_sensor_id_fk" FOREIGN KEY ("sensor_id") REFERENCES "public"."legacy-grow-app_sensor"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_sensor" ADD CONSTRAINT "legacy-grow-app_sensor_location_id_legacy-grow-app_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."legacy-grow-app_location"("id") ON DELETE set null ON UPDATE no action;
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
 ALTER TABLE "legacy-grow-app_task_template" ADD CONSTRAINT "legacy-grow-app_task_template_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_task" ADD CONSTRAINT "legacy-grow-app_task_template_id_legacy-grow-app_task_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."legacy-grow-app_task_template"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_task" ADD CONSTRAINT "legacy-grow-app_task_assigned_to_legacy-grow-app_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "legacy-grow-app_compliance_log" ADD CONSTRAINT "legacy-grow-app_compliance_log_verified_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_compliance_log" ADD CONSTRAINT "legacy-grow-app_compliance_log_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_harvest" ADD CONSTRAINT "legacy-grow-app_harvest_plant_id_legacy-grow-app_plant_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."legacy-grow-app_plant"("id") ON DELETE set null ON UPDATE no action;
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
 ALTER TABLE "legacy-grow-app_processing" ADD CONSTRAINT "legacy-grow-app_processing_harvest_id_legacy-grow-app_harvest_id_fk" FOREIGN KEY ("harvest_id") REFERENCES "public"."legacy-grow-app_harvest"("id") ON DELETE cascade ON UPDATE no action;
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
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "legacy-grow-app_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "legacy-grow-app_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "system_log_level_idx" ON "legacy-grow-app_system_log" USING btree ("level");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "system_log_source_idx" ON "legacy-grow-app_system_log" USING btree ("source");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "system_log_created_at_idx" ON "legacy-grow-app_system_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_email_idx" ON "legacy-grow-app_user" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_role_idx" ON "legacy-grow-app_user" USING btree ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_active_idx" ON "legacy-grow-app_user" USING btree ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verification_token_expires_idx" ON "legacy-grow-app_verification_token" USING btree ("expires");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "batch_code_idx" ON "legacy-grow-app_batch" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "batch_name_idx" ON "legacy-grow-app_batch" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "batch_status_idx" ON "legacy-grow-app_batch" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "batch_user_id_idx" ON "legacy-grow-app_batch" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "batch_genetic_id_idx" ON "legacy-grow-app_batch" USING btree ("genetic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "batch_location_id_idx" ON "legacy-grow-app_batch" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "batch_stage_idx" ON "legacy-grow-app_batch" USING btree ("stage");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "genetic_name_idx" ON "legacy-grow-app_genetic" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "genetic_type_idx" ON "legacy-grow-app_genetic" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "genetic_created_by_idx" ON "legacy-grow-app_genetic" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "genetic_slug_idx" ON "legacy-grow-app_genetic" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plant_code_idx" ON "legacy-grow-app_plant" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plant_batch_id_idx" ON "legacy-grow-app_plant" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plant_stage_idx" ON "legacy-grow-app_plant" USING btree ("stage");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plant_created_by_idx" ON "legacy-grow-app_plant" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plant_genetic_id_idx" ON "legacy-grow-app_plant" USING btree ("genetic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plant_location_id_idx" ON "legacy-grow-app_plant" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "area_name_idx" ON "legacy-grow-app_area" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "area_type_idx" ON "legacy-grow-app_area" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "area_facility_id_idx" ON "legacy-grow-app_area" USING btree ("facility_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "area_parent_id_idx" ON "legacy-grow-app_area" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "area_status_idx" ON "legacy-grow-app_area" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "facility_name_idx" ON "legacy-grow-app_facility" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "facility_type_idx" ON "legacy-grow-app_facility" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "facility_created_by_idx" ON "legacy-grow-app_facility" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "location_name_idx" ON "legacy-grow-app_location" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "location_type_idx" ON "legacy-grow-app_location" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "location_area_id_idx" ON "legacy-grow-app_location" USING btree ("area_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "location_status_idx" ON "legacy-grow-app_location" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensor_reading_sensor_id_idx" ON "legacy-grow-app_sensor_reading" USING btree ("sensor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensor_reading_timestamp_idx" ON "legacy-grow-app_sensor_reading" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensor_reading_value_idx" ON "legacy-grow-app_sensor_reading" USING btree ("value");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensor_name_idx" ON "legacy-grow-app_sensor" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensor_type_idx" ON "legacy-grow-app_sensor" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensor_location_id_idx" ON "legacy-grow-app_sensor" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensor_status_idx" ON "legacy-grow-app_sensor" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_template_name_idx" ON "legacy-grow-app_task_template" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_template_category_idx" ON "legacy-grow-app_task_template" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_status_idx" ON "legacy-grow-app_task" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_priority_idx" ON "legacy-grow-app_task" USING btree ("priority");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_assigned_to_idx" ON "legacy-grow-app_task" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_due_date_idx" ON "legacy-grow-app_task" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_template_id_idx" ON "legacy-grow-app_task" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "compliance_log_type_idx" ON "legacy-grow-app_compliance_log" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "compliance_log_category_idx" ON "legacy-grow-app_compliance_log" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "compliance_log_status_idx" ON "legacy-grow-app_compliance_log" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "compliance_log_verified_by_idx" ON "legacy-grow-app_compliance_log" USING btree ("verified_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "compliance_log_created_at_idx" ON "legacy-grow-app_compliance_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "harvest_batch_id_idx" ON "legacy-grow-app_harvest" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "harvest_date_idx" ON "legacy-grow-app_harvest" USING btree ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "harvest_plant_id_idx" ON "legacy-grow-app_harvest" USING btree ("plant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "harvest_quality_idx" ON "legacy-grow-app_harvest" USING btree ("quality");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "harvest_status_idx" ON "legacy-grow-app_harvest" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "processing_harvest_id_idx" ON "legacy-grow-app_processing" USING btree ("harvest_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "processing_type_idx" ON "legacy-grow-app_processing" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "processing_start_date_idx" ON "legacy-grow-app_processing" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "processing_status_idx" ON "legacy-grow-app_processing" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_entity_type_idx" ON "legacy-grow-app_note" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_entity_id_idx" ON "legacy-grow-app_note" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_type_idx" ON "legacy-grow-app_note" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_parent_id_idx" ON "legacy-grow-app_note" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_created_by_idx" ON "legacy-grow-app_note" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_created_at_idx" ON "legacy-grow-app_note" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_pinned_idx" ON "legacy-grow-app_note" USING btree ("pinned");