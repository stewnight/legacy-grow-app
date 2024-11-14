// Re-export all schemas and their types
export * from './enums'
export * from './core'
export * from './plants'
export * from './genetics'
export * from './batches'
export * from './facilities'
export * from './areas'
export * from './locations'
export * from './operations'
export * from './processing'
export * from './notes'

// Export relations separately to avoid naming conflicts
export {
  usersRelations,
  accountsRelations,
  sessionsRelations,
  notesRelations,
  facilitiesRelations,
  areasRelations,
  locationsRelations,
  plantsRelations,
  geneticsRelations,
  batchesRelations,
  sensorsRelations,
  sensorReadingsRelations,
  taskTemplatesRelations,
  tasksRelations,
  harvestsRelations,
  processingRelations,
  complianceLogsRelations,
} from './relations'
