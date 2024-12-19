import { relations, sql } from 'drizzle-orm'
import { index, timestamp, json, uuid, numeric } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../utils'
import {
  processingTypeEnum,
  processingMethodEnum,
  commonStatusEnum,
  qualityGradeEnum,
} from './enums'
import { users } from './core'
import { type Batch, batches } from './batches'
import { type Harvest, harvests } from './harvests'
import { type Location, locations } from './locations'
import { type Job, jobs } from './jobs'
import { type Note, notes } from './notes'
import { type Equipment, equipment } from './equipment'
import { type Sensor, sensors } from './sensors'
import { z } from 'zod'

// Schema for equipment settings in properties
const equipmentSettingsSchema = z.object({
  id: z.string(),
  settings: z.record(z.unknown()).optional(),
})

// Schema for environment data
const environmentSchema = z.object({
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  pressure: z.number().optional(),
  lightLevel: z.number().optional(),
  airflow: z.number().optional(),
})

// Schema for material tracking
const materialSchema = z.object({
  name: z.string(),
  amount: z.number(),
  unit: z.string(),
  batchId: z.string().optional(),
})

// Schema for process stages
const stageSchema = z.object({
  name: z.string(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  duration: z.number(),
  conditions: z.record(z.unknown()).optional(),
})

// Schema for lab results
export const processingLabResultsSchema = z.object({
  testId: z.string().optional(),
  results: z.record(z.unknown()).optional(),
  testedAt: z.string().optional(),
  testedBy: z.string().optional(),
  certificateUrl: z.string().optional(),
})

// Main processing properties schema
export const processingPropertiesSchema = z.object({
  equipment: z.array(equipmentSettingsSchema).optional(),
  environment: environmentSchema.optional(),
  materials: z.array(materialSchema).optional(),
  stages: z.array(stageSchema).optional(),
  sensors: z.array(z.string()).optional(), // Array of sensor IDs
  jobs: z.array(z.string()).optional(), // Array of job IDs
  notes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
})

export const processing = createTable(
  'processing',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    harvestId: uuid('harvest_id')
      .notNull()
      .references(() => harvests.id, { onDelete: 'cascade' }),
    batchId: uuid('batch_id')
      .notNull()
      .references(() => batches.id, { onDelete: 'cascade' }),
    locationId: uuid('location_id')
      .notNull()
      .references(() => locations.id),

    // Processing details
    type: processingTypeEnum('type').notNull(),
    method: processingMethodEnum('method').notNull(),
    status: commonStatusEnum('status').default('pending').notNull(),
    quality: qualityGradeEnum('quality'),

    // Weight tracking
    inputWeight: numeric('input_weight', { precision: 10, scale: 3 }).notNull(),
    outputWeight: numeric('output_weight', { precision: 10, scale: 3 }),
    yieldPercentage: numeric('yield_percentage', { precision: 5, scale: 2 }),

    // Timing
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    estimatedDuration: numeric('estimated_duration', {
      precision: 10,
      scale: 2,
    }),
    actualDuration: numeric('actual_duration', { precision: 10, scale: 2 }),

    // JSON fields for detailed data
    properties:
      json('properties').$type<z.infer<typeof processingPropertiesSchema>>(),
    labResults:
      json('lab_results').$type<z.infer<typeof processingLabResultsSchema>>(),

    // Metadata and tracking
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
    batchIdIdx: index('processing_batch_id_idx').on(table.batchId),
    harvestIdIdx: index('processing_harvest_id_idx').on(table.harvestId),
    locationIdIdx: index('processing_location_id_idx').on(table.locationId),
    typeMethodIdx: index('processing_type_method_idx').on(
      table.type,
      table.method
    ),
    statusIdx: index('processing_status_idx').on(table.status),
    qualityIdx: index('processing_quality_idx').on(table.quality),
    timingIdx: index('processing_timing_idx').on(
      table.startedAt,
      table.completedAt
    ),
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
    relationName: 'processingBatch',
  }),
  location: one(locations, {
    fields: [processing.locationId],
    references: [locations.id],
    relationName: 'processingLocation',
  }),
  createdBy: one(users, {
    fields: [processing.createdById],
    references: [users.id],
    relationName: 'processingCreator',
  }),
  notes: many(notes, {
    relationName: 'processingNotes',
  }),
  jobs: many(jobs, {
    relationName: 'processingJobs',
  }),
}))

// Zod Schemas
export const insertProcessingSchema = createInsertSchema(processing, {
  properties: (schema) => schema.properties.optional(),
  labResults: (schema) => schema.labResults.optional(),
  quality: (schema) => schema.quality.optional(),
  outputWeight: (schema) => schema.outputWeight.optional(),
  yieldPercentage: (schema) => schema.yieldPercentage.optional(),
  startedAt: (schema) => schema.startedAt.optional(),
  completedAt: (schema) => schema.completedAt.optional(),
  estimatedDuration: (schema) => schema.estimatedDuration.optional(),
  actualDuration: (schema) => schema.actualDuration.optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
})

export const selectProcessingSchema = createSelectSchema(processing)

// Types
export type Processing = typeof processing.$inferSelect
export type NewProcessing = typeof processing.$inferInsert
export type ProcessingWithRelations = Processing & {
  harvest: Harvest
  batch: Batch
  location: Location
  createdBy: { id: string; name: string; image: string }
  notes?: Note[]
  jobs?: Job[]
}
