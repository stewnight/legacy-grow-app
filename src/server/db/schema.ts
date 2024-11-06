import { relations, sql } from 'drizzle-orm'
import {
  index,
  integer,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  json,
  date,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { type AdapterAccount } from 'next-auth/adapters'

export const createTable = pgTableCreator((name) => `legacy-grow-app_${name}`)

// Define enums first
export const logLevelEnum = pgEnum('log_level', [
  'debug',
  'info',
  'warn',
  'error',
])
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'manager'])
export const batchStatusEnum = pgEnum('batch_status', [
  'active',
  'completed',
  'cancelled',
])
export const plantSourceEnum = pgEnum('plant_source', [
  'seed',
  'clone',
  'mother',
])
export const plantStageEnum = pgEnum('plant_stage', [
  'seedling',
  'vegetative',
  'flowering',
  'harvested',
])
export const plantSexEnum = pgEnum('plant_sex', [
  'unknown',
  'male',
  'female',
  'hermaphrodite',
])
export const healthStatusEnum = pgEnum('health_status', [
  'healthy',
  'sick',
  'pest',
  'nutrient',
  'dead',
])
export const taskStatusEnum = pgEnum('task_status', [
  'pending',
  'in_progress',
  'completed',
  'cancelled',
])
export const taskPriorityEnum = pgEnum('task_priority', [
  'low',
  'medium',
  'high',
  'urgent',
])
export const geneticTypeEnum = pgEnum('genetic_type', [
  'sativa',
  'indica',
  'hybrid',
])
export const locationTypeEnum = pgEnum('location_type', [
  'room',
  'section',
  'bench',
  'shelf',
])
export const sensorTypeEnum = pgEnum('sensor_type', [
  'temperature',
  'humidity',
  'co2',
  'light',
  'ph',
  'ec',
])
export const harvestQualityEnum = pgEnum('harvest_quality', [
  'A',
  'B',
  'C',
  'D',
])
export const systemLogSourceEnum = pgEnum('system_log_source', [
  'plants',
  'harvests',
  'tasks',
  'system',
  'auth',
  'sensors',
])
export const taskCategoryEnum = pgEnum('task_category', [
  'maintenance',
  'feeding',
  'environmental',
  'harvest',
])

// ================== CORE SYSTEM ==================

export type SystemLog = typeof systemLogs.$inferSelect

/**
 * System logging schema for tracking application events
 * Level options: debug, info, warn, error
 * Source: tracks the origin of the log (e.g., 'plants', 'harvests', 'system')
 */
export const systemLogs = createTable(
  'system_log',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    level: logLevelEnum('level').notNull(),
    source: systemLogSourceEnum('source').notNull(),
    message: text('message').notNull(),
    metadata: json('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (systemLog) => ({
    levelIdx: index('system_log_level_idx').on(systemLog.level),
    sourceIdx: index('system_log_source_idx').on(systemLog.source),
    createdAtIdx: index('system_log_created_at_idx').on(systemLog.createdAt),
  })
)

// ================== USERS & AUTH ==================
export type User = typeof users.$inferSelect
export type Account = typeof accounts.$inferSelect
export type Session = typeof sessions.$inferSelect
export type VerificationToken = typeof verificationTokens.$inferSelect

/**
 * Core user schema with authentication and authorization
 * Role options: user, admin, manager
 * Permissions: JSON array of string permissions
 * Preferences: User specific settings as JSON
 */
