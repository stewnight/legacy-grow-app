import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import {
  sensorReadings,
  insertSensorReadingSchema,
} from '~/server/db/schema/sensorReadings'
import { eq, desc, and, type SQL, gte, lte } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

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
        filters?.sensorId
          ? eq(sensorReadings.sensorId, filters.sensorId)
          : undefined,
        filters?.startDate
          ? gte(sensorReadings.timestamp, filters.startDate)
          : undefined,
        filters?.endDate
          ? lte(sensorReadings.timestamp, filters.endDate)
          : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.sensorReadings.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor ?? 0,
        orderBy: [desc(sensorReadings.timestamp)],
        with: {
          sensor: true,
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
      const reading = await ctx.db.query.sensorReadings.findFirst({
        where: eq(sensorReadings.id, input),
        with: {
          sensor: true,
        },
      })

      if (!reading) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sensor reading not found',
        })
      }

      return reading
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
      const [reading] = await ctx.db
        .insert(sensorReadings)
        .values(input as typeof sensorReadings.$inferInsert)
        .returning()

      return reading
    }),

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
        .values(input as (typeof sensorReadings.$inferInsert)[])
        .returning()

      return readings
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
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
