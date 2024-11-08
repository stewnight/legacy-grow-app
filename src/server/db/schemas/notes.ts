import { sql } from 'drizzle-orm'
import {
  index,
  integer,
  text,
  timestamp,
  varchar,
  json,
} from 'drizzle-orm/pg-core'
import { createTable } from '../utils'
import { users } from './core'
import { noteTypeEnum } from './enums'

// ================== NOTES ==================
export const notes = createTable(
  'note',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    content: text('content').notNull(),
    type: noteTypeEnum('type').notNull(),
    entityType: varchar('entity_type', { length: 50 }).notNull(),
    entityId: integer('entity_id').notNull(),
    parentId: integer('parent_id'),
    metadata: json('metadata').$type<{
      duration?: number
      dimensions?: { width: number; height: number }
      fileSize?: number
      mimeType?: string
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
  (note) => ({
    entityTypeIdx: index('note_entity_type_idx').on(note.entityType),
    entityIdIdx: index('note_entity_id_idx').on(note.entityId),
    createdByIdx: index('note_created_by_idx').on(note.createdById),
    createdAtIdx: index('note_created_at_idx').on(note.createdAt),
    parentIdIdx: index('note_parent_id_idx').on(note.parentId),
  })
)

export type Note = typeof notes.$inferSelect
export type NewNote = Omit<Note, 'id' | 'createdAt' | 'updatedAt'>
