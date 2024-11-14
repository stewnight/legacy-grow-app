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
    type: varchar('type', { length: 50 }).notNull(),
    parentId: uuid('parent_id'),
    dimensions: json('dimensions').$type<{
      length?: number
      width?: number
      height?: number
      unit?: 'm' | 'ft'
    }>(),
    capacity: json('capacity').$type<{
      plants?: number
      sqFt?: number
    }>(),
    environment: json('environment').$type<{
      temperature?: { min: number; max: number; unit: 'C' | 'F' }
      humidity?: { min: number; max: number }
      co2?: { min: number; max: number }
      light?: { type: string; intensity: number }
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
    nameIdx: index('area_name_idx').on(table.name),
    typeIdx: index('area_type_idx').on(table.type),
    facilityIdIdx: index('area_facility_id_idx').on(table.facilityId),
    parentIdIdx: index('area_parent_id_idx').on(table.parentId),
    statusIdx: index('area_status_idx').on(table.status),
  })
)
// Zod Schemas

export const insertAreaSchema = createInsertSchema(areas)
export const selectAreaSchema = createSelectSchema(areas)

// Types

export type Area = typeof areas.$inferSelect
export type NewArea = typeof areas.$inferInsert
