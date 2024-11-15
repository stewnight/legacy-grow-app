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
import {
  sensorTypeEnum,
  taskStatusEnum,
  taskPriorityEnum,
  taskCategoryEnum,
} from './enums'
import { users } from './core'
import { locations } from './locations'

// ================== SENSORS & MONITORING ==================
export const sensors = createTable(
  'sensor',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    type: sensorTypeEnum('type').notNull(),
    model: varchar('model', { length: 255 }),
    locationId: uuid('location_id').references(() => locations.id, {
      onDelete: 'set null',
    }),
    calibrationDate: date('calibration_date'),
    calibrationDue: date('calibration_due'),
    accuracy: decimal('accuracy', { precision: 10, scale: 4 }),
    range: json('range').$type<{
      min: number
      max: number
      unit: string
    }>(),
    metadata: json('metadata').$type<{
      ipAddress?: string
      protocol?: string
      firmware?: string
      lastCalibration?: string
      manufacturer?: string
      serialNumber?: string
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
    nameIdx: index('sensor_name_idx').on(table.name),
    typeIdx: index('sensor_type_idx').on(table.type),
    locationIdIdx: index('sensor_location_id_idx').on(table.locationId),
    statusIdx: index('sensor_status_idx').on(table.status),
  })
)

export const sensorReadings = createTable(
  'sensor_reading',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sensorId: uuid('sensor_id')
      .notNull()
      .references(() => sensors.id, { onDelete: 'cascade' }),
    value: decimal('value', { precision: 10, scale: 4 }).notNull(),
    unit: varchar('unit', { length: 50 }).notNull(),
    quality: decimal('quality', { precision: 5, scale: 2 }),
    metadata: json('metadata').$type<{
      raw?: number
      calibrated?: boolean
      errors?: string[]
    }>(),
    timestamp: timestamp('timestamp', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    sensorIdIdx: index('sensor_reading_sensor_id_idx').on(table.sensorId),
    timestampIdx: index('sensor_reading_timestamp_idx').on(table.timestamp),
    valueIdx: index('sensor_reading_value_idx').on(table.value),
  })
)

// ================== TASKS & TEMPLATES ==================
export const taskTemplates = createTable(
  'task_template',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    category: taskCategoryEnum('category').notNull(),
    description: text('description'),
    instructions: json('instructions').$type<string[]>(),
    estimatedDuration: integer('estimated_duration'),
    requiredSkills: json('required_skills').$type<string[]>(),
    checklist: json('checklist').$type<
      Array<{
        item: string
        required: boolean
        order: number
      }>
    >(),
    metadata: json('metadata').$type<{
      tools?: string[]
      safety?: string[]
      references?: string[]
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
    nameIdx: index('task_template_name_idx').on(table.name),
    categoryIdx: index('task_template_category_idx').on(table.category),
  })
)

export const tasks = createTable(
  'task',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    templateId: uuid('template_id').references(() => taskTemplates.id),
    assignedToId: uuid('assigned_to').references(() => users.id),
    status: taskStatusEnum('status').notNull().default('pending'),
    priority: taskPriorityEnum('priority').notNull().default('medium'),
    dueDate: timestamp('due_date', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    notes: text('notes'),
    checklist: json('checklist').$type<
      Array<{
        item: string
        completed: boolean
        completedAt?: string
        completedBy?: string
      }>
    >(),
    metadata: json('metadata').$type<{
      location?: string
      equipment?: string[]
      attachments?: string[]
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
    statusIdx: index('task_status_idx').on(table.status),
    priorityIdx: index('task_priority_idx').on(table.priority),
    assignedToIdx: index('task_assigned_to_idx').on(table.assignedToId),
    dueDateIdx: index('task_due_date_idx').on(table.dueDate),
    templateIdIdx: index('task_template_id_idx').on(table.templateId),
  })
)

// Zod Schemas
export const insertSensorSchema = createInsertSchema(sensors)
export const selectSensorSchema = createSelectSchema(sensors)
export const insertSensorReadingSchema = createInsertSchema(sensorReadings)
export const selectSensorReadingSchema = createSelectSchema(sensorReadings)
export const insertTaskTemplateSchema = createInsertSchema(taskTemplates)
export const selectTaskTemplateSchema = createSelectSchema(taskTemplates)
export const insertTaskSchema = createInsertSchema(tasks)
export const selectTaskSchema = createSelectSchema(tasks)

// Types
export type Sensor = typeof sensors.$inferSelect
export type NewSensor = typeof sensors.$inferInsert
export type SensorReading = typeof sensorReadings.$inferSelect
export type NewSensorReading = typeof sensorReadings.$inferInsert
export type TaskTemplate = typeof taskTemplates.$inferSelect
export type NewTaskTemplate = typeof taskTemplates.$inferInsert
export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
