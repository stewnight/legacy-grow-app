// src/server/api/routers/genetic.ts
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { genetics, insertGeneticSchema } from '~/server/db/schema'
import { eq, desc, like, and, SQL } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { geneticTypeEnum, statusEnum } from '~/server/db/schema/enums'

// Schema for filters
const geneticFiltersSchema = z.object({
  type: z.enum(geneticTypeEnum.enumValues).optional(),
  status: z.enum(statusEnum.enumValues).optional(),
  search: z.string().optional(),
  inHouse: z.boolean().optional(),
})

export const geneticRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
        filters: geneticFiltersSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, filters } = input

      const conditions = [
        filters?.type ? eq(genetics.type, filters.type) : undefined,
        filters?.status ? eq(genetics.status, filters.status) : undefined,
        filters?.inHouse ? eq(genetics.inHouse, filters.inHouse) : undefined,
        filters?.search
          ? like(genetics.name, `%${filters.search}%`)
          : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.genetics.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor || 0,
        orderBy: [desc(genetics.createdAt)],
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
      const genetic = await ctx.db.query.genetics.findFirst({
        where: eq(genetics.id, input),
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

      if (!genetic) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Genetic not found',
        })
      }

      return genetic
    }),

  create: protectedProcedure
    .input(
      insertGeneticSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        createdById: true,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { properties, growProperties, lineage, ...rest } = input

      const [genetic] = await ctx.db
        .insert(genetics)
        .values({
          ...rest,
          properties: properties as typeof genetics.$inferInsert.properties,
          growProperties:
            growProperties as typeof genetics.$inferInsert.growProperties,
          lineage: lineage as typeof genetics.$inferInsert.lineage,
          createdById: ctx.session.user.id,
        })
        .returning()

      if (!genetic) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create genetic',
        })
      }

      return genetic
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: insertGeneticSchema.partial().omit({
          id: true,
          createdAt: true,
          updatedAt: true,
          createdById: true,
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { properties, growProperties, lineage, ...rest } = input.data

      const [genetic] = await ctx.db
        .update(genetics)
        .set({
          ...rest,
          properties: properties as typeof genetics.$inferInsert.properties,
          growProperties:
            growProperties as typeof genetics.$inferInsert.growProperties,
          lineage: lineage as typeof genetics.$inferInsert.lineage,
          updatedAt: new Date(),
        })
        .where(eq(genetics.id, input.id))
        .returning()

      if (!genetic) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Genetic not found',
        })
      }

      return genetic
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(genetics)
        .where(eq(genetics.id, input))
        .returning()

      if (!deleted) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Genetic not found',
        })
      }

      return { success: true }
    }),
})
