import { sql } from 'drizzle-orm'
import {
  index,
  integer,
  varchar,
  timestamp,
  text,
  decimal,
  json,
  date,
  boolean,
  uuid,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

import { createTable } from '../utils'
import {
  batchStatusEnum,
  plantSourceEnum,
  plantStageEnum,
  plantSexEnum,
  healthStatusEnum,
  geneticTypeEnum,
} from './enums'
import { users } from './core'
import { locations } from './facility'

// ================== GENETICS ==================
export const genetics = createTable(
  'genetic',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    type: geneticTypeEnum('type').notNull(),
    breeder: varchar('breeder', { length: 255 }),
    description: text('description'),
    floweringTime: integer('flowering_time'),
    thcPotential: decimal('thc_potential', { precision: 4, scale: 2 }),
    cbdPotential: decimal('cbd_potential', { precision: 4, scale: 2 }),
    terpeneProfile: json('terpene_profile').$type<Record<
      string,
      number
    > | null>(),
    growthCharacteristics: json('growth_characteristics').$type<{
      height?: number
      spread?: number
      internodeSpacing?: number
      leafPattern?: string
    }>(),
    lineage: json('lineage').$type<{
      mother?: string
      father?: string
      generation?: number
    }>(),
    createdById: uuid('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    nameIdx: index('genetic_name_idx').on(table.name),
    typeIdx: index('genetic_type_idx').on(table.type),
    createdByIdx: index('genetic_created_by_idx').on(table.createdById),
    slugIdx: index('genetic_slug_idx').on(table.slug),
  })
)

// ================== BATCHES ==================
export const batches = createTable(
  'batch',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 255 })
      .notNull()
      .unique()
      .$defaultFn(
        () => `b${Date.now()}${Math.random().toString(36).slice(2, 11)}`
      ),
    name: varchar('name', { length: 255 }).notNull(),
    geneticId: uuid('genetic_id').references(() => genetics.id, {
      onDelete: 'set null',
    }),
    plantCount: integer('plant_count').notNull().default(0),
    notes: text('notes'),
    status: batchStatusEnum('status').notNull().default('active'),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    source: varchar('source', { length: 255 }),
    stage: plantStageEnum('stage'),
    plantDate: timestamp('plant_date', { withTimezone: true }),
    healthStatus: healthStatusEnum('health_status').default('healthy'),
    motherId: integer('mother_id'),
    generation: integer('generation'),
    sex: plantSexEnum('sex'),
    phenotype: varchar('phenotype', { length: 255 }),
    locationId: uuid('location_id').references(() => locations.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    codeIdx: index('batch_code_idx').on(table.code),
    nameIdx: index('batch_name_idx').on(table.name),
    statusIdx: index('batch_status_idx').on(table.status),
    userIdIdx: index('batch_user_id_idx').on(table.userId),
    geneticIdIdx: index('batch_genetic_id_idx').on(table.geneticId),
    locationIdIdx: index('batch_location_id_idx').on(table.locationId),
    stageIdx: index('batch_stage_idx').on(table.stage),
  })
)

// ================== PLANTS ==================
export const plants = createTable(
  'plant',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: text('code')
      .notNull()
      .unique()
      .$defaultFn(
        () => `p${Date.now()}${Math.random().toString(36).slice(2, 11)}`
      ),
    geneticId: uuid('genetic_id').references(() => genetics.id),
    batchId: uuid('batch_id').references(() => batches.id),
    source: plantSourceEnum('source').notNull(),
    stage: plantStageEnum('stage').notNull(),
    plantDate: date('plant_date'),
    harvestDate: date('harvest_date'),
    motherId: uuid('mother_id'),
    generation: integer('generation'),
    sex: plantSexEnum('sex'),
    phenotype: text('phenotype'),
    healthStatus: healthStatusEnum('health_status')
      .notNull()
      .default('healthy'),
    quarantine: boolean('quarantine').default(false),
    destroyReason: text('destroy_reason'),
    locationId: uuid('location_id').references(() => locations.id),
    createdById: uuid('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
    status: varchar('status', { length: 50 }).notNull().default('active'),
  },
  (table) => ({
    codeIdx: index('plant_code_idx').on(table.code),
    batchIdIdx: index('plant_batch_id_idx').on(table.batchId),
    stageIdx: index('plant_stage_idx').on(table.stage),
    createdByIdx: index('plant_created_by_idx').on(table.createdById),
    geneticIdIdx: index('plant_genetic_id_idx').on(table.geneticId),
    locationIdIdx: index('plant_location_id_idx').on(table.locationId),
  })
)

// Zod Schemas
export const insertPlantSchema = createInsertSchema(plants)
export const selectPlantSchema = createSelectSchema(plants)
export const insertGeneticSchema = createInsertSchema(genetics)
export const selectGeneticSchema = createSelectSchema(genetics)
export const insertBatchSchema = createInsertSchema(batches)
export const selectBatchSchema = createSelectSchema(batches)

// Types
export type Plant = typeof plants.$inferSelect
export type NewPlant = typeof plants.$inferInsert
export type Genetic = typeof genetics.$inferSelect
export type NewGenetic = typeof genetics.$inferInsert
export type Batch = typeof batches.$inferSelect
export type NewBatch = typeof batches.$inferInsert
