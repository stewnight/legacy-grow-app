import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { processing, insertProcessingSchema } from '~/server/db/schema'
import { eq, desc, like, and, type SQL } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { batchStatusEnum, harvestQualityEnum } from '~/server/db/schema/enums'

// Schema for filters
const processingFiltersSchema = z.object({
  status: z.enum(batchStatusEnum.enumValues).optional(),
  quality: z.enum(harvestQualityEnum.enumValues).optional(),
  search: z.string().optional(),
})

export const processingRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
        filters: processingFiltersSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, filters } = input

      const conditions = [
        filters?.status
          ? eq(processing.processStatus, filters.status)
          : undefined,
        filters?.quality ? eq(processing.quality, filters.quality) : undefined,
        filters?.search
          ? like(processing.identifier, `%${filters.search}%`)
          : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.processing.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor || 0,
        orderBy: [desc(processing.createdAt)],
        with: {
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
      const process = await ctx.db.query.processing.findFirst({
        where: eq(processing.id, input),
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      if (!process) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Processing record not found',
        })
      }

      return process
    }),

  create: protectedProcedure
    .input(
      insertProcessingSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        createdById: true,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { properties, metadata, labResults, ...rest } = input

      const [process] = await ctx.db
        .insert(processing)
        .values({
          ...rest,
          properties: properties as typeof processing.$inferInsert.properties,
          metadata: metadata as typeof processing.$inferInsert.metadata,
          labResults: labResults as typeof processing.$inferInsert.labResults,
          createdById: ctx.session.user.id,
        })
        .returning()

      if (!process) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create processing record',
        })
      }

      return process
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: insertProcessingSchema.partial().omit({
          id: true,
          createdAt: true,
          updatedAt: true,
          createdById: true,
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { properties, metadata, labResults, ...rest } = input.data

      const [process] = await ctx.db
        .update(processing)
        .set({
          ...rest,
          properties: properties as typeof processing.$inferInsert.properties,
          metadata: metadata as typeof processing.$inferInsert.metadata,
          labResults: labResults as typeof processing.$inferInsert.labResults,
          updatedAt: new Date(),
        })
        .where(eq(processing.id, input.id))
        .returning()

      if (!process) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Processing record not found',
        })
      }

      return process
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(processing)
        .where(eq(processing.id, input))
        .returning()

      if (!deleted) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Processing record not found',
        })
      }

      return { success: true }
    }),
})
