import { sql } from 'drizzle-orm'
import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js'

export async function up(db: PostgresJsDatabase) {
  // First, add the genetic_id column to batches
  await sql`ALTER TABLE "legacy-grow-app_batch" ADD COLUMN "genetic_id" integer`

  // Migrate data from strains to genetics if needed
  await sql`
    INSERT INTO "legacy-grow-app_genetic" (name, type, created_by, created_at)
    SELECT name, type, created_by_id, created_at
    FROM "legacy-grow-app_strain"
    ON CONFLICT (name) DO NOTHING
  `

  // Update batch references
  await sql`
    UPDATE "legacy-grow-app_batch" b
    SET genetic_id = g.id
    FROM "legacy-grow-app_genetic" g
    WHERE b.strain = g.name
  `

  // Make genetic_id not null after data migration
  await sql`ALTER TABLE "legacy-grow-app_batch" ALTER COLUMN "genetic_id" SET NOT NULL`

  // Add foreign key constraint
  await sql`
    ALTER TABLE "legacy-grow-app_batch" 
    ADD CONSTRAINT "batch_genetic_id_fkey" 
    FOREIGN KEY ("genetic_id") 
    REFERENCES "legacy-grow-app_genetic"("id")
  `

  // Remove strain column from batches
  await sql`ALTER TABLE "legacy-grow-app_batch" DROP COLUMN IF EXISTS "strain"`

  // Finally, drop the strains table
  await sql`DROP TABLE IF EXISTS "legacy-grow-app_strain"`
}

export async function down(db: PostgresJsDatabase) {
  // Add strain column back to batches
  await sql`ALTER TABLE "legacy-grow-app_batch" ADD COLUMN strain varchar(255)`

  // Recreate strains table
  await sql`
    CREATE TABLE "legacy-grow-app_strain" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(255) NOT NULL,
      created_by_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Migrate data back from genetics if needed
  await sql`
    INSERT INTO "legacy-grow-app_strain" (name, type, created_by_id, created_at)
    SELECT name, type, created_by, created_at
    FROM "legacy-grow-app_genetic"
  `

  // Update batch strain references
  await sql`
    UPDATE "legacy-grow-app_batch" b
    SET strain = g.name
    FROM "legacy-grow-app_genetic" g
    WHERE b.genetic_id = g.id
  `

  // Remove genetic_id column
  await sql`ALTER TABLE "legacy-grow-app_batch" DROP COLUMN IF EXISTS "genetic_id"`
}
