import { relations, sql } from 'drizzle-orm';
import { index, varchar, timestamp, json, uuid, text, AnyPgColumn } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { createTable } from '../utils';
import {
  plantSourceEnum,
  plantStageEnum,
  plantSexEnum,
  healthStatusEnum,
  statusEnum,
} from './enums';
import { users } from './core';
import { locations } from './locations';
import { genetics } from './genetics';
import { notes } from './notes';
import { batches } from './batches';
import { jobs } from './jobs';

export const plants = createTable(
  'plant',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    identifier: varchar('identifier', { length: 100 }).notNull().unique(),
    geneticId: uuid('genetic_id')
      .notNull()
      .references(() => genetics.id),
    locationId: uuid('location_id')
      .notNull()
      .references(() => locations.id),
    batchId: uuid('batch_id').references(() => batches.id),
    motherId: uuid('mother_id').references((): AnyPgColumn => plants.id),
    source: plantSourceEnum('source').notNull(),
    stage: plantStageEnum('stage').notNull(),
    sex: plantSexEnum('sex').default('unknown').notNull(),
    health: healthStatusEnum('health').default('healthy').notNull(),
    plantedDate: timestamp('planted_date', { withTimezone: true }).notNull(),
    properties: json('properties').$type<{
      height?: number;
      width?: number;
      notes?: string;
      feeding?: {
        schedule: string;
        lastFed?: string;
        nextFeed?: string;
      };
      training?: {
        method: string;
        lastTrained?: string;
        nextTraining?: string;
      };
    }>(), // Environmental properties
    metadata: json('metadata').$type<{
      generation?: number;
      clonedFrom?: string;
      germination?: {
        date: string;
        method: string;
        medium: string;
      };
    }>(), // Metadata
    notes: text('notes'),
    status: statusEnum('status').default('active').notNull(),
    destroyedAt: timestamp('destroyed_at', { withTimezone: true }),
    destroyReason: text('destroy_reason'),
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
    identifierIdx: index('plant_identifier_idx').on(table.identifier),
    geneticIdIdx: index('plant_genetic_id_idx').on(table.geneticId),
    locationIdIdx: index('plant_location_id_idx').on(table.locationId),
    batchIdIdx: index('plant_batch_id_idx').on(table.batchId),
    motherIdIdx: index('plant_mother_id_idx').on(table.motherId),
    stageIdx: index('plant_stage_idx').on(table.stage),
    healthIdx: index('plant_health_idx').on(table.health),
    statusIdx: index('plant_status_idx').on(table.status),
    plantedDateIdx: index('plant_planted_date_idx').on(table.plantedDate),
  })
);

// ================== RELATIONS ==================
export const plantsRelations = relations(plants, ({ one, many }) => ({
  genetic: one(genetics, {
    fields: [plants.geneticId],
    references: [genetics.id],
    relationName: 'geneticPlants',
  }),
  location: one(locations, {
    fields: [plants.locationId],
    references: [locations.id],
    relationName: 'locationPlants',
  }),
  batch: one(batches, {
    fields: [plants.batchId],
    references: [batches.id],
    relationName: 'batchPlants',
  }),
  mother: one(plants, {
    fields: [plants.motherId],
    references: [plants.id],
    relationName: 'motherPlant',
  }),
  children: many(plants, { relationName: 'motherPlant' }),
  createdBy: one(users, {
    fields: [plants.createdById],
    references: [users.id],
    relationName: 'plantCreator',
  }),
  jobs: many(jobs, { relationName: 'plantJobs' }),
  notes: many(notes, { relationName: 'plantNotes' }),
}));

// Zod Schemas
export const insertPlantSchema = createInsertSchema(plants).omit({
  createdAt: true,
  updatedAt: true,
  createdById: true,
});
export const selectPlantSchema = createSelectSchema(plants);

// Types
export type Plant = typeof plants.$inferSelect;
export type NewPlant = typeof plants.$inferInsert;
