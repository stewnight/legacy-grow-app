import { pgEnum } from 'drizzle-orm/pg-core'

// System and logging enums
export const logLevelEnum = pgEnum('log_level', [
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
])

export const systemLogSourceEnum = pgEnum('system_log_source', [
  'plants',
  'harvests',
  'tasks',
  'system',
  'auth',
  'sensors',
  'compliance',
  'facility',
])

// User related enums
export const userRoleEnum = pgEnum('user_role', [
  'user',
  'admin',
  'manager',
  'viewer',
])

// Plant and cultivation enums
export const batchStatusEnum = pgEnum('batch_status', [
  'active',
  'completed',
  'pending',
  'cancelled',
  'archived',
])

export const plantSourceEnum = pgEnum('plant_source', [
  'seed',
  'clone',
  'mother',
  'tissue_culture',
])

export const plantStageEnum = pgEnum('plant_stage', [
  'germination',
  'seedling',
  'vegetative',
  'flowering',
  'harvested',
  'mother',
  'clone',
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
  'quarantine',
])

export const geneticTypeEnum = pgEnum('genetic_type', [
  'sativa',
  'indica',
  'hybrid',
  'ruderalis',
])

// Location and facility enums
export const locationTypeEnum = pgEnum('location_type', [
  'room',
  'section',
  'bench',
  'shelf',
  'tray',
  'pot',
])

// Operations enums
export const sensorTypeEnum = pgEnum('sensor_type', [
  'temperature',
  'humidity',
  'co2',
  'light',
  'ph',
  'ec',
  'moisture',
  'pressure',
  'airflow',
])

export const taskStatusEnum = pgEnum('task_status', [
  'pending',
  'in_progress',
  'completed',
  'cancelled',
  'blocked',
  'deferred',
])

export const taskPriorityEnum = pgEnum('task_priority', [
  'low',
  'medium',
  'high',
  'urgent',
  'critical',
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
  'cleaning',
  'inspection',
])

// Processing and harvest enums
export const harvestQualityEnum = pgEnum('harvest_quality', [
  'A',
  'B',
  'C',
  'D',
  'F',
])

export const noteTypeEnum = pgEnum('note_type', [
  'text',
  'voice',
  'image',
  'file',
  'checklist',
  'measurement',
])

export const destroyReasonEnum = pgEnum('destroy_reason', [
  'died',
  'pest',
  'disease',
  'male',
  'hermaphrodite',
  'quality',
  'regulatory',
  'other',
])

export const buildingTypeEnum = pgEnum('building_type', [
  'indoor',
  'outdoor',
  'greenhouse',
  'hybrid',
])

export const areaTypeEnum = pgEnum('area_type', [
  'vegetation',
  'flowering',
  'drying',
  'storage',
  'processing',
  'mother',
  'clone',
  'quarantine',
])

export const statusEnum = pgEnum('status', [
  'active',
  'inactive',
  'archived',
  'maintenance',
])

// Export types for all enums
export type LogLevel = (typeof logLevelEnum.enumValues)[number]
export type SystemLogSource = (typeof systemLogSourceEnum.enumValues)[number]
export type UserRole = (typeof userRoleEnum.enumValues)[number]
export type BatchStatus = (typeof batchStatusEnum.enumValues)[number]
export type PlantSource = (typeof plantSourceEnum.enumValues)[number]
export type PlantStage = (typeof plantStageEnum.enumValues)[number]
export type PlantSex = (typeof plantSexEnum.enumValues)[number]
export type HealthStatus = (typeof healthStatusEnum.enumValues)[number]
export type GeneticType = (typeof geneticTypeEnum.enumValues)[number]
export type LocationType = (typeof locationTypeEnum.enumValues)[number]
export type SensorType = (typeof sensorTypeEnum.enumValues)[number]
export type TaskStatus = (typeof taskStatusEnum.enumValues)[number]
export type TaskPriority = (typeof taskPriorityEnum.enumValues)[number]
export type TaskCategory = (typeof taskCategoryEnum.enumValues)[number]
export type HarvestQuality = (typeof harvestQualityEnum.enumValues)[number]
export type NoteType = (typeof noteTypeEnum.enumValues)[number]
export type DestroyReason = (typeof destroyReasonEnum.enumValues)[number]
export type BuildingType = (typeof buildingTypeEnum.enumValues)[number]
export type AreaType = (typeof areaTypeEnum.enumValues)[number]
export type Status = (typeof statusEnum.enumValues)[number]
