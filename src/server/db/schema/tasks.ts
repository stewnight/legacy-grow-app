import { relations, sql } from 'drizzle-orm'
import {
  index,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  date,
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
    // Entity reference fields
    entityId: uuid('entity_id').notNull(),
    entityType: varchar('entity_type', { length: 50 }).notNull(),
    // Task management fields
    assignedToId: uuid('assigned_to_id').references(() => users.id),
    category: taskCategoryEnum('category').notNull(),
    priority: taskPriorityEnum('priority').default('medium').notNull(),
    taskStatus: taskStatusEnum('task_status').default('pending').notNull(),
    dueDate: date('due_date'),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    properties: json('properties').$type<{
      recurring?: {
        frequency: 'daily' | 'weekly' | 'monthly'
        interval?: number
        endDate?: string
      }
      checklist?: Array<{
        item: string
        required: boolean
        completed: boolean
        completedAt?: string
        completedBy?: string
      }>
      instructions?: Array<{
        step: number
        description: string
        imageUrl?: string
        duration?: number
      }>
      requirements?: {
        tools?: string[]
        supplies?: string[]
        ppe?: string[]
        certifications?: string[]
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
    entityIdx: index('task_entity_idx').on(table.entityId, table.entityType),
    assignedToIdx: index('task_assigned_to_idx').on(table.assignedToId),
    categoryIdx: index('task_category_idx').on(table.category),
    priorityIdx: index('task_priority_idx').on(table.priority),
    taskStatusIdx: index('task_status_idx').on(table.taskStatus),
    dueDateIdx: index('task_due_date_idx').on(table.dueDate),
    createdByIdx: index('task_created_by_idx').on(table.createdById),
    statusIdx: index('task_general_status_idx').on(table.status),
  })
)

// Relationships
const tasksRelations = relations(tasks, ({ one, many }) => ({
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
    relationName: 'assignedTasks',
  }),
  notes: many(notes, { relationName: 'taskNotes' }),
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
    relationName: 'taskCreator',
  }),
}))

// Zod Schemas
export const insertTaskSchema = createInsertSchema(tasks)
export const selectTaskSchema = createSelectSchema(tasks)

// Types
export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
