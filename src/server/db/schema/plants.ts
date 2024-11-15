import { sql } from 'drizzle-orm'
import {
  index,
  varchar,
  timestamp,
  json,
  uuid,
  date,
  text,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../utils'
import {
  plantSourceEnum,
  plantStageEnum,
  plantSexEnum,
  healthStatusEnum,
  statusEnum,
} from './enums'
import { users } from './core'
import { locations } from './locations'
import { genetics } from './genetics'

export const plants = createTable(
  'plant',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    identifier: varchar('identifier', { length: 100 }).notNull().unique(),
    geneticId: uuid('genetic_id')
      .notNull()
      .references(() => genetics.id),
    locationId: uuid('location_id')
      .notNull()
      .references(() => locations.id),
    source: plantSourceEnum('source').notNull(),
    stage: plantStageEnum('stage').notNull(),
    sex: plantSexEnum('sex').default('unknown').notNull(),
    health: healthStatusEnum('health').default('healthy').notNull(),
    plantedDate: date('planted_date').notNull(),
    properties: json('properties').$type<{
      height?: number
      width?: number
      notes?: string
      feeding?: {
        schedule: string
        lastFed?: string
        nextFeed?: string
      }
      training?: {
        method: string
        lastTrained?: string
        nextTraining?: string
      }
    }>(),
    metadata: json('metadata').$type<{
      motherIdentifier?: string
      batchNumber?: string
      generation?: number
      clonedFrom?: string
      germination?: {
        date: string
        method: string
        medium: string
      }
    }>(),
    notes: text('notes'),
    status: statusEnum('status').default('active').notNull(),
    destroyedAt: timestamp('destroyed_at', { withTimezone: true }),
    destroyReason: text('destroy_reason'),
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
    identifierIdx: index('plant_identifier_idx').on(table.identifier),
    geneticIdIdx: index('plant_genetic_id_idx').on(table.geneticId),
    locationIdIdx: index('plant_location_id_idx').on(table.locationId),
    stageIdx: index('plant_stage_idx').on(table.stage),
    healthIdx: index('plant_health_idx').on(table.health),
    statusIdx: index('plant_status_idx').on(table.status),
    plantedDateIdx: index('plant_planted_date_idx').on(table.plantedDate),
  })
)

// Zod Schemas
export const insertPlantSchema = createInsertSchema(plants)
export const selectPlantSchema = createSelectSchema(plants)

// Types
export type Plant = typeof plants.$inferSelect
export type NewPlant = typeof plants.$inferInsert
