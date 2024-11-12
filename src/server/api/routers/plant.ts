import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { plants } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { plantFormSchema } from '~/lib/validations/plant'

const plantInput = z.object({
  name: z.string().min(1, 'Name is required'),
  geneticId: z.number().min(1, 'Genetic is required'),
  batchId: z.number().min(1, 'Batch is required'),
  plantDate: z.string().min(1, 'Plant date is required'),
  harvestDate: z.string().min(1, 'Harvest date is required'),
})

export const plantRouter = createTRPCRouter({
  getByCode: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const plant = await ctx.db.query.plants.findFirst({
        where: eq(plants.code, input),
        with: {
          genetic: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
          batch: {
            columns: {
              id: true,
              name: true,
              code: true,
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

      if (!plant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plant not found',
        })
      }

      return plant
    }),
  list: protectedProcedure
    .input(
      z.object({
        filters: z
          .object({
            batchId: z.number(),
          })
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = input.filters?.batchId
        ? eq(plants.batchId, input.filters.batchId)
        : undefined

      return ctx.db.query.plants.findMany({
        where,
        with: {
          genetic: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
          batch: {
            columns: {
              id: true,
              name: true,
              code: true,
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
        orderBy: (plants, { desc }) => [desc(plants.createdAt)],
      })
    }),

  create: protectedProcedure
    .input(plantFormSchema)
    .mutation(async ({ ctx, input }) => {
      const code = `p${Date.now()}${Math.random().toString(36).substr(2, 9)}`

      const [plant] = await ctx.db
        .insert(plants)
        .values({
          ...input,
          code,
          status: 'active',
          createdById: ctx.session.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          plantDate: input.plantDate.toISOString(),
          harvestDate: input.harvestDate?.toISOString() ?? null,
        })
        .returning()

      return plant
    }),

  update: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        data: plantFormSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const plant = await ctx.db.query.plants.findFirst({
        where: eq(plants.code, input.code),
      })

      if (!plant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plant not found',
        })
      }

      const [updated] = await ctx.db
        .update(plants)
        .set({
          ...(input.data as Partial<typeof plants.$inferSelect>),
          updatedAt: new Date(),
        })
        .where(eq(plants.code, input.code))
        .returning()

      return updated
    }),

  delete: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const plant = await ctx.db.query.plants.findFirst({
        where: eq(plants.code, input.code),
      })

      if (!plant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plant not found',
        })
      }

      if (plant.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to delete this plant',
        })
      }

      await ctx.db.delete(plants).where(eq(plants.code, input.code))

      return plant
    }),
})
