import { sql } from 'drizzle-orm'
import {
  index,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  boolean,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../utils'
import { geneticTypeEnum, statusEnum } from './enums'
import { users } from './core'

export const genetics = createTable(
  'genetic',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    type: geneticTypeEnum('type').notNull(),
    breeder: varchar('breeder', { length: 255 }),
    description: text('description'),
    properties: json('properties').$type<{
      effects?: string[]
      flavors?: string[]
      thc?: {
        min?: number
        max?: number
      }
      cbd?: {
        min?: number
        max?: number
      }
      terpenes?: Array<{
        name: string
        percentage?: number
      }>
    }>(),
    growProperties: json('grow_properties').$type<{
      floweringTime?: {
        min: number
        max: number
        unit: 'days' | 'weeks'
      }
      height?: {
        min: number
        max: number
        unit: 'cm' | 'inches'
      }
      yield?: {
        min: number
        max: number
        unit: 'g' | 'oz' | 'kg'
      }
      difficulty?: 'easy' | 'medium' | 'hard'
      environment?: 'indoor' | 'outdoor' | 'both'
    }>(),
    lineage: json('lineage').$type<{
      mother?: string
      father?: string
      generation?: number
      hybridRatio?: string
      parents?: Array<{
        name: string
        type: string
        role: 'mother' | 'father'
      }>
    }>(),
    inHouse: boolean('in_house').default(false),
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
    nameIdx: index('genetic_name_idx').on(table.name),
    typeIdx: index('genetic_type_idx').on(table.type),
    breederIdx: index('genetic_breeder_idx').on(table.breeder),
    statusIdx: index('genetic_status_idx').on(table.status),
    inHouseIdx: index('genetic_in_house_idx').on(table.inHouse),
  })
)

// Zod Schemas
export const insertGeneticSchema = createInsertSchema(genetics)
export const selectGeneticSchema = createSelectSchema(genetics)

// Types
export type Genetic = typeof genetics.$inferSelect
export type NewGenetic = typeof genetics.$inferInsert