import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { batches } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
// import { api } from '~/trpc/server'

export const batchRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        strain: z.string(),
        plantCount: z.number().min(1),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const batch = await ctx.db
        .insert(batches)
        .values({
          ...input,
          userId: ctx.session.user.id,
        })
        .returning()

      // Create plants for the batch
      // Code to be implemented here

      return batch[0]
    }),

  list: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.batches.findMany({
      where: eq(batches.userId, ctx.session.user.id),
      orderBy: (batches) => [batches.createdAt],
    })
  }),
})
