// Re-export all schemas and their types
export * from './enums'
export * from './core'
export * from './cultivation'
export * from './facility'
export * from './operations'
export * from './processing'

// Update the user relations to include all relationships
import { relations } from 'drizzle-orm'
import { accounts, users } from './core'
import { plants } from './cultivation'
import { tasks, sensors } from './operations'
import { areas, locations } from './facility'
import { genetics } from './cultivation'
import { harvests, processing } from './processing'

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
}))
