import { sql } from 'drizzle-orm'
import {
  index,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  numeric,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../utils'
import { sensorTypeEnum, statusEnum } from './enums'
import { users } from './core'
import { locations } from './locations'

export const sensors = createTable(
  'sensor',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    identifier: varchar('identifier', { length: 100 }).notNull().unique(),
    locationId: uuid('location_id')
      .notNull()
      .references(() => locations.id),
    type: sensorTypeEnum('type').notNull(),
    manufacturer: varchar('manufacturer', { length: 255 }),
    model: varchar('model', { length: 255 }),
    serialNumber: varchar('serial_number', { length: 100 }),
    // Calibration tracking
    lastCalibration: timestamp('last_calibration', { withTimezone: true }),
    nextCalibration: timestamp('next_calibration', { withTimezone: true }),
    calibrationInterval: numeric('calibration_interval', {
      precision: 5,
      scale: 2,
    }), // in days
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
    configuration: json('configuration').$type<{
      readingInterval: number // in seconds
      alarmThresholds?: {
        low: number
        high: number
        criticalLow?: number
        criticalHigh?: number
      }
      connectivity: {
        type: 'wifi' | 'bluetooth' | 'ethernet' | 'zigbee'
        address?: string
        protocol?: string
        port?: number
      }
      calibrationPoints?: Array<{
        expected: number
        measured: number
        unit: string
      }>
    }>(),
    metadata: json('metadata').$type<{
      installation: {
        date: string
        by: string
        notes?: string
        height?: number
        orientation?: string
      }
      maintenance: Array<{
        date: string
        type: string
        description: string
        performedBy: string
        parts?: string[]
      }>
      firmware?: {
        version: string
        lastUpdated: string
        updateAvailable?: boolean
      }
      warranty?: {
        startDate: string
        endDate: string
        provider: string
        details: string
      }
    }>(),
    notes: text('notes'),
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
    identifierIdx: index('sensor_identifier_idx').on(table.identifier),
    locationIdIdx: index('sensor_location_id_idx').on(table.locationId),
    typeIdx: index('sensor_type_idx').on(table.type),
    statusIdx: index('sensor_status_idx').on(table.status),
    calibrationIdx: index('sensor_calibration_idx').on(table.nextCalibration),
    manufacturerModelIdx: index('sensor_manufacturer_model_idx').on(
      table.manufacturer,
      table.model
    ),
  })
)

// Zod Schemas
export const insertSensorSchema = createInsertSchema(sensors)
export const selectSensorSchema = createSelectSchema(sensors)

// Types
export type Sensor = typeof sensors.$inferSelect
export type NewSensor = typeof sensors.$inferInsert
