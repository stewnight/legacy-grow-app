import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { plants } from '~/server/db/schemas'
import { desc, eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { format } from 'date-fns'

export const plantRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        batchId: z.number().optional(),
        source: z.enum(['seed', 'clone', 'mother']),
        stage: z.enum(['seedling', 'vegetative', 'flowering']),
        plantDate: z.date(),
        healthStatus: z
          .enum(['healthy', 'sick', 'pest', 'nutrient'])
          .default('healthy'),
        quarantine: z.boolean().default(false),
        geneticId: z.number().optional(),
        motherId: z.number().optional(),
        generation: z.number().optional(),
        sex: z.enum(['male', 'female', 'hermaphrodite', 'unknown']).optional(),
        phenotype: z.string().optional(),
        locationId: z.number().optional(),
        destroyReason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.insert(plants).values({
          ...input,
          plantDate: format(input.plantDate, 'yyyy-MM-dd'),
          createdById: ctx.session.user.id,
        })
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create plant',
          cause: error,
        })
      }
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.plants.findMany({
      orderBy: [desc(plants.createdAt)],
      with: {
        genetic: true,
        location: true,
        createdBy: true,
      },
    })
  }),

  getById: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.plants.findFirst({
        where: eq(plants.id, input),
        with: {
          genetic: true,
          location: true,
          createdBy: true,
        },
      })
    }),
})
