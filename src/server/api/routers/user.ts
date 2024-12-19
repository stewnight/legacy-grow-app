import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'
import { users, verificationTokens } from '~/server/db/schema'
import { desc, eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { env } from '~/env'
import { isFirstUser } from '~/server/auth/utils'
import crypto from 'crypto'

export const userRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.db.query.users.findMany({
      orderBy: [desc(users.name)],
      columns: {
        id: true,
        name: true,
        image: true,
      },
    })
    return items
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      })
      return item
    }),

  isFirstUser: publicProcedure.query(async () => {
    return await isFirstUser()
  }),

  inviteUser: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if the current user is an admin
      const currentUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
      })

      if (currentUser?.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can invite users',
        })
      }

      // Check if user already exists
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      })

      if (existingUser) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User already exists',
        })
      }

      // Generate a unique token for the invitation
      const token = crypto.randomUUID()

      // Store the invitation token
      await ctx.db.insert(verificationTokens).values({
        identifier: input.email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      })

      // Get base URL from request headers
      const protocol = ctx.headers.get('x-forwarded-proto') ?? 'http'
      const host = ctx.headers.get('host') ?? 'localhost:3000'
      const baseUrl = `${protocol}://${host}`

      // Send invitation email using Resend
      const inviteUrl = `${baseUrl}/auth/signup?token=${token}`

      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.AUTH_RESEND_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'legacy-grow-app@stewit.dev',
            to: input.email,
            subject: 'Invitation to Legacy Grow',
            html: `
              <h1>You've been invited to Legacy Grow</h1>
              <p>Click the link below to create your account:</p>
              <a href="${inviteUrl}">${inviteUrl}</a>
              <p>This link will expire in 24 hours.</p>
            `,
          }),
        })
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send invitation email',
        })
      }

      return { success: true }
    }),

  verifyToken: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const verificationToken = await ctx.db.query.verificationTokens.findFirst(
        {
          where: eq(verificationTokens.token, input.token),
        }
      )

      if (!verificationToken) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid token',
        })
      }

      if (new Date(verificationToken.expires) < new Date()) {
        await ctx.db
          .delete(verificationTokens)
          .where(eq(verificationTokens.token, input.token))
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Token has expired',
        })
      }

      return {
        valid: true,
        email: verificationToken.identifier,
      }
    }),
})
