import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { areas, insertAreaSchema } from '~/server/db/schema'
import { eq, desc, like, and, SQL } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { areaTypeEnum, statusEnum } from '~/server/db/schema/enums'

// Schema for filters
const areaFiltersSchema = z.object({
  type: z.enum(areaTypeEnum.enumValues).optional(),
  status: z.enum(statusEnum.enumValues).optional(),
  search: z.string().optional(),
})

export const areaRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
        filters: areaFiltersSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, filters } = input

      const conditions = [
        filters?.type ? eq(areas.type, filters.type) : undefined,
        filters?.status ? eq(areas.status, filters.status) : undefined,
        filters?.search ? like(areas.name, `%${filters.search}%`) : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.areas.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor || 0,
        orderBy: [desc(areas.createdAt)],
        with: {
          facility: true,
          parent: true,
          children: true,
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
      const area = await ctx.db.query.areas.findFirst({
        where: eq(areas.id, input),
        with: {
          facility: true,
          parent: true,
          children: true,
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      if (!area) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Area not found',
        })
      }

      return area
    }),

  create: protectedProcedure
    .input(
      insertAreaSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        createdById: true,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { properties, dimensions, ...rest } = input

      const [area] = await ctx.db
        .insert(areas)
        .values({
          ...rest,
          properties:
            (properties as typeof areas.$inferInsert.properties) || null,
          dimensions:
            (dimensions as typeof areas.$inferInsert.dimensions) || null,
          createdById: ctx.session.user.id,
        })
        .returning()

      if (!area) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create area',
        })
      }

      return area
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: insertAreaSchema.partial().omit({
          id: true,
          createdAt: true,
          updatedAt: true,
          createdById: true,
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { properties, dimensions, ...rest } = input.data

      const [area] = await ctx.db
        .update(areas)
        .set({
          ...rest,
          properties:
            (properties as typeof areas.$inferInsert.properties) || null,
          dimensions:
            (dimensions as typeof areas.$inferInsert.dimensions) || null,
          updatedAt: new Date(),
        })
        .where(eq(areas.id, input.id))
        .returning()

      if (!area) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Area not found',
        })
      }

      return area
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(areas)
        .where(eq(areas.id, input))
        .returning()

      if (!deleted) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Area not found',
        })
      }

      return { success: true }
    }),
})
