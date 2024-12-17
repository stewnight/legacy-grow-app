import { relations, sql } from 'drizzle-orm'
import {
  index,
  varchar,
  timestamp,
  json,
  uuid,
  numeric,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../utils'
import { sensorTypeEnum, statusEnum } from './enums'
import { users, type User } from './core'
import { sensorReadings, type SensorReading } from './sensorReadings'
import { locations, type Location } from './locations'
import { jobs, type Job } from './jobs'
import { equipment, type Equipment } from './equipment'
import { notes, type Note } from './notes'

export const sensors = createTable(
  'sensor',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: sensorTypeEnum('type').notNull(),
    manufacturer: varchar('manufacturer', { length: 255 }),
    model: varchar('model', { length: 255 }),
    serialNumber: varchar('serial_number', { length: 100 }),
    lastCalibration: timestamp('last_calibration', { withTimezone: true }),
    nextCalibration: timestamp('next_calibration', { withTimezone: true }),
    calibrationInterval: numeric('calibration_interval', {
      precision: 5,
      scale: 2,
    }),
    equipmentId: uuid('equipment_id').references(() => equipment.id, {
      onDelete: 'set null',
    }),
    specifications: json('specifications').$type<{
      range: {
        min: number
        max: number
        unit: string
      }
      accuracy: {
        value: number
        unit: string
      }
      resolution: {
        value: number
        unit: string
      }
      responseTime?: {
        value: number
        unit: string
      }
      powerRequirements?: {
        voltage: number
        current: number
        type: 'AC' | 'DC'
      }
    }>(),
    metadata: json('metadata').$type<{
      installation: {
        date: string
        by: string
        notes?: string
      }
      maintenance?: Array<{
        date: string
        type: string
        description: string
        performedBy: string
      }>
    }>(),
    locationId: uuid('location_id').references(() => locations.id),
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
    typeIdx: index('sensor_type_idx').on(table.type),
    statusIdx: index('sensor_status_idx').on(table.status),
    calibrationIdx: index('sensor_calibration_idx').on(table.nextCalibration),
    manufacturerModelIdx: index('sensor_manufacturer_model_idx').on(
      table.manufacturer,
      table.model
    ),
    locationIdx: index('sensor_location_idx').on(table.locationId),
    equipmentIdx: index('sensor_equipment_idx').on(table.equipmentId),
  })
)

export const sensorsRelations = relations(sensors, ({ one, many }) => ({
  location: one(locations, {
    fields: [sensors.locationId],
    references: [locations.id],
    relationName: 'sensorLocation',
  }),
  equipment: one(equipment, {
    fields: [sensors.equipmentId],
    references: [equipment.id],
    relationName: 'equipmentSensors',
  }),
  readings: many(sensorReadings, { relationName: 'sensorReadings' }),
  createdBy: one(users, {
    fields: [sensors.createdById],
    references: [users.id],
    relationName: 'sensorCreator',
  }),
  jobs: many(jobs, { relationName: 'sensorJobs' }),
  notes: many(notes, { relationName: 'sensorNotes' }),
}))

// Zod Schemas
export const insertSensorSchema = createInsertSchema(sensors).omit({
  createdAt: true,
  updatedAt: true,
  createdById: true,
})
export const selectSensorSchema = createSelectSchema(sensors)

// Types
export type Sensor = typeof sensors.$inferSelect
export type NewSensor = typeof sensors.$inferInsert
export type SensorWithRelations = Sensor & {
  location?: Location
  equipment?: Equipment
  readings: SensorReading[]
  createdBy: Pick<User, 'id' | 'name' | 'image'>
  jobs: Job[]
  notes: Note[]
}
