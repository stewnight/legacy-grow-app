import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { harvests, insertHarvestSchema } from '~/server/db/schema'
import { eq, desc, like, and, SQL } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { batchStatusEnum, harvestQualityEnum } from '~/server/db/schema/enums'

// Schema for filters
const harvestFiltersSchema = z.object({
  status: z.enum(batchStatusEnum.enumValues).optional(),
  quality: z.enum(harvestQualityEnum.enumValues).optional(),
  search: z.string().optional(),
})

export const harvestRouter = createTRPCRouter({
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
        filters?.status ? eq(harvests.harvestStatus, filters.status) : undefined,
        filters?.quality ? eq(harvests.quality, filters.quality) : undefined,
        filters?.search ? like(harvests.identifier, `%${filters.search}%`) : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.harvests.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor || 0,
        orderBy: [desc(harvests.createdAt)],
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

  get: protectedProcedure.input(z.string().uuid()).query(async ({ ctx, input }) => {
    const harvest = await ctx.db.query.harvests.findFirst({
      where: eq(harvests.id, input),
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

    if (!harvest) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Harvest not found',
      })
    }

    return harvest
  }),

  create: protectedProcedure
    .input(
      insertHarvestSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        createdById: true,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { properties, metadata, labResults, ...rest } = input

      const [harvest] = await ctx.db
        .insert(harvests)
        .values({
          ...rest,
          properties: properties as typeof harvests.$inferInsert.properties,
          metadata: metadata as typeof harvests.$inferInsert.metadata,
          labResults: labResults as typeof harvests.$inferInsert.labResults,
          createdById: ctx.session.user.id,
        })
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
        id: z.string().uuid(),
        data: insertHarvestSchema.partial().omit({
          id: true,
          createdAt: true,
          updatedAt: true,
          createdById: true,
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { properties, metadata, labResults, ...rest } = input.data

      const [harvest] = await ctx.db
        .update(harvests)
        .set({
          ...rest,
          properties: properties as typeof harvests.$inferInsert.properties,
          metadata: metadata as typeof harvests.$inferInsert.metadata,
          labResults: labResults as typeof harvests.$inferInsert.labResults,
          updatedAt: new Date(),
        })
        .where(eq(harvests.id, input.id))
        .returning()

      if (!harvest) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Harvest not found',
        })
      }

      return harvest
    }),

  delete: protectedProcedure.input(z.string().uuid()).mutation(async ({ ctx, input }) => {
    const [deleted] = await ctx.db.delete(harvests).where(eq(harvests.id, input)).returning()

    if (!deleted) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Harvest not found',
      })
    }

    return { success: true }
  }),
})
