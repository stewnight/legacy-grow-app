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

// ================== FACILITIES ==================
export const facilities = createTable(
  'facility',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    address: json('address').$type<{
      street: string
      city: string
      state: string
      zip: string
      country: string
      coordinates?: { lat: number; lng: number }
    }>(),
    license: json('license').$type<{
      number: string
      type: string
      expiryDate: string
      issuedBy: string
      status: string
    }>(),
    capacity: json('capacity').$type<{
      plants?: number
      sqFt?: number
      rooms?: number
    }>(),
    properties: json('properties').$type<{
      climate?: string
      security?: string[]
      utilities?: string[]
    }>(),
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
    nameIdx: index('facility_name_idx').on(table.name),
    typeIdx: index('facility_type_idx').on(table.type),
    createdByIdx: index('facility_created_by_idx').on(table.createdById),
  })
)

// Zod Schemas
export const insertFacilitySchema = createInsertSchema(facilities)
export const selectFacilitySchema = createSelectSchema(facilities)

// Types
export type Facility = typeof facilities.$inferSelect
export type NewFacility = typeof facilities.$inferInsert
