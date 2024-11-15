import { sql } from 'drizzle-orm'
import {
  index,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  date,
  numeric,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../utils'
import { batchStatusEnum, harvestQualityEnum, statusEnum } from './enums'
import { users } from './core'
import { batches } from './batches'
import { locations } from './locations'

export const harvests = createTable(
  'harvest',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    identifier: varchar('identifier', { length: 100 }).notNull().unique(),
    batchId: uuid('batch_id')
      .notNull()
      .references(() => batches.id),
    locationId: uuid('location_id')
      .notNull()
      .references(() => locations.id),
    harvestDate: date('harvest_date').notNull(),
    // Weight tracking with 3 decimal places for precision
    wetWeight: numeric('wet_weight', { precision: 10, scale: 3 }),
    dryWeight: numeric('dry_weight', { precision: 10, scale: 3 }),
    trimWeight: numeric('trim_weight', { precision: 10, scale: 3 }),
    wasteWeight: numeric('waste_weight', { precision: 10, scale: 3 }),
    quality: harvestQualityEnum('quality'),
    harvestStatus: batchStatusEnum('harvest_status')
      .default('active')
      .notNull(),
    properties: json('properties').$type<{
      dryingConditions?: {
        temperature: number
        humidity: number
        duration: number
        method: string
      }
      trimming?: {
        method: string
        machine?: string
        team?: string[]
        duration?: number
      }
      yield?: {
        expected: number
        actual: number
        variance: number
        unit: string
      }
      categories?: Array<{
        name: string
        weight: number
        grade?: string
      }>
    }>(),
    labResults: json('lab_results').$type<{
      thc?: number
      cbd?: number
      moisture?: number
      terpenes?: Array<{
        name: string
        percentage: number
      }>
      microbials?: {
        passed: boolean
        details?: Record<string, number>
      }
      metals?: {
        passed: boolean
        details?: Record<string, number>
      }
      pesticides?: {
        passed: boolean
        details?: Record<string, number>
      }
      testedAt?: string
      testedBy?: string
      certificateUrl?: string
    }>(),
    metadata: json('metadata').$type<{
      environmentalConditions?: {
        temperature: number
        humidity: number
        light: number
      }
      team?: string[]
      equipment?: string[]
      notes?: string[]
      images?: Array<{
        url: string
        type: string
        timestamp: string
      }>
    }>(),
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
    identifierIdx: index('harvest_identifier_idx').on(table.identifier),
    batchIdIdx: index('harvest_batch_id_idx').on(table.batchId),
    locationIdIdx: index('harvest_location_id_idx').on(table.locationId),
    harvestDateIdx: index('harvest_date_idx').on(table.harvestDate),
    qualityIdx: index('harvest_quality_idx').on(table.quality),
    harvestStatusIdx: index('harvest_status_idx').on(table.harvestStatus),
    statusIdx: index('harvest_general_status_idx').on(table.status),
  })
)

// Zod Schemas
export const insertHarvestSchema = createInsertSchema(harvests)
export const selectHarvestSchema = createSelectSchema(harvests)

// Types
export type Harvest = typeof harvests.$inferSelect
export type NewHarvest = typeof harvests.$inferInsert
