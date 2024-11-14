import {
  index,
  integer,
  varchar,
  timestamp,
  text,
  decimal,
  json,
  uuid,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

import { createTable } from '../utils'
import {
  batchStatusEnum,
  plantSourceEnum,
  plantStageEnum,
  plantSexEnum,
  healthStatusEnum,
  geneticTypeEnum,
} from './enums'
import { users } from './core'

// ================== GENETICS ==================
export const genetics = createTable(
  'genetic',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    type: geneticTypeEnum('type').notNull(),
    breeder: varchar('breeder', { length: 255 }),
    description: text('description'),
    floweringTime: integer('flowering_time'),
    thcPotential: decimal('thc_potential', { precision: 4, scale: 2 }),
    cbdPotential: decimal('cbd_potential', { precision: 4, scale: 2 }),
    terpeneProfile: json('terpene_profile').$type<Record<
      string,
      number
    > | null>(),
    growthCharacteristics: json('growth_characteristics').$type<{
      height?: number
      spread?: number
      internodeSpacing?: number
      leafPattern?: string
    }>(),
    lineage: json('lineage').$type<{
      mother?: string
      father?: string
      generation?: number
    }>(),
    createdById: uuid('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    nameIdx: index('genetic_name_idx').on(table.name),
    typeIdx: index('genetic_type_idx').on(table.type),
    createdByIdx: index('genetic_created_by_idx').on(table.createdById),
    slugIdx: index('genetic_slug_idx').on(table.slug),
  })
)

// Zod Schemas
export const insertGeneticSchema = createInsertSchema(genetics)
export const selectGeneticSchema = createSelectSchema(genetics)

// Types
export type Genetic = typeof genetics.$inferSelect
export type NewGenetic = typeof genetics.$inferInsert
