import { relations, sql } from 'drizzle-orm'
import {
  index,
  varchar,
  timestamp,
  numeric,
  uuid,
  json,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../utils'
import { sensors } from './sensors'

export const sensorReadings = createTable(
  'sensor_reading',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sensorId: uuid('sensor_id')
      .notNull()
      .references(() => sensors.id, { onDelete: 'cascade' }),
    readingValue: numeric('reading_value', {
      precision: 10,
      scale: 2,
    }).notNull(),
    unit: varchar('unit', { length: 50 }).notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true })
      .defaultNow()
      .notNull(),
    metadata: json('metadata').$type<{
      accuracy?: number
      resolution?: number
      environmentalFactors?: {
        temperature?: number
        humidity?: number
      }
    }>(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    sensorIdx: index('sensor_reading_sensor_idx').on(table.sensorId),
    timestampIdx: index('sensor_reading_timestamp_idx').on(table.timestamp),
  })
)

export const sensorReadingsRelations = relations(sensorReadings, ({ one }) => ({
  sensor: one(sensors, {
    fields: [sensorReadings.sensorId],
    references: [sensors.id],
    relationName: 'sensorReadings',
  }),
}))

// Zod Schemas
export const insertSensorReadingSchema = createInsertSchema(sensorReadings)
export const selectSensorReadingSchema = createSelectSchema(sensorReadings)

// Types
export type SensorReading = typeof sensorReadings.$inferSelect
export type NewSensorReading = typeof sensorReadings.$inferInsert
