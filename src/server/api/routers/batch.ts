import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { batches, insertBatchSchema } from '~/server/db/schema'
import { eq, desc, like, and, SQL } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { batchStatusEnum } from '~/server/db/schema/enums'

// Schema for filters
const batchFiltersSchema = z.object({
  status: z.enum(batchStatusEnum.enumValues).optional(),
  search: z.string().optional(),
})

export const batchRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
        filters: batchFiltersSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, filters } = input

      const conditions = [
        filters?.status ? eq(batches.batchStatus, filters.status) : undefined,
        filters?.search
          ? like(batches.identifier, `%${filters.search}%`)
          : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.batches.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor || 0,
        orderBy: [desc(batches.updatedAt)],
        with: {
          genetic: true,
          location: true,
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > limit) {
        items.pop()
        nextCursor = cursor ? cursor + limit : limit
      }

      return { items, nextCursor }
    }),

  get: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const batch = await ctx.db.query.batches.findFirst({
        where: eq(batches.id, input),
        with: {
          genetic: true,
          location: true,
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      if (!batch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Batch not found',
        })
      }

      return batch
    }),

  create: protectedProcedure
    .input(insertBatchSchema.omit({ id: true }))
    .mutation(async ({ ctx, input }) => {
      const insertData = {
        ...input,
        createdById: ctx.session.user.id,
      }

      const [batch] = await ctx.db
        .insert(batches)
        .values(insertData)
        .returning()

      if (!batch) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create batch',
        })
      }

      return batch
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: insertBatchSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updateData = {
        ...input.data,
        updatedAt: new Date(),
      }

      const [batch] = await ctx.db
        .update(batches)
        .set(updateData)
        .where(eq(batches.id, input.id))
        .returning()

      if (!batch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Batch not found',
        })
      }

      return batch
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(batches)
        .where(eq(batches.id, input))
        .returning()

      if (!deleted) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Batch not found',
        })
      }

      return { success: true }
    }),
})
