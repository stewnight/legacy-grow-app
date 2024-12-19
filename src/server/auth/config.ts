import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { type DefaultSession, type NextAuthConfig } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import Credentials from 'next-auth/providers/credentials'
import Resend from 'next-auth/providers/resend'

import { db } from '~/server/db'
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from '~/server/db/schema'

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      // ...other properties
      // role: UserRole;
    } & DefaultSession['user']
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    Resend,
    Credentials({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'high@legacy.ag',
        },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        let user = null
        const pwHash = saltAndHashPassword(credentials.password)

        // logic to verify if the user exists
        user = await getUserFromDb(credentials.email, pwHash)

        if (!user) {
          // No user found, so this is their first attempt to login
          // Optionally, this is also the place you could do a user registration
          throw new Error('Invalid credentials.')
        }

        // return user object with their profile data
        return user
      },
    }),
    DiscordProvider,
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
} satisfies NextAuthConfig
