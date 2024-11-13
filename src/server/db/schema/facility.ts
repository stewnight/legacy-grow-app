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
    parentId: uuid('parent_id').references(() => areas.id),
    dimensions: json('dimensions').$type<{
      length?: number
      width?: number
      height?: number
      unit?: 'ft' | 'm'
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
export const insertFacilitySchema = createInsertSchema(facilities)
export const selectFacilitySchema = createSelectSchema(facilities)
export const insertAreaSchema = createInsertSchema(areas)
export const selectAreaSchema = createSelectSchema(areas)
export const insertLocationSchema = createInsertSchema(locations)
export const selectLocationSchema = createSelectSchema(locations)

// Types
export type Facility = typeof facilities.$inferSelect
export type NewFacility = typeof facilities.$inferInsert
export type Area = typeof areas.$inferSelect
export type NewArea = typeof areas.$inferInsert
export type Location = typeof locations.$inferSelect
export type NewLocation = typeof locations.$inferInsert
