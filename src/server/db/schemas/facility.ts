import { relations, sql } from 'drizzle-orm'
import {
  index,
  integer,
  varchar,
  timestamp,
  text,
  json,
} from 'drizzle-orm/pg-core'

import { createTable } from '../utils'
import { locationTypeEnum } from './enums'
import { users } from './core'

// ================== FACILITIES ==================
export type Facility = typeof facilities.$inferSelect
export type NewFacility = Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>

export const facilities = createTable(
  'facility',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    address: text('address'),
    license: varchar('license', { length: 255 }),
    capacity: json('capacity'),
    properties: json('properties'),
    createdById: varchar('created_by', { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (facility) => ({
    nameIdx: index('facility_name_idx').on(facility.name),
    typeIdx: index('facility_type_idx').on(facility.type),
    createdByIdx: index('facility_created_by_idx').on(facility.createdById),
  })
)

// ================== AREAS ==================
export type Area = typeof areas.$inferSelect
export type NewArea = Omit<Area, 'id' | 'createdAt' | 'updatedAt'>

export const areas = createTable(
  'area',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    facilityId: integer('facility_id').references(() => facilities.id),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    parentId: integer('parent_id'),
    dimensions: json('dimensions'),
    capacity: json('capacity'),
    environment: json('environment'),
    status: varchar('status', { length: 50 }),
    createdById: varchar('created_by', { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (area) => ({
    nameIdx: index('area_name_idx').on(area.name),
    typeIdx: index('area_type_idx').on(area.type),
    facilityIdIdx: index('area_facility_id_idx').on(area.facilityId),
  })
)

// ================== LOCATIONS ==================
export type Location = typeof locations.$inferSelect
export type NewLocation = Omit<Location, 'id' | 'createdAt' | 'updatedAt'>

export const locations = createTable(
  'location',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    areaId: integer('area_id').references(() => areas.id),
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
    createdById: varchar('created_by', { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (location) => ({
    nameIdx: index('location_name_idx').on(location.name),
    typeIdx: index('location_type_idx').on(location.type),
    areaIdIdx: index('location_area_id_idx').on(location.areaId),
  })
)

// Relations
export const facilitiesRelations = relations(facilities, ({ one, many }) => ({
  areas: many(areas),
  createdBy: one(users, {
    fields: [facilities.createdById],
    references: [users.id],
  }),
}))

export const areasRelations = relations(areas, ({ one, many }) => ({
  facility: one(facilities, {
    fields: [areas.facilityId],
    references: [facilities.id],
  }),
  parent: one(areas, {
    fields: [areas.parentId],
    references: [areas.id],
  }),
  locations: many(locations),
  createdBy: one(users, {
    fields: [areas.createdById],
    references: [users.id],
  }),
}))

export const locationsRelations = relations(locations, ({ one }) => ({
  area: one(areas, {
    fields: [locations.areaId],
    references: [areas.id],
  }),
  createdBy: one(users, {
    fields: [locations.createdById],
    references: [users.id],
  }),
}))
