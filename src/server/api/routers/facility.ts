// src/server/api/routers/facility.ts
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { facilities, insertFacilitySchema } from '~/server/db/schema'
import { eq, desc, like, and, SQL } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { facilityTypeEnum, statusEnum } from '~/server/db/schema/enums'

type FacilityProperties = typeof facilities.$inferInsert.properties
type FacilityAddress = typeof facilities.$inferInsert.address

// Schema for filters
const facilityFiltersSchema = z.object({
  type: z.enum(facilityTypeEnum.enumValues).optional(),
  status: z.enum(statusEnum.enumValues).optional(),
  search: z.string().optional(),
})

export const facilityRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
        filters: facilityFiltersSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, filters } = input

      const conditions = [
        filters?.type ? eq(facilities.type, filters.type) : undefined,
        filters?.status ? eq(facilities.status, filters.status) : undefined,
        filters?.search
          ? like(facilities.name, `%${filters.search}%`)
          : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.facilities.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor || 0,
        orderBy: [desc(facilities.createdAt)],
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
      const facility = await ctx.db.query.facilities.findFirst({
        where: eq(facilities.id, input),
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

      if (!facility) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Facility not found',
        })
      }

      return facility
    }),

  create: protectedProcedure
    .input(insertFacilitySchema)
    .mutation(async ({ ctx, input }) => {
      const insertData = {
        ...input,
        createdById: ctx.session.user.id,
        properties: input.properties as FacilityProperties,
        address: input.address as FacilityAddress,
      }

      const [facility] = await ctx.db
        .insert(facilities)
        .values(insertData)
        .returning()

      if (!facility) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create facility',
        })
      }

      return facility
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: insertFacilitySchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updateData = {
        ...input.data,
        updatedAt: new Date(),
        properties: input.data
          .properties as typeof facilities.$inferInsert.properties,
        address: input.data.address as typeof facilities.$inferInsert.address,
      }

      const [facility] = await ctx.db
        .update(facilities)
        .set(updateData)
        .where(eq(facilities.id, input.id))
        .returning()

      if (!facility) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Facility not found',
        })
      }

      return facility
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(facilities)
        .where(eq(facilities.id, input))
        .returning()

      if (!deleted) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Facility not found',
        })
      }

      return { success: true }
    }),
})
