import { z } from 'zod'
import { desc, eq, and, or, like } from 'drizzle-orm'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { plants, type Plant } from '~/server/db/schema/cultivation'
import { plantStageEnum, plantSourceEnum } from '~/server/db/schema/enums'

export const plantRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
        filters: z
          .object({
            status: z.string().optional(),
            stage: z.enum(plantStageEnum.enumValues).optional(),
            search: z.string().optional(),
          })
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, filters } = input

      const conditions = []
      if (filters?.status) conditions.push(eq(plants.status, filters.status))
      if (filters?.stage) conditions.push(eq(plants.stage, filters.stage))
      if (filters?.search) {
        conditions.push(
          or(
            like(plants.code, `%${filters.search}%`),
            like(plants.phenotype || '', `%${filters.search}%`)
          )
        )
      }

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
        const nextItem = items.pop()
        nextCursor = cursor ? cursor + limit : limit
      }

      return {
        items,
        nextCursor,
      }
    }),

  // Get a single plant by code
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

  // Create a new plant
  create: protectedProcedure
    .input(
      z.object({
        code: z.string().optional(),
        geneticId: z.string().uuid().optional(),
        batchId: z.string().uuid().optional(),
        source: z.enum(plantSourceEnum.enumValues),
        stage: z.enum(plantStageEnum.enumValues),
        plantDate: z.date().optional(),
        harvestDate: z.date().optional(),
        motherId: z.string().uuid().optional(),
        generation: z.number().optional(),
        sex: z.enum(['unknown', 'male', 'female', 'hermaphrodite']),
        phenotype: z.string().optional(),
        healthStatus: z.enum(['healthy', 'sick', 'pest', 'nutrient']),
        quarantine: z.boolean().optional(),
        locationId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const plant = await ctx.db
        .insert(plants)
        .values({
          ...input,
          createdById: ctx.session.user.id,
        })
        .returning()

      return plant[0]
    }),

  // Update a plant
  update: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        data: z.object({
          geneticId: z.string().uuid().optional(),
          batchId: z.string().uuid().optional(),
          source: z.enum(plantSourceEnum.enumValues).optional(),
          stage: z.enum(plantStageEnum.enumValues).optional(),
          plantDate: z.date().optional(),
          harvestDate: z.date().optional(),
          motherId: z.string().uuid().optional(),
          generation: z.number().optional(),
          sex: z
            .enum(['unknown', 'male', 'female', 'hermaphrodite'])
            .optional(),
          phenotype: z.string().optional(),
          healthStatus: z
            .enum(['healthy', 'sick', 'pest', 'nutrient'])
            .optional(),
          quarantine: z.boolean().optional(),
          locationId: z.string().uuid().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const plant = await ctx.db
        .update(plants)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(plants.code, input.code))
        .returning()

      return plant[0]
    }),

  // Delete a plant
  delete: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(plants).where(eq(plants.code, input.code))
    }),
})
