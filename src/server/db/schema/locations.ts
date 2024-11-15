import { relations, sql } from 'drizzle-orm'
import {
  index,
  varchar,
  timestamp,
  json,
  uuid,
  integer,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../utils'
import { locationTypeEnum, statusEnum } from './enums'
import { users } from './core'
import { areas } from './areas'
import { plants } from './plants'
import { tasks } from './tasks'
import { batches } from './batches'
import { sensors } from './sensors'
import { harvests } from './harvests'
import { processing } from './processing'

export const locations = createTable(
  'location',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    areaId: uuid('area_id')
      .notNull()
      .references(() => areas.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    type: locationTypeEnum('type').notNull(),
    coordinates: json('coordinates').$type<{
      x: number
      y: number
      z?: number
      unit: 'ft' | 'm'
    }>(),
    properties: json('properties').$type<{
      temperature?: { min: number; max: number }
      humidity?: { min: number; max: number }
      light?: {
        type: string
        intensity: number
        height?: number
      }
      irrigation?: {
        type: string
        schedule?: string
      }
    }>(),
    dimensions: json('dimensions').$type<{
      length: number
      width: number
      height?: number
      unit: 'ft' | 'm'
    }>(),
    capacity: integer('capacity').default(0),
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
    nameIdx: index('location_name_idx').on(table.name),
    typeIdx: index('location_type_idx').on(table.type),
    areaIdIdx: index('location_area_id_idx').on(table.areaId),
    statusIdx: index('location_status_idx').on(table.status),
  })
)
const locationsRelations = relations(locations, ({ one, many }) => ({
  area: one(areas, {
    fields: [locations.areaId],
    references: [areas.id],
    relationName: 'areaLocations',
  }),
  plants: many(plants, { relationName: 'locationPlants' }),
  sensors: many(sensors, { relationName: 'locationSensors' }),
  batches: many(batches, { relationName: 'locationBatches' }),
  tasks: many(tasks, { relationName: 'locationTasks' }),
  harvests: many(harvests, { relationName: 'locationHarvests' }),
  processing: many(processing, { relationName: 'locationProcessing' }),
  createdBy: one(users, {
    fields: [locations.createdById],
    references: [users.id],
    relationName: 'locationCreator',
  }),
}))

// Zod Schemas
export const insertLocationSchema = createInsertSchema(locations)
export const selectLocationSchema = createSelectSchema(locations)

// Types
export type Location = typeof locations.$inferSelect
export type NewLocation = typeof locations.$inferInsert