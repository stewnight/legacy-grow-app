// src/server/api/routers/plant.ts
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { plants, insertPlantSchema } from '~/server/db/schema'
import { eq, desc, like, and, or, type SQL } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import {
  plantStageEnum,
  plantSourceEnum,
  plantSexEnum,
  healthStatusEnum,
  statusEnum,
} from '~/server/db/schema/enums'

// Schema for filters
const plantFiltersSchema = z.object({
  stage: z.enum(plantStageEnum.enumValues).optional(),
  source: z.enum(plantSourceEnum.enumValues).optional(),
  sex: z.enum(plantSexEnum.enumValues).optional(),
  health: z.enum(healthStatusEnum.enumValues).optional(),
  status: z.enum(statusEnum.enumValues).optional(),
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
        filters?.stage ? eq(plants.stage, filters.stage) : undefined,
        filters?.source ? eq(plants.source, filters.source) : undefined,
        filters?.sex ? eq(plants.sex, filters.sex) : undefined,
        filters?.health ? eq(plants.health, filters.health) : undefined,
        filters?.status ? eq(plants.status, filters.status) : undefined,
        filters?.search
          ? or(
              like(plants.identifier, `%${filters.search}%`),
              like(plants.notes || '', `%${filters.search}%`)
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
          location: true,
          batch: true,
          mother: true,
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
      const plant = await ctx.db.query.plants.findFirst({
        where: eq(plants.id, input),
        with: {
          genetic: true,
          location: true,
          batch: true,
          mother: true,
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

      if (!plant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plant not found',
        })
      }

      return plant
    }),

  create: protectedProcedure
    .input(insertPlantSchema)
    .mutation(async ({ ctx, input }) => {
      const insertData = {
        ...input,
        batchId: input.batchId === 'none' ? null : input.batchId,
        motherId: input.motherId === 'none' ? null : input.motherId,
        createdById: ctx.session.user.id,
        properties: input.properties as typeof plants.$inferInsert.properties,
        metadata: input.metadata as typeof plants.$inferInsert.metadata,
      }

      const [plant] = await ctx.db.insert(plants).values(insertData).returning()

      if (!plant) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create plant',
        })
      }

      return plant
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: insertPlantSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updateData = {
        ...input.data,
        batchId: input.data.batchId === 'none' ? null : input.data.batchId,
        motherId: input.data.motherId === 'none' ? null : input.data.motherId,
        properties: input.data
          .properties as typeof plants.$inferInsert.properties,
        metadata: input.data.metadata as typeof plants.$inferInsert.metadata,
        updatedAt: new Date(),
      }

      const [plant] = await ctx.db
        .update(plants)
        .set(updateData)
        .where(eq(plants.id, input.id))
        .returning()

      if (!plant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plant not found',
        })
      }

      return plant
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(plants)
        .where(eq(plants.id, input))
        .returning()

      if (!deleted) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plant not found',
        })
      }

      return { success: true }
    }),
})
