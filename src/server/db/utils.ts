import { pgTableCreator } from 'drizzle-orm/pg-core'

/**
 * Custom table creator that automatically prefixes all table names
 * @param name - The table name to prefix
 * @returns Prefixed table name with 'legacy-grow-app_'
 */
export const createTable = pgTableCreator((name) => `legacy-grow-app_${name}`)
