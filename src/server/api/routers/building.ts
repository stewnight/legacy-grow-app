// src/server/api/routers/  .ts
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { buildings, insertBuildingSchema } from '~/server/db/schema'
import { eq, desc, like, and, SQL } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { buildingTypeEnum, statusEnum } from '~/server/db/schema/enums'

type BuildingProperties = typeof buildings.$inferInsert.properties
type BuildingAddress = typeof buildings.$inferInsert.address

// Schema for filters
const buildingFiltersSchema = z.object({
  type: z.enum(buildingTypeEnum.enumValues).optional(),
  status: z.enum(statusEnum.enumValues).optional(),
  search: z.string().optional(),
})

export const buildingRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
        filters: buildingFiltersSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, filters } = input

      const conditions = [
        filters?.type ? eq(buildings.type, filters.type) : undefined,
        filters?.status ? eq(buildings.status, filters.status) : undefined,
        filters?.search
          ? like(buildings.name, `%${filters.search}%`)
          : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.buildings.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor || 0,
        orderBy: [desc(buildings.createdAt)],
        with: {
          areas: true,
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
      const building = await ctx.db.query.buildings.findFirst({
        where: eq(buildings.id, input),
        with: {
          areas: {
            with: {
              children: true,
            },
          },
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      if (!building) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Facility not found',
        })
      }

      return building
    }),

  create: protectedProcedure
    .input(insertBuildingSchema)
    .mutation(async ({ ctx, input }) => {
      const insertData = {
        ...input,
        createdById: ctx.session.user.id,
        properties: input.properties as BuildingProperties,
        address: input.address as BuildingAddress,
      }

      const [building] = await ctx.db
        .insert(buildings)
        .values(insertData)
        .returning()

      if (!building) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create facility',
        })
      }

      return building
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: insertBuildingSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updateData = {
        ...input.data,
        updatedAt: new Date(),
        properties: input.data
          .properties as typeof buildings.$inferInsert.properties,
        address: input.data.address as typeof buildings.$inferInsert.address,
      }

      const [building] = await ctx.db
        .update(buildings)
        .set(updateData)
        .where(eq(buildings.id, input.id))
        .returning()

      if (!building) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Building not found',
        })
      }

      return building
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(buildings)
        .where(eq(buildings.id, input))
        .returning()

      if (!deleted) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Building not found',
        })
      }

      return { success: true }
    }),
})
