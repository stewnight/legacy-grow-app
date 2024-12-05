import { sql, relations } from 'drizzle-orm';
import {
  index,
  integer,
  varchar,
  timestamp,
  json,
  uuid,
  AnyPgColumn,
  decimal,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { createTable } from '../utils';
import { roomTypeEnum, statusEnum } from './enums';
import { users } from './core';
import { buildings } from './buildings';
import { locations } from './locations';

// ================== ROOMS ==================
export const rooms = createTable(
  'room',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    buildingId: uuid('building_id')
      .notNull()
      .references(() => buildings.id, { onDelete: 'cascade' }),
    parentId: uuid('parent_id').references((): AnyPgColumn => rooms.id, {
      onDelete: 'cascade',
    }),
    name: varchar('name', { length: 255 }).notNull(),
    type: roomTypeEnum('type').notNull(),
    properties: json('properties').$type<{
      temperature?: { min: number; max: number };
      humidity?: { min: number; max: number };
      light?: { type: string; intensity: number };
      co2?: { min: number; max: number };
    }>(),
    dimensions: json('dimensions').$type<{
      length: number;
      width: number;
      height?: number;
      unit: 'm' | 'ft';
      usableSqDimensions?: number;
    }>(),
    capacity: integer('capacity').default(0),
    status: statusEnum('status').default('active').notNull(),
    createdById: uuid('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    nameIdx: index('room_name_idx').on(table.name),
    typeIdx: index('room_type_idx').on(table.type),
    buildingIdIdx: index('room_building_id_idx').on(table.buildingId),
    statusIdx: index('room_status_idx').on(table.status),
    parentIdIdx: index('room_parent_id_idx').on(table.parentId),
  })
);

// ================== RELATIONS ==================
export const roomsRelations = relations(rooms, ({ one, many }) => ({
  building: one(buildings, {
    fields: [rooms.buildingId],
    references: [buildings.id],
    relationName: 'buildingRooms',
  }),
  parent: one(rooms, {
    fields: [rooms.parentId],
    references: [rooms.id],
    relationName: 'parentRoom',
  }),
  children: many(rooms, { relationName: 'parentRoom' }),
  locations: many(locations, { relationName: 'roomLocations' }),
  createdBy: one(users, {
    fields: [rooms.createdById],
    references: [users.id],
    relationName: 'roomCreator',
  }),
}));

// ================== SCHEMAS ==================
export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
});

export const selectRoomSchema = createSelectSchema(rooms);

// ================== TYPES ==================
export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;
