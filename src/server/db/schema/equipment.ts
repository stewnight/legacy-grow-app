import { relations, sql } from 'drizzle-orm'
import { index, integer, varchar, timestamp, json, uuid, decimal } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createTable } from '../utils'
import { equipmentTypeEnum, equipmentStatusEnum, maintenanceFrequencyEnum } from './enums'
import { users } from './core'
import { rooms } from './rooms'
import { sensors } from './sensors'

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
    maintenanceFrequency: maintenanceFrequencyEnum('maintenance_frequency').notNull(),
    lastMaintenanceDate: timestamp('last_maintenance_date', {
      withTimezone: true,
    }),
    nextMaintenanceDate: timestamp('next_maintenance_date', {
      withTimezone: true,
    }),
    specifications: json('specifications').$type<{
      power?: number
      voltage?: number
      current?: number
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
    metadata: json('metadata').$type<{
      installation?: {
        date: string
        by: string
        contractor?: string
        warranty?: {
          provider: string
          contract: string
          expiration: string
        }
      }
      maintenance?: Array<{
        date: string
        type: string
        description: string
        performedBy: string
        cost?: number
        nextScheduled?: string
      }>
      compliance?: {
        certifications: string[]
        lastInspection?: string
        nextInspection?: string
        documents?: Array<{
          type: string
          number: string
          expiration?: string
        }>
      }
      customFields?: Record<string, unknown>
    }>(),
    notes: varchar('notes', { length: 1000 }),
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
    nameIdx: index('equipment_name_idx').on(table.name),
    typeIdx: index('equipment_type_idx').on(table.type),
    statusIdx: index('equipment_status_idx').on(table.status),
    manufacturerIdx: index('equipment_manufacturer_idx').on(table.manufacturer),
    serialNumberIdx: index('equipment_serial_number_idx').on(table.serialNumber),
  })
)

// ================== EQUIPMENT ROOM ASSIGNMENTS ==================
export const equipmentRoomAssignments = createTable(
  'equipment_room_assignment',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    equipmentId: uuid('equipment_id')
      .notNull()
      .references(() => equipment.id, { onDelete: 'cascade' }),
    roomId: uuid('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
    assignedById: uuid('assigned_by')
      .notNull()
      .references(() => users.id),
    notes: varchar('notes', { length: 1000 }),
  },
  (table) => ({
    equipmentRoomIdx: index('equipment_room_idx').on(table.equipmentId, table.roomId),
  })
)

// ================== MAINTENANCE RECORDS ==================
export const maintenanceRecords = createTable(
  'maintenance_record',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    equipmentId: uuid('equipment_id')
      .notNull()
      .references(() => equipment.id, { onDelete: 'cascade' }),
    maintenanceDate: timestamp('maintenance_date', { withTimezone: true }).defaultNow().notNull(),
    type: varchar('type', { length: 255 }).notNull(),
    description: varchar('description', { length: 1000 }),
    cost: decimal('cost', { precision: 10, scale: 2 }),
    performedById: uuid('performed_by')
      .notNull()
      .references(() => users.id),
    nextMaintenanceDate: timestamp('next_maintenance_date', {
      withTimezone: true,
    }),
    status: varchar('status', { length: 50 }).default('completed'),
    parts: json('parts').$type<
      {
        name: string
        quantity: number
        cost?: number
      }[]
    >(),
    metadata: json('metadata').$type<Record<string, unknown>>(),
  },
  (table) => ({
    equipmentMaintenanceIdx: index('equipment_maintenance_idx').on(
      table.equipmentId,
      table.maintenanceDate
    ),
  })
)

// ================== RELATIONS ==================
export const equipmentRelations = relations(equipment, ({ one, many }) => ({
  roomAssignments: many(equipmentRoomAssignments),
  maintenanceRecords: many(maintenanceRecords),
  createdBy: one(users, {
    fields: [equipment.createdById],
    references: [users.id],
    relationName: 'equipmentCreator',
  }),
  sensors: many(sensors, { relationName: 'equipmentSensors' }),
}))

export const equipmentRoomAssignmentsRelations = relations(equipmentRoomAssignments, ({ one }) => ({
  equipment: one(equipment, {
    fields: [equipmentRoomAssignments.equipmentId],
    references: [equipment.id],
    relationName: 'equipmentAssignment',
  }),
  room: one(rooms, {
    fields: [equipmentRoomAssignments.roomId],
    references: [rooms.id],
    relationName: 'roomEquipment',
  }),
  assignedBy: one(users, {
    fields: [equipmentRoomAssignments.assignedById],
    references: [users.id],
    relationName: 'equipmentAssigner',
  }),
}))

export const maintenanceRecordsRelations = relations(maintenanceRecords, ({ one }) => ({
  equipment: one(equipment, {
    fields: [maintenanceRecords.equipmentId],
    references: [equipment.id],
    relationName: 'equipmentMaintenance',
  }),
  performedBy: one(users, {
    fields: [maintenanceRecords.performedById],
    references: [users.id],
    relationName: 'maintenancePerformer',
  }),
}))

// ================== SCHEMAS ==================
export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
})

export const selectEquipmentSchema = createSelectSchema(equipment)

export const insertMaintenanceRecordSchema = createInsertSchema(maintenanceRecords).omit({
  id: true,
})

export const selectMaintenanceRecordSchema = createSelectSchema(maintenanceRecords)

export const insertEquipmentRoomAssignmentSchema = createInsertSchema(
  equipmentRoomAssignments
).omit({
  id: true,
  assignedAt: true,
})

export const selectEquipmentRoomAssignmentSchema = createSelectSchema(equipmentRoomAssignments)

// ================== TYPES ==================
export type Equipment = typeof equipment.$inferSelect
export type NewEquipment = typeof equipment.$inferInsert
export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect
export type NewMaintenanceRecord = typeof maintenanceRecords.$inferInsert
export type EquipmentRoomAssignment = typeof equipmentRoomAssignments.$inferSelect
export type NewEquipmentRoomAssignment = typeof equipmentRoomAssignments.$inferInsert
