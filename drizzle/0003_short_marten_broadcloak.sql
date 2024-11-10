DO $$ BEGIN
 CREATE TYPE "public"."destroy_reason" AS ENUM('died', 'destroyed', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
