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
          ...plantData,
          plantDate: format(plantData.plantDate, 'yyyy-MM-dd'),
          code: `${batch.id}-${Math.random().toString(36).substring(2, 7)}`,
          batchId: batch.id,
          geneticId: batch.geneticId ?? null,
          motherId: plantData.motherId ?? null,
          generation: plantData.generation ?? null,
          createdById: ctx.session.user.id,
          harvestDate: null,
          quarantine: false,
          destroyReason: null,
          sex: plantData.sex ?? 'female',
          phenotype: plantData.phenotype ?? null,
          locationId: plantData.locationId ?? null,
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
