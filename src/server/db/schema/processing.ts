import { relations, sql } from 'drizzle-orm'
import { index, varchar, timestamp, json, uuid, text, numeric } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../utils'
import { batchStatusEnum, harvestQualityEnum, statusEnum } from './enums'
import { users } from './core'
import { batches } from './batches'
import { harvests } from './harvests'
import { locations } from './locations'
import { jobs } from './jobs'
import { notes } from './notes'

export const processing = createTable(
  'processing',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    identifier: varchar('identifier', { length: 100 }).notNull().unique(),
    harvestId: uuid('harvest_id')
      .notNull()
      .references(() => harvests.id),
    batchId: uuid('batch_id')
      .notNull()
      .references(() => batches.id),
    locationId: uuid('location_id')
      .notNull()
      .references(() => locations.id),
    // Processing type and method
    type: varchar('type', { length: 50 }).notNull(), // drying, curing, extraction, etc.
    method: varchar('method', { length: 100 }).notNull(), // specific technique used
    // Weight tracking
    inputWeight: numeric('input_weight', { precision: 10, scale: 3 }).notNull(),
    outputWeight: numeric('output_weight', { precision: 10, scale: 3 }),
    yieldPercentage: numeric('yield_percentage', { precision: 5, scale: 2 }),
    // Timing
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    duration: numeric('duration', { precision: 10, scale: 2 }), // in hours
    processStatus: batchStatusEnum('process_status').default('active').notNull(),
    quality: harvestQualityEnum('quality'),
    properties: json('properties').$type<{
      equipment?: Array<{
        name: string
        type: string
        settings?: Record<string, unknown>
      }>
      environment?: {
        temperature: number
        humidity: number
        pressure?: number
        lightLevel?: number
        airflow?: number
      }
      materials?: Array<{
        name: string
        amount: number
        unit: string
        batch?: string
      }>
      stages?: Array<{
        name: string
        duration: number
        conditions?: Record<string, unknown>
        completedAt?: string
      }>
    }>(),
    labResults: json('lab_results').$type<{
      potency?: {
        thc: number
        cbd: number
        totalCannabinoids: number
      }
      terpenes?: Array<{
        name: string
        percentage: number
      }>
      contaminants?: {
        microbial: boolean
        metals: boolean
        pesticides: boolean
        solvents?: boolean
      }
      moisture?: number
      density?: number
      viscosity?: number
      color?: string
      testedAt?: string
      testedBy?: string
      certificateUrl?: string
    }>(),
    metadata: json('metadata').$type<{
      operators?: Array<{
        userId: string
        role: string
        hours: number
      }>
      qualityChecks?: Array<{
        timestamp: string
        parameter: string
        value: unknown
        operator: string
      }>
      notes?: string[]
      images?: Array<{
        url: string
        type: string
        timestamp: string
      }>
      costs?: {
        labor: number
        materials: number
        energy: number
        other?: number
      }
    }>(),
    notes: text('notes'),
    status: statusEnum('status').default('active').notNull(),
    createdById: uuid('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    identifierIdx: index('processing_identifier_idx').on(table.identifier),
    harvestIdIdx: index('processing_harvest_id_idx').on(table.harvestId),
    batchIdIdx: index('processing_batch_id_idx').on(table.batchId),
    locationIdIdx: index('processing_location_id_idx').on(table.locationId),
    typeMethodIdx: index('processing_type_method_idx').on(table.type, table.method),
    processStatusIdx: index('processing_status_idx').on(table.processStatus),
    startedAtIdx: index('processing_started_at_idx').on(table.startedAt),
    statusIdx: index('processing_general_status_idx').on(table.status),
  })
)

// Relations
export const processingRelations = relations(processing, ({ one, many }) => ({
  harvest: one(harvests, {
    fields: [processing.harvestId],
    references: [harvests.id],
    relationName: 'harvestProcessing',
  }),
  batch: one(batches, {
    fields: [processing.batchId],
    references: [batches.id],
    relationName: 'batchProcessing',
  }),
  location: one(locations, {
    fields: [processing.locationId],
    references: [locations.id],
    relationName: 'locationProcessing',
  }),
  createdBy: one(users, {
    fields: [processing.createdById],
    references: [users.id],
    relationName: 'processingCreator',
  }),
  jobs: many(jobs, { relationName: 'processingJobs' }),
  notes: many(notes, { relationName: 'processingNotes' }),
}))

// Zod Schemas
export const insertProcessingSchema = createInsertSchema(processing).omit({
  createdAt: true,
  updatedAt: true,
  createdById: true,
})
export const selectProcessingSchema = createSelectSchema(processing)

// Types
export type Processing = typeof processing.$inferSelect
export type NewProcessing = typeof processing.$inferInsert
