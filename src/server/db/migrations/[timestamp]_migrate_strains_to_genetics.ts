import { sql } from 'drizzle-orm'
import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js'

export async function up(db: PostgresJsDatabase) {
  // Migrate data from strains to genetics
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
}

export async function down(db: PostgresJsDatabase) {
  // Make genetic_id nullable again
  await sql`ALTER TABLE "legacy-grow-app_batch" ALTER COLUMN "genetic_id" DROP NOT NULL`
}
