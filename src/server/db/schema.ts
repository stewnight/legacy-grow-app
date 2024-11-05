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
} from 'drizzle-orm/pg-core'
import { type AdapterAccount } from 'next-auth/adapters'

export const createTable = pgTableCreator((name) => `legacy-grow-app_${name}`)

// ================== CORE SYSTEM ==================

export type SystemLog = typeof systemLogs.$inferSelect

export const systemLogs = createTable(
  'system_log',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    level: varchar('level', { length: 50 }).notNull(),
    source: varchar('source', { length: 255 }).notNull(),
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
  role: varchar('role', { length: 50 }).notNull().default('user'),
  active: boolean('active').default(true),
  permissions: json('permissions'),
  preferences: json('preferences'),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  plants: many(plants),
  tasks: many(tasks),
  createdGenetics: many(genetics),
  createdAreas: many(areas),
  createdLocations: many(locations),
  createdSensors: many(sensors),
  createdTasks: many(tasks),
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
export type Genetic = typeof genetics.$inferSelect
export type Plant = typeof plants.$inferSelect

export const genetics = createTable(
  'genetic',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    breeder: varchar('breeder', { length: 255 }),
    description: text('description'),
    floweringTime: integer('flowering_time'),
    thcPotential: decimal('thc_potential'),
    cbdPotential: decimal('cbd_potential'),
    terpeneProfie: json('terpene_profile'),
    growthCharacteristics: json('growth_characteristics'),
    lineage: json('lineage'),
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

export const plants = createTable(
  'plant',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    geneticId: integer('genetic_id').references(() => genetics.id),
    batchId: varchar('batch_id', { length: 255 }),
    source: varchar('source', { length: 50 }), // seed, clone, mother
    stage: varchar('stage', { length: 50 }), // seedling, vegetative, flowering
    plantDate: date('plant_date'),
    harvestDate: date('harvest_date'),
    motherId: integer('mother_id'),
    generation: integer('generation'),
    sex: varchar('sex', { length: 50 }),
    phenotype: varchar('phenotype', { length: 255 }),
    healthStatus: varchar('health_status', { length: 50 }),
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

export const locations = createTable(
  'location',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    areaId: integer('area_id').references(() => areas.id),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    coordinates: json('coordinates'),
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
  (location) => ({
    nameIdx: index('location_name_idx').on(location.name),
    typeIdx: index('location_type_idx').on(location.type),
    areaIdIdx: index('location_area_id_idx').on(location.areaId),
  })
)

// ================== SENSORS & MONITORING ==================
export type Sensor = typeof sensors.$inferSelect
export type SensorReading = typeof sensorReadings.$inferSelect

export const sensors = createTable(
  'sensor',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    model: varchar('model', { length: 255 }),
    locationId: integer('location_id').references(() => locations.id),
    calibrationDate: date('calibration_date'),
    calibrationDue: date('calibration_due'),
    accuracy: decimal('accuracy'),
    range: json('range'),
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

export const taskTemplates = createTable(
  'task_template',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    name: varchar('name', { length: 255 }).notNull(),
    category: varchar('category', { length: 50 }).notNull(),
    description: text('description'),
    instructions: json('instructions'),
    estimatedDuration: integer('estimated_duration'),
    requiredSkills: json('required_skills'),
    checklist: json('checklist'),
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

export const tasks = createTable(
  'task',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    templateId: integer('template_id').references(() => taskTemplates.id),
    assignedToId: varchar('assigned_to', { length: 255 }).references(
      () => users.id
    ),
    status: varchar('status', { length: 50 }).notNull(),
    priority: varchar('priority', { length: 50 }).notNull(),
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
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    supplierId: integer('supplier_id').references(() => suppliers.id),
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
    quality: varchar('quality', { length: 50 }),
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
  }),
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
  }),
}))

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  inputs: many(inputs),
  createdBy: one(users, {
    fields: [suppliers.createdById],
    references: [users.id],
  }),
}))

export const inputsRelations = relations(inputs, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [inputs.supplierId],
    references: [suppliers.id],
  }),
  createdBy: one(users, {
    fields: [inputs.createdById],
    references: [users.id],
  }),
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
