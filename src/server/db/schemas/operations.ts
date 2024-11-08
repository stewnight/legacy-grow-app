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
import {
  sensorTypeEnum,
  taskStatusEnum,
  taskPriorityEnum,
  taskCategoryEnum,
} from './enums'
import { users } from './core'
import { locations } from './facility'

// ================== SENSORS & MONITORING ==================
export type Sensor = typeof sensors.$inferSelect
export type NewSensor = Omit<Sensor, 'id' | 'createdAt' | 'updatedAt'>
export type SensorReading = typeof sensorReadings.$inferSelect

export const sensors = createTable(
  'sensor',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    name: varchar('name', { length: 255 }).notNull(),
    type: sensorTypeEnum('type').notNull(),
    model: varchar('model', { length: 255 }),
    locationId: integer('location_id').references(() => locations.id),
    calibrationDate: date('calibration_date'),
    calibrationDue: date('calibration_due'),
    accuracy: decimal('accuracy'),
    range: json('range').$type<{ min: number; max: number; unit: string }>(),
    metadata: json('metadata').$type<{
      ipAddress?: string
      protocol?: string
      firmware?: string
      lastCalibration?: Date
    }>(),
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
    nameIdx: index('sensor_name_idx').on(table.name),
    typeIdx: index('sensor_type_idx').on(table.type),
    locationIdIdx: index('sensor_location_id_idx').on(table.locationId),
  })
)

export const sensorReadings = createTable(
  'sensor_reading',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    sensorId: integer('sensor_id').references(() => sensors.id),
    value: decimal('value').notNull(),
    unit: varchar('unit', { length: 50 }).notNull(),
    quality: varchar('quality', { length: 50 }),
    metadata: json('metadata'),
    timestamp: timestamp('timestamp', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    sensorIdIdx: index('sensor_reading_sensor_id_idx').on(table.sensorId),
    timestampIdx: index('sensor_reading_timestamp_idx').on(table.timestamp),
  })
)

// ================== TASKS & TEMPLATES ==================
export type TaskTemplate = typeof taskTemplates.$inferSelect
export type NewTaskTemplate = Omit<
  TaskTemplate,
  'id' | 'createdAt' | 'updatedAt'
>
export type Task = typeof tasks.$inferSelect
export type NewTask = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>

export const taskTemplates = createTable(
  'task_template',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    name: varchar('name', { length: 255 }).notNull(),
    category: taskCategoryEnum('category').notNull(),
    description: text('description'),
    instructions: json('instructions').$type<string[]>(),
    estimatedDuration: integer('estimated_duration'),
    requiredSkills: json('required_skills').$type<string[]>(),
    checklist: json('checklist').$type<{ item: string; required: boolean }[]>(),
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
    nameIdx: index('task_template_name_idx').on(table.name),
    categoryIdx: index('task_template_category_idx').on(table.category),
  })
)

export const tasks = createTable(
  'task',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    templateId: integer('template_id').references(() => taskTemplates.id),
    assignedToId: varchar('assigned_to', { length: 255 }).references(
      () => users.id
    ),
    status: taskStatusEnum('status').notNull(),
    priority: taskPriorityEnum('priority').notNull(),
    dueDate: timestamp('due_date', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    notes: text('notes'),
    metadata: json('metadata'),
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
    statusIdx: index('task_status_idx').on(table.status),
    priorityIdx: index('task_priority_idx').on(table.priority),
    assignedToIdx: index('task_assigned_to_idx').on(table.assignedToId),
    dueDateIdx: index('task_due_date_idx').on(table.dueDate),
  })
)

// ================== SUPPLIERS & INPUTS ==================
export type Supplier = typeof suppliers.$inferSelect
export type NewSupplier = Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>
export type Input = typeof inputs.$inferSelect
export type NewInput = Omit<Input, 'id' | 'createdAt' | 'updatedAt'>

export const suppliers = createTable(
  'supplier',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    contact: json('contact'),
    address: text('address'),
    license: varchar('license', { length: 255 }),
    status: varchar('status', { length: 50 }),
    rating: integer('rating'),
    notes: text('notes'),
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
    nameIdx: index('supplier_name_idx').on(table.name),
    typeIdx: index('supplier_type_idx').on(table.type),
    statusIdx: index('supplier_status_idx').on(table.status),
  })
)

export const inputs = createTable(
  'input',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    supplierId: integer('supplier_id').references(() => suppliers.id),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    manufacturer: varchar('manufacturer', { length: 255 }),
    composition: json('composition'),
    applicationMethods: json('application_methods'),
    safetyData: json('safety_data'),
    storage: json('storage'),
    certifications: json('certifications'),
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
    nameIdx: index('input_name_idx').on(table.name),
    typeIdx: index('input_type_idx').on(table.type),
    supplierIdIdx: index('input_supplier_id_idx').on(table.supplierId),
  })
)
