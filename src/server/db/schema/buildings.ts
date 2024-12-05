import { relations, sql } from 'drizzle-orm';
import { index, varchar, timestamp, json, uuid, text } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { createTable } from '../utils';
import { buildingTypeEnum, statusEnum } from './enums';
import { users } from './core';
import { rooms } from './rooms';

// ================== buildings ==================
export const buildings = createTable(
  'building',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    type: buildingTypeEnum('type').notNull(),
    address: json('address').$type<{
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    }>(),
    properties: json('properties').$type<{
      climate?: {
        controlType: 'manual' | 'automated';
        hvacSystem?: string;
      };
      security?: {
        accessControl: boolean;
        cameraSystem: boolean;
      };
      power?: {
        mainSource: string;
        backup: boolean;
      };
    }>(),
    licenseNumber: varchar('license_number', { length: 100 }),
    description: text('description'),
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
    nameIdx: index('building_name_idx').on(table.name),
    typeIdx: index('building_type_idx').on(table.type),
    statusIdx: index('building_status_idx').on(table.status),
    licenseIdx: index('building_license_idx').on(table.licenseNumber),
  })
);

// ================== RELATIONS ==================

export const buildingsRelations = relations(buildings, ({ one, many }) => ({
  rooms: many(rooms, { relationName: 'buildingRooms' }),
  createdBy: one(users, {
    fields: [buildings.createdById],
    references: [users.id],
    relationName: 'buildingCreator',
  }),
}));

export const insertBuildingSchema = createInsertSchema(buildings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
});

export const selectBuildingSchema = createSelectSchema(buildings);

export type Building = typeof buildings.$inferSelect;
export type NewBuilding = typeof buildings.$inferInsert;
