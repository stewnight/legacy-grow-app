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
import { batches } from './batches'

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

// Types
export type Plant = typeof plants.$inferSelect
export type NewPlant = typeof plants.$inferInsert
