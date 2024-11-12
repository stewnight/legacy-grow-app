import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { batches, type Batch, plants } from '~/server/db/schema'
import { eq, sql } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { batchFormSchema } from '~/lib/validations/batch'
import { format } from 'date-fns'
import { plantRouter } from './plant'

export const batchRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const results = await ctx.db.query.batches.findMany({
      with: {
        genetic: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
        },
        plants: true,
        createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      where: eq(batches.userId, ctx.session.user.id),
      orderBy: (batches, { desc }) => [desc(batches.createdAt)],
      columns: {
        id: true,
        code: true,
        name: true,
        geneticId: true,
        plantCount: true,
        notes: true,
        status: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return results.map((batch) => ({
      ...batch,
      _count: {
        plants: batch.plants.length,
      },
    }))
  }),

  getByCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const batch = await ctx.db.query.batches.findFirst({
        where: eq(batches.code, input.code),
        with: {
          genetic: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
          plants: true,
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        columns: {
          id: true,
          code: true,
          name: true,
          geneticId: true,
          plantCount: true,
          notes: true,
          status: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!batch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Batch not found',
        })
      }

      if (batch.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to view this batch',
        })
      }

      return {
        ...batch,
        _count: {
          plants: batch.plants.length,
        },
      }
    }),

  create: protectedProcedure
    .input(batchFormSchema)
    .mutation(async ({ ctx, input }) => {
      const code = `b${Date.now()}${Math.random().toString(36).substr(2, 9)}`
      const now = new Date()

      const [batch] = await ctx.db
        .insert(batches)
        .values({
          name: input.name,
          code,
          geneticId: input.geneticId,
          plantCount: input.plantCount,
          notes: input.notes ?? null,
          status: 'active',
          userId: ctx.session.user.id,
          source: input.source ?? undefined,
          stage: input.stage ?? undefined,
          plantDate: input.plantDate ? new Date(input.plantDate) : undefined,
          healthStatus: input.healthStatus ?? undefined,
          motherId: input.motherId ?? undefined,
          generation: input.generation ?? undefined,
          sex: input.sex ?? undefined,
          phenotype: input.phenotype ?? undefined,
          locationId: input.locationId ?? undefined,
          createdAt: now,
          updatedAt: now,
        })
        .returning()

      if (!batch) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create batch',
        })
      }

      try {
        await Promise.all(
          Array(input.plantCount)
            .fill(null)
            .map(async () => {
              await plantRouter.createCaller(ctx).create({
                batchId: batch.id,
                geneticId: input.geneticId,
                source: input.source ?? 'seed',
                stage: input.stage ?? 'seedling',
                plantDate: input.plantDate ?? now,
                healthStatus: input.healthStatus ?? 'healthy',
                motherId: input.motherId ?? undefined,
                generation: input.generation ?? undefined,
                sex: input.sex ?? 'unknown',
                phenotype: input.phenotype ?? undefined,
                locationId: input.locationId ?? undefined,
                quarantine: false,
              })
            })
        )
      } catch (error) {
        console.error('Failed to create plants:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create plants for batch',
          cause: error,
        })
      }

      return batch
    }),

  update: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        data: batchFormSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(batches)
        .set({
          ...input.data,
          plantDate: input.data.plantDate
            ? new Date(input.data.plantDate)
            : null,
          updatedAt: new Date(),
        })
        .where(eq(batches.code, input.code))
        .returning()

      return updated
    }),

  delete: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const batch = await ctx.db.query.batches.findFirst({
        where: eq(batches.code, input.code),
        with: {
          plants: true,
        },
      })

      if (!batch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Batch not found',
        })
      }

      if (batch.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to delete this batch',
        })
      }

      if (batch.plants.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete batch with active plants',
        })
      }

      await ctx.db.delete(batches).where(eq(batches.code, input.code))

      return batch
    }),
})
