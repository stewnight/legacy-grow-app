import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { sensors, insertSensorSchema } from '~/server/db/schema'
import { eq, desc, like, and, type SQL } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { sensorTypeEnum, statusEnum } from '~/server/db/schema/enums'

// Schema for filters
const sensorFiltersSchema = z.object({
  type: z.enum(sensorTypeEnum.enumValues).optional(),
  status: z.enum(statusEnum.enumValues).optional(),
  search: z.string().optional(),
})

export const sensorRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
        filters: sensorFiltersSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, filters } = input

      const conditions = [
        filters?.type ? eq(sensors.type, filters.type) : undefined,
        filters?.status ? eq(sensors.status, filters.status) : undefined,
        filters?.search
          ? like(sensors.identifier, `%${filters.search}%`)
          : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.sensors.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor || 0,
        orderBy: [desc(sensors.createdAt)],
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
      const sensor = await ctx.db.query.sensors.findFirst({
        where: eq(sensors.id, input),
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
          readings: {
            limit: 100,
            orderBy: [desc(sensors.createdAt)],
          },
        },
      })

      if (!sensor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sensor not found',
        })
      }

      return sensor
    }),

  create: protectedProcedure
    .input(
      insertSensorSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        createdById: true,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { specifications, metadata, ...rest } = input

      const [sensor] = await ctx.db
        .insert(sensors)
        .values({
          ...rest,
          specifications:
            specifications as typeof sensors.$inferInsert.specifications,
          metadata: metadata as typeof sensors.$inferInsert.metadata,
          createdById: ctx.session.user.id,
        })
        .returning()

      if (!sensor) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create sensor',
        })
      }

      return sensor
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: insertSensorSchema.partial().omit({
          id: true,
          createdAt: true,
          updatedAt: true,
          createdById: true,
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { specifications, metadata, ...rest } = input.data

      const [sensor] = await ctx.db
        .update(sensors)
        .set({
          ...rest,
          specifications:
            specifications as typeof sensors.$inferInsert.specifications,
          metadata: metadata as typeof sensors.$inferInsert.metadata,
          updatedAt: new Date(),
        })
        .where(eq(sensors.id, input.id))
        .returning()

      if (!sensor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sensor not found',
        })
      }

      return sensor
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(sensors)
        .where(eq(sensors.id, input))
        .returning()

      if (!deleted) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sensor not found',
        })
      }

      return { success: true }
    }),
})
