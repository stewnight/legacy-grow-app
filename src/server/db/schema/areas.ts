import { sql, relations } from 'drizzle-orm'
import {
  index,
  integer,
  varchar,
  timestamp,
  json,
  uuid,
  AnyPgColumn,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../utils'
import { areaTypeEnum, statusEnum } from './enums'
import { users } from './core'
import { buildings } from './buildings'

// ================== AREAS ==================
export const areas = createTable(
  'area',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    buildingId: uuid('building_id')
      .notNull()
      .references(() => buildings.id, { onDelete: 'cascade' }),
    parentId: uuid('parent_id').references((): AnyPgColumn => areas.id, {
      onDelete: 'cascade',
    }),
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
    buildingIdIdx: index('area_building_id_idx').on(table.buildingId),
    statusIdx: index('area_status_idx').on(table.status),
    parentIdIdx: index('area_parent_id_idx').on(table.parentId),
  })
)

// ================== RELATIONS ==================
export const areasRelations = relations(areas, ({ one, many }) => ({
  building: one(buildings, {
    fields: [areas.buildingId],
    references: [buildings.id],
    relationName: 'buildingAreas',
  }),
  parent: one(areas, {
    fields: [areas.parentId],
    references: [areas.id],
    relationName: 'parentArea',
  }),
  children: many(areas, { relationName: 'parentArea' }),
  createdBy: one(users, {
    fields: [areas.createdById],
    references: [users.id],
    relationName: 'areaCreator',
  }),
}))

// ================== SCHEMAS ==================
export const insertAreaSchema = createInsertSchema(areas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
})

export const selectAreaSchema = createSelectSchema(areas)

// ================== TYPES ==================
export type Area = typeof areas.$inferSelect
export type NewArea = typeof areas.$inferInsert
