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
} from './enums'
import { users } from './core'
import { notes } from './notes'

export const tasks = createTable(
  'task',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    entityId: uuid('entity_id').notNull(),
    entityType: varchar('entity_type', { length: 255 }).notNull(),
    assignedToId: uuid('assigned_to_id').references(() => users.id),
    category: taskCategoryEnum('category').notNull(),
    priority: taskPriorityEnum('priority').notNull(),
    taskStatus: taskStatusEnum('task_status').notNull(),
    status: statusEnum('status').default('active').notNull(),
    dueDate: timestamp('due_date', { withTimezone: true }),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    properties: json('properties').$type<{
      recurring?: {
        frequency: string
        interval?: number
        endDate?: string
      }
      checklist?: Array<{
        item: string
        completed: boolean
        completedAt?: string | null
      }>
      instructions?: string[]
      requirements?: {
        tools?: string[]
        supplies?: string[]
        ppe?: string[]
      }
    }>(),
    metadata: json('metadata').$type<{
      previousTasks?: string[]
      nextTasks?: string[]
      estimatedDuration?: number
      actualDuration?: number
      location?: {
        id: string
        type: string
        name: string
      }
      customFields?: Record<string, unknown>
    }>(),
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
}))

// Zod Schemas
export const insertTaskSchema = createInsertSchema(tasks)
export const selectTaskSchema = createSelectSchema(tasks)

// Types
export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
