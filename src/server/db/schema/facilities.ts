import { sql } from 'drizzle-orm'
import {
  index,
  varchar,
  timestamp,
  json,
  uuid,
  text,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

import { createTable } from '../utils'
import { facilityTypeEnum, statusEnum } from './enums'
import { users } from './core'

// ================== FACILITIES ==================
export const facilities = createTable(
  'facility',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    type: facilityTypeEnum('type').notNull(),
    address: json('address').$type<{
      street: string
      city: string
      state: string
      country: string
      postalCode: string
      coordinates?: {
        latitude: number
        longitude: number
      }
    }>(),
    properties: json('properties').$type<{
      climate?: {
        controlType: 'manual' | 'automated'
        hvacSystem?: string
      }
      security?: {
        accessControl: boolean
        cameraSystem: boolean
      }
      power?: {
        mainSource: string
        backup: boolean
      }
    }>(),
    licenseNumber: varchar('license_number', { length: 100 }),
    description: text('description'),
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
    nameIdx: index('facility_name_idx').on(table.name),
    typeIdx: index('facility_type_idx').on(table.type),
    statusIdx: index('facility_status_idx').on(table.status),
    licenseIdx: index('facility_license_idx').on(table.licenseNumber),
  })
)

// Zod Schemas
export const insertFacilitySchema = createInsertSchema(facilities)
export const selectFacilitySchema = createSelectSchema(facilities)

// Types
export type Facility = typeof facilities.$inferSelect
export type NewFacility = typeof facilities.$inferInsert
