import { relations, sql } from 'drizzle-orm'
import {
  index,
  integer,
  primaryKey,
  text,
  timestamp,
  varchar,
  boolean,
  json,
  uuid,
} from 'drizzle-orm/pg-core'
import { buildings } from './buildings'
import { rooms } from './rooms'
import { locations } from './locations'
import { plants } from './plants'
import { genetics } from './genetics'
import { batches } from './batches'
import { type AdapterAccount } from 'next-auth/adapters'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

import { createTable } from '../utils'
import { logLevelEnum, systemLogSourceEnum, userRoleEnum } from './enums'
import { jobs } from './jobs'
import { sensors } from './sensors'
import { harvests, notes, processing } from '.'

// ================== SYSTEM LOGS ==================
export const systemLogs = createTable(
  'system_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    level: logLevelEnum('level').notNull(),
    source: systemLogSourceEnum('source').notNull(),
    message: text('message').notNull(),
    metadata: json('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    levelIdx: index('system_log_level_idx').on(table.level),
    sourceIdx: index('system_log_source_idx').on(table.source),
    createdAtIdx: index('system_log_created_at_idx').on(table.createdAt),
  })
)

// ================== USERS & AUTH ==================
export type UserPreferences = {
  theme?: 'light' | 'dark' | 'system'
  notifications?: {
    email?: boolean
    push?: boolean
    inApp?: boolean
  }
  units?: 'metric' | 'imperial'
  language?: string
  timezone?: string
}

export const users = createTable(
  'user',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    emailVerified: timestamp('email_verified', {
      mode: 'date',
      withTimezone: true,
    }),
    image: varchar('image', { length: 255 }),
    role: userRoleEnum('role').notNull().default('user'),
    active: boolean('active').default(true),
    permissions: json('permissions').$type<string[]>().default([]),
    preferences: json('preferences').$type<UserPreferences>().default({}),
    lastLogin: timestamp('last_login', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    emailIdx: index('user_email_idx').on(table.email),
    roleIdx: index('user_role_idx').on(table.role),
    activeIdx: index('user_active_idx').on(table.active),
  })
)

export const accounts = createTable(
  'account',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 255 })
      .$type<AdapterAccount['type']>()
      .notNull(),
    provider: varchar('provider', { length: 255 }).notNull(),
    providerAccountId: varchar('provider_account_id', {
      length: 255,
    }).notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: varchar('token_type', { length: 255 }),
    scope: varchar('scope', { length: 255 }),
    id_token: text('id_token'),
    session_state: varchar('session_state', { length: 255 }),
  },
  (table) => ({
    compoundKey: primaryKey({
      columns: [table.provider, table.providerAccountId],
    }),
    userIdIdx: index('account_user_id_idx').on(table.userId),
  })
)

export const sessions = createTable(
  'session',
  {
    sessionToken: varchar('session_token', { length: 255 })
      .notNull()
      .primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expires: timestamp('expires', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),
  },
  (table) => ({
    userIdIdx: index('session_user_id_idx').on(table.userId),
  })
)

export const verificationTokens = createTable(
  'verification_token',
  {
    identifier: varchar('identifier', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expires: timestamp('expires', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),
  },
  (table) => ({
    compoundKey: primaryKey({ columns: [table.identifier, table.token] }),
    expiresIdx: index('verification_token_expires_idx').on(table.expires),
  })
)

/**
 * Core user relations including all created and assigned entities
 * @remarks
 * Users can create multiple entities and be assigned to jobs
 */
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts, { relationName: 'userAccounts' }),
  sessions: many(sessions, { relationName: 'userSessions' }),
  // Created entities
  createdBuildings: many(buildings, { relationName: 'buildingCreator' }),
  createdRooms: many(rooms, { relationName: 'roomCreator' }),
  createdLocations: many(locations, { relationName: 'locationCreator' }),
  createdPlants: many(plants, { relationName: 'plantCreator' }),
  createdGenetics: many(genetics, { relationName: 'geneticCreator' }),
  createdBatches: many(batches, { relationName: 'batchCreator' }),
  createdJobs: many(jobs, { relationName: 'jobCreator' }),
  createdSensors: many(sensors, { relationName: 'sensorCreator' }),
  createdHarvests: many(harvests, { relationName: 'harvestCreator' }),
  createdProcessing: many(processing, { relationName: 'processingCreator' }),
  createdNotes: many(notes, { relationName: 'noteCreator' }),
}))

/**
 * Authentication relations for NextAuth.js
 */
export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
    relationName: 'userAccounts',
  }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
    relationName: 'userSessions',
  }),
}))

// Zod Schemas
export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)

// Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Account = typeof accounts.$inferSelect
export type Session = typeof sessions.$inferSelect
export type VerificationToken = typeof verificationTokens.$inferSelect
