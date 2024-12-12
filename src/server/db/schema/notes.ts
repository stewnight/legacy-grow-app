import { relations, sql } from 'drizzle-orm'
import {
  index,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../utils'
import { noteTypeEnum, statusEnum } from './enums'
import { users } from './core'
import { plants } from './plants'
import { harvests } from './harvests'
import { locations } from './locations'
import { batches } from './batches'
import { jobs } from './jobs'
import { processing } from './processing'
import { sensors } from './sensors'
import { equipment } from './equipment'

export const notes = createTable(
  'note',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: noteTypeEnum('type').default('text').notNull(),
    title: varchar('title', { length: 255 }),
    content: text('content'),
    entityId: uuid('entity_id').notNull(),
    entityType: varchar('entity_type', { length: 50 }).notNull(),
    parentId: uuid('parent_id').references((): AnyPgColumn => notes.id, {
      onDelete: 'cascade',
    }),
    properties: json('properties').$type<{
      tags?: string[]
      priority?: 'low' | 'medium' | 'high'
      category?: string
      measurements?: Array<{
        type: string
        value: number
        unit: string
        timestamp?: string
      }>
      checklist?: Array<{
        item: string
        completed: boolean
        completedAt?: string
        completedBy?: string
      }>
      media?: Array<{
        type: string
        url: string
        thumbnail?: string
        metadata?: Record<string, unknown>
      }>
    }>(),
    metadata: json('metadata').$type<{
      device?: string
      location?: {
        latitude?: number
        longitude?: number
        altitude?: number
      }
      weather?: {
        temperature?: number
        humidity?: number
        conditions?: string
      }
      references?: Array<{
        type: string
        id: string
        description?: string
      }>
    }>(),
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
    entityIdx: index('note_entity_idx').on(table.entityId, table.entityType),
    typeIdx: index('note_type_idx').on(table.type),
    createdByIdx: index('note_created_by_idx').on(table.createdById),
    statusIdx: index('note_status_idx').on(table.status),
    createdAtIdx: index('note_created_at_idx').on(table.createdAt),
  })
)

// Relationships
export const notesRelations = relations(notes, ({ one, many }) => ({
  parent: one(notes, {
    fields: [notes.parentId],
    references: [notes.id],
    relationName: 'parentNote',
  }),
  children: many(notes, { relationName: 'parentNote' }),
  createdBy: one(users, {
    fields: [notes.createdById],
    references: [users.id],
    relationName: 'noteCreator',
  }),
  equipment: one(equipment, {
    fields: [notes.entityId],
    references: [equipment.id],
    relationName: 'equipmentNotes',
  }),
  plant: one(plants, {
    fields: [notes.entityId],
    references: [plants.id],
    relationName: 'plantNotes',
  }),
  batch: one(batches, {
    fields: [notes.entityId],
    references: [batches.id],
    relationName: 'batchNotes',
  }),
  harvest: one(harvests, {
    fields: [notes.entityId],
    references: [harvests.id],
    relationName: 'harvestNotes',
  }),
  location: one(locations, {
    fields: [notes.entityId],
    references: [locations.id],
    relationName: 'locationNotes',
  }),
  job: one(jobs, {
    fields: [notes.entityId],
    references: [jobs.id],
    relationName: 'jobNotes',
  }),
  processing: one(processing, {
    fields: [notes.entityId],
    references: [processing.id],
    relationName: 'processingNotes',
  }),
  sensor: one(sensors, {
    fields: [notes.entityId],
    references: [sensors.id],
    relationName: 'sensorNotes',
  }),
}))

// Zod Schemas
export const insertNoteSchema = createInsertSchema(notes).omit({
  createdAt: true,
  updatedAt: true,
  createdById: true,
})
export const selectNoteSchema = createSelectSchema(notes)

// Types
export type Note = typeof notes.$inferSelect
export type NewNote = typeof notes.$inferInsert
