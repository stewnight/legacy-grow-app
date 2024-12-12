import { relations, sql } from 'drizzle-orm'
import {
  index,
  varchar,
  timestamp,
  json,
  uuid,
  text,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../utils'
import {
  jobStatusEnum,
  jobPriorityEnum,
  jobCategoryEnum,
  statusEnum,
  jobEntityTypeEnum,
  JobEntityType,
} from './enums'
import { users } from './core'
import { type Note, notes } from './notes'
import { type Location, locations } from './locations'
import { type Plant, plants } from './plants'
import { type Batch, batches } from './batches'
import { type Genetic, genetics } from './genetics'
import { type Sensor, sensors } from './sensors'
import { type Processing, processing } from './processing'
import { type Harvest, harvests } from './harvests'
import { z } from 'zod'
import { type Equipment, equipment } from './equipment'

const taskSchema = z.object({
  item: z.string(),
  completed: z.boolean().default(false),
  completedAt: z.string().nullable().optional(),
  estimatedMinutes: z.number().nullable().optional(),
  actualMinutes: z.number().nullable().optional(),
  startedAt: z.string().nullable().optional(),
})

const recurringSchema = z
  .object({
    frequency: z.string(),
    interval: z.number(),
    endDate: z.string().optional(),
  })
  .nullable()

const requirementsSchema = z
  .object({
    tools: z.array(z.string()).default([]),
    supplies: z.array(z.string()).default([]),
    ppe: z.array(z.string()).default([]),
  })
  .default({
    tools: [],
    supplies: [],
    ppe: [],
  })

export const jobPropertiesSchema = z
  .object({
    recurring: recurringSchema.optional().default(null),
    tasks: z.array(taskSchema).default([]),
    instructions: z.array(z.string()).default([]),
    requirements: requirementsSchema,
  })
  .default({
    recurring: null,
    tasks: [],
    instructions: [],
    requirements: { tools: [], supplies: [], ppe: [] },
  })

export const jobs = createTable(
  'job',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    entityId: uuid('entity_id'),
    entityType: jobEntityTypeEnum('entity_type').notNull(),
    assignedToId: uuid('assigned_to_id').references(() => users.id),
    category: jobCategoryEnum('category').notNull(),
    priority: jobPriorityEnum('priority').notNull(),
    jobStatus: jobStatusEnum('job_status').notNull(),
    status: statusEnum('status').default('active').notNull(),
    dueDate: timestamp('due_date', { withTimezone: true }),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    properties: json('properties')
      .$type<z.infer<typeof jobPropertiesSchema>>()
      .default({
        recurring: null,
        tasks: [],
        instructions: [],
        requirements: { tools: [], supplies: [], ppe: [] },
      }),
    metadata: json('metadata')
      .$type<{
        previousJobs: string[]
        nextJobs: string[]
        estimatedDuration: number | null
        actualDuration: number | null
        location: {
          id: string
          type: string
          name: string
        } | null
      }>()
      .default({
        previousJobs: [],
        nextJobs: [],
        estimatedDuration: null,
        actualDuration: null,
        location: null,
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
    titleIdx: index('job_title_idx').on(table.title),
    categoryIdx: index('job_category_idx').on(table.category),
    priorityIdx: index('job_priority_idx').on(table.priority),
    statusIdx: index('job_status_idx').on(table.status),
    assignedToIdx: index('job_assigned_to_idx').on(table.assignedToId),
    entityIdx: index('job_entity_idx').on(table.entityId, table.entityType),
    dueDateIdx: index('job_due_date_idx').on(table.dueDate),
  })
)

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  assignedTo: one(users, {
    fields: [jobs.assignedToId],
    references: [users.id],
    relationName: 'jobAssignee',
  }),
  createdBy: one(users, {
    fields: [jobs.createdById],
    references: [users.id],
    relationName: 'jobCreator',
  }),
  notes: many(notes, {
    relationName: 'jobNotes',
  }),
  equipment: one(equipment, {
    fields: [jobs.entityId],
    references: [equipment.id],
    relationName: 'equipmentJobs',
  }),
  location: one(locations, {
    fields: [jobs.entityId],
    references: [locations.id],
    relationName: 'locationJobs',
  }),
  plant: one(plants, {
    fields: [jobs.entityId],
    references: [plants.id],
    relationName: 'plantJobs',
  }),
  batch: one(batches, {
    fields: [jobs.entityId],
    references: [batches.id],
    relationName: 'batchJobs',
  }),
  genetic: one(genetics, {
    fields: [jobs.entityId],
    references: [genetics.id],
    relationName: 'geneticJobs',
  }),
  sensor: one(sensors, {
    fields: [jobs.entityId],
    references: [sensors.id],
    relationName: 'sensorJobs',
  }),
  processing: one(processing, {
    fields: [jobs.entityId],
    references: [processing.id],
    relationName: 'processingJobs',
  }),
  harvest: one(harvests, {
    fields: [jobs.entityId],
    references: [harvests.id],
    relationName: 'harvestJobs',
  }),
}))

// Zod Schemas
export const insertJobSchema = createInsertSchema(jobs, {
  properties: (schema) => schema.properties.optional(),
  metadata: (schema) => schema.metadata.optional(),
  description: (schema) => schema.description.optional(),
  entityId: (schema) => schema.entityId.optional(),
  entityType: (schema) => schema.entityType.default('none'),
  assignedToId: (schema) => schema.assignedToId.optional(),
  category: (schema) => schema.category.default('maintenance'),
  priority: (schema) => schema.priority.default('low'),
  jobStatus: (schema) => schema.jobStatus.default('pending'),
  status: (schema) => schema.status.default('active'),
  dueDate: (schema) => schema.dueDate.optional(),
  startedAt: (schema) => schema.startedAt.optional(),
  completedAt: (schema) => schema.completedAt.optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
})

export const selectJobSchema = createSelectSchema(jobs)

// ================== TYPES ==================
export type Job = typeof jobs.$inferSelect
export type NewJob = typeof jobs.$inferInsert

export type JobWithRelations = Job & {
  assignedTo?: { id: string; name: string; image: string } | null
  createdBy: { id: string; name: string }
  equipment?: Equipment[] | null
  notes?: Note[] | null
  location?: Location | undefined
  plant?: Plant | undefined
  batch?: Batch | undefined
  genetic?: Genetic | undefined
  sensor?: Sensor | undefined
  processing?: Processing | undefined
  harvest?: Harvest | undefined
}

export { taskSchema }
