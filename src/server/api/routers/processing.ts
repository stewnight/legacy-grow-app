import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { processing, insertProcessingSchema } from '~/server/db/schema'
import { eq, desc, like, and, type SQL } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import {
  processingStatusEnum,
  processingMethodEnum,
  processingTypeEnum,
} from '~/server/db/schema/enums'

// Schema for filters
const processingFiltersSchema = z.object({
  type: z.enum(processingTypeEnum.enumValues).optional(),
  method: z.enum(processingMethodEnum.enumValues).optional(),
  status: z.enum(processingStatusEnum.enumValues).optional(),
  harvestId: z.string().uuid().optional(),
  batchId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
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
        filters?.type ? eq(processing.type, filters.type) : undefined,
        filters?.method ? eq(processing.method, filters.method) : undefined,
        filters?.status ? eq(processing.status, filters.status) : undefined,
        filters?.harvestId
          ? eq(processing.harvestId, filters.harvestId)
          : undefined,
        filters?.batchId ? eq(processing.batchId, filters.batchId) : undefined,
        filters?.locationId
          ? eq(processing.locationId, filters.locationId)
          : undefined,
        filters?.search
          ? like(processing.id, `%${filters.search}%`)
          : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.processing.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor ?? 0,
        orderBy: [desc(processing.createdAt)],
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          harvest: true,
          batch: true,
          location: true,
          notes: {
            with: {
              createdBy: {
                columns: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
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
              image: true,
            },
          },
          harvest: true,
          batch: true,
          location: true,
          notes: {
            with: {
              createdBy: {
                columns: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
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
    .input(insertProcessingSchema)
    .mutation(async ({ ctx, input }) => {
      const [process] = await ctx.db
        .insert(processing)
        .values({
          ...input,
          createdById: ctx.session.user.id,
          properties: input.properties || {},
          labResults: input.labResults || {},
        } as typeof processing.$inferInsert)
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
        data: insertProcessingSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [process] = await ctx.db
        .update(processing)
        .set({
          ...input.data,
          updatedAt: new Date(),
        } as typeof processing.$inferInsert)
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
