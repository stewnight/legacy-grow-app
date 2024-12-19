import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import {
  processing,
  insertProcessingSchema,
  processingPropertiesSchema,
  processingLabResultsSchema,
} from '~/server/db/schema/processing'
import { desc, eq, and, inArray, sql, type SQL } from 'drizzle-orm'
import { enumValues } from '~/server/db/schema/enums'
import { TRPCError } from '@trpc/server'

// Schema for filters
const processingFiltersSchema = z.object({
  status: z.enum(enumValues.status).optional(),
  quality: z.enum(enumValues.quality).optional(),
  type: z.enum(enumValues.processingType).optional(),
  method: z.enum(enumValues.processingMethod).optional(),
  batchIds: z.array(z.string()).optional(),
  harvestIds: z.array(z.string()).optional(),
  locationIds: z.array(z.string()).optional(),
  search: z.string().optional(),
})

export const processingRouter = createTRPCRouter({
  create: protectedProcedure
    .input(insertProcessingSchema)
    .mutation(async ({ ctx, input }) => {
      const [process] = await ctx.db
        .insert(processing)
        .values({
          ...input,
          properties: input.properties ?? {},
          labResults: input.labResults ?? {},
          createdById: ctx.session.user.id,
        } as typeof processing.$inferInsert)
        .returning()

      if (!process) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create processing',
        })
      }

      return process
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: insertProcessingSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(processing)
        .set({
          ...input.data,
          properties: input.data.properties ?? {},
          labResults: input.data.labResults ?? {},
          updatedAt: new Date(),
        } as typeof processing.$inferInsert)
        .where(eq(processing.id, input.id))
        .returning()

      if (!updated) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Processing not found',
        })
      }

      return updated
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
          message: 'Processing not found',
        })
      }

      return { success: true }
    }),

  getById: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const process = await ctx.db.query.processing.findFirst({
        where: eq(processing.id, input),
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true,
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
          jobs: true,
        },
      })

      if (!process) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Processing not found',
        })
      }

      return process
    }),

  getByHarvestId: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const results = await ctx.db.query.processing.findMany({
        where: eq(processing.harvestId, input),
        orderBy: [desc(processing.createdAt)],
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
          harvest: true,
          batch: true,
          location: true,
          notes: true,
          jobs: true,
        },
      })

      return results
    }),

  getByBatchId: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const results = await ctx.db.query.processing.findMany({
        where: eq(processing.batchId, input),
        orderBy: [desc(processing.createdAt)],
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
          harvest: true,
          batch: true,
          location: true,
          notes: true,
          jobs: true,
        },
      })

      return results
    }),

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
        filters?.status ? eq(processing.status, filters.status) : undefined,
        filters?.quality ? eq(processing.quality, filters.quality) : undefined,
        filters?.type ? eq(processing.type, filters.type) : undefined,
        filters?.method ? eq(processing.method, filters.method) : undefined,
        filters?.batchIds?.length
          ? inArray(processing.batchId, filters.batchIds)
          : undefined,
        filters?.harvestIds?.length
          ? inArray(processing.harvestId, filters.harvestIds)
          : undefined,
        filters?.locationIds?.length
          ? inArray(processing.locationId, filters.locationIds)
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
          jobs: true,
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > limit) {
        items.pop()
        nextCursor = cursor ? cursor + limit : limit
      }

      return { items, nextCursor }
    }),

  getStats: protectedProcedure
    .input(
      z.object({
        batchId: z.string().optional(),
        harvestId: z.string().optional(),
        locationId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = []

      if (input.batchId) {
        conditions.push(eq(processing.batchId, input.batchId))
      }

      if (input.harvestId) {
        conditions.push(eq(processing.harvestId, input.harvestId))
      }

      if (input.locationId) {
        conditions.push(eq(processing.locationId, input.locationId))
      }

      if (input.startDate) {
        conditions.push(sql`${processing.createdAt} >= ${input.startDate}`)
      }

      if (input.endDate) {
        conditions.push(sql`${processing.createdAt} <= ${input.endDate}`)
      }

      const results = await ctx.db
        .select({
          totalProcesses: sql<number>`count(*)`,
          totalInputWeight: sql<number>`sum(${processing.inputWeight})`,
          totalOutputWeight: sql<number>`sum(${processing.outputWeight})`,
          avgYieldPercentage: sql<number>`avg(${processing.yieldPercentage})`,
          statusCounts: sql<Record<string, number>>`
            jsonb_object_agg(
              status,
              count
            ) FROM (
              SELECT status, count(*) as count
              FROM ${processing}
              WHERE ${and(...conditions)}
              GROUP BY status
            ) status_counts
          `,
          qualityCounts: sql<Record<string, number>>`
            jsonb_object_agg(
              quality,
              count
            ) FROM (
              SELECT quality, count(*) as count
              FROM ${processing}
              WHERE ${and(...conditions)} AND quality IS NOT NULL
              GROUP BY quality
            ) quality_counts
          `,
          typeCounts: sql<Record<string, number>>`
            jsonb_object_agg(
              type,
              count
            ) FROM (
              SELECT type, count(*) as count
              FROM ${processing}
              WHERE ${and(...conditions)}
              GROUP BY type
            ) type_counts
          `,
          methodCounts: sql<Record<string, number>>`
            jsonb_object_agg(
              method,
              count
            ) FROM (
              SELECT method, count(*) as count
              FROM ${processing}
              WHERE ${and(...conditions)}
              GROUP BY method
            ) method_counts
          `,
        })
        .from(processing)
        .where(and(...conditions))

      return results[0]
    }),
})
