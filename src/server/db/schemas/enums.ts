import { pgEnum } from 'drizzle-orm/pg-core'

// System and logging enums
export const logLevelEnum = pgEnum('log_level', [
  'debug',
  'info',
  'warn',
  'error',
])

export const systemLogSourceEnum = pgEnum('system_log_source', [
  'plants',
  'harvests',
  'tasks',
  'system',
  'auth',
  'sensors',
])

// User related enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'manager'])

// Plant and cultivation enums
export const batchStatusEnum = pgEnum('batch_status', [
  'active',
  'completed',
  'cancelled',
])

export const plantSourceEnum = pgEnum('plant_source', [
  'seed',
  'clone',
  'mother',
])

export const plantStageEnum = pgEnum('plant_stage', [
  'seedling',
  'vegetative',
  'flowering',
  'harvested',
])

export const plantSexEnum = pgEnum('plant_sex', [
  'unknown',
  'male',
  'female',
  'hermaphrodite',
])

export const healthStatusEnum = pgEnum('health_status', [
  'healthy',
  'sick',
  'pest',
  'nutrient',
  'dead',
])

export const geneticTypeEnum = pgEnum('genetic_type', [
  'sativa',
  'indica',
  'hybrid',
])

// Location and facility enums
export const locationTypeEnum = pgEnum('location_type', [
  'room',
  'section',
  'bench',
  'shelf',
])

// Operations enums
export const sensorTypeEnum = pgEnum('sensor_type', [
  'temperature',
  'humidity',
  'co2',
  'light',
  'ph',
  'ec',
])

export const taskStatusEnum = pgEnum('task_status', [
  'pending',
  'in_progress',
  'completed',
  'cancelled',
])

export const taskPriorityEnum = pgEnum('task_priority', [
  'low',
  'medium',
  'high',
  'urgent',
])

export const taskCategoryEnum = pgEnum('task_category', [
  'maintenance',
  'transplanting',
  'cloning',
  'feeding',
  'environmental',
  'harvest',
  'drying',
  'trimming',
  'packing',   
])

// Processing and harvest enums
export const harvestQualityEnum = pgEnum('harvest_quality', [
  'A',
  'B',
  'C',
  'D',
])

export const noteTypeEnum = pgEnum('note_type', [
  'text',
  'voice',
  'image',
  'file',
])

export const destroyReasonEnum = pgEnum('destroy_reason', [
  'died',
  'destroyed',
  'other',
])

export type DestroyReason = (typeof destroyReasonEnum.enumValues)[number]
export type DestroyReasonEnum = typeof destroyReasonEnum

export type NoteType = (typeof noteTypeEnum.enumValues)[number]
export type NoteTypeEnum = typeof noteTypeEnum

export type HarvestQuality = (typeof harvestQualityEnum.enumValues)[number]
export type HarvestQualityEnum = typeof harvestQualityEnum

export type GeneticType = (typeof geneticTypeEnum.enumValues)[number]
export type GeneticTypeEnum = typeof geneticTypeEnum

export type LocationType = (typeof locationTypeEnum.enumValues)[number]
export type LocationTypeEnum = typeof locationTypeEnum

export type SensorType = (typeof sensorTypeEnum.enumValues)[number]
export type SensorTypeEnum = typeof sensorTypeEnum

export type TaskStatus = (typeof taskStatusEnum.enumValues)[number]
export type TaskStatusEnum = typeof taskStatusEnum

export type TaskPriority = (typeof taskPriorityEnum.enumValues)[number]
export type TaskPriorityEnum = typeof taskPriorityEnum

export type TaskCategory = (typeof taskCategoryEnum.enumValues)[number]
export type TaskCategoryEnum = typeof taskCategoryEnum

export type PlantSource = (typeof plantSourceEnum.enumValues)[number]
export type PlantSourceEnum = typeof plantSourceEnum

export type PlantStage = (typeof plantStageEnum.enumValues)[number]
export type PlantStageEnum = typeof plantStageEnum

export type PlantSex = (typeof plantSexEnum.enumValues)[number]
export type PlantSexEnum = typeof plantSexEnum

export type HealthStatus = (typeof healthStatusEnum.enumValues)[number]
export type HealthStatusEnum = typeof healthStatusEnum

export type BatchStatus = (typeof batchStatusEnum.enumValues)[number]
export type BatchStatusEnum = typeof batchStatusEnum
