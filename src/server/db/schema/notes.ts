import { sql } from 'drizzle-orm'
import {
  index,
  uuid,
  text,
  timestamp,
  varchar,
  json,
  boolean,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

import { createTable } from '../utils'
import { noteTypeEnum } from './enums'
import { users } from './core'

export const notes = createTable(
  'note',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    content: text('content').notNull(),
    type: noteTypeEnum('type').notNull().default('text'),
    entityType: varchar('entity_type', { length: 50 }).notNull(),
    entityId: uuid('entity_id').notNull(),
    parentId: uuid('parent_id').references(() => notes.id, {
      onDelete: 'cascade',
    }),
    metadata: json('metadata').$type<{
      // For voice notes
      duration?: number
      transcription?: string
      audioUrl?: string
      // For image notes
      dimensions?: { width: number; height: number }
      thumbnailUrl?: string
      imageUrl?: string
      // For file notes
      fileSize?: number
      mimeType?: string
      fileUrl?: string
      // For checklist notes
      items?: Array<{
        text: string
        checked: boolean
        checkedAt?: string
        checkedBy?: string
      }>
      // For measurement notes
      value?: number
      unit?: string
      category?: string
      // Common metadata
      tags?: string[]
      location?: { lat: number; lng: number }
      device?: string
      app?: string
      version?: string
    }>(),
    pinned: boolean('pinned').default(false),
    archived: boolean('archived').default(false),
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
    entityTypeIdx: index('note_entity_type_idx').on(table.entityType),
    entityIdIdx: index('note_entity_id_idx').on(table.entityId),
    typeIdx: index('note_type_idx').on(table.type),
    parentIdIdx: index('note_parent_id_idx').on(table.parentId),
    createdByIdx: index('note_created_by_idx').on(table.createdById),
    createdAtIdx: index('note_created_at_idx').on(table.createdAt),
    pinnedIdx: index('note_pinned_idx').on(table.pinned),
  })
)

// Zod Schemas
export const insertNoteSchema = createInsertSchema(notes)
export const selectNoteSchema = createSelectSchema(notes)

// Types
export type Note = typeof notes.$inferSelect
export type NewNote = typeof notes.$inferInsert
