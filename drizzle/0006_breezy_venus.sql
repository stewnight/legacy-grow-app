CREATE TYPE "public"."equipment_status" AS ENUM('active', 'maintenance', 'offline', 'decommissioned', 'standby');--> statement-breakpoint
CREATE TYPE "public"."equipment_type" AS ENUM('hvac', 'lighting', 'irrigation', 'co2', 'dehumidifier', 'fan', 'filter', 'sensor', 'pump', 'other');--> statement-breakpoint
CREATE TYPE "public"."maintenance_frequency" AS ENUM('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'biannual', 'annual', 'as_needed');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "equipment_type" NOT NULL,
	"model" varchar(255),
	"manufacturer" varchar(255),
	"serial_number" varchar(255),
	"purchase_date" timestamp with time zone,
	"warranty_expiration" timestamp with time zone,
	"status" "equipment_status" DEFAULT 'active' NOT NULL,
	"maintenance_frequency" "maintenance_frequency" NOT NULL,
	"last_maintenance_date" timestamp with time zone,
	"next_maintenance_date" timestamp with time zone,
	"specifications" json,
	"metadata" json,
	"notes" varchar(1000),
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_equipment_room_assignment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"equipment_id" uuid NOT NULL,
	"room_id" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_by" uuid NOT NULL,
	"notes" varchar(1000)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legacy-grow-app_maintenance_record" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"equipment_id" uuid NOT NULL,
	"maintenance_date" timestamp with time zone DEFAULT now() NOT NULL,
	"type" varchar(255) NOT NULL,
	"description" varchar(1000),
	"cost" numeric(10, 2),
	"performed_by" uuid NOT NULL,
	"next_maintenance_date" timestamp with time zone,
	"status" varchar(50) DEFAULT 'completed',
	"parts" json,
	"metadata" json
);
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_sensor" ADD COLUMN "equipment_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_equipment" ADD CONSTRAINT "legacy-grow-app_equipment_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_equipment_room_assignment" ADD CONSTRAINT "legacy-grow-app_equipment_room_assignment_equipment_id_legacy-grow-app_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."legacy-grow-app_equipment"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_equipment_room_assignment" ADD CONSTRAINT "legacy-grow-app_equipment_room_assignment_room_id_legacy-grow-app_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."legacy-grow-app_room"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_equipment_room_assignment" ADD CONSTRAINT "legacy-grow-app_equipment_room_assignment_assigned_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_maintenance_record" ADD CONSTRAINT "legacy-grow-app_maintenance_record_equipment_id_legacy-grow-app_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."legacy-grow-app_equipment"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_maintenance_record" ADD CONSTRAINT "legacy-grow-app_maintenance_record_performed_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "equipment_name_idx" ON "legacy-grow-app_equipment" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "equipment_type_idx" ON "legacy-grow-app_equipment" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "equipment_status_idx" ON "legacy-grow-app_equipment" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "equipment_manufacturer_idx" ON "legacy-grow-app_equipment" USING btree ("manufacturer");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "equipment_serial_number_idx" ON "legacy-grow-app_equipment" USING btree ("serial_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "equipment_room_idx" ON "legacy-grow-app_equipment_room_assignment" USING btree ("equipment_id","room_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "equipment_maintenance_idx" ON "legacy-grow-app_maintenance_record" USING btree ("equipment_id","maintenance_date");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_sensor" ADD CONSTRAINT "legacy-grow-app_sensor_equipment_id_legacy-grow-app_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."legacy-grow-app_equipment"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensor_equipment_idx" ON "legacy-grow-app_sensor" USING btree ("equipment_id");