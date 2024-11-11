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
        notes: z.string().optional(),
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
        createdBy: true,
        batch: true,
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
          createdBy: true,
          batch: true,
        },
      })
    }),

  getByCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const plant = await ctx.db.query.plants.findFirst({
        where: eq(plants.code, input.code),
        with: {
          genetic: true,
          createdBy: true,
          batch: true,
        },
      })

      if (!plant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plant not found',
        })
      }

      return plant
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        batchId: z.number().optional(),
        source: z.enum(['seed', 'clone', 'mother']).optional(),
        stage: z
          .enum(['seedling', 'vegetative', 'flowering', 'harvested'])
          .optional(),
        plantDate: z.date().optional(),
        harvestDate: z.date().optional(),
        notes: z.string().optional(),
        healthStatus: z
          .enum(['healthy', 'sick', 'pest', 'nutrient'])
          .optional(),
        quarantine: z.boolean().optional(),
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
      const { id, plantDate, harvestDate, ...updateData } = input
      try {
        await ctx.db
          .update(plants)
          .set({
            ...updateData,
            ...(plantDate && { plantDate: format(plantDate, 'yyyy-MM-dd') }),
            ...(harvestDate && {
              harvestDate: format(harvestDate, 'yyyy-MM-dd'),
            }),
            updatedAt: new Date(),
          })
          .where(eq(plants.id, id))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update plant',
          cause: error,
        })
      }
    }),

  delete: protectedProcedure
    .input(z.object({ 
      id: z.number(),
      destroyReason: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First update the plant with destroy reason if provided
        if (input.destroyReason) {
          await ctx.db
            .update(plants)
            .set({
              destroyReason: input.destroyReason,
              updatedAt: new Date(),
            })
            .where(eq(plants.id, input.id))
        }

        // Then delete the plant
        await ctx.db.delete(plants).where(eq(plants.id, input.id))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete plant',
          cause: error,
        })
      }
    }),
})
