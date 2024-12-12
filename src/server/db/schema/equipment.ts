import { relations, sql } from 'drizzle-orm'
import { index, varchar, timestamp, json, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../utils'
import {
  equipmentTypeEnum,
  equipmentStatusEnum,
  maintenanceFrequencyEnum,
} from './enums'
import { users } from './core'
import { rooms } from './rooms'
import { sensors } from './sensors'
import { locations } from './locations'
import { notes } from './notes'
import { jobs } from './jobs'

// ================== EQUIPMENT ==================
export const equipment = createTable(
  'equipment',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    type: equipmentTypeEnum('type').notNull(),
    model: varchar('model', { length: 255 }),
    manufacturer: varchar('manufacturer', { length: 255 }),
    serialNumber: varchar('serial_number', { length: 255 }),
    purchaseDate: timestamp('purchase_date', { withTimezone: true }),
    warrantyExpiration: timestamp('warranty_expiration', {
      withTimezone: true,
    }),
    status: equipmentStatusEnum('status').default('active').notNull(),
    maintenanceFrequency: maintenanceFrequencyEnum(
      'maintenance_frequency'
    ).notNull(),
    lastMaintenanceDate: timestamp('last_maintenance_date', {
      withTimezone: true,
    }),
    nextMaintenanceDate: timestamp('next_maintenance_date', {
      withTimezone: true,
    }),
    roomId: uuid('room_id').references(() => rooms.id),
    locationId: uuid('location_id').references(() => locations.id),
    specifications: json('specifications').$type<{
      power?: {
        watts: number
        voltage: number
        current: number
        type: 'AC' | 'DC'
      }
      dimensions?: {
        length: number
        width: number
        height: number
        unit: 'mm' | 'in' | 'cm'
      }
      weight?: {
        value: number
        unit: 'kg' | 'lbs'
      }
      capacity?: {
        value: number
        unit: string
      }
      operatingRange?: {
        min: number
        max: number
        unit: string
      }
    }>(),
    metadata: json('metadata').$type<Record<string, string | undefined>>(),
    notes: varchar('notes', { length: 1000 }),
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
    nameIdx: index('equipment_name_idx').on(table.name),
    typeIdx: index('equipment_type_idx').on(table.type),
    statusIdx: index('equipment_status_idx').on(table.status),
    manufacturerIdx: index('equipment_manufacturer_idx').on(table.manufacturer),
    serialNumberIdx: index('equipment_serial_number_idx').on(
      table.serialNumber
    ),
    nextMaintenanceIdx: index('equipment_next_maintenance_idx').on(
      table.nextMaintenanceDate
    ),
    roomIdx: index('equipment_room_idx').on(table.roomId),
    locationIdx: index('equipment_location_idx').on(table.locationId),
  })
)

// ================== RELATIONS ==================
export const equipmentRelations = relations(equipment, ({ one, many }) => ({
  jobs: many(jobs, { relationName: 'equipmentJobs' }),
  room: one(rooms, {
    fields: [equipment.roomId],
    references: [rooms.id],
    relationName: 'roomEquipment',
  }),
  location: one(locations, {
    fields: [equipment.locationId],
    references: [locations.id],
    relationName: 'locationEquipment',
  }),
  createdBy: one(users, {
    fields: [equipment.createdById],
    references: [users.id],
    relationName: 'equipmentCreator',
  }),
  sensors: many(sensors, { relationName: 'equipmentSensors' }),
  notes: many(notes, { relationName: 'equipmentNotes' }),
}))

// ================== SCHEMAS ==================
export const insertEquipmentSchema = createInsertSchema(equipment, {
  specifications: (schema) => schema.specifications.optional(),
  metadata: (schema) => schema.metadata.optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
})

export const selectEquipmentSchema = createSelectSchema(equipment)

// ================== TYPES ==================
export type Equipment = typeof equipment.$inferSelect
export type NewEquipment = typeof equipment.$inferInsert
