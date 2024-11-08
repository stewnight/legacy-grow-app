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
} from 'drizzle-orm/pg-core'
import { type AdapterAccount } from 'next-auth/adapters'

import { createTable } from '../utils'
import { logLevelEnum, systemLogSourceEnum, userRoleEnum } from './enums'

// ================== SYSTEM LOGS ==================
export type SystemLog = typeof systemLogs.$inferSelect

export const systemLogs = createTable(
  'system_log',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    level: logLevelEnum('level').notNull(),
    source: systemLogSourceEnum('source').notNull(),
    message: text('message').notNull(),
    metadata: json('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (self) => ({
    levelIdx: index('system_log_level_idx').on(self.level),
    sourceIdx: index('system_log_source_idx').on(self.source),
    createdAtIdx: index('system_log_created_at_idx').on(self.createdAt),
  })
)

// ================== USERS & AUTH ==================
export type User = typeof users.$inferSelect
export type Account = typeof accounts.$inferSelect
export type Session = typeof sessions.$inferSelect
export type VerificationToken = typeof verificationTokens.$inferSelect

export const users = createTable('user', {
  id: varchar('id', { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull(),
  emailVerified: timestamp('email_verified', {
    mode: 'date',
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar('image', { length: 255 }),
  role: userRoleEnum('role').notNull().default('user'),
  active: boolean('active').default(true),
  permissions: json('permissions').$type<string[]>(),
  preferences: json('preferences').$type<{
    theme?: 'light' | 'dark'
    notifications?: boolean
    units?: 'metric' | 'imperial'
  }>(),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export const accounts = createTable(
  'account',
  {
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id),
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
  (self) => ({
    compoundKey: primaryKey({
      columns: [self.provider, self.providerAccountId],
    }),
    userIdIdx: index('account_user_id_idx').on(self.userId),
  })
)

export const sessions = createTable(
  'session',
  {
    sessionToken: varchar('session_token', { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp('expires', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),
  },
  (self) => ({
    userIdIdx: index('session_user_id_idx').on(self.userId),
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
  (self) => ({
    compoundKey: primaryKey({ columns: [self.identifier, self.token] }),
  })
)

// Auth Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))
