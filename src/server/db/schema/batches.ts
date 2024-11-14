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
import { locations } from './locations'
import { genetics } from './genetics'

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
    codeIdx: index('batch_code_idx').on(table.code),
    nameIdx: index('batch_name_idx').on(table.name),
    statusIdx: index('batch_status_idx').on(table.status),
    userIdIdx: index('batch_user_id_idx').on(table.userId),
    geneticIdIdx: index('batch_genetic_id_idx').on(table.geneticId),
    locationIdIdx: index('batch_location_id_idx').on(table.locationId),
    stageIdx: index('batch_stage_idx').on(table.stage),
    createdByIdx: index('batch_created_by_idx').on(table.createdById),
  })
)

export const insertBatchSchema = createInsertSchema(batches)
export const selectBatchSchema = createSelectSchema(batches)

export type Batch = typeof batches.$inferSelect
export type NewBatch = typeof batches.$inferInsert
