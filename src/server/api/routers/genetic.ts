// src/server/api/routers/genetic.ts
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { batches, genetics, insertGeneticSchema, plants } from '~/server/db/schema'
import { eq, desc, like, and, type SQL } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { geneticTypeEnum, statusEnum } from '~/server/db/schema/enums'

// Define the type for the JSON fields based on your schema
type GeneticProperties = typeof genetics.$inferInsert.properties
type GeneticGrowProperties = typeof genetics.$inferInsert.growProperties
type GeneticLineage = typeof genetics.$inferInsert.lineage

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
        filters?.search ? like(genetics.name, `%${filters.search}%`) : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.genetics.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor || 0,
        orderBy: [desc(genetics.createdAt)],
        with: {
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

  get: protectedProcedure.input(z.string().uuid()).query(async ({ ctx, input }) => {
    const genetic = await ctx.db.query.genetics.findFirst({
      where: eq(genetics.id, input),
      with: {
        batches: {
          where: eq(batches.status, 'active'),
        },
        plants: {
          where: eq(plants.status, 'active'),
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

    if (!genetic) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Genetic not found',
      })
    }

    return {
      ...genetic,
      plantCount: genetic.plants?.length ?? 0,
      batchCount: genetic.batches?.length ?? 0,
    }
  }),

  create: protectedProcedure.input(insertGeneticSchema).mutation(async ({ ctx, input }) => {
    const insertData = {
      ...input,
      createdById: ctx.session.user.id,
      properties: input.properties as GeneticProperties,
      growProperties: input.growProperties as GeneticGrowProperties,
      lineage: input.lineage as GeneticLineage,
    }

    const [genetic] = await ctx.db.insert(genetics).values(insertData).returning()

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
        data: insertGeneticSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updateData = {
        ...input.data,
        updatedAt: new Date(),
        properties: input.data.properties as GeneticProperties,
        growProperties: input.data.growProperties as GeneticGrowProperties,
        lineage: input.data.lineage as GeneticLineage,
      }

      const [genetic] = await ctx.db
        .update(genetics)
        .set(updateData)
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

  delete: protectedProcedure.input(z.string().uuid()).mutation(async ({ ctx, input }) => {
    const [deleted] = await ctx.db.delete(genetics).where(eq(genetics.id, input)).returning()

    if (!deleted) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Genetic not found',
      })
    }

    return { success: true }
  }),
})
