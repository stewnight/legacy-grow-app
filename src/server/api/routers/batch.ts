import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { batches, plants, type Batch, type NewPlant } from '~/server/db/schemas'
import { eq } from 'drizzle-orm'
import { format } from 'date-fns'

export const batchRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        geneticId: z.number(),
        plantCount: z.number().min(1),
        notes: z.string().optional(),
        // Plant details
        source: z.enum(['seed', 'clone', 'mother']),
        stage: z.enum(['seedling', 'vegetative', 'flowering']),
        plantDate: z.date(),
        healthStatus: z.enum(['healthy', 'sick', 'pest', 'nutrient']),
        motherId: z.number().optional(),
        generation: z.number().optional(),
        sex: z.enum(['male', 'female', 'hermaphrodite', 'unknown']).optional(),
        phenotype: z.string().optional(),
        locationId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }): Promise<Batch> => {
      const { name, geneticId, plantCount, notes, ...plantData } = input

      // Create the batch first
      const [batch] = await ctx.db
        .insert(batches)
        .values({
          name,
          plantCount,
          notes,
          geneticId,
          userId: ctx.session.user.id,
        } satisfies Partial<Batch>)
        .returning()

      if (!batch) {
        throw new Error('Failed to create batch')
      }

      // Create plants with proper type checking
      const plantsToCreate: NewPlant[] = Array(plantCount)
        .fill(null)
        .map(() => ({
          plantDate: format(input.plantDate, 'yyyy-MM-dd'),
          code: `PLT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          batchId: batch.id,
          geneticId: input.geneticId,
          motherId: null,
          generation: null,
          createdById: ctx.session.user.id,
          harvestDate: null,
          quarantine: false,
          destroyReason: null,
          locationId: null,
          phenotype: null,
          sex: 'unknown' as const,
          source: input.source,
          stage: 'seedling' as const,
          healthStatus: 'healthy' as const,
          status: 'active' as const,
        }))

      await ctx.db.insert(plants).values(plantsToCreate)

      return batch
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.batches.findFirst({
        where: eq(batches.id, input.id),
        with: {
          plants: true,
          genetic: true,
          createdBy: true,
        },
      })
    }),

  list: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.batches.findMany({
      orderBy: (batches) => [batches.createdAt],
      with: {
        genetic: true,
        createdBy: true,
      },
    })
  }),
})
