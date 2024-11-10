import { sql } from 'drizzle-orm'
import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js'

export async function up(db: PostgresJsDatabase) {
  // First, add the genetic_id column to batches (nullable initially)
  await sql`ALTER TABLE "legacy-grow-app_batch" ADD COLUMN IF NOT EXISTS "genetic_id" integer`

  // Add foreign key constraint
  await sql`
    ALTER TABLE "legacy-grow-app_batch" 
    ADD CONSTRAINT "batch_genetic_id_fkey" 
    FOREIGN KEY ("genetic_id") 
    REFERENCES "legacy-grow-app_genetic"("id")
  `
}

export async function down(db: PostgresJsDatabase) {
  // Remove foreign key constraint
  await sql`ALTER TABLE "legacy-grow-app_batch" DROP CONSTRAINT IF EXISTS "batch_genetic_id_fkey"`

  // Remove genetic_id column
  await sql`ALTER TABLE "legacy-grow-app_batch" DROP COLUMN IF EXISTS "genetic_id"`
}