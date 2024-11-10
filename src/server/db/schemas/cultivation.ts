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
} from 'drizzle-orm/pg-core'

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

// ================== BATCHES ==================
export type Batch = typeof batches.$inferSelect
export type NewBatch = Omit<Batch, 'id' | 'createdAt' | 'updatedAt'>

export const batches = createTable(
  'batch',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    code: varchar('code', { length: 255 })
      .notNull()
      .$defaultFn(
        () => `BAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      ),
    name: varchar('name', { length: 255 }).notNull(),
    geneticId: integer('genetic_id')
      .notNull()
      .references(() => genetics.id),
    startDate: timestamp('start_date', { withTimezone: true }).defaultNow(),
    endDate: timestamp('end_date', { withTimezone: true }),
    status: batchStatusEnum('status').notNull().default('active'),
    plantCount: integer('plant_count').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    userId: varchar('user_id', { length: 255 }).notNull(),
  },
  (batch) => ({
    codeIdx: index('batch_code_idx').on(batch.code),
    nameIdx: index('batch_name_idx').on(batch.name),
    statusIdx: index('batch_status_idx').on(batch.status),
    userIdIdx: index('batch_user_id_idx').on(batch.userId),
  })
)

// ================== GENETICS ==================
export type Genetic = typeof genetics.$inferSelect
export type NewGenetic = Omit<Genetic, 'id' | 'createdAt' | 'updatedAt'>

export const genetics = createTable(
  'genetic',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    name: varchar('name', { length: 255 }).notNull(),
    type: geneticTypeEnum('type').notNull(),
    breeder: varchar('breeder', { length: 255 }),
    description: text('description'),
    floweringTime: integer('flowering_time'),
    thcPotential: decimal('thc_potential'),
    cbdPotential: decimal('cbd_potential'),
    terpeneProfie: json('terpene_profile').$type<Record<string, number>>(),
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
    createdById: varchar('created_by', { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (genetic) => ({
    nameIdx: index('genetic_name_idx').on(genetic.name),
    typeIdx: index('genetic_type_idx').on(genetic.type),
    createdByIdx: index('genetic_created_by_idx').on(genetic.createdById),
  })
)

// ================== PLANTS ==================
export type Plant = typeof plants.$inferSelect
export type NewPlant = Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>

export const plants = createTable(
  'plant',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    code: varchar('code', { length: 255 })
      .notNull()
      .$defaultFn(
        () => `PLT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      ),
    geneticId: integer('genetic_id').references(() => genetics.id),
    batchId: integer('batch_id').references(() => batches.id),
    source: plantSourceEnum('source').notNull(),
    stage: plantStageEnum('stage').notNull(),
    plantDate: date('plant_date'),
    harvestDate: date('harvest_date'),
    motherId: integer('mother_id'),
    generation: integer('generation'),
    sex: plantSexEnum('sex'),
    phenotype: varchar('phenotype', { length: 255 }),
    healthStatus: healthStatusEnum('health_status')
      .notNull()
      .default('healthy'),
    quarantine: boolean('quarantine').default(false),
    destroyReason: varchar('destroy_reason', { length: 255 }),
    locationId: integer('location_id').references(() => locations.id),
    createdById: varchar('created_by', { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (plant) => ({
    codeIdx: index('plant_code_idx').on(plant.code),
    batchIdIdx: index('plant_batch_id_idx').on(plant.batchId),
    stageIdx: index('plant_stage_idx').on(plant.stage),
    createdByIdx: index('plant_created_by_idx').on(plant.createdById),
    geneticIdIdx: index('plant_genetic_id_idx').on(plant.geneticId),
    locationIdIdx: index('plant_location_id_idx').on(plant.locationId),
  })
)
