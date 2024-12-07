import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { sensorReadings, insertSensorReadingSchema } from '~/server/db/schema/sensorReadings'
import { eq, desc, and, SQL, gte, lte } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

// Schema for filters
const sensorReadingFiltersSchema = z.object({
  sensorId: z.string().uuid().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})

export const sensorReadingRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).default(100),
        cursor: z.number().nullish(),
        filters: sensorReadingFiltersSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, filters } = input

      const conditions = [
        filters?.sensorId ? eq(sensorReadings.sensorId, filters.sensorId) : undefined,
        filters?.startDate ? gte(sensorReadings.timestamp, filters.startDate) : undefined,
        filters?.endDate ? lte(sensorReadings.timestamp, filters.endDate) : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db
        .select()
        .from(sensorReadings)
        .where(conditions.length ? and(...conditions) : undefined)
        .limit(limit + 1)
        .offset(cursor || 0)
        .orderBy(desc(sensorReadings.timestamp))

      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > limit) {
        items.pop()
        nextCursor = cursor ? cursor + limit : limit
      }

      return { items, nextCursor }
    }),

  get: protectedProcedure.input(z.string().uuid()).query(async ({ ctx, input }) => {
    const reading = await ctx.db
      .select()
      .from(sensorReadings)
      .where(eq(sensorReadings.id, input))
      .limit(1)

    if (!reading[0]) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Sensor reading not found',
      })
    }

    return reading[0]
  }),

  create: protectedProcedure
    .input(
      insertSensorReadingSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { metadata, ...rest } = input

      const [reading] = await ctx.db
        .insert(sensorReadings)
        .values({
          ...rest,
          metadata: (metadata as typeof sensorReadings.$inferInsert.metadata) || null,
        })
        .returning()

      if (!reading) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create sensor reading',
        })
      }

      return reading
    }),

  // Bulk create for efficiency
  createMany: protectedProcedure
    .input(
      z.array(
        insertSensorReadingSchema.omit({
          id: true,
          createdAt: true,
          updatedAt: true,
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const readings = await ctx.db
        .insert(sensorReadings)
        .values(
          input.map(({ metadata, ...rest }) => ({
            ...rest,
            metadata: (metadata as typeof sensorReadings.$inferInsert.metadata) || null,
          }))
        )
        .returning()

      return readings
    }),

  delete: protectedProcedure.input(z.string().uuid()).mutation(async ({ ctx, input }) => {
    const [deleted] = await ctx.db
      .delete(sensorReadings)
      .where(eq(sensorReadings.id, input))
      .returning()

    if (!deleted) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Sensor reading not found',
      })
    }

    return { success: true }
  }),
})
