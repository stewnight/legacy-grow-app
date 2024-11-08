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
  'feeding',
  'environmental',
  'harvest',
])

// Processing and harvest enums
export const harvestQualityEnum = pgEnum('harvest_quality', [
  'A',
  'B',
  'C',
  'D',
])