export const users = createTable('user', {
  id: varchar('id', { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull(),
  emailVerified: timestamp('email_verified', {
    mode: 'date',
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar('image', { length: 255 }),
  role: userRoleEnum('role').notNull().default('user'),
  active: boolean('active').default(true),
  permissions: json('permissions').$type<string[]>(),
  preferences: json('preferences').$type<{
    theme?: 'light' | 'dark'
    notifications?: boolean
    units?: 'metric' | 'imperial'
  }>(),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  plants: many(plants),
  assignedTasks: many(tasks, { relationName: 'assignedTasks' }), // Add relationName
  createdTasks: many(tasks, { relationName: 'createdTasks' }), // Add relationName
  createdGenetics: many(genetics),
  createdAreas: many(areas),
  createdLocations: many(locations),
  createdSensors: many(sensors),
  createdHarvests: many(harvests),
  createdProcessing: many(processing),
}))

export const accounts = createTable(
  'account',
  {
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar('type', { length: 255 })
      .$type<AdapterAccount['type']>()
      .notNull(),
    provider: varchar('provider', { length: 255 }).notNull(),
    providerAccountId: varchar('provider_account_id', {
      length: 255,
    }).notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: varchar('token_type', { length: 255 }),
    scope: varchar('scope', { length: 255 }),
    id_token: text('id_token'),
    session_state: varchar('session_state', { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index('account_user_id_idx').on(account.userId),
  })
)

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessions = createTable(
  'session',
  {
    sessionToken: varchar('session_token', { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp('expires', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index('session_user_id_idx').on(session.userId),
  })
)

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const verificationTokens = createTable(
  'verification_token',
  {
    identifier: varchar('identifier', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expires: timestamp('expires', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
)

// ================== PLANTS & GENETICS ==================
export type Batch = typeof batches.$inferSelect
export type Genetic = typeof genetics.$inferSelect
export type Plant = typeof plants.$inferSelect

/**
 * Plant batches for grouping plants together
 * Status options: active, completed, cancelled
 * Plant count: Number of plants in the batch
 */
export const batches = createTable('batches', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  strain: varchar('strain', { length: 255 }).notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).defaultNow(),
  endDate: timestamp('end_date', { withTimezone: true }),
  status: batchStatusEnum('status').notNull().default('active'),
  plantCount: integer('plant_count').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  userId: varchar('user_id', { length: 255 }).notNull(),
})

/**
 * Plant genetics/strains schema
 * Type options: sativa, indica, hybrid
 * Flowering time: in days
 * THC/CBD potential: percentage values 0-100
 */
export const genetics = createTable(
  'genetic',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    name: varchar('name', { length: 255 }).notNull(),
    type: geneticTypeEnum('type').notNull(),
    breeder: varchar('breeder', { length: 255 }),
    description: text('description'),
    floweringTime: integer('flowering_time'),
    thcPotential: decimal('thc_potential'),
    cbdPotential: decimal('cbd_potential'),
    terpeneProfie: json('terpene_profile').$type<Record<string, number>>(), // Fix typo
    growthCharacteristics: json('growth_characteristics').$type<{
      height?: number
      spread?: number
      internodeSpacing?: number
      leafPattern?: string
    }>(),
    lineage: json('lineage').$type<{
      mother?: string
      father?: string
      generation?: number
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
  (genetic) => ({
    nameIdx: index('genetic_name_idx').on(genetic.name),
    typeIdx: index('genetic_type_idx').on(genetic.type),
    createdByIdx: index('genetic_created_by_idx').on(genetic.createdById),
  })
)

/**
 * Individual plants
 * Source options: seed, clone, mother
 * Stage options: seedling, vegetative, flowering, harvested
 * Sex options: unknown, male, female, hermaphrodite
 */
export const plants = createTable(
  'plant',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    geneticId: integer('genetic_id').references(() => genetics.id),
    batchId: integer('batch_id').references(() => batches.id),
    source: plantSourceEnum('source').notNull(),
    stage: plantStageEnum('stage').notNull(),
    plantDate: date('plant_date'),
    harvestDate: date('harvest_date'),
    motherId: integer('mother_id'),
    generation: integer('generation'),
    sex: plantSexEnum('sex'),
    phenotype: varchar('phenotype', { length: 255 }),
    healthStatus: healthStatusEnum('health_status')
      .notNull()
      .default('healthy'),
    quarantine: boolean('quarantine').default(false),
    destroyReason: varchar('destroy_reason', { length: 255 }),
    locationId: integer('location_id').references(() => locations.id),
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
  (plant) => ({
    batchIdIdx: index('plant_batch_id_idx').on(plant.batchId),
    stageIdx: index('plant_stage_idx').on(plant.stage),
    createdByIdx: index('plant_created_by_idx').on(plant.createdById),
    geneticIdIdx: index('plant_genetic_id_idx').on(plant.geneticId),
    locationIdIdx: index('plant_location_id_idx').on(plant.locationId),
  })
)

// ================== LOCATIONS & AREAS ==================
export type Facility = typeof facilities.$inferSelect
export type Area = typeof areas.$inferSelect
export type Location = typeof locations.$inferSelect

export const facilities = createTable(
  'facility',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    address: text('address'),
    license: varchar('license', { length: 255 }),
    capacity: json('capacity'),
    properties: json('properties'),
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
  (facility) => ({
    nameIdx: index('facility_name_idx').on(facility.name),
    typeIdx: index('facility_type_idx').on(facility.type),
    createdByIdx: index('facility_created_by_idx').on(facility.createdById),
  })
)

export const areas = createTable(
  'area',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    facilityId: integer('facility_id').references(() => facilities.id),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    parentId: integer('parent_id'),
    dimensions: json('dimensions'),
    capacity: json('capacity'),
    environment: json('environment'),
    status: varchar('status', { length: 50 }),
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
  (area) => ({
    nameIdx: index('area_name_idx').on(area.name),
    typeIdx: index('area_type_idx').on(area.type),
    facilityIdIdx: index('area_facility_id_idx').on(area.facilityId),
  })
)

/**
 * Location tracking schema
 * Type options: room, section, bench, shelf
 * Coordinates: JSON object with position data
 * Properties: Environmental conditions and requirements
 */
export const locations = createTable(
  'location',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    areaId: integer('area_id').references(() => areas.id),
    name: varchar('name', { length: 255 }).notNull(),
    type: locationTypeEnum('type').notNull(),
    coordinates: json('coordinates').$type<{
      x: number
      y: number
      z?: number
      level?: number
    }>(),
    properties: json('properties').$type<{
      temperature?: { min: number; max: number }
      humidity?: { min: number; max: number }
      light?: { type: string; intensity: number }
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
  (location) => ({
    nameIdx: index('location_name_idx').on(location.name),
    typeIdx: index('location_type_idx').on(location.type),
    areaIdIdx: index('location_area_id_idx').on(location.areaId),
  })
)

// ================== SENSORS & MONITORING ==================
export type Sensor = typeof sensors.$inferSelect
export type SensorReading = typeof sensorReadings.$inferSelect

/**
 * Sensor data collection schema
 * Type options: temperature, humidity, co2, light, ph, ec
 * Range: Min/max values the sensor can measure
 * Metadata: Additional sensor specific data
 */
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
  (sensor) => ({
    nameIdx: index('sensor_name_idx').on(sensor.name),
    typeIdx: index('sensor_type_idx').on(sensor.type),
    locationIdIdx: index('sensor_location_id_idx').on(sensor.locationId),
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
  (reading) => ({
    sensorIdIdx: index('sensor_reading_sensor_id_idx').on(reading.sensorId),
    timestampIdx: index('sensor_reading_timestamp_idx').on(reading.timestamp),
  })
)

// ================== TASKS & MAINTENANCE ==================
export type TaskTemplate = typeof taskTemplates.$inferSelect
export type Task = typeof tasks.$inferSelect

/**
 * Task templates for common cultivation tasks
 * Category options: maintenance, feeding, environmental, harvest
 * Instructions: Step by step process
 * Required skills: Array of required capabilities
 */
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
  (template) => ({
    nameIdx: index('task_template_name_idx').on(template.name),
    categoryIdx: index('task_template_category_idx').on(template.category),
  })
)

/**
 * Tasks for plant maintenance and workflow
 * Status options: pending, in_progress, completed, cancelled
 * Priority options: low, medium, high, urgent
 */
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
  (task) => ({
    statusIdx: index('task_status_idx').on(task.status),
    priorityIdx: index('task_priority_idx').on(task.priority),
    assignedToIdx: index('task_assigned_to_idx').on(task.assignedToId),
    dueDateIdx: index('task_due_date_idx').on(task.dueDate),
  })
)

// ================== INPUTS & SUPPLIES ==================
export type Supplier = typeof suppliers.$inferSelect
export type Input = typeof inputs.$inferSelect

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
  (supplier) => ({
    nameIdx: index('supplier_name_idx').on(supplier.name),
    typeIdx: index('supplier_type_idx').on(supplier.type),
    statusIdx: index('supplier_status_idx').on(supplier.status),
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
  (input) => ({
    nameIdx: index('input_name_idx').on(input.name),
    typeIdx: index('input_type_idx').on(input.type),
    supplierIdIdx: index('input_supplier_id_idx').on(input.supplierId),
  })
)

// ================== HARVESTS & PROCESSING ==================
export type Harvest = typeof harvests.$inferSelect
export type Processing = typeof processing.$inferSelect

/**
 * Harvests tracking
 * Quality options: A, B, C, D
 */
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
  (harvest) => ({
    batchIdIdx: index('harvest_batch_id_idx').on(harvest.batchId),
    dateIdx: index('harvest_date_idx').on(harvest.date),
    plantIdIdx: index('harvest_plant_id_idx').on(harvest.plantId),
  })
)

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
  (processing) => ({
    harvestIdIdx: index('processing_harvest_id_idx').on(processing.harvestId),
    typeIdx: index('processing_type_idx').on(processing.type),
    startDateIdx: index('processing_start_date_idx').on(processing.startDate),
  })
)

// ================== COMPLIANCE & TRACKING ==================
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
  (log) => ({
    typeIdx: index('compliance_log_type_idx').on(log.type),
    categoryIdx: index('compliance_log_category_idx').on(log.category),
    statusIdx: index('compliance_log_status_idx').on(log.status),
  })
)

// ================== RELATIONS ==================
export const plantsRelations = relations(plants, ({ one }) => ({
  genetic: one(genetics, {
    fields: [plants.geneticId],
    references: [genetics.id],
  }),
  location: one(locations, {
    fields: [plants.locationId],
    references: [locations.id],
  }),
  createdBy: one(users, {
    fields: [plants.createdById],
    references: [users.id],
  }),
  batch: one(batches, {
    fields: [plants.batchId],
    references: [batches.id],
  }),
}))

export const areasRelations = relations(areas, ({ one, many }) => ({
  facility: one(facilities, {
    fields: [areas.facilityId],
    references: [facilities.id],
  }),
  parent: one(areas, {
    fields: [areas.parentId],
    references: [areas.id],
  }),
  locations: many(locations),
  createdBy: one(users, {
    fields: [areas.createdById],
    references: [users.id],
  }),
}))

export const locationsRelations = relations(locations, ({ one, many }) => ({
  area: one(areas, {
    fields: [locations.areaId],
    references: [areas.id],
  }),
  plants: many(plants),
  sensors: many(sensors),
  createdBy: one(users, {
    fields: [locations.createdById],
    references: [users.id],
  }),
}))

export const sensorsRelations = relations(sensors, ({ one, many }) => ({
  location: one(locations, {
    fields: [sensors.locationId],
    references: [locations.id],
  }),
  readings: many(sensorReadings),
  createdBy: one(users, {
    fields: [sensors.createdById],
    references: [users.id],
  }),
}))

export const sensorReadingsRelations = relations(sensorReadings, ({ one }) => ({
  sensor: one(sensors, {
    fields: [sensorReadings.sensorId],
    references: [sensors.id],
  }),
}))

export const taskTemplatesRelations = relations(
  taskTemplates,
  ({ one, many }) => ({
    tasks: many(tasks),
    createdBy: one(users, {
      fields: [taskTemplates.createdById],
      references: [users.id],
    }),
  })
)

export const tasksRelations = relations(tasks, ({ one }) => ({
  template: one(taskTemplates, {
    fields: [tasks.templateId],
    references: [taskTemplates.id],
  }),
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
    relationName: 'assignedTasks', // Add relationName
  }),
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
    relationName: 'createdTasks', // Add relationName
  }),
}))

export const inputsRelations = relations(inputs, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [inputs.supplierId],
    references: [suppliers.id],
  }),
}))

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  inputs: many(inputs),
}))

