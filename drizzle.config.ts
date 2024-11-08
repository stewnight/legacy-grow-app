import { type Config } from 'drizzle-kit'

import { env } from '~/env'

export default {
  schema: './src/server/db/schemas',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ['legacy-grow-app_*'],
} satisfies Config
