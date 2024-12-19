import { relations, sql } from 'drizzle-orm'
import { index, timestamp, json, uuid, numeric } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../utils'
import { commonStatusEnum, qualityGradeEnum } from './enums'
import { users } from './core'
import { type Batch, batches } from './batches'
import { type Location, locations } from './locations'
import { type Job, jobs } from './jobs'
import { type Note, notes } from './notes'
import { type Processing, processing } from './processing'
import { z } from 'zod'

// Schema for lab results
export const labResultsSchema = z.object({
  testId: z.string().optional(),
  results: z.record(z.unknown()).optional(),
  testedAt: z.string().optional(),
  testedBy: z.string().optional(),
  certificateUrl: z.string().optional(),
})

// Schema for harvest properties
export const harvestPropertiesSchema = z.object({
  method: z.string().optional(),
  conditions: z.record(z.unknown()).optional(),
  notes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  environment: z
    .object({
      temperature: z.number().optional(),
      humidity: z.number().optional(),
      light: z.number().optional(),
      co2: z.number().optional(),
    })
    .optional(),
  equipment: z
    .array(
      z.object({
        id: z.string(),
        settings: z.record(z.unknown()).optional(),
      })
    )
    .optional(),
})

export const harvests = createTable(
  'harvest',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    batchId: uuid('batch_id')
      .notNull()
      .references(() => batches.id, { onDelete: 'cascade' }),
    locationId: uuid('location_id')
      .notNull()
      .references(() => locations.id),

    // Status and quality
    status: commonStatusEnum('status').default('pending').notNull(),
    quality: qualityGradeEnum('quality'),

    // Weight tracking
    wetWeight: numeric('wet_weight', { precision: 10, scale: 3 }).notNull(),
    dryWeight: numeric('dry_weight', { precision: 10, scale: 3 }),
    wasteWeight: numeric('waste_weight', { precision: 10, scale: 3 }),
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
      json('properties').$type<z.infer<typeof harvestPropertiesSchema>>(),
    labResults: json('lab_results').$type<z.infer<typeof labResultsSchema>>(),

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
    batchIdIdx: index('harvest_batch_id_idx').on(table.batchId),
    locationIdIdx: index('harvest_location_id_idx').on(table.locationId),
    statusIdx: index('harvest_status_idx').on(table.status),
    qualityIdx: index('harvest_quality_idx').on(table.quality),
    timingIdx: index('harvest_timing_idx').on(
      table.startedAt,
      table.completedAt
    ),
  })
)

// Relations
export const harvestsRelations = relations(harvests, ({ one, many }) => ({
  batch: one(batches, {
    fields: [harvests.batchId],
    references: [batches.id],
    relationName: 'harvestBatch',
  }),
  location: one(locations, {
    fields: [harvests.locationId],
    references: [locations.id],
    relationName: 'harvestLocation',
  }),
  createdBy: one(users, {
    fields: [harvests.createdById],
    references: [users.id],
    relationName: 'harvestCreator',
  }),
  notes: many(notes, {
    relationName: 'harvestNotes',
  }),
  jobs: many(jobs, {
    relationName: 'harvestJobs',
  }),
  processing: many(processing, {
    relationName: 'harvestProcessing',
  }),
}))

// Zod Schemas
export const insertHarvestSchema = createInsertSchema(harvests, {
  properties: (schema) => schema.properties.optional(),
  labResults: (schema) => schema.labResults.optional(),
  quality: (schema) => schema.quality.optional(),
  dryWeight: (schema) => schema.dryWeight.optional(),
  wasteWeight: (schema) => schema.wasteWeight.optional(),
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

export const selectHarvestSchema = createSelectSchema(harvests)

// Types
export type Harvest = typeof harvests.$inferSelect
export type NewHarvest = typeof harvests.$inferInsert
export type HarvestWithRelations = Harvest & {
  batch: Batch
  location: Location
  createdBy: { id: string; name: string; image: string }
  notes?: Note[]
  jobs?: Job[]
  processing?: Processing[]
}
