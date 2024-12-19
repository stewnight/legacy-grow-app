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
import { noteTypeEnum } from './enums'
import { users } from './core'
import { Plant, plants } from './plants'
import { Harvest, harvests } from './harvests'
import { locations } from './locations'
import { Batch, batches } from './batches'
import { Job, jobs } from './jobs'
import { Processing, processing } from './processing'
import { Sensor, sensors } from './sensors'
import { Equipment, equipment } from './equipment'
import { Genetic } from './genetics'

export const notes = createTable(
  'note',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: noteTypeEnum('type').default('text').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content'),
    entityId: uuid('entity_id'),
    entityType: varchar('entity_type', { length: 50 }).notNull(),
    properties: json('properties').$type<{
      tags?: string[]
      priority?: 'low' | 'medium' | 'high'
      media?: Array<{
        type: string
        url: string
        thumbnail?: string
        metadata?: Record<string, unknown>
      }>
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
    entityIdx: index('note_entity_idx').on(table.entityId, table.entityType),
    typeIdx: index('note_type_idx').on(table.type),
    createdByIdx: index('note_created_by_idx').on(table.createdById),
    createdAtIdx: index('note_created_at_idx').on(table.createdAt),
  })
)

// Relationships
export const notesRelations = relations(notes, ({ one }) => ({
  createdBy: one(users, {
    fields: [notes.createdById],
    references: [users.id],
    relationName: 'noteCreator',
  }),
  plant: one(plants, {
    fields: [notes.entityId],
    references: [plants.id],
    relationName: 'plantNotes',
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
  batch: one(batches, {
    fields: [notes.entityId],
    references: [batches.id],
    relationName: 'batchNotes',
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
  equipment: one(equipment, {
    fields: [notes.entityId],
    references: [equipment.id],
    relationName: 'equipmentNotes',
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

export type NoteWithRelations = Note & {
  createdBy: { id: string; name: string; image: string }
  equipment?: Equipment[] | null
  plant?: Plant | undefined
  batch?: Batch | undefined
  harvest?: Harvest | undefined
  location?: Location | undefined
  job?: Job | undefined
  processing?: Processing | undefined
  sensor?: Sensor | undefined
  genetic?: Genetic | undefined
}
