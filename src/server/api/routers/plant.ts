import { z } from 'zod'
import { desc, eq, and, or, like, SQL } from 'drizzle-orm'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import {
  plants,
  insertPlantSchema,
  selectPlantSchema,
} from '~/server/db/schema/cultivation'
import {
  plantStageEnum,
  plantSourceEnum,
  plantSexEnum,
  healthStatusEnum,
} from '~/server/db/schema/enums'

const plantFiltersSchema = z.object({
  status: z.enum(healthStatusEnum.enumValues).optional(),
  stage: z.enum(plantStageEnum.enumValues).optional(),
  search: z.string().optional(),
})

export const plantRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
        filters: plantFiltersSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, filters } = input

      const conditions = [
        filters?.status ? eq(plants.status, filters.status) : undefined,
        filters?.stage ? eq(plants.stage, filters.stage) : undefined,
        filters?.search
          ? or(
              like(plants.code, `%${filters.search}%`),
              like(plants.phenotype || '', `%${filters.search}%`)
            )
          : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.plants.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor || 0,
        orderBy: [desc(plants.createdAt)],
        with: {
          genetic: true,
          batch: true,
          location: true,
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

  get: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.db.query.plants.findFirst({
      where: eq(plants.code, input),
      with: {
        genetic: true,
        batch: true,
        location: true,
        createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  }),

  create: protectedProcedure
    .input(
      insertPlantSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        createdById: true,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [plant] = await ctx.db
        .insert(plants)
        .values({
          ...input,
          createdById: ctx.session.user.id,
        })
        .returning()

      return plant
    }),

  update: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        data: insertPlantSchema.partial().omit({
          id: true,
          code: true,
          createdAt: true,
          updatedAt: true,
          createdById: true,
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [plant] = await ctx.db
        .update(plants)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(plants.code, input.code))
        .returning()

      return plant
    }),

  delete: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(plants).where(eq(plants.code, input.code))
    }),
})
