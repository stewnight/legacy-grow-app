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
  taskStatusEnum,
  taskPriorityEnum,
  taskCategoryEnum,
  statusEnum,
  taskEntityTypeEnum,
} from './enums'
import { users } from './core'
import { Note, notes } from './notes'
import { Location, locations } from './locations'
import { Plant, plants } from './plants'
import { Batch, batches } from './batches'
import { Genetic, genetics } from './genetics'
import { Sensor, sensors } from './sensors'
import { Processing, processing } from './processing'
import { Harvest, harvests } from './harvests'

export const tasks = createTable(
  'task',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    entityId: uuid('entity_id'),
    entityType: taskEntityTypeEnum('entity_type').notNull(),
    assignedToId: uuid('assigned_to_id').references(() => users.id),
    category: taskCategoryEnum('category').notNull(),
    priority: taskPriorityEnum('priority').notNull(),
    taskStatus: taskStatusEnum('task_status').notNull(),
    status: statusEnum('status').default('active').notNull(),
    dueDate: timestamp('due_date', { withTimezone: true }),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    properties: json('properties')
      .$type<{
        recurring: {
          frequency: string
          interval: number
          endDate?: string
        } | null
        checklist: Array<{
          item: string
          completed: boolean
          completedAt?: string | null
        }>
        instructions: string[]
        requirements: {
          tools: string[]
          supplies: string[]
          ppe: string[]
        }
      }>()
      .default({}),
    metadata: json('metadata')
      .$type<{
        previousTasks: string[]
        nextTasks: string[]
        estimatedDuration: number | null
        actualDuration: number | null
        location: {
          id: string
          type: string
          name: string
        } | null
      }>()
      .default({}),
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
    titleIdx: index('task_title_idx').on(table.title),
    categoryIdx: index('task_category_idx').on(table.category),
    priorityIdx: index('task_priority_idx').on(table.priority),
    statusIdx: index('task_status_idx').on(table.status),
    assignedToIdx: index('task_assigned_to_idx').on(table.assignedToId),
    entityIdx: index('task_entity_idx').on(table.entityId, table.entityType),
    dueDateIdx: index('task_due_date_idx').on(table.dueDate),
  })
)

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
    relationName: 'taskAssignee',
  }),
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
    relationName: 'taskCreator',
  }),
  notes: many(notes, { relationName: 'taskNotes' }),
  location: one(locations, {
    fields: [tasks.entityId],
    references: [locations.id],
    relationName: 'locationTasks',
  }),
  plant: one(plants, {
    fields: [tasks.entityId],
    references: [plants.id],
    relationName: 'plantTasks',
  }),
  batch: one(batches, {
    fields: [tasks.entityId],
    references: [batches.id],
    relationName: 'batchTasks',
  }),
  genetic: one(genetics, {
    fields: [tasks.entityId],
    references: [genetics.id],
    relationName: 'geneticTasks',
  }),
  sensor: one(sensors, {
    fields: [tasks.entityId],
    references: [sensors.id],
    relationName: 'sensorTasks',
  }),
  processing: one(processing, {
    fields: [tasks.entityId],
    references: [processing.id],
    relationName: 'processingTasks',
  }),
  harvest: one(harvests, {
    fields: [tasks.entityId],
    references: [harvests.id],
    relationName: 'harvestTasks',
  }),
}))

// Zod Schemas
export const insertTaskSchema = createInsertSchema(tasks, {
  properties: (schema) => schema.properties.optional(),
  metadata: (schema) => schema.metadata.optional(),
  entityId: (schema) =>
    schema.entityId
      .nullable()
      .optional()
      .refine(
        (val, ctx) => {
          const entityType =
            ctx.path[0] === 'entityType'
              ? ctx.path[1]
              : (ctx as any).parent?.entityType
          return entityType === 'none' ? true : typeof val === 'string'
        },
        { message: 'Entity ID is required unless entity type is none' }
      ),
}).omit({
  createdAt: true,
  updatedAt: true,
  createdById: true,
})

export const selectTaskSchema = createSelectSchema(tasks)

// Types
export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert

export type TaskWithRelations = Task & {
  assignedTo?: { id: string; name: string } | null
  createdBy: { id: string; name: string }
  notes?: Note[]
  location?: Location
  plant?: Plant
  batch?: Batch
  genetic?: Genetic
  sensor?: Sensor
  processing?: Processing
  harvest?: Harvest
}
