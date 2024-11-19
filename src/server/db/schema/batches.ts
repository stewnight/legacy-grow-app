import { sql, relations } from 'drizzle-orm'
import {
  index,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  date,
  integer,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../utils'
import { batchStatusEnum, plantStageEnum, statusEnum } from './enums'
import { users } from './core'
import { genetics } from './genetics'
import { locations } from './locations'

export interface BatchProperties {
  source?: 'seed' | 'clone' | 'tissue_culture'
  medium?: string
  container?: string
  nutrients?: Array<{
    name: string
    schedule?: string
    amount?: string
  }>
  environment?: {
    temperature?: { min: number; max: number }
    humidity?: { min: number; max: number }
    light?: { hours: number; intensity?: number }
  }
}

export interface BatchMetadata {
  motherBatch?: string
  generation?: number
  phenotype?: string
  selectionCriteria?: string[]
  targetYield?: number
}

// Create table
export const batches = createTable(
  'batch',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    identifier: varchar('identifier', { length: 100 }).notNull().unique(),
    geneticId: uuid('genetic_id')
      .notNull()
      .references(() => genetics.id),
    locationId: uuid('location_id')
      .notNull()
      .references(() => locations.id),
    stage: plantStageEnum('stage').notNull(),
    batchStatus: batchStatusEnum('batch_status').default('active').notNull(),
    startDate: date('start_date'),
    expectedEndDate: date('expected_end_date'),
    actualEndDate: date('actual_end_date'),
    plantCount: integer('plant_count').default(0),
    properties: json('properties').$type<BatchProperties>(),
    metadata: json('metadata').$type<BatchMetadata>(),
    notes: text('notes'),
    status: statusEnum('status').default('active').notNull(),
    createdById: uuid('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    identifierIdx: index('batch_identifier_idx').on(table.identifier),
    geneticIdIdx: index('batch_genetic_id_idx').on(table.geneticId),
    locationIdIdx: index('batch_location_id_idx').on(table.locationId),
    stageIdx: index('batch_stage_idx').on(table.stage),
    batchStatusIdx: index('batch_status_idx').on(table.batchStatus),
    startDateIdx: index('batch_start_date_idx').on(table.startDate),
    statusIdx: index('batch_general_status_idx').on(table.status),
  })
)

export const batchesRelations = relations(batches, ({ one }) => ({
  genetic: one(genetics, {
    fields: [batches.geneticId],
    references: [genetics.id],
    relationName: 'geneticBatches',
  }),
  location: one(locations, {
    fields: [batches.locationId],
    references: [locations.id],
    relationName: 'locationBatches',
  }),
  createdBy: one(users, {
    fields: [batches.createdById],
    references: [users.id],
  }),
}))

// Zod Schemas
export const insertBatchSchema = createInsertSchema(batches).omit({
  properties: true,
  metadata: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
})
export const selectBatchSchema = createSelectSchema(batches)

// Types
export type Batch = typeof batches.$inferSelect
export type NewBatch = typeof batches.$inferInsert
