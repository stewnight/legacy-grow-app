import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { strains } from '~/server/db/schemas'
import { eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

export const strainRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        type: z.enum(['sativa', 'indica', 'hybrid']),
        description: z.string().optional(),
        floweringTime: z.number().min(1).max(52).optional(),
        thcPotential: z.number().min(0).max(100).optional(),
        cbdPotential: z.number().min(0).max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const [strain] = await ctx.db
          .insert(strains)
          .values({
            name: input.name,
            type: input.type,
            description: input.description,
            floweringTime: input.floweringTime,
            thcPotential: input.thcPotential?.toString(),
            cbdPotential: input.cbdPotential?.toString(),
            createdById: ctx.session.user.id,
          })
          .returning()

        return strain
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create strain',
          cause: error,
        })
      }
    }),

  list: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.strains.findMany({
      orderBy: (strains) => [strains.name],
    })
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.delete(strains).where(eq(strains.id, input.id))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete strain',
          cause: error,
        })
      }
    }),
})
