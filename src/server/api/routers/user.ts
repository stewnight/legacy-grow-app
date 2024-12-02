import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { users } from '~/server/db/schema'
import { desc, eq } from 'drizzle-orm'

export const userRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.db.query.users.findMany({
      orderBy: [desc(users.name)],
      columns: {
        id: true,
        name: true,
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
})
