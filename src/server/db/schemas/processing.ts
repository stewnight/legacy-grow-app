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
} from 'drizzle-orm/pg-core'

import { createTable } from '../utils'
import { harvestQualityEnum } from './enums'
import { users } from './core'
import { plants } from './cultivation'

// ================== HARVESTS ==================
export type Harvest = typeof harvests.$inferSelect
export type NewHarvest = Omit<Harvest, 'id' | 'createdAt' | 'updatedAt'>

export const harvests = createTable(
  'harvest',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    plantId: integer('plant_id').references(() => plants.id),
    batchId: varchar('batch_id', { length: 255 }).notNull(),
    date: date('date').notNull(),
    wetWeight: decimal('wet_weight'),
    dryWeight: decimal('dry_weight'),
    trimWeight: decimal('trim_weight'),
    wasteWeight: decimal('waste_weight'),
    location: varchar('location', { length: 255 }),
    quality: harvestQualityEnum('quality'),
    notes: text('notes'),
    labResults: json('lab_results'),
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
  (table) => ({
    batchIdIdx: index('harvest_batch_id_idx').on(table.batchId),
    dateIdx: index('harvest_date_idx').on(table.date),
    plantIdIdx: index('harvest_plant_id_idx').on(table.plantId),
  })
)

// ================== PROCESSING ==================
export type Processing = typeof processing.$inferSelect
export type NewProcessing = Omit<Processing, 'id' | 'createdAt' | 'updatedAt'>

export const processing = createTable(
  'processing',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    harvestId: integer('harvest_id').references(() => harvests.id),
    type: varchar('type', { length: 50 }).notNull(),
    startDate: timestamp('start_date', { withTimezone: true }),
    endDate: timestamp('end_date', { withTimezone: true }),
    inputWeight: decimal('input_weight'),
    outputWeight: decimal('output_weight'),
    yield: decimal('yield'),
    method: varchar('method', { length: 255 }),
    equipment: json('equipment'),
    parameters: json('parameters'),
    notes: text('notes'),
    labResults: json('lab_results'),
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
  (table) => ({
    harvestIdIdx: index('processing_harvest_id_idx').on(table.harvestId),
    typeIdx: index('processing_type_idx').on(table.type),
    startDateIdx: index('processing_start_date_idx').on(table.startDate),
  })
)

// ================== COMPLIANCE LOGS ==================
export type ComplianceLog = typeof complianceLogs.$inferSelect

export const complianceLogs = createTable(
  'compliance_log',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    type: varchar('type', { length: 50 }).notNull(),
    category: varchar('category', { length: 50 }).notNull(),
    details: json('details'),
    attachments: json('attachments'),
    status: varchar('status', { length: 50 }),
    verifiedById: varchar('verified_by', { length: 255 }).references(
      () => users.id
    ),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
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
  (table) => ({
    typeIdx: index('compliance_log_type_idx').on(table.type),
    categoryIdx: index('compliance_log_category_idx').on(table.category),
    statusIdx: index('compliance_log_status_idx').on(table.status),
  })
)
