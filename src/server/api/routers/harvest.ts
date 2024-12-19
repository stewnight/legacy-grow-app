import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { harvests, insertHarvestSchema } from '~/server/db/schema/harvests'
import { desc, eq, and, inArray, sql, type SQL } from 'drizzle-orm'
import { enumValues } from '~/server/db/schema/enums'
import { TRPCError } from '@trpc/server'

// Schema for filters
const harvestFiltersSchema = z.object({
  status: z.enum(enumValues.status).optional(),
  quality: z.enum(enumValues.quality).optional(),
  batchIds: z.array(z.string()).optional(),
  locationIds: z.array(z.string()).optional(),
  search: z.string().optional(),
})

export const harvestRouter = createTRPCRouter({
  create: protectedProcedure
    .input(insertHarvestSchema)
    .mutation(async ({ ctx, input }) => {
      const [harvest] = await ctx.db
        .insert(harvests)
        .values({
          ...input,
          properties: input.properties ?? {},
          labResults: input.labResults ?? {},
          createdById: ctx.session.user.id,
        } as typeof harvests.$inferInsert)
        .returning()

      if (!harvest) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create harvest',
        })
      }

      return harvest
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: insertHarvestSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(harvests)
        .set({
          ...input.data,
          properties: input.data.properties ?? {},
          labResults: input.data.labResults ?? {},
          updatedAt: new Date(),
        } as typeof harvests.$inferInsert)
        .where(eq(harvests.id, input.id))
        .returning()

      if (!updated) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Harvest not found',
        })
      }

      return updated
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(harvests)
        .where(eq(harvests.id, input))
        .returning()

      if (!deleted) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Harvest not found',
        })
      }

      return { success: true }
    }),

  getById: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const harvest = await ctx.db.query.harvests.findFirst({
        where: eq(harvests.id, input),
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
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
          processing: true,
        },
      })

      if (!harvest) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Harvest not found',
        })
      }

      return harvest
    }),

  getByBatchId: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const results = await ctx.db.query.harvests.findMany({
        where: eq(harvests.batchId, input),
        orderBy: [desc(harvests.createdAt)],
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
          location: true,
          notes: true,
          jobs: true,
          processing: true,
        },
      })

      return results
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
        filters: harvestFiltersSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, filters } = input

      const conditions = [
        filters?.status ? eq(harvests.status, filters.status) : undefined,
        filters?.quality ? eq(harvests.quality, filters.quality) : undefined,
        filters?.batchIds?.length
          ? inArray(harvests.batchId, filters.batchIds)
          : undefined,
        filters?.locationIds?.length
          ? inArray(harvests.locationId, filters.locationIds)
          : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.harvests.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor ?? 0,
        orderBy: [desc(harvests.createdAt)],
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
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
          processing: true,
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
        locationId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = []

      if (input.batchId) {
        conditions.push(eq(harvests.batchId, input.batchId))
      }

      if (input.locationId) {
        conditions.push(eq(harvests.locationId, input.locationId))
      }

      if (input.startDate) {
        conditions.push(sql`${harvests.createdAt} >= ${input.startDate}`)
      }

      if (input.endDate) {
        conditions.push(sql`${harvests.createdAt} <= ${input.endDate}`)
      }

      const results = await ctx.db
        .select({
          totalHarvests: sql<number>`count(*)`,
          totalWetWeight: sql<number>`sum(${harvests.wetWeight})`,
          totalDryWeight: sql<number>`sum(${harvests.dryWeight})`,
          avgYieldPercentage: sql<number>`avg(${harvests.yieldPercentage})`,
          statusCounts: sql<Record<string, number>>`
            jsonb_object_agg(
              status,
              count
            ) FROM (
              SELECT status, count(*) as count
              FROM ${harvests}
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
              FROM ${harvests}
              WHERE ${and(...conditions)} AND quality IS NOT NULL
              GROUP BY quality
            ) quality_counts
          `,
        })
        .from(harvests)
        .where(and(...conditions))

      return results[0]
    }),
})
