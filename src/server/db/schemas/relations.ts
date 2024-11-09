import { relations } from 'drizzle-orm'
import { users, accounts, sessions } from './core'
import { notes } from './notes'
import { plants, genetics, batches, strains } from './cultivation'
import { tasks, sensors, sensorReadings, taskTemplates } from './operations'
import { areas, locations, facilities } from './facility'
import { harvests, processing, complianceLogs } from './processing'

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  plants: many(plants),
  assignedTasks: many(tasks, { relationName: 'assignedTasks' }),
  createdTasks: many(tasks, { relationName: 'createdTasks' }),
  createdGenetics: many(genetics),
  createdAreas: many(areas),
  createdLocations: many(locations),
  createdSensors: many(sensors),
  createdHarvests: many(harvests),
  createdProcessing: many(processing),
  createdNotes: many(notes, { relationName: 'userCreatedNotes' }),
}))

// Auth relations
export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

// Notes relations
export const notesRelations = relations(notes, ({ one }) => ({
  createdBy: one(users, {
    fields: [notes.createdById],
    references: [users.id],
    relationName: 'userCreatedNotes',
  }),
  parent: one(notes, {
    fields: [notes.parentId],
    references: [notes.id],
    relationName: 'noteParent',
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
  }),
  locations: many(locations),
  createdBy: one(users, {
    fields: [areas.createdById],
    references: [users.id],
  }),
}))

export const locationsRelations = relations(locations, ({ one }) => ({
  area: one(areas, {
    fields: [locations.areaId],
    references: [areas.id],
  }),
  createdBy: one(users, {
    fields: [locations.createdById],
    references: [users.id],
  }),
}))

// Cultivation relations
export const plantsRelations = relations(plants, ({ one }) => ({
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
  }),
  batch: one(batches, {
    fields: [plants.batchId],
    references: [batches.id],
  }),
}))

export const geneticsRelations = relations(genetics, ({ one, many }) => ({
  plants: many(plants),
  createdBy: one(users, {
    fields: [genetics.createdById],
    references: [users.id],
  }),
}))

export const batchesRelations = relations(batches, ({ many, one }) => ({
  plants: many(plants),
  createdBy: one(users, {
    fields: [batches.userId],
    references: [users.id],
  }),
  strain: one(strains, {
    fields: [batches.strain],
    references: [strains.name],
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
    relationName: 'createdTasks',
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
  }),
}))

export const complianceLogsRelations = relations(complianceLogs, ({ one }) => ({
  verifiedBy: one(users, {
    fields: [complianceLogs.verifiedById],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [complianceLogs.createdById],
    references: [users.id],
  }),
}))

// Strains relations
export const strainsRelations = relations(strains, ({ many, one }) => ({
  batches: many(batches),
  createdBy: one(users, {
    fields: [strains.createdById],
    references: [users.id],
  }),
}))