export const harvestsRelations = relations(harvests, ({ one, many }) => ({
  plant: one(plants, {
    fields: [harvests.plantId],
    references: [plants.id],
  }),
  processing: many(processing),
  createdBy: one(users, {
    fields: [harvests.createdById],
    references: [users.id],
  }),
}))

export const processingRelations = relations(processing, ({ one }) => ({
  harvest: one(harvests, {
    fields: [processing.harvestId],
    references: [harvests.id],
  }),
  createdBy: one(users, {
    fields: [processing.createdById],
    references: [users.id],
  }),
}))

export const complianceLogsRelations = relations(complianceLogs, ({ one }) => ({
  verifiedBy: one(users, {
    fields: [complianceLogs.verifiedById],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [complianceLogs.createdById],
    references: [users.id],
  }),
}))

export const geneticsRelations = relations(genetics, ({ one, many }) => ({
  plants: many(plants),
  createdBy: one(users, {
    fields: [genetics.createdById],
    references: [users.id],
  }),
}))

export const facilitiesRelations = relations(facilities, ({ one, many }) => ({
  areas: many(areas),
  createdBy: one(users, {
    fields: [facilities.createdById],
    references: [users.id],
  }),
}))

export const batchesRelations = relations(batches, ({ many, one }) => ({
  plants: many(plants),
  createdBy: one(users, {
    fields: [batches.userId],
    references: [users.id],
  }),
}))
