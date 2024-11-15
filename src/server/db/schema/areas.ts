import { sql } from 'drizzle-orm'
import {
  index,
  integer,
  varchar,
  timestamp,
  json,
  uuid,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../utils'
import { areaTypeEnum, statusEnum } from './enums'
import { users } from './core'
import { facilities } from './facilities'

// ================== AREAS ==================
export const areas = createTable(
  'area',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    facilityId: uuid('facility_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    type: areaTypeEnum('type').notNull(),
    properties: json('properties').$type<{
      temperature?: { min: number; max: number }
      humidity?: { min: number; max: number }
      light?: { type: string; intensity: number }
      co2?: { min: number; max: number }
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
    nameIdx: index('area_name_idx').on(table.name),
    typeIdx: index('area_type_idx').on(table.type),
    facilityIdIdx: index('area_facility_id_idx').on(table.facilityId),
    statusIdx: index('area_status_idx').on(table.status),
  })
)
// Zod Schemas

export const insertAreaSchema = createInsertSchema(areas)
export const selectAreaSchema = createSelectSchema(areas)

// Types

export type Area = typeof areas.$inferSelect
export type NewArea = typeof areas.$inferInsert
