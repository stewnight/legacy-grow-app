import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { locations, insertLocationSchema } from '~/server/db/schema'
import { eq, desc, like, and, SQL } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { locationTypeEnum, statusEnum } from '~/server/db/schema/enums'

// Schema for filters
const locationFiltersSchema = z.object({
  type: z.enum(locationTypeEnum.enumValues).optional(),
  status: z.enum(statusEnum.enumValues).optional(),
  search: z.string().optional(),
})

export const locationRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
        filters: locationFiltersSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, filters } = input

      const conditions = [
        filters?.type ? eq(locations.type, filters.type) : undefined,
        filters?.status ? eq(locations.status, filters.status) : undefined,
        filters?.search
          ? like(locations.name, `%${filters.search}%`)
          : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.locations.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor || 0,
        orderBy: [desc(locations.createdAt)],
        with: {
          area: true,
          plants: true,
          sensors: true,
          batches: true,
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
      const location = await ctx.db.query.locations.findFirst({
        where: eq(locations.id, input),
        with: {
          area: true,
          plants: true,
          sensors: true,
          batches: true,
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      if (!location) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Location not found',
        })
      }

      return location
    }),

  create: protectedProcedure
    .input(
      insertLocationSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        createdById: true,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { properties, coordinates, dimensions, ...rest } = input

      const [location] = await ctx.db
        .insert(locations)
        .values({
          ...rest,
          properties: properties as typeof locations.$inferInsert.properties,
          coordinates: coordinates as typeof locations.$inferInsert.coordinates,
          dimensions: dimensions as typeof locations.$inferInsert.dimensions,
          createdById: ctx.session.user.id,
        })
        .returning()

      if (!location) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create location',
        })
      }

      return location
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: insertLocationSchema.partial().omit({
          id: true,
          createdAt: true,
          updatedAt: true,
          createdById: true,
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { properties, coordinates, dimensions, ...rest } = input.data

      const [location] = await ctx.db
        .update(locations)
        .set({
          ...rest,
          properties: properties as typeof locations.$inferInsert.properties,
          coordinates: coordinates as typeof locations.$inferInsert.coordinates,
          dimensions: dimensions as typeof locations.$inferInsert.dimensions,
          updatedAt: new Date(),
        })
        .where(eq(locations.id, input.id))
        .returning()

      if (!location) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Location not found',
        })
      }

      return location
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(locations)
        .where(eq(locations.id, input))
        .returning()

      if (!deleted) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Location not found',
        })
      }

      return { success: true }
    }),
})
