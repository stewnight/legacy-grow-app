import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { type DefaultSession, type NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Resend from 'next-auth/providers/resend'
import { env } from '~/env'
import { createUser, getUserFromDb, isFirstUser, verifyPassword } from './utils'
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from '~/server/db/schema/core'
import { db } from '~/server/db'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }

  interface User {
    id?: string
    email?: string | null
    role?: string
    password?: string
  }
}

function html(params: { url: string; host: string }) {
  const { url, host } = params
  const escapedHost = host.replace(/\./g, '&#8203;.')

  return `
    <body style="background: #f9f9f9;">
      <table width="100%" border="0" cellspacing="20" cellpadding="0"
        style="background: #fff; max-width: 600px; margin: auto; border-radius: 10px;">
        <tr>
          <td align="center"
            style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: #444;">
            Sign in to <strong>${escapedHost}</strong>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center" style="border-radius: 5px;" bgcolor="#22c55e">
                  <a href="${url}"
                    target="_blank"
                    style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid #22c55e; display: inline-block; font-weight: bold;">
                    Sign in
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center"
            style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: #444;">
            If you did not request this email you can safely ignore it.
          </td>
        </tr>
      </table>
    </body>
  `
}

function text({ url, host }: { url: string; host: string }) {
  return `Sign in to ${host}\n${url}\n\n`
}

export const authConfig = {
  providers: [
    Resend({
      apiKey: env.AUTH_RESEND_KEY,
      from: 'legacy-grow-app@stewit.dev',
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const { host } = new URL(url)

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: provider.from,
            to: email,
            subject: `Sign in to ${host}`,
            html: html({ url, host }),
            text: text({ url, host }),
          }),
        })

        if (!res.ok) {
          throw new Error('Failed to send verification email')
        }
      },
      async generateVerificationToken() {
        const array = new Uint8Array(16)
        crypto.getRandomValues(array)
        return Array.from(array)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
      },
      normalizeIdentifier(identifier: string): string {
        const [local = '', domain = ''] = identifier
          .toLowerCase()
          .trim()
          .split('@')
        return `${local}@${domain.split(',')[0]}`
      },
    }),
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
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials')
        }

        const user = await getUserFromDb(credentials.email)

        // If no user exists and this is the first user, create an admin account
        if (!user) {
          const isFirst = await isFirstUser()
          if (isFirst) {
            const newUser = await createUser(
              credentials.email,
              credentials.password,
              'admin'
            )
            if (!newUser) throw new Error('Failed to create user')
            return {
              id: newUser.id,
              email: newUser.email,
              role: newUser.role,
              password: newUser.password,
            }
          }
          throw new Error('Invalid credentials')
        }

        // Verify password for existing user
        if (
          !user.password ||
          !(await verifyPassword(user.password, credentials.password))
        ) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          password: user.password,
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as any, // Temporary fix for type mismatch between @auth versions
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: user.role,
      },
    }),
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
  },
} satisfies NextAuthConfig
