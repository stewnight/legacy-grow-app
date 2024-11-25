import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { areas, insertAreaSchema } from '~/server/db/schema'
import { eq, desc, like, and, SQL } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { areaTypeEnum, statusEnum } from '~/server/db/schema/enums'

// Define the type for the JSON fields based on your schema
type AreaProperties = typeof areas.$inferInsert.properties
type AreaDimensions = typeof areas.$inferInsert.dimensions

// Schema for filters
const areaFiltersSchema = z.object({
  type: z.enum(areaTypeEnum.enumValues).optional(),
  status: z.enum(statusEnum.enumValues).optional(),
  search: z.string().optional(),
  buildingId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
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
        filters?.buildingId
          ? eq(areas.buildingId, filters.buildingId)
          : undefined,
        filters?.parentId ? eq(areas.parentId, filters.parentId) : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.areas.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor || 0,
        orderBy: [desc(areas.createdAt)],
        with: {
          building: true,
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
          building: true,
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
    .input(insertAreaSchema)
    .mutation(async ({ ctx, input }) => {
      const insertData = {
        ...input,
        createdById: ctx.session.user.id,
        properties: input.properties as AreaProperties,
        dimensions: input.dimensions as AreaDimensions,
      }

      const [area] = await ctx.db.insert(areas).values(insertData).returning()

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
        data: insertAreaSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updateData = {
        ...input.data,
        updatedAt: new Date(),
        properties: input.data.properties as AreaProperties,
        dimensions: input.data.dimensions as AreaDimensions,
      }

      const [area] = await ctx.db
        .update(areas)
        .set(updateData)
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
