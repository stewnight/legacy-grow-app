import { sql } from 'drizzle-orm'
import {
  index,
  integer,
  varchar,
  timestamp,
  text,
  json,
  uuid,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../utils'
import { locationTypeEnum } from './enums'
import { users } from './core'
import { areas } from './areas'

// ================== LOCATIONS ==================
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
      level?: number
    }>(),
    properties: json('properties').$type<{
      temperature?: { min: number; max: number }
      humidity?: { min: number; max: number }
      light?: { type: string; intensity: number }
    }>(),
    capacity: integer('capacity'),
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
    nameIdx: index('location_name_idx').on(table.name),
    typeIdx: index('location_type_idx').on(table.type),
    areaIdIdx: index('location_area_id_idx').on(table.areaId),
    statusIdx: index('location_status_idx').on(table.status),
  })
)

// Zod Schemas

export const insertLocationSchema = createInsertSchema(locations)
export const selectLocationSchema = createSelectSchema(locations)

// Types

export type Location = typeof locations.$inferSelect
export type NewLocation = typeof locations.$inferInsert
