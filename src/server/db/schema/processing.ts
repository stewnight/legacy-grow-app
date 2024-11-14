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
  uuid,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

import { createTable } from '../utils'
import { harvestQualityEnum } from './enums'
import { users } from './core'
import { plants } from './plants'

// ================== HARVESTS ==================
export const harvests = createTable(
  'harvest',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    plantId: uuid('plant_id').references(() => plants.id, {
      onDelete: 'set null',
    }),
    batchId: varchar('batch_id', { length: 255 }).notNull(),
    date: date('date').notNull(),
    wetWeight: decimal('wet_weight', { precision: 10, scale: 2 }),
    dryWeight: decimal('dry_weight', { precision: 10, scale: 2 }),
    trimWeight: decimal('trim_weight', { precision: 10, scale: 2 }),
    wasteWeight: decimal('waste_weight', { precision: 10, scale: 2 }),
    location: varchar('location', { length: 255 }),
    quality: harvestQualityEnum('quality'),
    notes: text('notes'),
    labResults: json('lab_results').$type<{
      thc?: number
      cbd?: number
      terpenes?: Record<string, number>
      testDate?: string
      laboratory?: string
      certNumber?: string
    }>(),
    status: varchar('status', { length: 50 }).default('active'),
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
    batchIdIdx: index('harvest_batch_id_idx').on(table.batchId),
    dateIdx: index('harvest_date_idx').on(table.date),
    plantIdIdx: index('harvest_plant_id_idx').on(table.plantId),
    qualityIdx: index('harvest_quality_idx').on(table.quality),
    statusIdx: index('harvest_status_idx').on(table.status),
  })
)

// ================== PROCESSING ==================
export const processing = createTable(
  'processing',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    harvestId: uuid('harvest_id')
      .notNull()
      .references(() => harvests.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 50 }).notNull(),
    startDate: timestamp('start_date', { withTimezone: true }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true }),
    inputWeight: decimal('input_weight', { precision: 10, scale: 2 }),
    outputWeight: decimal('output_weight', { precision: 10, scale: 2 }),
    yield: decimal('yield', { precision: 5, scale: 2 }),
    method: varchar('method', { length: 255 }),
    equipment: json('equipment').$type<
      {
        name: string
        settings?: Record<string, unknown>
        calibration?: string
      }[]
    >(),
    parameters: json('parameters').$type<{
      temperature?: number
      pressure?: number
      duration?: number
      solvent?: string
      notes?: string
    }>(),
    notes: text('notes'),
    labResults: json('lab_results').$type<{
      potency?: Record<string, number>
      purity?: number
      contaminants?: Record<string, number>
      testDate?: string
    }>(),
    status: varchar('status', { length: 50 }).default('active'),
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
    harvestIdIdx: index('processing_harvest_id_idx').on(table.harvestId),
    typeIdx: index('processing_type_idx').on(table.type),
    startDateIdx: index('processing_start_date_idx').on(table.startDate),
    statusIdx: index('processing_status_idx').on(table.status),
  })
)

// ================== COMPLIANCE LOGS ==================
export const complianceLogs = createTable(
  'compliance_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: varchar('type', { length: 50 }).notNull(),
    category: varchar('category', { length: 50 }).notNull(),
    details: json('details').$type<{
      event: string
      location?: string
      participants?: string[]
      quantities?: Record<string, number>
      notes?: string
    }>(),
    attachments: json('attachments').$type<
      {
        type: string
        url: string
        name: string
        size?: number
      }[]
    >(),
    status: varchar('status', { length: 50 }).default('pending'),
    verifiedById: uuid('verified_by').references(() => users.id),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
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
    typeIdx: index('compliance_log_type_idx').on(table.type),
    categoryIdx: index('compliance_log_category_idx').on(table.category),
    statusIdx: index('compliance_log_status_idx').on(table.status),
    verifiedByIdx: index('compliance_log_verified_by_idx').on(
      table.verifiedById
    ),
    createdAtIdx: index('compliance_log_created_at_idx').on(table.createdAt),
  })
)

// Zod Schemas
export const insertHarvestSchema = createInsertSchema(harvests)
export const selectHarvestSchema = createSelectSchema(harvests)
export const insertProcessingSchema = createInsertSchema(processing)
export const selectProcessingSchema = createSelectSchema(processing)
export const insertComplianceLogSchema = createInsertSchema(complianceLogs)
export const selectComplianceLogSchema = createSelectSchema(complianceLogs)

// Types
export type Harvest = typeof harvests.$inferSelect
export type NewHarvest = typeof harvests.$inferInsert
export type Processing = typeof processing.$inferSelect
export type NewProcessing = typeof processing.$inferInsert
export type ComplianceLog = typeof complianceLogs.$inferSelect
export type NewComplianceLog = typeof complianceLogs.$inferInsert
