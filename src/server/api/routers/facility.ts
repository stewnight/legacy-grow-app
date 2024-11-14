import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { and, desc, eq, like, SQL } from 'drizzle-orm'
import { facilities, insertFacilitySchema } from '~/server/db/schema'

const facilityFiltersSchema = z.object({
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
        filters?.search
          ? like(facilities.name, `%${filters.search}%`)
          : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.facilities.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor || 0,
        orderBy: [desc(facilities.updatedAt)],
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
      const facility = await ctx.db.query.facilities.findFirst({
        where: eq(facilities.id, input),
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
      const [facility] = await ctx.db
        .insert(facilities)
        .values({
          ...input,
          createdById: ctx.session.user.id,
        })
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
        data: insertFacilitySchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [facility] = await ctx.db
        .update(facilities)
        .set({ ...input.data, updatedAt: new Date() })
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
      await ctx.db.delete(facilities).where(eq(facilities.id, input))
    }),
})
