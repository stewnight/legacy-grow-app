import { z } from 'zod'
import { desc, eq, and, sql, like, SQL } from 'drizzle-orm'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import {
  genetics,
  insertGeneticSchema,
  selectGeneticSchema,
  plants,
  batches,
} from '~/server/db/schema'
import { geneticTypeEnum } from '~/server/db/schema/enums'

const geneticFiltersSchema = z.object({
  type: z.enum(geneticTypeEnum.enumValues).optional(),
  search: z.string().optional(),
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
        filters?.search
          ? like(genetics.name, `%${filters.search}%`)
          : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.genetics.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor || 0,
        orderBy: [desc(genetics.createdAt)],
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > limit) {
        items.pop()
        nextCursor = cursor ? cursor + limit : limit
      }

      return { items, nextCursor }
    }),

  get: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const genetic = await ctx.db.query.genetics.findFirst({
      where: eq(genetics.slug, input),
      with: {
        batches: true,
        plants: true,
      },
    })
    return genetic
  }),

  create: protectedProcedure
    .input(
      insertGeneticSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [genetic] = await ctx.db
        .insert(genetics)
        .values({
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
      return genetic
    }),

  update: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        data: insertGeneticSchema.partial().omit({
          id: true,
          createdAt: true,
          updatedAt: true,
          createdById: true,
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [genetic] = await ctx.db
        .update(genetics)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(genetics.id, input.id))
        .returning()
      return genetic
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(genetics).where(eq(genetics.id, input))
    }),
})
