import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { batches, plants } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { format } from 'date-fns'

export const batchRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        strain: z.string(),
        plantCount: z.number().min(1),
        notes: z.string().optional(),
        // Plant details
        source: z.enum(['seed', 'clone', 'mother']),
        stage: z.enum(['seedling', 'vegetative', 'flowering']),
        plantDate: z.date(),
        healthStatus: z.enum(['healthy', 'sick', 'pest', 'nutrient']),
        geneticId: z.number().optional(),
        motherId: z.number().optional(),
        generation: z.number().optional(),
        sex: z.enum(['male', 'female', 'hermaphrodite', 'unknown']).optional(),
        phenotype: z.string().optional(),
        locationId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, strain, plantCount, notes, ...plantData } = input

      // Create the batch first
      const [batch] = await ctx.db
        .insert(batches)
        .values({
          name,
          strain,
          plantCount,
          notes,
          userId: ctx.session.user.id,
        })
        .returning()

      // Create the specified number of plants with formatted date
      const plantsToCreate = Array(plantCount).fill({
        ...plantData,
        plantDate: format(plantData.plantDate, 'yyyy-MM-dd'),
        batchId: batch?.id,
        createdById: ctx.session.user.id,
      })

      await ctx.db.insert(plants).values(plantsToCreate)

      return batch
    }),

  list: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.batches.findMany({
      where: eq(batches.userId, ctx.session.user.id),
      orderBy: (batches) => [batches.createdAt],
    })
  }),
})
