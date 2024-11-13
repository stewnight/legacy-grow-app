import { relations } from 'drizzle-orm'
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  systemLogs,
} from './core'
import { notes } from './notes'
import { plants, genetics, batches } from './cultivation'
import { tasks, sensors, sensorReadings, taskTemplates } from './operations'
import { areas, locations, facilities } from './facility'
import { harvests, processing, complianceLogs } from './processing'

// Core relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  plants: many(plants, { relationName: 'plantCreator' }),
  assignedTasks: many(tasks, { relationName: 'assignedTasks' }),
  createdTasks: many(tasks, { relationName: 'taskCreator' }),
  createdGenetics: many(genetics, { relationName: 'geneticCreator' }),
  createdAreas: many(areas, { relationName: 'areaCreator' }),
  createdLocations: many(locations, { relationName: 'locationCreator' }),
  createdSensors: many(sensors, { relationName: 'sensorCreator' }),
  createdHarvests: many(harvests, { relationName: 'harvestCreator' }),
  createdProcessing: many(processing, { relationName: 'processingCreator' }),
  createdNotes: many(notes, { relationName: 'noteCreator' }),
  verifiedComplianceLogs: many(complianceLogs, {
    relationName: 'complianceVerifier',
  }),
  createdComplianceLogs: many(complianceLogs, {
    relationName: 'complianceCreator',
  }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

// Notes relations
export const notesRelations = relations(notes, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [notes.createdById],
    references: [users.id],
    relationName: 'noteCreator',
  }),
  parent: one(notes, {
    fields: [notes.parentId],
    references: [notes.id],
    relationName: 'parentNote',
  }),
  children: many(notes, {
    relationName: 'parentNote',
  }),
}))

// Facility relations
export const facilitiesRelations = relations(facilities, ({ one, many }) => ({
  areas: many(areas),
  createdBy: one(users, {
    fields: [facilities.createdById],
    references: [users.id],
  }),
}))

export const areasRelations = relations(areas, ({ one, many }) => ({
  facility: one(facilities, {
    fields: [areas.facilityId],
    references: [facilities.id],
  }),
  parent: one(areas, {
    fields: [areas.parentId],
    references: [areas.id],
    relationName: 'parentArea',
  }),
  children: many(areas, {
    relationName: 'parentArea',
  }),
  locations: many(locations),
  createdBy: one(users, {
    fields: [areas.createdById],
    references: [users.id],
    relationName: 'areaCreator',
  }),
}))

export const locationsRelations = relations(locations, ({ one, many }) => ({
  area: one(areas, {
    fields: [locations.areaId],
    references: [areas.id],
  }),
  plants: many(plants),
  sensors: many(sensors),
  createdBy: one(users, {
    fields: [locations.createdById],
    references: [users.id],
    relationName: 'locationCreator',
  }),
}))

// Cultivation relations
export const plantsRelations = relations(plants, ({ one, many }) => ({
  genetic: one(genetics, {
    fields: [plants.geneticId],
    references: [genetics.id],
  }),
  location: one(locations, {
    fields: [plants.locationId],
    references: [locations.id],
  }),
  createdBy: one(users, {
    fields: [plants.createdById],
    references: [users.id],
    relationName: 'plantCreator',
  }),
  batch: one(batches, {
    fields: [plants.batchId],
    references: [batches.id],
  }),
  mother: one(plants, {
    fields: [plants.motherId],
    references: [plants.id],
    relationName: 'motherPlant',
  }),
  children: many(plants, {
    relationName: 'motherPlant',
  }),
}))

export const geneticsRelations = relations(genetics, ({ one, many }) => ({
  plants: many(plants),
  batches: many(batches),
  createdBy: one(users, {
    fields: [genetics.createdById],
    references: [users.id],
    relationName: 'geneticCreator',
  }),
}))

export const batchesRelations = relations(batches, ({ one, many }) => ({
  plants: many(plants),
  genetic: one(genetics, {
    fields: [batches.geneticId],
    references: [genetics.id],
  }),
  location: one(locations, {
    fields: [batches.locationId],
    references: [locations.id],
  }),
  createdBy: one(users, {
    fields: [batches.userId],
    references: [users.id],
  }),
}))

// Operations relations
export const sensorsRelations = relations(sensors, ({ one, many }) => ({
  location: one(locations, {
    fields: [sensors.locationId],
    references: [locations.id],
  }),
  readings: many(sensorReadings),
  createdBy: one(users, {
    fields: [sensors.createdById],
    references: [users.id],
    relationName: 'sensorCreator',
  }),
}))

export const sensorReadingsRelations = relations(sensorReadings, ({ one }) => ({
  sensor: one(sensors, {
    fields: [sensorReadings.sensorId],
    references: [sensors.id],
  }),
}))

export const taskTemplatesRelations = relations(
  taskTemplates,
  ({ one, many }) => ({
    tasks: many(tasks),
    createdBy: one(users, {
      fields: [taskTemplates.createdById],
      references: [users.id],
    }),
  })
)

export const tasksRelations = relations(tasks, ({ one }) => ({
  template: one(taskTemplates, {
    fields: [tasks.templateId],
    references: [taskTemplates.id],
  }),
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
    relationName: 'assignedTasks',
  }),
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
    relationName: 'taskCreator',
  }),
}))

// Processing relations
export const harvestsRelations = relations(harvests, ({ one, many }) => ({
  plant: one(plants, {
    fields: [harvests.plantId],
    references: [plants.id],
  }),
  processing: many(processing),
  createdBy: one(users, {
    fields: [harvests.createdById],
    references: [users.id],
    relationName: 'harvestCreator',
  }),
}))

export const processingRelations = relations(processing, ({ one }) => ({
  harvest: one(harvests, {
    fields: [processing.harvestId],
    references: [harvests.id],
  }),
  createdBy: one(users, {
    fields: [processing.createdById],
    references: [users.id],
    relationName: 'processingCreator',
  }),
}))

export const complianceLogsRelations = relations(complianceLogs, ({ one }) => ({
  verifiedBy: one(users, {
    fields: [complianceLogs.verifiedById],
    references: [users.id],
    relationName: 'complianceVerifier',
  }),
  createdBy: one(users, {
    fields: [complianceLogs.createdById],
    references: [users.id],
    relationName: 'complianceCreator',
  }),
}))
