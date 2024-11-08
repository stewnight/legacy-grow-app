ALTER TABLE "legacy-grow-app_legacy-grow-app_user" RENAME TO "legacy-grow-app_user";--> statement-breakpoint
ALTER TABLE "legacy-grow-app_account" DROP CONSTRAINT "legacy-grow-app_account_user_id_legacy-grow-app_legacy-grow-app_user_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_session" DROP CONSTRAINT "legacy-grow-app_session_user_id_legacy-grow-app_legacy-grow-app_user_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_genetic" DROP CONSTRAINT "legacy-grow-app_genetic_created_by_legacy-grow-app_legacy-grow-app_user_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_plant" DROP CONSTRAINT "legacy-grow-app_plant_created_by_legacy-grow-app_legacy-grow-app_user_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_area" DROP CONSTRAINT "legacy-grow-app_area_created_by_legacy-grow-app_legacy-grow-app_user_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_facility" DROP CONSTRAINT "legacy-grow-app_facility_created_by_legacy-grow-app_legacy-grow-app_user_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_location" DROP CONSTRAINT "legacy-grow-app_location_created_by_legacy-grow-app_legacy-grow-app_user_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_input" DROP CONSTRAINT "legacy-grow-app_input_created_by_legacy-grow-app_legacy-grow-app_user_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_sensor" DROP CONSTRAINT "legacy-grow-app_sensor_created_by_legacy-grow-app_legacy-grow-app_user_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_supplier" DROP CONSTRAINT "legacy-grow-app_supplier_created_by_legacy-grow-app_legacy-grow-app_user_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_task_template" DROP CONSTRAINT "legacy-grow-app_task_template_created_by_legacy-grow-app_legacy-grow-app_user_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_task" DROP CONSTRAINT "legacy-grow-app_task_assigned_to_legacy-grow-app_legacy-grow-app_user_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_task" DROP CONSTRAINT "legacy-grow-app_task_created_by_legacy-grow-app_legacy-grow-app_user_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_compliance_log" DROP CONSTRAINT "legacy-grow-app_compliance_log_verified_by_legacy-grow-app_legacy-grow-app_user_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_compliance_log" DROP CONSTRAINT "legacy-grow-app_compliance_log_created_by_legacy-grow-app_legacy-grow-app_user_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_harvest" DROP CONSTRAINT "legacy-grow-app_harvest_created_by_legacy-grow-app_legacy-grow-app_user_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_processing" DROP CONSTRAINT "legacy-grow-app_processing_created_by_legacy-grow-app_legacy-grow-app_user_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy-grow-app_note" DROP CONSTRAINT "legacy-grow-app_note_created_by_legacy-grow-app_legacy-grow-app_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_account" ADD CONSTRAINT "legacy-grow-app_account_user_id_legacy-grow-app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_session" ADD CONSTRAINT "legacy-grow-app_session_user_id_legacy-grow-app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "legacy-grow-app_plant" ADD CONSTRAINT "legacy-grow-app_plant_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "legacy-grow-app_location" ADD CONSTRAINT "legacy-grow-app_location_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legacy-grow-app_input" ADD CONSTRAINT "legacy-grow-app_input_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "legacy-grow-app_supplier" ADD CONSTRAINT "legacy-grow-app_supplier_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "legacy-grow-app_harvest" ADD CONSTRAINT "legacy-grow-app_harvest_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "legacy-grow-app_note" ADD CONSTRAINT "legacy-grow-app_note_created_by_legacy-grow-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."legacy-grow-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
